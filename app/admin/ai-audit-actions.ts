"use server";

import fs from "fs";
import path from "path";

export async function callGeminiJson(prompt: string): Promise<Record<string, unknown>> {
  // 1. Check local Ollama first
  if (process.env.OLLAMA_MODEL) {
    try {
      const response = await fetch("http://127.0.0.1:11434/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });
      if (response.ok) {
        const result = await response.json();
        const textContent = result.choices?.[0]?.message?.content || "{}";
        return JSON.parse(textContent) as Record<string, unknown>;
      } else {
        const text = await response.text();
        console.warn(`Ollama returned status ${response.status}: ${text}`);
      }
    } catch (err) {
      console.warn("Ollama is not running or failed, falling back to other providers:", err);
    }
  }

  // 2. Check OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://saumya.space",
          "X-Title": "Saumya Portfolio Admin",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash:free",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });
      if (response.ok) {
        const result = await response.json();
        const textContent = result.choices?.[0]?.message?.content || "{}";
        return JSON.parse(textContent) as Record<string, unknown>;
      } else {
        const text = await response.text();
        console.warn(`OpenRouter returned status ${response.status}: ${text}`);
      }
    } catch (err) {
      console.error("OpenRouter error, falling back to Gemini:", err);
    }
  }

  // 3. Fallback to Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanJson = textContent.replace(/```json/i, "").replace(/```/, "").trim();
        return JSON.parse(cleanJson) as Record<string, unknown>;
      }
    } catch (err) {
      console.warn("Gemini API failed, falling back to Pollinations AI:", err);
    }
  }

  // 4. Ultimate keyless fallback: Pollinations AI
  try {
    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt + "\n\nCRITICAL: Return ONLY a valid JSON object matching the requested schema. No markdown formatting, no preambles." }],
        jsonMode: true
      })
    });
    if (res.ok) {
      const text = await res.text();
      try {
        const cleanJson = text.replace(/```json/i, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson) as Record<string, unknown>;
      } catch (e) {
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const candidate = text.substring(firstBrace, lastBrace + 1);
          return JSON.parse(candidate) as Record<string, unknown>;
        }
        throw e;
      }
    } else {
      console.error(`Pollinations AI returned status ${res.status}`);
    }
  } catch (err) {
    console.error("Pollinations AI keyless fallback failed:", err);
  }

  throw new Error("All AI providers (Ollama, OpenRouter, Gemini, Pollinations) failed or are unconfigured.");
}

export async function runProjectAudit(projectFields: Record<string, unknown>) {
  const coverImage = String(projectFields.coverImage || "");
  const galleryImages = String(projectFields.galleryImages || "");
  const galleryCount = galleryImages.split(",").filter((u) => u.length > 0).length;

  const prompt = `
Evaluate the overall completeness of the following project details.
Calculate an overall Quality Score (0-100) based on completeness (is there a title, slug, overview, short description, technologies, tags, cover image, and gallery images?).
Provide an array of missing critical fields and general suggestions.

Project Title: "${projectFields.title || ""}"
Release Year: "${projectFields.year || ""}"
Short Description: "${projectFields.description || ""}"
Detailed Overview: "${projectFields.overview || ""}"
Technologies: "${projectFields.technologies || ""}"
Tags: "${projectFields.tags || ""}"
Cover Image Status: "${coverImage ? "Present" : "Missing"}"
Gallery Count: ${galleryCount}

Return exactly in this JSON format:
{
  "overallScore": number,
  "missing": string[],
  "suggestions": string[]
}
`;
  try {
    const data = await callGeminiJson(prompt);
    return {
      overallScore: typeof data.overallScore === "number" ? data.overallScore : 0,
      missing: Array.isArray(data.missing) ? (data.missing as string[]) : [],
      suggestions: Array.isArray(data.suggestions) ? (data.suggestions as string[]) : [],
      error: undefined,
    };
  } catch (err: unknown) {
    return {
      overallScore: 0,
      missing: [],
      suggestions: [],
      error: err instanceof Error ? err.message : "Failed to audit project.",
    };
  }
}

export async function runEngineeringReview(projectFields: Record<string, unknown>) {
  const prompt = `
Perform a critical Engineering Review of this project description.
Critique the project's:
1. Methodology (how the engineering work was performed).
2. Validation (how outputs or accuracy were validated).
3. Testing (what tests were executed).
4. Results (performance metrics, findings).
5. Limitations (what constraints exist, boundary conditions).

Evaluate and assign an Engineering Score (0-100) based on these criteria. Provide a critique summary and specific recommendations (e.g. calibration, concrete mix proportions, sensor tests).

Project Title: "${projectFields.title || ""}"
Detailed Overview: "${projectFields.overview || ""}"
Technologies: "${projectFields.technologies || ""}"

Return exactly in this JSON format:
{
  "engineeringScore": number,
  "critique": string,
  "suggestions": string[]
}
`;
  try {
    const data = await callGeminiJson(prompt);
    return {
      engineeringScore: typeof data.engineeringScore === "number" ? data.engineeringScore : 0,
      critique: typeof data.critique === "string" ? data.critique : "",
      suggestions: Array.isArray(data.suggestions) ? (data.suggestions as string[]) : [],
      error: undefined,
    };
  } catch (err: unknown) {
    return {
      engineeringScore: 0,
      critique: "",
      suggestions: [],
      error: err instanceof Error ? err.message : "Failed to run engineering critique.",
    };
  }
}

export async function runSEOAudit(projectFields: Record<string, unknown>) {
  const prompt = `
Audit the SEO meta fields for this project.
Evaluate Title, Slug, Description, and Keywords.
Calculate an SEO Score (0-100).
Suggest an optimized SEO Title, Meta Description (max 160 characters), and a short critique with suggestions.

Project Title: "${projectFields.title || ""}"
Slug: "${projectFields.slug || ""}"
Short Description: "${projectFields.description || ""}"
Tags: "${projectFields.tags || ""}"

Return exactly in this JSON format:
{
  "seoScore": number,
  "seoTitle": string,
  "metaDescription": string,
  "critique": string,
  "suggestions": string[]
}
`;
  try {
    const data = await callGeminiJson(prompt);
    return {
      seoScore: typeof data.seoScore === "number" ? data.seoScore : 0,
      seoTitle: typeof data.seoTitle === "string" ? data.seoTitle : "",
      metaDescription: typeof data.metaDescription === "string" ? data.metaDescription : "",
      critique: typeof data.critique === "string" ? data.critique : "",
      suggestions: Array.isArray(data.suggestions) ? (data.suggestions as string[]) : [],
      error: undefined,
    };
  } catch (err: unknown) {
    return {
      seoScore: 0,
      seoTitle: "",
      metaDescription: "",
      critique: "",
      suggestions: [],
      error: err instanceof Error ? err.message : "Failed to run SEO audit.",
    };
  }
}

export async function runMediaAudit(projectFields: Record<string, unknown>) {
  const galleryImages = String(projectFields.galleryImages || "");
  const galleryCount = galleryImages.split(",").filter((u) => u.length > 0).length;

  const prompt = `
Audit the media configuration for this project.
Check cover image and gallery images list.
Evaluate if image alt texts and captions are likely missing or generic.
Calculate a Media Score (0-100). Provide specific media critique and layout/ordering recommendations.

Cover Image: "${projectFields.coverImage || ""}"
Gallery Count: ${galleryCount}

Return exactly in this JSON format:
{
  "mediaScore": number,
  "critique": string,
  "suggestions": string[]
}
`;
  try {
    const data = await callGeminiJson(prompt);
    return {
      mediaScore: typeof data.mediaScore === "number" ? data.mediaScore : 0,
      critique: typeof data.critique === "string" ? data.critique : "",
      suggestions: Array.isArray(data.suggestions) ? (data.suggestions as string[]) : [],
      error: undefined,
    };
  } catch (err: unknown) {
    return {
      mediaScore: 0,
      critique: "",
      suggestions: [],
      error: err instanceof Error ? err.message : "Failed to run media audit.",
    };
  }
}

export async function generateVisionMetadataAction(imageUrl: string, mimeType: string = "image/jpeg") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "Missing GEMINI_API_KEY." };
  }

  try {
    let base64Data = "";
    if (imageUrl.startsWith("http")) {
      const res = await fetch(imageUrl);
      const buffer = await res.arrayBuffer();
      base64Data = Buffer.from(buffer).toString("base64");
    } else {
      // Local file
      const localPath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        base64Data = buffer.toString("base64");
      } else {
        throw new Error(`Local file not found at ${localPath}`);
      }
    }

    let data: any = null;

    if (process.env.OLLAMA_MODEL && (process.env.OLLAMA_MODEL.includes("llava") || process.env.OLLAMA_MODEL.includes("vision") || process.env.OLLAMA_MODEL.includes("llama"))) {
      try {
        const response = await fetch("http://127.0.0.1:11434/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyze this image for a professional engineering/creative portfolio. Return a suggested SEO alt_text (1 sentence), a detailed caption (1-2 sentences), a suggested broad category (e.g. Civil Engineering, Photography, Architecture, IoT), and a list of 5 specific keyword tags. Return exactly in this JSON format:\n{\n  \"altText\": \"string\",\n  \"caption\": \"string\",\n  \"category\": \"string\",\n  \"tags\": [\"string\"]\n}"
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType || "image/jpeg"};base64,${base64Data}`
                    }
                  }
                ]
              }
            ],
            response_format: { type: "json_object" }
          })
        });
        if (response.ok) {
          const result = await response.json();
          const textContent = result.choices?.[0]?.message?.content || "{}";
          data = JSON.parse(textContent);
        } else {
          const text = await response.text();
          console.warn(`Ollama vision returned status ${response.status}: ${text}`);
        }
      } catch (err) {
        console.warn("Ollama vision analysis failed, falling back to other providers:", err);
      }
    }

    if (!data && process.env.OPENROUTER_API_KEY) {
      try {
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://saumya.space",
            "X-Title": "Saumya Portfolio Admin",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash:free",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyze this image for a professional engineering/creative portfolio. Return a suggested SEO alt_text (1 sentence), a detailed caption (1-2 sentences), a suggested broad category (e.g. Civil Engineering, Photography, Architecture, IoT), and a list of 5 specific keyword tags. Return exactly in this JSON format:\n{\n  \"altText\": \"string\",\n  \"caption\": \"string\",\n  \"category\": \"string\",\n  \"tags\": [\"string\"]\n}"
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType || "image/jpeg"};base64,${base64Data}`
                    }
                  }
                ]
              }
            ],
            response_format: { type: "json_object" }
          })
        });
        if (openRouterResponse.ok) {
          const result = await openRouterResponse.json();
          const textContent = result.choices?.[0]?.message?.content || "{}";
          data = JSON.parse(textContent);
        } else {
          const text = await openRouterResponse.text();
          console.warn(`OpenRouter image analysis returned status ${openRouterResponse.status}: ${text}`);
        }
      } catch (err) {
        console.error("OpenRouter image analysis error, falling back to Gemini:", err);
      }
    }

    if (!data && apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Analyze this image for a professional engineering/creative portfolio. Return a suggested SEO alt_text (1 sentence), a detailed caption (1-2 sentences), a suggested broad category (e.g. Civil Engineering, Photography, Architecture, IoT), and a list of 5 specific keyword tags. Return exactly in this JSON format:\n{\n  \"altText\": \"string\",\n  \"caption\": \"string\",\n  \"category\": \"string\",\n  \"tags\": [\"string\"]\n}"
                    },
                    {
                      inlineData: {
                        mimeType: mimeType || "image/jpeg",
                        data: base64Data
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: "application/json",
              },
            })
          }
        );

        if (response.ok) {
          const result = await response.json();
          const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          data = JSON.parse(textContent);
        }
      } catch (err) {
        console.warn("Gemini vision analysis failed, falling back to Pollinations AI filename guessing:", err);
      }
    }

    if (!data) {
      try {
        console.log("Using Pollinations AI keyless fallback for image metadata (based on filename)...");
        const cleanName = imageUrl.split("/").pop() || imageUrl;
        const prompt = `Based on the image filename "${cleanName}", guess and return:
1. SEO alt_text (1 sentence)
2. Detailed caption (1-2 sentences)
3. Suggested broad category (e.g. Civil Engineering, Photography, Architecture, IoT)
4. List of 5 specific keyword tags

Return exactly in this JSON format:
{
  "altText": "string",
  "caption": "string",
  "category": "string",
  "tags": ["string"]
}`;
        const res = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt + "\n\nCRITICAL: Return ONLY a valid JSON object matching the requested schema. No markdown formatting, no preambles." }],
            jsonMode: true
          })
        });
        if (res.ok) {
          const text = await res.text();
          try {
            const cleanJson = text.replace(/```json/i, "").replace(/```/g, "").trim();
            data = JSON.parse(cleanJson);
          } catch (e) {
            const firstBrace = text.indexOf("{");
            const lastBrace = text.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              const candidate = text.substring(firstBrace, lastBrace + 1);
              data = JSON.parse(candidate);
            } else {
              throw e;
            }
          }
        }
      } catch (err) {
        console.error("Pollinations AI filename-based analysis failed:", err);
      }
    }

    return {
      success: true,
      metadata: {
        altText: typeof data.altText === "string" ? data.altText : "",
        caption: typeof data.caption === "string" ? data.caption : "",
        category: typeof data.category === "string" ? data.category : "",
        tags: Array.isArray(data.tags) ? data.tags.map(String) : []
      }
    };
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Gemini Vision error:", e);
    return { error: e.message };
  }
}

export async function generateProjectCaseStudyAction(
  title: string,
  overview: string,
  technologies: string[]
) {
  const prompt = `
Generate a comprehensive, professional engineering case study for a project named "${title}".
Based on this short overview: "${overview}"
And using these technologies: ${technologies.join(", ")}.

Ensure it is realistic in nature, focusing on actual engineering workflows, physical/standards constraints (like IS codes if civil, or latency/data-rate if IoT), and real testing methods.

Structure the response with detailed content for each of these sections (do not write placeholder summaries):
1. Detailed Technical Overview (markdown paragraphs).
2. The exact engineering challenges faced (at least 2 challenges, focusing on calibration, structural limits, or sensor noise).
3. The technical solution and implementation steps.
4. Key outcomes and performance metrics.
5. Future improvements or roadmap additions.

Return exactly in this JSON format:
{
  "detailedOverview": "string (markdown)",
  "challenges": "string",
  "solution": "string",
  "keyOutcomes": ["string"],
  "lessonsLearned": ["string"],
  "futureImprovements": "string"
}
`;

  try {
    const data = await callGeminiJson(prompt);
    return {
      success: true,
      caseStudy: {
        detailedOverview: typeof data.detailedOverview === "string" ? data.detailedOverview : "",
        challenges: typeof data.challenges === "string" ? data.challenges : "",
        solution: typeof data.solution === "string" ? data.solution : "",
        keyOutcomes: Array.isArray(data.keyOutcomes) ? data.keyOutcomes.map(String) : [],
        lessonsLearned: Array.isArray(data.lessonsLearned) ? data.lessonsLearned.map(String) : [],
        futureImprovements: typeof data.futureImprovements === "string" ? data.futureImprovements : ""
      }
    };
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Case study generation error:", e);
    return { error: e.message };
  }
}

export async function generateLinkedInPostAction(
  title: string,
  overview: string,
  technologies: string[]
) {
  const prompt = `
Generate a professional, recruiter-oriented LinkedIn post sharing that I have completed a new engineering project: "${title}".
Based on this overview: "${overview}"
Utilizing these technologies: ${technologies.join(", ")}.

CRITICAL CONSTRAINT: Do NOT include any confidential details, specific IP, code patterns, formulas, or proprietary methodology that could be stolen. Keep it high-level, focusing on the engineering impact, challenges solved, skills applied, and outcomes achieved.
Tone: Enthusiastic, professional, senior-engineer level, and highly attractive to recruiters.
Include 3-5 relevant hashtags (e.g., #Engineering, #CivilEngineering, #IoT, #ConstructionTech) at the end.

Return exactly in this JSON format:
{
  "postText": "string (the exact post body ready for sharing)"
}
`;

  try {
    const data = await callGeminiJson(prompt);
    return {
      success: true,
      postText: typeof data.postText === "string" ? data.postText : ""
    };
  } catch (err: unknown) {
    const e = err as Error;
    console.error("LinkedIn post generation error:", e);
    return { error: e.message };
  }
}

export async function generateFieldFixAction(
  projectFields: Record<string, unknown>,
  fieldToFix: string,
  context?: string
) {
  const prompt = `
You are an expert engineering portfolio assistant.
A project is missing a field or needs a field improved: "${fieldToFix}".
Additional Context / Suggestion: "${context || "Generate an appropriate value for this field."}"

Project Title: "${projectFields.title || ""}"
Short Description: "${projectFields.description || ""}"
Overview: "${projectFields.overview || ""}"

Please generate the optimal text for the field: "${fieldToFix}".
If it's "tags" or "technologies", return a comma-separated list.
If it's "slug", return a URL-friendly slug.

Return exactly in this JSON format:
{
  "suggestedValue": "string"
}
`;

  try {
    const data = await callGeminiJson(prompt);
    return {
      success: true,
      suggestedValue: typeof data.suggestedValue === "string" ? data.suggestedValue : ""
    };
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Field fix generation error:", e);
    return { error: e.message };
  }
}
