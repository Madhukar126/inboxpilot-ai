import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { threadId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { membership } = await requireTenant();

  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId: membership.tenantId,
      emailThreadId: params.threadId
    },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({ logs });
}

export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { membership } = await requireTenant();
  const body = (await req.json()) as { actionType: string; details?: Record<string, unknown> };

  const validTypes = ["SCORED", "REPLY_GENERATED", "REPLY_SENT", "REPLY_FAILED", "MANUAL_REPLY_SENT"];
  if (!validTypes.includes(body.actionType)) {
    return NextResponse.json({ error: "Invalid actionType" }, { status: 400 });
  }

  const log = await prisma.auditLog.create({
    data: {
      tenantId: membership.tenantId,
      emailThreadId: params.threadId,
      actionType: body.actionType as never,
      details: (body.details ?? {}) as import("@prisma/client").Prisma.InputJsonValue
    }
  });

  return NextResponse.json({ log });
}
