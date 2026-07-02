import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { sendGmailReply } from "@/lib/gmail-threads";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { membership } = await requireTenant();
  const body = (await req.json()) as { to: string; subject: string; body: string };

  if (!body.to || !body.body) {
    return NextResponse.json({ error: "Missing required fields: to, body" }, { status: 400 });
  }

  const result = await sendGmailReply(
    session.user.id,
    params.threadId,
    body.to,
    body.subject ?? "",
    body.body
  );

  // Log the action
  await prisma.auditLog.create({
    data: {
      tenantId: membership.tenantId,
      emailThreadId: params.threadId,
      actionType: result.success ? "MANUAL_REPLY_SENT" : "REPLY_FAILED",
      details: result.success
        ? { replyBody: body.body, to: body.to }
        : { error: result.error, replyBody: body.body }
    }
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
