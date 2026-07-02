import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getGmailThread, parseMessage } from "@/lib/gmail-threads";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { threadId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thread = await getGmailThread(session.user.id, params.threadId);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const messages = thread.messages.map(parseMessage);
  return NextResponse.json({ threadId: thread.id, messages });
}
