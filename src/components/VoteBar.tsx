"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VoteBar({
  packId,
  upvotes,
  downvotes,
  initialVote = 0,
}: {
  packId: string;
  upvotes: number;
  downvotes: number;
  initialVote?: number;
}) {
  const router = useRouter();
  const [vote, setVote] = useState(initialVote);
  const [counts, setCounts] = useState({ up: upvotes, down: downvotes });
  const [busy, setBusy] = useState(false);

  async function cast(next: 1 | -1) {
    if (busy) return;
    const value = vote === next ? 0 : next;
    // optimistic
    const prev = { vote, counts };
    const up = counts.up + (value === 1 ? 1 : 0) - (vote === 1 ? 1 : 0);
    const down = counts.down + (value === -1 ? 1 : 0) - (vote === -1 ? 1 : 0);
    setVote(value);
    setCounts({ up, down });
    setBusy(true);
    try {
      const res = await fetch(`/api/packs/${packId}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.status === 401) {
        router.push("/login");
        setVote(prev.vote);
        setCounts(prev.counts);
      } else if (!res.ok) {
        setVote(prev.vote);
        setCounts(prev.counts);
      }
    } catch {
      setVote(prev.vote);
      setCounts(prev.counts);
    } finally {
      setBusy(false);
    }
  }

  const net = counts.up - counts.down;
  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={() => cast(1)}
        aria-label="upvote"
        className={`grid h-7 w-7 place-items-center border-[1.5px] border-ink text-sm tape-shadow-sm transition active:translate-y-px ${
          vote === 1 ? "bg-accent text-accent-ink" : "bg-paper"
        }`}
      >
        ▲
      </button>
      <span className="min-w-6 text-center text-sm font-bold tabular-nums">{net}</span>
      <button
        onClick={() => cast(-1)}
        aria-label="downvote"
        className={`grid h-7 w-7 place-items-center border-[1.5px] border-ink text-sm tape-shadow-sm transition active:translate-y-px ${
          vote === -1 ? "bg-ink text-paper" : "bg-paper"
        }`}
      >
        ▼
      </button>
    </div>
  );
}
