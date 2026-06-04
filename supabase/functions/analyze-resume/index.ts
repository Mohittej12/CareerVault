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
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Resume text and job description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing resume with AI...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and resume parser.
You will:
1. Score how well the resume matches the job description (0-100).
2. Identify strengths and improvements.
3. Extract keywords from the job description: matched (present in resume) and missing.
4. EXHAUSTIVELY parse the resume into structured fields. Extract EVERY job, EVERY degree, EVERY skill, EVERY project, EVERY certification, and ALL links (LinkedIn, GitHub, portfolio, personal website).

Be exhaustive. Never invent facts. If a section is missing in the resume, return an empty array.`;

    const userPrompt = `Analyze this resume against the job description and extract complete structured data.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

    const tools = [
      {
        type: "function",
        function: {
          name: "return_analysis",
          description: "Return ATS analysis and structured resume data.",
          parameters: {
            type: "object",
            properties: {
              matchScore: { type: "number", description: "0-100 ATS match score" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              keywordsMatched: { type: "array", items: { type: "string" } },
              keywordsMissing: { type: "array", items: { type: "string" } },
              extractedResume: {
                type: "object",
                properties: {
                  personalInfo: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      location: { type: "string" },
                      summary: { type: "string" },
                      linkedin: { type: "string", description: "LinkedIn URL or empty string" },
                      github: { type: "string", description: "GitHub URL or empty string" },
                      portfolio: { type: "string", description: "Portfolio/personal website URL or empty string" },
                    },
                    required: ["name", "email", "phone", "location", "summary", "linkedin", "github", "portfolio"],
                    additionalProperties: false,
                  },
                  experiences: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string" },
                        position: { type: "string" },
                        duration: { type: "string" },
                        description: { type: "string", description: "Use newline-separated bullet points (start each with • or -) when the resume has bullets." },
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
                        school: { type: "string" },
                        degree: { type: "string" },
                        year: { type: "string" },
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
                        name: { type: "string" },
                        tech: { type: "string", description: "Technologies/stack used, comma separated. Empty string if unknown." },
                        description: { type: "string" },
                        link: { type: "string", description: "Project URL or empty string" },
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
                        name: { type: "string" },
                        issuer: { type: "string" },
                        year: { type: "string" },
                      },
                      required: ["name", "issuer", "year"],
                      additionalProperties: false,
                    },
                  },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "Flat list of every skill found in the resume.",
                  },
                },
                required: ["personalInfo", "experiences", "education", "projects", "certifications", "skills"],
                additionalProperties: false,
              },
            },
            required: [
              "matchScore",
              "strengths",
              "improvements",
              "keywordsMatched",
              "keywordsMissing",
              "extractedResume",
            ],
            additionalProperties: false,
          },
        },
      },
    ];

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
        tools,
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call returned:', JSON.stringify(data));
      throw new Error('Invalid AI response format');
    }

    let analysis;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error('Failed to parse tool args:', toolCall.function.arguments);
      throw new Error('Invalid AI response format');
    }

    console.log('AI analysis complete');

    return new Response(
      JSON.stringify({
        matchScore: analysis.matchScore || 0,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        keywords: {
          matched: analysis.keywordsMatched || [],
          missing: analysis.keywordsMissing || [],
        },
        extractedResume: analysis.extractedResume || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
