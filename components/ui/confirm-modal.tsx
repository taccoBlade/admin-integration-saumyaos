/**
 * ConfirmModal – lightweight replacement for browser confirm() / alert().
 *
 * Usage:
 *   const { modal, confirm } = useConfirmModal();
 *   const ok = await confirm({ title: "Delete item?", description: "This cannot be undone." });
 *   if (ok) doDelete();
 *   {modal}
 */
"use client";

import React, { useCallback, useRef, useState } from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmModalState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmModalState | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...opts, resolve });
    });
  }, []);

  const handleClose = useCallback((value: boolean) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ConfirmModal] User chose:", value);
    }
    state?.resolve(value);
    setState(null);
  }, [state]);

  const modal = state ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby={state.description ? "confirm-modal-desc" : undefined}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-[#121417] border border-white/10 rounded-xl shadow-glass w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <h2
          id="confirm-modal-title"
          className="text-base font-semibold text-white"
        >
          {state.title}
        </h2>
        {state.description && (
          <p
            id="confirm-modal-desc"
            className="text-sm text-white/60 leading-relaxed"
          >
            {state.description}
          </p>
        )}
        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            aria-label={state.cancelLabel ?? "Cancel"}
            onClick={() => handleClose(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 border border-white/10 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition"
          >
            {state.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            aria-label={state.confirmLabel ?? "Confirm"}
            onClick={() => handleClose(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition ${
              state.danger
                ? "bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-400"
                : "bg-attention-500 hover:bg-attention-hover text-black focus-visible:ring-attention-400"
            }`}
          >
            {state.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { modal, confirm };
}
