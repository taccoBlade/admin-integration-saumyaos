import { getResumeUrl } from "@/lib/content";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const resumeUrl = await getResumeUrl();
    if (resumeUrl && resumeUrl !== "#" && resumeUrl.startsWith("http")) {
      const response = await fetch(resumeUrl, { cache: "no-store" });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'inline; filename="Saumya_Parekh_CV.pdf"',
            "Cache-Control": "public, max-age=0, must-revalidate",
          },
        });
      }
      // Fallback redirect if streaming fetch returns error
      return NextResponse.redirect(resumeUrl, { status: 307 });
    }
  } catch (error) {
    console.error("Failed to serve dynamic resume:", error);
  }

  // Fallback to static resume in public folder
  return NextResponse.redirect(new URL("/saumya-resume.pdf", request.url), { status: 307 });
}

