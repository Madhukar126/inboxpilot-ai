import { Activity, BarChart3, MailCheck, type LucideIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { membership } = await requireTenant();
  const tenantId = membership.tenantId;

  const [leadStats, enabledRules, snapshots] = await Promise.all([
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
    prisma.analyticsSnapshot.findMany({
      where: { tenantId },
      orderBy: { capturedAt: "desc" },
      take: 6
    })
  ]);

  const avgLeadScore = Math.round(leadStats._avg.score ?? 0);
  const totalLeads = leadStats._count._all;

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">Analytics</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Workspace performance</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Monitor the health of Gmail lead capture, scoring quality, and auto-reply coverage.
            </p>
          </div>
          <BarChart3 className="h-9 w-9 text-blue-600" aria-hidden="true" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AnalyticsMetric icon={MailCheck} label="Total leads" value={totalLeads.toString()} />
        <AnalyticsMetric icon={Activity} label="Average score" value={avgLeadScore.toString()} />
        <AnalyticsMetric icon={BarChart3} label="Active rules" value={enabledRules.toString()} />
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-ink">Recent snapshots</h2>
        <div className="mt-5 grid gap-3">
          {snapshots.length > 0 ? (
            snapshots.map((snapshot) => (
              <div key={snapshot.id} className="rounded-md border border-line p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-ink">{snapshot.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {snapshot.capturedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-right text-sm">
                    <span>{snapshot.leadCount} leads</span>
                    <span>{Math.round(snapshot.avgLeadScore)} avg</span>
                    <span>{Math.round(snapshot.replyRate)}% reply</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-line p-8 text-sm leading-6 text-slate-600">
              Analytics snapshots will populate after scheduled Gmail analysis jobs begin writing
              tenant metrics.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type AnalyticsMetricProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function AnalyticsMetric({ icon: Icon, label, value }: AnalyticsMetricProps) {
  return (
    <div className="rounded-md border border-line bg-white p-5 shadow-soft">
      <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}
