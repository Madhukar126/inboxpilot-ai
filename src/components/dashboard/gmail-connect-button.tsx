"use client";

import { MailPlus } from "lucide-react";
import { signIn } from "next-auth/react";

import { cn } from "@/lib/cn";

type GmailConnectButtonProps = {
  className?: string;
  label?: string;
};

export function GmailConnectButton({
  className,
  label = "Connect Gmail"
}: GmailConnectButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        signIn(
          "google",
          { callbackUrl: "/dashboard" },
          {
            access_type: "offline",
            prompt: "consent"
          }
        )
      }
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
    >
      <MailPlus className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
