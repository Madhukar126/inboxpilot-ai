"use client";

import { Mail } from "lucide-react";
import { signIn } from "next-auth/react";

import { cn } from "@/lib/cn";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
  className?: string;
  label?: string;
};

export function GoogleSignInButton({
  callbackUrl = "/dashboard",
  className,
  label = "Continue with Google"
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        signIn(
          "google",
          { callbackUrl },
          {
            access_type: "offline",
            prompt: "consent"
          }
        )
      }
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
    >
      <Mail className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
