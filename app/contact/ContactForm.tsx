"use client";

import { useFormStatus } from "react-dom";
import { submitContactMessage } from "./actions";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useRef, useActionState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative px-8 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-white hover:text-[#08090b] hover:bg-white hover:border-white transition-all duration-350 font-bold font-mono text-xs overflow-hidden flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
    >
      <span>{pending ? "SENDING..." : "SEND MESSAGE"}</span>
      {!pending && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactMessage, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="w-full max-w-xl mx-auto flex flex-col gap-4 mb-12">
      {state?.success && (
        <div className="flex items-center gap-2 p-4 border border-green-500/20 bg-green-500/10 text-green-400 rounded-lg text-sm font-mono mb-2">
          <CheckCircle className="w-4 h-4" />
          <span>Message sent successfully! I'll get back to you soon.</span>
        </div>
      )}
      {state?.error && (
        <div className="flex items-center gap-2 p-4 border border-red-500/20 bg-red-500/10 text-red-400 rounded-lg text-sm font-mono mb-2">
          <AlertCircle className="w-4 h-4" />
          <span>{state.error}</span>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="name" className="sr-only">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Name"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-attention-500/50 focus:ring-1 focus:ring-attention-500/50 transition-all font-mono"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Email Address"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-attention-500/50 focus:ring-1 focus:ring-attention-500/50 transition-all font-mono"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="message" className="sr-only">Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="What's on your mind?"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-attention-500/50 focus:ring-1 focus:ring-attention-500/50 transition-all font-mono resize-none"
        />
      </div>

      <div className="flex justify-end mt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
