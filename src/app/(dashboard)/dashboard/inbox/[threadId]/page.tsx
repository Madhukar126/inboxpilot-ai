"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Loader2,
  Mail,
  RotateCcw,
  Send,
  User
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ParsedMessage = {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  snippet: string;
};

type AuditLog = {
  id: string;
  emailThreadId: string;
  actionType: "SCORED" | "REPLY_GENERATED" | "REPLY_SENT" | "REPLY_FAILED" | "MANUAL_REPLY_SENT";
  details: Record<string, unknown> | null;
  createdAt: string;
};

const ACTION_CONFIG: Record<
  AuditLog["actionType"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  SCORED: {
    label: "Lead Scored",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Bot className="h-3.5 w-3.5" />
  },
  REPLY_GENERATED: {
    label: "Draft Generated",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    icon: <Mail className="h-3.5 w-3.5" />
  },
  REPLY_SENT: {
    label: "Sent",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />
  },
  REPLY_FAILED: {
    label: "Failed",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertCircle className="h-3.5 w-3.5" />
  },
  MANUAL_REPLY_SENT: {
    label: "Manual Reply Sent",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <User className="h-3.5 w-3.5" />
  }
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const router = useRouter();

  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingThread, setLoadingThread] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [threadError, setThreadError] = useState<string | null>(null);

  // Manual reply state
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Retry state
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    setLoadingThread(true);
    setThreadError(null);
    try {
      const res = await fetch(`/api/gmail/threads/${threadId}`);
      if (!res.ok) throw new Error("Failed to load thread");
      const data = (await res.json()) as { messages: ParsedMessage[] };
      setMessages(data.messages ?? []);
    } catch {
      setThreadError("Could not load this thread. Make sure Gmail is connected.");
    } finally {
      setLoadingThread(false);
    }
  }, [threadId]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/audit`);
      if (!res.ok) return;
      const data = (await res.json()) as { logs: AuditLog[] };
      setLogs(data.logs ?? []);
    } finally {
      setLoadingLogs(false);
    }
  }, [threadId]);

  useEffect(() => {
    void fetchThread();
    void fetchLogs();
  }, [fetchThread, fetchLogs]);

  const firstMessage = messages[0];

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim() || !firstMessage) return;

    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const res = await fetch(`/api/threads/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: firstMessage.from,
          subject: firstMessage.subject,
          body: replyBody
        })
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setSendError(err.error ?? "Failed to send reply.");
      } else {
        setSendSuccess(true);
        setReplyBody("");
        void fetchLogs();
      }
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleRetry(log: AuditLog) {
    if (!firstMessage) return;
    setRetrying(log.id);

    const draft =
      typeof log.details === "object" && log.details !== null
        ? (log.details as Record<string, unknown>).replyBody ?? (log.details as Record<string, unknown>).draft
        : undefined;

    try {
      const res = await fetch(`/api/threads/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: firstMessage.from,
          subject: firstMessage.subject,
          body: typeof draft === "string" ? draft : "Retry reply"
        })
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setSendError(err.error ?? "Retry failed.");
      } else {
        void fetchLogs();
      }
    } catch {
      setSendError("Network error during retry.");
    } finally {
      setRetrying(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">
            {firstMessage?.subject || "Loading thread…"}
          </p>
          <p className="text-xs text-slate-500">Thread ID: {threadId}</p>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* LEFT: Email thread */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Email Thread
          </h2>

          {loadingThread ? (
            <div className="flex items-center justify-center gap-3 rounded-md border border-line bg-white py-16 text-sm text-slate-500 shadow-soft">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading thread…
            </div>
          ) : threadError ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              {threadError}
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id}
                className="rounded-md border border-line bg-white p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {idx === 0 ? (
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          Original
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                          Reply #{idx}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm font-semibold text-ink">
                      <span className="text-slate-500">From: </span>
                      {msg.from}
                    </p>
                    {msg.to && (
                      <p className="truncate text-sm text-slate-600">
                        <span className="font-semibold">To: </span>
                        {msg.to}
                      </p>
                    )}
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold">Subject: </span>
                      {msg.subject}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-slate-400">{msg.date}</p>
                </div>

                <div className="mt-4 rounded-md border border-line bg-slate-50 p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
                    {msg.body || msg.snippet}
                  </pre>
                </div>
              </div>
            ))
          )}

          {/* Manual Override */}
          {!loadingThread && !threadError && firstMessage && (
            <div className="rounded-md border border-line bg-white p-5 shadow-soft">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <User className="h-4 w-4 text-amber-600" aria-hidden="true" />
                Manual Override
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Type a custom reply to send directly, bypassing AI.
              </p>

              <form onSubmit={(e) => void handleSendReply(e)} className="mt-4 space-y-3">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write your reply…"
                  rows={5}
                  className="w-full rounded-md border border-line bg-slate-50 px-4 py-3 text-sm text-ink placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />

                {sendError && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {sendError}
                  </p>
                )}
                {sendSuccess && (
                  <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Reply sent successfully.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending || !replyBody.trim()}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? "Sending…" : "Send Reply"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT: AI Activity Log */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            AI Activity Log
          </h2>

          <div className="rounded-md border border-line bg-white shadow-soft">
            {loadingLogs ? (
              <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading activity…
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-sm text-slate-400">
                <Bot className="h-8 w-8 text-slate-200" />
                No AI activity yet for this thread.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {logs.map((log) => {
                  const config = ACTION_CONFIG[log.actionType];
                  const details =
                    typeof log.details === "object" && log.details !== null
                      ? (log.details as Record<string, unknown>)
                      : null;

                  return (
                    <li key={log.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${config.color}`}
                          >
                            {config.icon}
                            {config.label}
                          </span>

                          {/* Score badge */}
                          {log.actionType === "SCORED" && details?.score != null && (
                            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                              Score: {String(details.score)}
                            </span>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {formatTime(log.createdAt)}
                          </span>

                          {/* Retry button for failed */}
                          {log.actionType === "REPLY_FAILED" && (
                            <button
                              onClick={() => void handleRetry(log)}
                              disabled={retrying === log.id}
                              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              {retrying === log.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                              Retry
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      {details && (
                        <div className="mt-3 space-y-1.5">
                          {typeof details.replyBody === "string" && (
                            <p className="rounded-md border border-line bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                              <span className="font-semibold">Draft: </span>
                              {details.replyBody}
                            </p>
                          )}
                          {typeof details.draft === "string" && (
                            <p className="rounded-md border border-line bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                              <span className="font-semibold">Draft: </span>
                              {details.draft}
                            </p>
                          )}
                          {typeof details.error === "string" && (
                            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                              <span className="font-semibold">Error: </span>
                              {details.error}
                            </p>
                          )}
                          {typeof details.to === "string" && (
                            <p className="text-xs text-slate-500">
                              <span className="font-semibold">To: </span>
                              {details.to}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
