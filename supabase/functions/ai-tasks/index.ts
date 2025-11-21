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
    const { type, todos, prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    };

    // Different AI operations based on type
    switch (type) {
      case "suggest":
        systemPrompt = "Kamu adalah asisten AI yang membantu menyarankan tugas berdasarkan konteks tugas yang ada. Berikan 3-5 saran tugas yang actionable dan relevan dalam bahasa Indonesia.";
        body.messages[0].content = systemPrompt;
        body.tools = [
          {
            type: "function",
            function: {
              name: "suggest_tasks",
              description: "Return 3-5 actionable task suggestions.",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        priority: { type: "string", enum: ["low", "medium", "high"] },
                        category: { type: "string" }
                      },
                      required: ["title", "priority", "category"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ];
        body.tool_choice = { type: "function", function: { name: "suggest_tasks" } };
        break;

      case "prioritize":
        systemPrompt = "Kamu adalah asisten AI yang membantu memprioritaskan tugas. Analisis tugas-tugas yang diberikan dan berikan rekomendasi prioritas berdasarkan urgensi, pentingnya, dan dependensi.";
        body.messages[0].content = systemPrompt;
        body.tools = [
          {
            type: "function",
            function: {
              name: "prioritize_tasks",
              description: "Analyze and prioritize tasks.",
              parameters: {
                type: "object",
                properties: {
                  priorities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        priority: { type: "string", enum: ["low", "medium", "high"] },
                        reason: { type: "string" }
                      },
                      required: ["id", "priority", "reason"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["priorities"],
                additionalProperties: false
              }
            }
          }
        ];
        body.tool_choice = { type: "function", function: { name: "prioritize_tasks" } };
        break;

      case "summarize":
        systemPrompt = "Kamu adalah asisten AI yang membuat ringkasan produktivitas. Buatlah ringkasan yang insightful dari tugas-tugas pengguna dalam bahasa Indonesia.";
        body.messages[0].content = systemPrompt;
        break;

      case "search":
        systemPrompt = "Kamu adalah asisten AI yang membantu mencari tugas menggunakan natural language. Berdasarkan query, identifikasi tugas-tugas yang relevan.";
        body.messages[0].content = systemPrompt;
        body.tools = [
          {
            type: "function",
            function: {
              name: "search_tasks",
              description: "Find relevant tasks based on natural language query.",
              parameters: {
                type: "object",
                properties: {
                  task_ids: {
                    type: "array",
                    items: { type: "string" }
                  },
                  explanation: { type: "string" }
                },
                required: ["task_ids", "explanation"],
                additionalProperties: false
              }
            }
          }
        ];
        body.tool_choice = { type: "function", function: { name: "search_tasks" } };
        break;

      case "estimate":
        systemPrompt = "Kamu adalah asisten AI yang membantu mengestimasi waktu penyelesaian tugas. Berikan estimasi realistis dalam menit, jam, atau hari.";
        body.messages[0].content = systemPrompt;
        body.tools = [
          {
            type: "function",
            function: {
              name: "estimate_time",
              description: "Estimate time needed for tasks.",
              parameters: {
                type: "object",
                properties: {
                  estimates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        estimate: { type: "string" },
                        confidence: { type: "string", enum: ["low", "medium", "high"] }
                      },
                      required: ["id", "estimate", "confidence"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["estimates"],
                additionalProperties: false
              }
            }
          }
        ];
        body.tool_choice = { type: "function", function: { name: "estimate_time" } };
        break;

      case "schedule":
        systemPrompt = "Kamu adalah asisten AI yang membantu menjadwalkan tugas. Analisis tugas dan berikan saran jadwal yang optimal.";
        body.messages[0].content = systemPrompt;
        body.tools = [
          {
            type: "function",
            function: {
              name: "schedule_tasks",
              description: "Create optimal schedule for tasks.",
              parameters: {
                type: "object",
                properties: {
                  schedule: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        suggested_time: { type: "string" },
                        reason: { type: "string" }
                      },
                      required: ["id", "suggested_time", "reason"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["schedule"],
                additionalProperties: false
              }
            }
          }
        ];
        body.tool_choice = { type: "function", function: { name: "schedule_tasks" } };
        break;

      default:
        throw new Error("Invalid AI operation type");
    }

    console.log("Calling AI with type:", type);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit tercapai, coba lagi nanti ya." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit Lovable AI habis, tambahkan kredit di workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract tool call results or content
    let result;
    if (data.choices?.[0]?.message?.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      result = JSON.parse(toolCall.function.arguments);
    } else {
      result = { content: data.choices?.[0]?.message?.content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-tasks function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
