"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CanvasItemView, ItemView } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { ShareFrame } from "@/components/ShareFrame";
import { isProbablyUrl } from "@/lib/url";

const MAX_ITEMS = 9;
const MIN_ITEMS = 3;
const BASE_CARD_CQW = 38;

const GHOSTS = [
  "performative male",
  "reformer pilates is her whole personality",
  "just discovered woodworking guy",
  "amateur etymologist of the group chat",
  "getting over him",
  "she has a Notion for everything",
];

const SLOTS: { x: number; y: number; r: number }[] = [
  { x: 0.28, y: 0.3, r: -5 },
  { x: 0.7, y: 0.26, r: 6 },
  { x: 0.5, y: 0.52, r: -2 },
  { x: 0.26, y: 0.7, r: 4 },
  { x: 0.74, y: 0.68, r: -6 },
  { x: 0.5, y: 0.86, r: 3 },
  { x: 0.5, y: 0.16, r: -3 },
  { x: 0.82, y: 0.46, r: 5 },
  { x: 0.18, y: 0.46, r: -4 },
];

type CItem = CanvasItemView & { pending?: boolean; tempId?: string; inherited?: boolean };

export function ComposerClient({
  forkOf,
  initialTitle,
  initialItems,
  initialAddUrl,
}: {
  forkOf: string | null;
  initialTitle: string;
  initialItems: CanvasItemView[];
  initialAddUrl: string | null;
}) {
  const router = useRouter();
  const storageKey = forkOf ? `packrat-draft:fork:${forkOf}` : "packrat-draft:new";

  const [title, setTitle] = useState(initialTitle);
  const [authorName, setAuthorName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [items, setItems] = useState<CItem[]>(
    initialItems.map((i) => ({ ...i, inherited: Boolean(forkOf) })),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [status, setStatus] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [ghostIdx, setGhostIdx] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const frame916 = useRef<HTMLDivElement>(null);
  const frame11 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setGhostIdx((i) => (i + 1) % GHOSTS.length), 2600);
    return () => clearInterval(t);
  }, []);

  // restore from localStorage on mount (blank compose only; fork/add come from the URL)
  useEffect(() => {
    if (!forkOf && !initialAddUrl) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.title) setTitle(d.title);
          if (d.authorName) setAuthorName(d.authorName);
          if (d.recipient) setRecipient(d.recipient);
          if (Array.isArray(d.items) && d.items.length) setItems(d.items);
        }
      } catch {}
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ title, authorName, recipient, items: items.filter((i) => !i.pending) }),
      );
    } catch {}
  }, [title, authorName, recipient, items, hydrated, storageKey]);

  // ---------- add / plop ----------
  const addFromItem = useCallback((item: ItemView) => {
    setItems((prev) => {
      if (prev.length >= MAX_ITEMS) {
        setStatus("9 is the cap — that's the whole point");
        return prev;
      }
      const slot = SLOTS[prev.length % SLOTS.length];
      const maxZ = prev.reduce((m, i) => Math.max(m, i.zIndex), 0);
      return [
        ...prev,
        {
          itemId: item.id,
          item,
          linerNote: null,
          x: slot.x,
          y: slot.y,
          scale: 1,
          rotation: slot.r,
          zIndex: maxZ + 1,
        },
      ];
    });
  }, []);

  const addLink = useCallback(async (rawUrl: string) => {
    const url = rawUrl.trim();
    if (!isProbablyUrl(url)) {
      setStatus("that doesn't look like a link");
      return;
    }
    const tempId = "tmp_" + Math.abs(hashStr(url + Math.floor(performance.now())));
    setItems((prev) => {
      if (prev.length >= MAX_ITEMS) {
        setStatus("9 is the cap");
        return prev;
      }
      const slot = SLOTS[prev.length % SLOTS.length];
      const maxZ = prev.reduce((m, i) => Math.max(m, i.zIndex), 0);
      const domain = safeDomain(url);
      return [
        ...prev,
        {
          itemId: tempId,
          tempId,
          pending: true,
          item: {
            id: tempId,
            canonicalUrl: url,
            title: domain,
            imageUrl: null,
            domain,
            sourceType: "other",
            unfurlStatus: "pending",
          },
          linerNote: null,
          x: slot.x,
          y: slot.y,
          scale: 1,
          rotation: slot.r,
          zIndex: maxZ + 1,
        },
      ];
    });
    setLinkInput("");
    try {
      const res = await fetch("/api/items/unfurl", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { item?: ItemView; error?: string };
      if (!data.item) {
        setStatus(data.error ?? "couldn't unfurl that");
        setItems((prev) => prev.filter((i) => i.tempId !== tempId));
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.tempId === tempId
            ? { ...i, itemId: data.item!.id, item: data.item!, pending: false, tempId: undefined }
            : i,
        ),
      );
      setStatus("plopped");
    } catch {
      setStatus("network hiccup — try again");
      setItems((prev) => prev.filter((i) => i.tempId !== tempId));
    }
  }, []);

  // shared-link plop on mount (from the share sheet)
  const addedRef = useRef(false);
  useEffect(() => {
    if (initialAddUrl && !addedRef.current) {
      addedRef.current = true;
      addLink(initialAddUrl);
    }
  }, [initialAddUrl, addLink]);

  // paste anywhere → plop
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      const text = e.clipboardData?.getData("text") ?? "";
      if (isProbablyUrl(text)) {
        e.preventDefault();
        addLink(text);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addLink]);

  // ---------- drag ----------
  const dragState = useRef<{ id: string; moved: boolean } | null>(null);
  function onPointerDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragState.current = { id, moved: false };
    setSelected(id);
  }
  function onPointerMove(e: React.PointerEvent) {
    const ds = dragState.current;
    if (!ds || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = snap(clamp01((e.clientX - rect.left) / rect.width), [0.25, 0.5, 0.75]);
    const y = snap(clamp01((e.clientY - rect.top) / rect.height), [0.33, 0.5, 0.67]);
    ds.moved = true;
    setItems((prev) => prev.map((i) => (i.itemId === ds.id ? { ...i, x, y, inherited: false } : i)));
  }
  function onPointerUp() {
    dragState.current = null;
  }

  // ---------- selected edits ----------
  function updateSelected(patch: Partial<CItem>) {
    setItems((prev) => prev.map((i) => (i.itemId === selected ? { ...i, ...patch, inherited: false } : i)));
  }
  function removeItem(id: string) {
    if (selected === id) setSelected(null);
    setItems((prev) => prev.filter((i) => i.itemId !== id));
  }
  function bringToFront(id: string) {
    setItems((prev) => {
      const maxZ = prev.reduce((m, i) => Math.max(m, i.zIndex), 0);
      return prev.map((i) => (i.itemId === id ? { ...i, zIndex: maxZ + 1 } : i));
    });
  }

  // ---------- publish ----------
  async function handlePublish() {
    setStatus("");
    if (!title.trim()) {
      setStatus("give it a title — that's the joke");
      return;
    }
    const solid = items.filter((i) => !i.pending);
    if (solid.length < MIN_ITEMS) {
      setStatus(`add at least ${MIN_ITEMS} items`);
      return;
    }
    setPublishing(true);
    try {
      setStatus("rendering share images…");
      const { toBlob } = await import("html-to-image");
      const opts = { pixelRatio: 1, cacheBust: true, type: "image/webp" as const, quality: 0.9 };
      const blob916 = frame916.current ? await toBlob(frame916.current, opts) : null;
      const blob11 = frame11.current ? await toBlob(frame11.current, opts) : null;
      const url916 = blob916 ? await uploadImage(blob916, "9x16") : undefined;
      const url11 = blob11 ? await uploadImage(blob11, "1x1") : undefined;

      setStatus("publishing…");
      const res = await fetch("/api/packs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          authorName: authorName || null,
          dedicationRecipient: recipient || null,
          remixParentId: forkOf,
          items: solid.map((i, idx) => ({
            itemId: i.itemId,
            linerNote: i.linerNote,
            x: i.x,
            y: i.y,
            scale: i.scale,
            rotation: i.rotation,
            zIndex: i.zIndex || idx,
          })),
          image9x16: url916,
          image1x1: url11,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? "couldn't publish");
        setPublishing(false);
        return;
      }
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      router.push(data.url!);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "publish failed");
      setPublishing(false);
    }
  }

  const sel = items.find((i) => i.itemId === selected) ?? null;
  const solidCount = items.filter((i) => !i.pending).length;
  const shareItems = items.filter((i) => !i.pending);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* left: title + canvas */}
      <div className="space-y-4">
        <div className="ink-border tape-shadow bg-paper-2 px-4 py-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink-soft">
            {forkOf ? "forking — make it yours" : "title first · this is the punchline"}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`The ${GHOSTS[ghostIdx]} starter pack`}
            className="poster-title w-full bg-transparent text-2xl outline-none placeholder:text-ink-soft/50 sm:text-3xl"
          />
        </div>

        <div className="flex gap-2">
          <input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLink(linkInput)}
            placeholder="Paste a link (⌘V anywhere) — Spotify, a product, a video…"
            className="w-full border-[1.5px] border-ink bg-paper px-3 py-2 text-sm outline-none focus:bg-paper-2"
          />
          <button onClick={() => addLink(linkInput)} className="btn btn-accent">
            Plop
          </button>
        </div>

        <div
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={() => setSelected(null)}
          className="relative mx-auto w-full max-w-md overflow-hidden ink-border tape-shadow bg-paper"
          style={{ aspectRatio: "4 / 5", containerType: "size", touchAction: "none" }}
        >
          {items.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center">
              <p className="font-note text-lg italic text-ink-soft">
                paste a link to plop your first item.
                <br />4 to 9 things. scarcity is the curation.
              </p>
            </div>
          ) : null}

          {items.map((ci) => (
            <div
              key={ci.itemId}
              onPointerDown={(e) => onPointerDown(e, ci.itemId)}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(ci.itemId);
              }}
              className={`animate-plop absolute cursor-grab active:cursor-grabbing ${
                selected === ci.itemId ? "outline-2 outline-dashed outline-accent" : ""
              }`}
              style={{
                left: `${ci.x * 100}%`,
                top: `${ci.y * 100}%`,
                width: `${BASE_CARD_CQW * ci.scale}cqw`,
                transform: `translate(-50%, -50%) rotate(${ci.rotation}deg)`,
                zIndex: selected === ci.itemId ? 999 : ci.zIndex,
                opacity: ci.pending ? 0.7 : ci.inherited ? 0.85 : 1,
                outlineOffset: 3,
              }}
            >
              {ci.inherited ? (
                <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink px-1.5 py-0.5 text-[0.55rem] font-bold uppercase text-paper">
                  inherited
                </span>
              ) : null}
              <ItemCard item={ci.item} linerNote={ci.linerNote} width="100%" />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-ink-soft">
          {solidCount}/9 items · drag to arrange · tap an item to add a note
        </p>
      </div>

      {/* right: inspector + meta + publish */}
      <div className="space-y-4">
        <div className="ink-border bg-paper-2 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-soft">
              {sel ? "selected item" : "nothing selected"}
            </span>
            {status ? <span className="text-xs text-accent">{status}</span> : null}
          </div>
          {sel ? (
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block font-note text-sm italic text-ink-soft">
                  liner note — the commentary is the point
                </label>
                <input
                  value={sel.linerNote ?? ""}
                  onChange={(e) => updateSelected({ linerNote: e.target.value || null })}
                  placeholder="this is the tote. don't fight it."
                  className="w-full border-[1.5px] border-ink bg-paper px-2 py-1.5 text-sm outline-none"
                />
              </div>
              <SliderRow label="size" min={0.6} max={1.7} step={0.05} value={sel.scale} onChange={(v) => updateSelected({ scale: v })} />
              <SliderRow label="tilt" min={-18} max={18} step={1} value={sel.rotation} onChange={(v) => updateSelected({ rotation: v })} />
              <div className="flex gap-2">
                <button onClick={() => bringToFront(sel.itemId)} className="btn flex-1 !text-[0.7rem]">
                  Front
                </button>
                <button onClick={() => removeItem(sel.itemId)} className="btn flex-1 !text-[0.7rem] !bg-ink !text-paper">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 font-note text-sm italic text-ink-soft">
              tap an item on the canvas to size it, tilt it, and write its note.
            </p>
          )}
        </div>

        <div className="ink-border bg-paper px-4 py-3 space-y-2">
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="your name (optional)"
            className="w-full border-b-[1.5px] border-ink bg-transparent px-1 py-1 text-sm outline-none"
          />
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="made for… (optional)"
            className="w-full border-b-[1.5px] border-ink bg-transparent px-1 py-1 text-sm outline-none font-note italic"
          />
        </div>

        <button onClick={handlePublish} disabled={publishing} className="btn btn-accent btn-lg w-full">
          {publishing ? "pressing…" : "Publish & get link →"}
        </button>
        <p className="text-center text-[0.7rem] text-ink-soft">
          the canvas is the share asset — publishing gives you a link to share anywhere.
        </p>
      </div>

      {/* offscreen render targets */}
      <div style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }} aria-hidden>
        <div ref={frame916}>
          <ShareFrame title={title} authorName={authorName} dedicationRecipient={recipient} items={shareItems} width={1080} height={1920} />
        </div>
        <div ref={frame11}>
          <ShareFrame title={title} authorName={authorName} dedicationRecipient={recipient} items={shareItems} width={1080} height={1080} />
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-xs font-semibold uppercase text-ink-soft">
      <span className="w-8">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
    </label>
  );
}

async function uploadImage(blob: Blob, kind: string): Promise<string> {
  const form = new FormData();
  form.append("file", blob, `${kind}.webp`);
  form.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("upload failed");
  return data.url;
}

function clamp01(n: number) {
  return Math.max(0.05, Math.min(0.95, n));
}
function snap(v: number, anchors: number[], threshold = 0.025): number {
  for (const a of anchors) if (Math.abs(v - a) < threshold) return a;
  return v;
}
function safeDomain(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : "https://" + url).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}
