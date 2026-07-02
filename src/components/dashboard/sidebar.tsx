"use client";

import { BarChart3, Bot, Gauge, Inbox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard
  },
  {
    href: "/dashboard/inbox",
    label: "Inbox",
    icon: Inbox
  },
  {
    href: "/dashboard/lead-scoring",
    label: "Lead Scoring",
    icon: Gauge
  },
  {
    href: "/dashboard/auto-reply",
    label: "Auto-Reply",
    icon: Bot
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3
  }
];

type DashboardSidebarProps = {
  tenantName: string;
};

export function DashboardSidebar({ tenantName }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-white md:min-h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col gap-5 p-4 md:p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
            IP
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">InboxPilot AI</span>
            <span className="block truncate text-xs text-slate-500">{tenantName}</span>
          </span>
        </Link>

        <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
