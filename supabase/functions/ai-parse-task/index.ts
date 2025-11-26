import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'text is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = '';
    let userPrompt = text;

    if (type === 'parse') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
      const dayAfter = new Date(today.getTime() + 172800000).toISOString().split('T')[0];
      const nextWeek = new Date(today.getTime() + 604800000).toISOString().split('T')[0];

      systemPrompt = `Anda adalah asisten manajemen tugas. Ubah deskripsi menjadi JSON terstruktur dengan schema:
{
  "title": string,
  "due_date": string | null,
  "priority": "low" | "medium" | "high",
  "estimated_duration_minutes": number | null,
  "category": string | null,
  "tags": string[],
  "summary": string
}

Tanggal hari ini: ${todayStr}
Aturan tanggal Indonesia:
- "besok" = ${tomorrow}
- "lusa" = ${dayAfter}  
- "minggu depan" = ${nextWeek}
- "pagi" = 09:00 WIB, "siang" = 12:00 WIB, "sore" = 15:00 WIB, "malam" = 19:00 WIB

Jika ada waktu spesifik, gabungkan dengan tanggal dalam format ISO 8601 dengan timezone WIB (UTC+7).
Buat summary singkat 1-2 kalimat yang informatif.`;
    } else if (type === 'summary') {
      systemPrompt = 'Buat ringkasan tugas harian. Return JSON: {"today_list": [{"title": string, "id": string, "priority": string}], "urgent": [{"title": string, "id": string}], "progress_summary": string, "recommendations": string[]}';
    } else if (type === 'search') {
      systemPrompt = 'Cari secara semantik dan return array string id yang relevan berdasarkan query. Return JSON array saja.';
    } else if (type === 'anomaly') {
      systemPrompt = `Analisis perilaku dan pola tugas pengguna. Identifikasi:
- Pola pembuatan dan penyelesaian tugas (waktu, frekuensi)
- Tugas dengan prioritas tinggi yang belum diselesaikan
- Tugas yang sering terlambat atau overdue
- Kategori tugas yang paling sering dibuat
- Waktu estimasi vs waktu aktual
- Pola prokrastinasi atau kebiasaan positif

Return JSON: {
  "insights": string[], // 3-5 insight spesifik tentang perilaku user
  "recommendations": string[] // 3-5 rekomendasi actionable
}

Berikan analisis yang personal dan konstruktif berdasarkan data tugas yang ada.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Coba lagi sebentar ya.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Kredit AI habis. Tolong tambah kredit di settings.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI service error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsed), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-parse-task:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
