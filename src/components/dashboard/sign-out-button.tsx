"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-slate-600 transition hover:border-slate-300 hover:text-ink focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
