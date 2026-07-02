import { Gauge, MailSearch } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LeadScoringPage() {
  const { membership } = await requireTenant();
  const leads = await prisma.lead.findMany({
    where: { tenantId: membership.tenantId },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: 12
  });

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">Lead Scoring</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Prioritize Gmail leads</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Scores are designed for inbound email qualification across buyer intent, company fit,
              urgency, and reply readiness.
            </p>
          </div>
          <Gauge className="h-9 w-9 text-blue-600" aria-hidden="true" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-ink">Scoring model</h2>
          <div className="mt-4 space-y-3">
            {[
              ["Intent", "Pricing, demo, procurement, or migration language."],
              ["Fit", "Domain, company profile, and account tier signals."],
              ["Urgency", "Deadlines, follow-up cadence, and executive visibility."],
              ["Readiness", "Whether an auto-reply can resolve the next step."]
            ].map(([label, detail]) => (
              <div key={label} className="rounded-md border border-line p-3">
                <p className="text-sm font-bold text-ink">{label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink">Lead queue</h2>
            <MailSearch className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-line">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="grid gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{lead.name}</p>
                    <p className="truncate text-sm text-slate-500">{lead.email}</p>
                  </div>
                  <p className="text-sm text-slate-600">{lead.company ?? "Unknown company"}</p>
                  <span className="w-fit rounded-md bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {lead.score}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 text-sm leading-6 text-slate-600">
                No scored leads yet. Once Gmail ingestion is added, this table will show ranked
                conversations for the active tenant.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
