export const AIService = {
  async generateStream(
    prompt: string,
    systemInstruction: string,
    context: Record<string, unknown>,
    onChunk: (text: string) => void,
    onDone?: () => void,
    onError?: (err: Error) => void,
    signal?: AbortSignal
  ) {
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction, context }),
        signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to generate content.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is not readable.");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        onChunk(text);
      }
      if (onDone) onDone();
    } catch (err: unknown) {
      if (onError && !(err instanceof DOMException && err.name === "AbortError")) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }
};
