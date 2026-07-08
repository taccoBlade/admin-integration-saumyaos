"use server";

import { callGeminiJson } from "./ai-audit-actions";
import { GrowthPage } from "./growth-actions";

export async function generateSeoReviewAction(page: GrowthPage) {
  // We feed the page content to Gemini and ask it to review against SEO best practices.
  const prompt = `
You are an expert technical SEO reviewer. Review the following structured content blocks for an SEO landing page.
The target primary keyword intent is unknown, but assume it targets high-intent tech/engineering traffic.

Content Blocks:
${JSON.stringify(page.content_blocks, null, 2)}

Provide a strict, critical SEO review. Return a JSON object exactly matching this format:
{
  "score": number, // 0-100
  "suggestions": [
    {
      "status": "pass" | "warn" | "fail",
      "message": string // e.g. "Heading too short", "FAQ missing", "Keyword density low"
    }
  ]
}
  `;

  try {
    const result = await callGeminiJson(prompt);
    return result as { score: number; suggestions: Array<{ status: string; message: string }> };
  } catch (error) {
    console.error("AI SEO Review failed:", error);
    return {
      score: 50,
      suggestions: [{ status: "warn", message: "Failed to generate AI review." }],
    };
  }
}

export interface AiContentBrief {
  targetKeyword: string;
  intent: string;
  audience: string;
  readingLevel: string;
  competitors: string;
  tone: string;
}

export async function analyzeContentHealthAction(page: GrowthPage) {
  const prompt = `
You are an expert Content Health Analyzer for SEO. Review these content blocks.
Content Blocks:
${JSON.stringify(page.content_blocks, null, 2)}

Provide a strict Content Health report. Return ONLY a JSON object exactly matching this format:
{
  "readingTimeMinutes": number,
  "headingStructureScore": number, // 0-100
  "linkDensityScore": number, // 0-100
  "accessibilityScore": number, // 0-100
  "issues": [
    {
      "type": "Broken Image" | "Long Paragraph" | "Missing Alt Text" | "Duplicate Section" | "Heading Structure",
      "message": string
    }
  ]
}
  `;

  try {
    const result = await callGeminiJson(prompt);
    return result as { 
      readingTimeMinutes: number; 
      headingStructureScore: number; 
      linkDensityScore: number; 
      accessibilityScore: number; 
      issues: Array<{ type: string; message: string }> 
    };
  } catch (error) {
    console.error("AI Content Health failed:", error);
    return null;
  }
}

export async function generateContentBlockDraftAction(
  blockType: string,
  pageContext: any,
  existingBlocks: any[],
  brief?: AiContentBrief
) {
  const prompt = `
You are an expert technical copywriter for a high-end engineering portfolio.
Draft a new content block of type: "${blockType}".

Page Context (what this page is about):
${JSON.stringify(pageContext, null, 2)}

Content Brief (Follow strictly):
${JSON.stringify(brief || {}, null, 2)}

Existing Blocks on the page:
${JSON.stringify(existingBlocks, null, 2)}

Instructions:
- If blockType is "Hero", provide "title" and "description".
- If blockType is "Problem", provide "statement" and "details".
- If blockType is "Solution", provide "overview" and "features" (array of strings).
- If blockType is "FAQ", provide "faqs" (array of {question, answer}).
- Return ONLY valid JSON matching the structure of the block type requested. No markdown blocks.
  `;

  try {
    const result = await callGeminiJson(prompt);
    return {
      type: blockType,
      data: result,
    };
  } catch (error) {
    console.error("AI Content Generation failed:", error);
    throw new Error("Failed to generate content block.");
  }
}

export async function computeRelatedProjectsAction(
  page: GrowthPage,
  allProjects: any[]
) {
  // A simple weighted overlap algorithm for projects based on JSON attributes.
  // In a real scenario, this could use pgvector or more complex matching.
  const pageTech = new Set(page.related_technologies || []);
  const pageInd = new Set(page.related_services || []); // Treating services/industries similarly for matching
  
  const scoredProjects = allProjects.map(project => {
    let score = 0;
    const pTech = project.source_json?.software_components || [];
    const pEng = project.source_json?.engineering_concepts || [];
    const pDom = project.source_json?.domain || "";

    pTech.forEach((t: string) => { if (pageTech.has(t)) score += 2; });
    pEng.forEach((t: string) => { if (pageTech.has(t)) score += 1; });
    if (pageInd.has(pDom)) score += 3;

    return { project, score };
  });

  return scoredProjects
    .filter(sp => sp.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(sp => sp.project);
}
