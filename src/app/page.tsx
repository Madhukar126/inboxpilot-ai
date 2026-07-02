import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Gauge,
  Mail,
  ShieldCheck,
  Users
} from "lucide-react";
import Link from "next/link";

const featureCards = [
  {
    title: "Lead Scoring",
    description: "Rank inbound Gmail conversations by intent, fit, and next-best action.",
    icon: Gauge
  },
  {
    title: "Auto-Reply",
    description: "Create approval-ready drafts for common sales and support moments.",
    icon: Bot
  },
  {
    title: "Analytics",
    description: "Track pipeline health, reply coverage, and workspace activity.",
    icon: BarChart3
  }
];

const trustItems = [
  {
    label: "Tenant-isolated workspaces",
    icon: Users
  },
  {
    label: "Database-backed sessions",
    icon: ShieldCheck
  },
  {
    label: "Gmail OAuth scopes",
    icon: Mail
  }
];

export default function LandingPage() {
  return (
    <main className="bg-cloud text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
              IP
            </span>
            <span className="text-sm font-bold">InboxPilot AI</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden text-sm font-semibold text-slate-600 transition hover:text-ink sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/signin?callbackUrl=/dashboard"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-600">
            <BadgeCheck className="h-4 w-4 text-teal-600" aria-hidden="true" />
            Multi-tenant Gmail intelligence
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
            InboxPilot AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A SaaS dashboard for teams that want Gmail lead scoring, auto-reply workflows, and
            analytics inside isolated customer workspaces.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signin?callbackUrl=/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Connect Gmail
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#features"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-ink"
            >
              View modules
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="text-sm font-bold text-ink">Workspace Command</p>
              <p className="text-xs text-slate-500">Gmail connected</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Live
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-line p-3">
              <p className="text-xs font-semibold text-slate-500">Leads</p>
              <p className="mt-2 text-2xl font-bold text-ink">128</p>
              <p className="mt-1 text-xs text-teal-700">24 high intent</p>
            </div>
            <div className="rounded-md border border-line p-3">
              <p className="text-xs font-semibold text-slate-500">Drafts</p>
              <p className="mt-2 text-2xl font-bold text-ink">42</p>
              <p className="mt-1 text-xs text-blue-700">18 ready</p>
            </div>
            <div className="rounded-md border border-line p-3">
              <p className="text-xs font-semibold text-slate-500">Reply rate</p>
              <p className="mt-2 text-2xl font-bold text-ink">37%</p>
              <p className="mt-1 text-xs text-amber-700">up 8%</p>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-line">
            {[
              ["Enterprise pricing request", "Score 94", "Auto-reply draft ready"],
              ["Integration question", "Score 81", "Route to success"],
              ["Newsletter reply", "Score 38", "Low priority"]
            ].map(([subject, score, action]) => (
              <div
                key={subject}
                className="grid gap-2 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto]"
              >
                <span className="text-sm font-semibold text-ink">{subject}</span>
                <span className="text-sm text-blue-700">{score}</span>
                <span className="text-sm text-slate-500">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-md border border-line p-6">
                  <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  <h2 className="mt-5 text-lg font-bold text-ink">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
