import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authOptions } from "@/lib/auth";

type SignInPageProps = {
  searchParams?: {
    callbackUrl?: string;
    error?: string;
  };
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions);
  const callbackUrl = safeCallbackUrl(searchParams?.callbackUrl);

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <main className="grid min-h-screen bg-cloud text-ink lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex flex-col justify-between bg-white p-6 sm:p-10">
        <Link href="/" className="flex w-fit items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
            IP
          </span>
          <span className="text-sm font-bold">InboxPilot AI</span>
        </Link>

        <div className="py-14">
          <p className="mb-4 text-sm font-bold text-blue-700">Secure workspace access</p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Sign in and connect Gmail in one flow.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Google OAuth creates your account, grants Gmail scopes, and provisions your first
            tenant workspace automatically.
          </p>
        </div>

        <p className="text-sm text-slate-500">PostgreSQL sessions powered by NextAuth and Prisma.</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use your Google account to enter the dashboard and authorize Gmail access.
          </p>

          {searchParams?.error ? (
            <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Google sign-in could not be completed. Check your OAuth credentials and try again.
            </div>
          ) : null}

          <GoogleSignInButton callbackUrl={callbackUrl} className="mt-6 w-full" />
        </div>
      </section>
    </main>
  );
}

function safeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith("/")) {
    return "/dashboard";
  }

  return callbackUrl;
}
