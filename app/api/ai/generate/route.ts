import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY. Please add it to your .env.local file." },
      { status: 500 }
    );
  }

  try {
    const { prompt, systemInstruction, context } = await req.json();

    // Inject context into the prompt
    let fullPrompt = prompt;
    if (context && Object.keys(context).length > 0) {
      fullPrompt = `[Context Information]\n${JSON.stringify(context, null, 2)}\n\n[Instructions]\n${prompt}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction }] }
            : undefined,
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Gemini API returned error: ${errText}` },
        { status: response.status }
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return new Response("No reader available", { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
        let braceCount = 0;
        let startIndex = -1;
        let inString = false;
        let escapeNext = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            for (let i = 0; i < buffer.length; i++) {
              const char = buffer[i];
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              if (char === "\\") {
                escapeNext = true;
                continue;
              }
              if (char === '"') {
                inString = !inString;
                continue;
              }
              if (!inString) {
                if (char === "{") {
                  if (braceCount === 0) startIndex = i;
                  braceCount++;
                } else if (char === "}") {
                  braceCount--;
                  if (braceCount === 0 && startIndex !== -1) {
                    const objStr = buffer.substring(startIndex, i + 1);
                    try {
                      const obj = JSON.parse(objStr);
                      const text = obj.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (text) {
                        controller.enqueue(encoder.encode(text));
                      }
                    } catch {
                      // ignore
                    }
                    buffer = buffer.substring(i + 1);
                    i = -1; // reset loop to scan new buffer
                  }
                }
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });
  } catch (err: unknown) {
    console.error("AI Generate Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate AI content" },
      { status: 500 }
    );
  }
}
