import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { ensureTenantForUser } from "@/lib/tenant";

export async function requireUserSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  return session;
}

export async function requireTenant() {
  const session = await requireUserSession();
  const membership = await ensureTenantForUser(
    session.user.id,
    session.user.name,
    session.user.email
  );

  return {
    session,
    membership
  };
}
