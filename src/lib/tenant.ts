import { prisma } from "@/lib/prisma";

export function workspaceNameFromUser(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return `${name.trim()}'s Workspace`;
  }

  const emailPrefix = email?.split("@")[0]?.replace(/[._-]+/g, " ");
  if (emailPrefix?.trim()) {
    return `${titleCase(emailPrefix.trim())}'s Workspace`;
  }

  return "New Workspace";
}

export async function getActiveMembership(userId: string) {
  return prisma.tenantMember.findFirst({
    where: { userId },
    include: { tenant: true },
    orderBy: { createdAt: "asc" }
  });
}

export async function ensureTenantForUser(userId: string, name?: string | null, email?: string | null) {
  const existingMembership = await getActiveMembership(userId);
  if (existingMembership) {
    return existingMembership;
  }

  const workspaceName = workspaceNameFromUser(name, email);
  const slug = await createUniqueTenantSlug(workspaceName);

  await prisma.tenant.create({
    data: {
      name: workspaceName,
      slug,
      members: {
        create: {
          userId,
          role: "OWNER"
        }
      }
    }
  });

  const membership = await getActiveMembership(userId);
  if (!membership) {
    throw new Error("Failed to create tenant membership");
  }

  return membership;
}

async function createUniqueTenantSlug(input: string) {
  const base = slugify(input) || "workspace";

  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await prisma.tenant.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}`;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function titleCase(input: string) {
  return input.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
