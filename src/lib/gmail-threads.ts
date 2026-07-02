import { getGmailAccount } from "@/lib/gmail";

export type GmailMessageHeader = {
  name: string;
  value: string;
};

export type GmailMessagePart = {
  mimeType: string;
  body?: { data?: string; size?: number };
  parts?: GmailMessagePart[];
  headers?: GmailMessageHeader[];
};

export type GmailMessage = {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  payload?: GmailMessagePart & { headers?: GmailMessageHeader[] };
};

export type GmailThread = {
  id: string;
  snippet: string;
  messages: GmailMessage[];
};

export type GmailThreadListItem = {
  id: string;
  snippet: string;
  historyId: string;
};

export type GmailThreadsListResponse = {
  threads?: GmailThreadListItem[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

function decodeBase64(data: string): string {
  try {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function extractBody(part: GmailMessagePart): string {
  if (part.mimeType === "text/plain" && part.body?.data) {
    return decodeBase64(part.body.data);
  }
  if (part.parts) {
    for (const p of part.parts) {
      const text = extractBody(p);
      if (text) return text;
    }
  }
  return "";
}

function getHeader(headers: GmailMessageHeader[] | undefined, name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export type ParsedMessage = {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  snippet: string;
};

export function parseMessage(msg: GmailMessage): ParsedMessage {
  const headers = msg.payload?.headers ?? [];
  return {
    id: msg.id,
    threadId: msg.threadId,
    from: getHeader(headers, "From"),
    to: getHeader(headers, "To"),
    subject: getHeader(headers, "Subject"),
    date: getHeader(headers, "Date"),
    body: msg.payload ? extractBody(msg.payload) : msg.snippet,
    snippet: msg.snippet
  };
}

export async function listGmailThreads(
  userId: string,
  maxResults = 20
): Promise<GmailThreadListItem[]> {
  const account = await getGmailAccount(userId);
  if (!account?.access_token) return [];

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=${maxResults}&labelIds=INBOX`,
    {
      headers: { Authorization: `Bearer ${account.access_token}` },
      cache: "no-store"
    }
  );

  if (!res.ok) return [];
  const data = (await res.json()) as GmailThreadsListResponse;
  return data.threads ?? [];
}

export async function getGmailThread(
  userId: string,
  threadId: string
): Promise<GmailThread | null> {
  const account = await getGmailAccount(userId);
  if (!account?.access_token) return null;

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
    {
      headers: { Authorization: `Bearer ${account.access_token}` },
      cache: "no-store"
    }
  );

  if (!res.ok) return null;
  return (await res.json()) as GmailThread;
}

export async function sendGmailReply(
  userId: string,
  threadId: string,
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  const account = await getGmailAccount(userId);
  if (!account?.access_token) return { success: false, error: "No Gmail account connected." };

  const email = [
    `To: ${to}`,
    `Subject: Re: ${subject.replace(/^Re:\s*/i, "")}`,
    `In-Reply-To: ${threadId}`,
    `References: ${threadId}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    ``,
    body
  ].join("\r\n");

  const encoded = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw: encoded, threadId })
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } };
    return { success: false, error: err.error?.message ?? "Failed to send reply." };
  }

  return { success: true };
}
