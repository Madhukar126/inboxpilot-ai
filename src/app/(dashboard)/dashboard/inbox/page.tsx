"use client";

import { Inbox, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ThreadItem = {
  id: string;
  snippet: string;
};

export default function InboxPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/threads");
      if (!res.ok) throw new Error("Failed to fetch threads");
      const data = (await res.json()) as { threads: ThreadItem[] };
      setThreads(data.threads ?? []);
    } catch {
      setError("Could not load inbox. Make sure Gmail is connected.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchThreads();
  }, [fetchThreads]);

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-blue-700">Inbox</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Gmail Threads</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Click a thread to view the full email and AI activity log.
            </p>
          </div>
          <button
            onClick={() => void fetchThreads()}
            className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-md border border-line bg-white shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Loading inbox…
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center text-sm text-amber-700">{error}</div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-sm text-slate-500">
            <Inbox className="h-8 w-8 text-slate-300" aria-hidden="true" />
            No threads found in your inbox.
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  onClick={() => router.push(`/dashboard/inbox/${thread.id}`)}
                  className="w-full px-5 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <p className="text-xs font-semibold text-slate-400">Thread ID: {thread.id}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-700">{thread.snippet}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
