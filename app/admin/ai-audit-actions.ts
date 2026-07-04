"use server";

async function callGeminiJson(prompt: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Please add it to your .env.local file.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error: ${text}`);
  }

  const result = await response.json();
  const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  try {
    return JSON.parse(textContent) as Record<string, unknown>;
  } catch {
    console.error("JSON parsing error:", textContent);
    return {};
  }
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
