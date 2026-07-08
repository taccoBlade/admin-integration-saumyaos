"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { callGeminiJson } from "./ai-audit-actions";

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

export const generateLatexResumeAction = actionClient
  .schema(z.object({}))
  .action(async () => {
    const supabase = await createSupabaseServerClient();
    
    // Fetch site settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    const ownerName = settings?.owner_name || "John Doe";
    const headline = settings?.headline || "Software Engineer";
    const email = settings?.contact_json?.email || "email@example.com";
    
    // Fetch projects
    const { data: projects } = await supabase
      .from("projects")
      .select("title, year, description, technologies, role")
      .eq("status", "published")
      .order("year", { ascending: false });

    // Fetch skills
    const { data: skills } = await supabase
      .from("skills")
      .select("name, base_strength")
      .eq("status", "published")
      .order("base_strength", { ascending: false });
      
    // Fetch timeline events (experience/education)
    const { data: timeline } = await supabase
      .from("timeline_events")
      .select("title, description, event_type, year, location, organization")
      .eq("status", "published")
      .order("year", { ascending: false });

  const prompt = `
  You are an expert LaTeX resume generator. 
  I need you to generate a full, compilable LaTeX document (using standard packages like article, geometry, enumitem, hyperref) for a professional resume.
  
  CRITICAL DESIGN RULES:
  1. Make the resume EXTREMELY concise and impactful, fitting on exactly 1 page.
  2. For each project and experience, generate 2-3 crisp, action-oriented bullet points (similar to top tech resumes). Do not just copy the descriptions; summarize them to highlight engineering impact, technologies used, and outcomes.
  3. Group skills logically (e.g., Languages, Frameworks, Tools) instead of a raw list.
  4. You MUST use the exact structural style defined in the REFERENCE LATEX TEMPLATE below. Just replace the dummy content with the real data provided. Do not use a different documentclass or layout logic.
  
  REFERENCE LATEX TEMPLATE:
  \\documentclass[11pt]{article}
  \\usepackage[a4paper, margin=0.65in]{geometry}
  \\usepackage{titlesec}
  \\usepackage{enumitem}
  \\usepackage[hidelinks]{hyperref}
  \\usepackage{xcolor}
  \\usepackage{parskip}
  \\usepackage{tgheros}
  \\renewcommand{\\familydefault}{\\sfdefault}
  \\usepackage[T1]{fontenc}
  
  \\definecolor{accent}{HTML}{1F4E79}
  \\definecolor{textgray}{HTML}{444444}
  
  \\titleformat{\\section}{\\large\\bfseries\\color{accent}\\uppercase}{}{0em}{}[\\vspace{-0.4em}\\rule{\\textwidth}{1pt}]
  \\titlespacing*{\\section}{0pt}{1.2em}{0.8em}
  
  \\newcommand{\\resumeSubheading}[4]{
    \\vspace{0.4em}\\noindent
    \\begin{tabular*}{\\textwidth}{@{}l@{\\extracolsep{\\fill}}r@{}}
      \\textbf{#1} & \\textit{#2} \\\\
      \\textit{#3} & \\textit{#4} \\\\
    \\end{tabular*}\\vspace{0.2em}
  }
  \\newcommand{\\resumeProjectHeading}[2]{
    \\vspace{0.4em}\\noindent
    \\begin{tabular*}{\\textwidth}{@{}l@{\\extracolsep{\\fill}}r@{}}
      \\textbf{#1} & \\textit{#2} \\\\
    \\end{tabular*}\\vspace{0.2em}
  }
  
  \\begin{document}
  \\pagestyle{empty}
  \\begin{center}
      {\\Huge\\bfseries\\color{accent} Name}\\\\[0.4em]
      {\\large Headline}\\\\[0.4em]
      \\textcolor{textgray}{Email | Links}
  \\end{center}
  % (use similar \\section and \\resumeSubheading / \\resumeProjectHeading blocks for Experience, Education, Projects, and Skills)
  \\end{document}
  
  Here is the data from my database:
  Name: ${ownerName}
  Headline: ${headline}
  Email: ${email}
  
  EXPERIENCE / EDUCATION:
  ${JSON.stringify(timeline, null, 2)}
  
  PROJECTS:
  ${JSON.stringify(projects, null, 2)}
  
  SKILLS:
  ${JSON.stringify(skills, null, 2)}
  
  CRITICAL INSTRUCTIONS:
  1. STRICT CONTENT RULES: You must ONLY use data provided in the JSON below. NO HALLUCINATIONS. Do not invent technologies, metrics, or experiences that are not explicitly present.
  2. Bullet points MUST start with strong action verbs and include quantified achievements where data is available. Use ATS-friendly terminology.
  3. The LaTeX template is completely fixed. Do not add packages or alter the structure. Just inject the content.
  4. Escape special characters like &, %, $, #, _, {, }, ~, ^, \\ properly in LaTeX.
  5. Return ONLY a valid JSON object matching the format below. Do not include markdown formatting like \`\`\`json.
  
  Return exactly in this JSON format:
  {
    "latexCode": "string (the raw, complete LaTeX code starting with \\documentclass)"
  }
  `;
  
    try {
      const data = await callGeminiJson(prompt);
      return {
        latexCode: typeof data.latexCode === "string" ? data.latexCode : ""
      };
    } catch (err: unknown) {
      const e = err as Error;
      console.error("LaTeX generation error:", e);
      throw new Error(e.message);
    }
  });
