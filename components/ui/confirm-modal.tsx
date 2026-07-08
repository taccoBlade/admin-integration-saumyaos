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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    <AlertDialog open={!!state} onOpenChange={(open) => {
      if (!open) handleClose(false);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          {state.description && (
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleClose(false)}>
            {state.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => handleClose(true)}
            className={state.danger ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            {state.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null;

  return { modal, confirm };
}
