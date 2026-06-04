import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { resume, missingKeywords } = await req.json();
    if (!resume) {
      return new Response(JSON.stringify({ error: 'resume is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `You rewrite resumes to be more ATS-friendly. Naturally weave the provided missing keywords into the summary, experience descriptions, and project descriptions where they truthfully fit. Never invent jobs, employers, projects, certifications, or fake credentials. Preserve all links, projects and certifications as-is. Keep tone professional and concise. Format experience descriptions as bullet lines starting with "• ". Return the same JSON structure with improved text.`;

    const userPrompt = `Rewrite this resume to better pass ATS, integrating these missing keywords where appropriate:
MISSING KEYWORDS: ${(missingKeywords || []).join(', ')}

CURRENT RESUME (JSON):
${JSON.stringify(resume, null, 2)}`;

    const tools = [{
      type: "function",
      function: {
        name: "return_resume",
        description: "Return the improved resume.",
        parameters: {
          type: "object",
          properties: {
            personalInfo: {
              type: "object",
              properties: {
                name: { type: "string" }, email: { type: "string" },
                phone: { type: "string" }, location: { type: "string" },
                summary: { type: "string" },
                linkedin: { type: "string" }, github: { type: "string" }, portfolio: { type: "string" },
              },
              required: ["name", "email", "phone", "location", "summary", "linkedin", "github", "portfolio"],
              additionalProperties: false,
            },
            experiences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" }, position: { type: "string" },
                  duration: { type: "string" }, description: { type: "string" },
                },
                required: ["company", "position", "duration", "description"],
                additionalProperties: false,
              },
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  school: { type: "string" }, degree: { type: "string" }, year: { type: "string" },
                },
                required: ["school", "degree", "year"],
                additionalProperties: false,
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" }, tech: { type: "string" },
                  description: { type: "string" }, link: { type: "string" },
                },
                required: ["name", "tech", "description", "link"],
                additionalProperties: false,
              },
            },
            certifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" }, issuer: { type: "string" }, year: { type: "string" },
                },
                required: ["name", "issuer", "year"],
                additionalProperties: false,
              },
            },
            skills: { type: "array", items: { type: "string" } },
          },
          required: ["personalInfo", "experiences", "education", "projects", "certifications", "skills"],
          additionalProperties: false,
        },
      },
    }];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "return_resume" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error('Invalid AI response');
    const improved = JSON.parse(args);

    return new Response(JSON.stringify({ resume: improved }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('improve-resume error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
