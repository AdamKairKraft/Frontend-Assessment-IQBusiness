"use client";

import { useTransition } from "react";
import { deleteUserAction } from "../actions";

export function DeleteUserButton({ userId, userName }: { userId: number; userName: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete ${userName}? This also removes their orders and notes.`)) {
          return;
        }
        startTransition(async () => {
          // redirect() throws on success, so we only get here on failure
          const result = await deleteUserAction(userId);
          if (result?.error) {
            window.alert(result.error);
          }
        });
      }}
      className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Deleting…" : "Delete user"}
    </button>
  );
}
