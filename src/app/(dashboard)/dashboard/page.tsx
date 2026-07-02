import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Gauge,
  MailCheck,
  SendHorizonal,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";

import { GmailConnectButton } from "@/components/dashboard/gmail-connect-button";
import { getGmailConnection } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { session, membership } = await requireTenant();
  const tenantId = membership.tenantId;

  const [gmail, leadStats, activeRules, recentLeads] = await Promise.all([
    getGmailConnection(session.user.id),
    prisma.lead.aggregate({
      where: { tenantId },
      _count: { _all: true },
      _avg: { score: true }
    }),
    prisma.autoReplyRule.count({
      where: {
        tenantId,
        enabled: true
      }
    }),
    prisma.lead.findMany({
      where: { tenantId },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      take: 4
    })
  ]);

  const avgScore = Math.round(leadStats._avg.score ?? 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-700">Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-ink">Gmail AI command center</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Connect Gmail, score leads, prepare replies, and track workspace performance from
                one tenant-aware control plane.
              </p>
            </div>
            <GmailConnectButton label={gmail.connected ? "Reconnect Gmail" : "Connect Gmail"} />
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ink">Gmail connection</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {gmail.connected
                  ? gmail.emailAddress ?? "Authorized Google mailbox"
                  : gmail.needsReconnect
                    ? "Reconnect to refresh Gmail permissions."
                    : "Connect a mailbox to activate lead scoring."}
              </p>
            </div>
            {gmail.connected ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            ) : (
              <CircleAlert className="h-6 w-6 text-amber-600" aria-hidden="true" />
            )}
          </div>
          {gmail.error ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {gmail.error}
            </p>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-line p-3">
              <p className="text-xs font-semibold text-slate-500">Messages</p>
              <p className="mt-2 text-xl font-bold text-ink">{gmail.messagesTotal ?? 0}</p>
            </div>
            <div className="rounded-md border border-line p-3">
              <p className="text-xs font-semibold text-slate-500">Threads</p>
              <p className="mt-2 text-xl font-bold text-ink">{gmail.threadsTotal ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Gauge}
          label="Leads scored"
          value={leadStats._count._all.toString()}
          detail={`Average score ${avgScore}`}
        />
        <MetricCard
          icon={SendHorizonal}
          label="Active auto-replies"
          value={activeRules.toString()}
          detail="Rules ready for draft generation"
        />
        <MetricCard
          icon={BarChart3}
          label="Analytics coverage"
          value={gmail.connected ? "Live" : "Pending"}
          detail="Gmail telemetry status"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink">Modules</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              ["/dashboard/lead-scoring", "Lead Scoring", "Qualify Gmail conversations by intent."],
              ["/dashboard/auto-reply", "Auto-Reply", "Prepare policy-safe response drafts."],
              ["/dashboard/analytics", "Analytics", "Monitor lead and reply performance."]
            ].map(([href, title, description]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md border border-line p-4 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <p className="text-sm font-bold text-ink">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink">Recent leads</h2>
            <MailCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-line">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="grid gap-2 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{lead.name}</p>
                    <p className="truncate text-sm text-slate-500">{lead.email}</p>
                  </div>
                  <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {lead.score}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-sm leading-6 text-slate-600">
                Leads will appear here after Gmail ingestion and scoring are connected.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
};

function MetricCard({ icon: Icon, label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-md border border-line bg-white p-5 shadow-soft">
      <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </div>
  );
}
