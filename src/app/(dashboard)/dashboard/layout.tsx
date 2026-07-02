import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { requireTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, membership } = await requireTenant();

  return (
    <div className="min-h-screen bg-cloud text-ink md:flex">
      <DashboardSidebar tenantName={membership.tenant.name} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-line bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{membership.tenant.name}</p>
              <p className="truncate text-xs text-slate-500">
                {membership.role.toLowerCase()} access
              </p>
            </div>
            <div className="flex items-center gap-3">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-9 w-9 rounded-md border border-line object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-600">
                  {session.user.name?.charAt(0) ?? "U"}
                </span>
              )}
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="px-5 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
