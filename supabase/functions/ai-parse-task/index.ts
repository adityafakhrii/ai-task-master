import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_TEXT_LENGTH = 10000;
const VALID_TYPES = ['parse', 'summary', 'search', 'anomaly', 'slice', 'breakdown', 'reschedule', 'theme_suggest', 'prioritize', 'daily_review'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { text, type } = await req.json();

    // Input validation
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Text exceeds maximum length of 10000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type && !VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'AI service not configured (GEMINI_API_KEY is missing)' }),
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

      systemPrompt = `Anda adalah asisten AI eksekusi tugas untuk seorang mentor bootcamp coding (CODEPOLITAN).
Tugas Anda adalah mem-parse deskripsi/percakapan natural menjadi task terstruktur dan actionable.
Kembalikan JSON dengan skema:
{
  "title": string,
  "description": string,
  "due_date": string | null,
  "priority": "low" | "medium" | "high",
  "estimated_duration_minutes": number | null,
  "category": "Bootcamp" | "Materi" | "Review & Grading" | "Event / Closing" | "Community & Chat" | "Admin" | "Personal",
  "tags": string[],
  "subtasks": string[],
  "summary": string,
  "why_now": string
}

Tanggal hari ini: ${todayStr}
Aturan tanggal Indonesia:
- "hari ini" / "today" = ${todayStr}
- "besok" = ${tomorrow}
- "lusa" = ${dayAfter}  
- "minggu depan" = ${nextWeek}
- Waktu: "pagi" = 09:00 WIB, "siang" = 12:00 WIB, "sore" = 15:00 WIB, "malam" = 19:00 WIB.
- Jika ada waktu spesifik, gabungkan dengan tanggal dalam format ISO 8601 (contoh: "${tomorrow}T09:00:00+07:00").
- subtasks: berikan 2-4 langkah konkret, actionable, dan spesifik.
- why_now: alasan 1 kalimat singkat mengapa task ini penting atau mendesak.`;
    } else if (type === 'prioritize') {
      systemPrompt = `Anda adalah AI Execution Coach untuk mentor bootcamp.
Pengguna akan mengirimkan daftar task hari ini dalam bentuk JSON.
Analisis urgensi, deadline, dan impact terhadap peserta/acara.
Tentukan urutan eksekusi terbaik hari ini beserta alasan strategi eksekusi.
Return JSON:
{
  "strategy_summary": string,
  "recommended_order": [
    {
      "id": string,
      "title": string,
      "priority": "high" | "medium" | "low",
      "order": number,
      "reason": string
    }
  ],
  "quick_wins_suggestion": string
}`;
    } else if (type === 'daily_review') {
      systemPrompt = `Anda adalah AI Daily Reviewer untuk personal execution.
Pengguna mengirimkan JSON berisi { completedTasks: [], incompleteTasks: [] }.
Analisis performa hari ini dengan objektif, tajam, dan tidak klise.
Return JSON:
{
  "headline": string,
  "insight": string,
  "priority_alert": string | null,
  "suggested_focus_tomorrow": string[]
}`;
    } else if (type === 'summary') {
      systemPrompt = 'Buat ringkasan tugas harian. Return JSON: {"today_list": [{"title": string, "id": string, "priority": string}], "urgent": [{"title": string, "id": string}], "progress_summary": string, "recommendations": string[]}';
    } else if (type === 'search') {
      systemPrompt = 'Cari secara semantik dan return array string id yang relevan berdasarkan query. Return JSON array saja.';
    } else if (type === 'anomaly') {
      systemPrompt = `Anda adalah analis produktivitas tugas AI.
Pengguna akan mengirimkan JSON array riwayat tugas mereka. Deteksi kebiasaan, pola, dan anomali dari data tersebut.
Contoh: Apakah mereka sering mengabaikan tugas prioritas "high"? Apakah ada pola penundaan tugas tertentu?
Return JSON dengan format:
{
  "insights": ["Temuan 1", "Temuan 2"],
  "recommendations": ["Saran 1", "Saran 2"]
}`;
    } else if (type === 'slice' || type === 'breakdown') {
      systemPrompt = `Anda adalah asisten produktivitas. Pengguna akan memberikan sebuah tugas yang mungkin besar atau tidak spesifik.
Ubah tugas tersebut menjadi 3 hingga 5 sub-tugas (langkah-langkah kecil) yang spesifik dan actionable.
Return JSON dengan satu property "subtasks" yang berisi array string. Contoh: {"subtasks": ["Siapkan data outline", "Hubungi vendor", "Draft email pengajuan"]}`;
    } else if (type === 'reschedule') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
      const nextWeek = new Date(today.getTime() + 604800000).toISOString().split('T')[0];

      systemPrompt = `Anda adalah pengatur jadwal pintar (Calendar Tetris AI). 
Pengguna akan mengirimkan JSON array berisi tugas-tugas yang "overdue" (melewati tenggat waktu). 
Tugas Anda adalah membuat ulang rekomendasi "due_date" untuk tiap tugas berdasarkan prioritas:
- "high" harus hari ini (${todayStr}) atau maksimal besok (${tomorrow}).
- "medium" bisa besok atau lusa.
- "low" bisa didistribusikan hingga minggu depan (${nextWeek}).

Return JSON dengan format:
{
  "rescheduled_tasks": [
    { "id": "tugas_id", "suggested_due_date": "YYYY-MM-DDTHH:mm:ssZ" }
  ]
}
Pastikan suggested_due_date logis dan disebar (misalnya pagi jam 09:00, siang jam 13:00) agar user tidak kelelahan. Jika id tersedia di input, gunakan id tersebut.`;
    } else if (type === 'theme_suggest') {
      systemPrompt = `Anda adalah "AI Theme Designer".
Pengguna akan memberikan JSON array tentang status tugas-tugas mereka hari ini (jumlah tugas high priority vs low priority, dll).
Tugas Anda adalah merekomendasikan tema visual yang cocok.
Jika tugas "high priority" banyak, maka sarankan tema "neon-dark" agar fokus dan bersemangat. 
Jika tugas santai/biasa lebih banyak, sarankan tema "deep-ocean" agar tenang.
Secara lalai, sarankan "default".
Return JSON dengan satu property "theme" yang berisi salah satu dari: "default", "neon-dark", atau "deep-ocean".`;
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
        }
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
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsed;
    try {
      // Remove generic markdown code block formatting some LLMs add
      const cleanContent = content.replace(/```(?:json)?\s?/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanContent);
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
