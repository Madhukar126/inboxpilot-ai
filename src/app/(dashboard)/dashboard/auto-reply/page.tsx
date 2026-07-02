import { Bot, SendHorizonal } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

const starterRules = [
  {
    name: "Demo request",
    trigger: "Sender asks for a demo, walkthrough, or sales call.",
    tone: "Helpful",
    enabled: true
  },
  {
    name: "Pricing question",
    trigger: "Sender asks for pricing, plans, procurement, or contract terms.",
    tone: "Concise",
    enabled: false
  },
  {
    name: "Support handoff",
    trigger: "Sender reports a product issue that should route to support.",
    tone: "Assuring",
    enabled: false
  }
];

export default async function AutoReplyPage() {
  const { membership } = await requireTenant();
  const rules = await prisma.autoReplyRule.findMany({
    where: { tenantId: membership.tenantId },
    orderBy: [{ enabled: "desc" }, { createdAt: "desc" }],
    take: 12
  });

  const visibleRules = rules.length > 0 ? rules : starterRules;

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">Auto-Reply</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Draft replies with guardrails</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Rules map Gmail intent to response drafts. Keep sending behind approval while the AI
              prepares the first version.
            </p>
          </div>
          <Bot className="h-9 w-9 text-blue-600" aria-hidden="true" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-ink">Reply rules</h2>
          <div className="mt-4 grid gap-3">
            {visibleRules.map((rule) => (
              <div key={rule.name} className="rounded-md border border-line p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-ink">{rule.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{rule.trigger}</p>
                  </div>
                  <span
                    className={
                      rule.enabled
                        ? "rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                        : "rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                    }
                  >
                    {rule.enabled ? "On" : "Off"}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">Tone: {rule.tone}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <SendHorizonal className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-ink">Draft lifecycle</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>1. Gmail message arrives in the connected mailbox.</p>
            <p>2. Intent and account signals select the best reply rule.</p>
            <p>3. AI prepares a draft for human review before sending.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
