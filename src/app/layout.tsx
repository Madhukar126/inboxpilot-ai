import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "InboxPilot AI",
  description: "A multi-tenant AI dashboard for Gmail lead scoring, auto-reply, and analytics.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
