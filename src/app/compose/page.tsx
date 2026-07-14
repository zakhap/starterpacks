import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createDraft, getPackWithItems } from "@/lib/packs";
import { shelfForUser } from "@/lib/items";
import { detailToView } from "@/lib/view";
import type { ItemView } from "@/lib/types";
import { ComposerClient } from "./ComposerClient";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string; remix?: string; dedicate?: string }>;
}) {
  const user = await getCurrentUser();
  const sp = await searchParams;
  if (!user) {
    const qs = new URLSearchParams(sp as Record<string, string>).toString();
    redirect(`/login?next=${encodeURIComponent("/compose?" + qs)}`);
  }

  // Ensure we always operate on a persistent draft id (survives refresh, no dupes).
  if (!sp.draft) {
    const draft = await createDraft(user.id, {
      remixParentId: sp.remix,
      dedicationRecipient: sp.dedicate ? "" : undefined,
    });
    const extra = sp.dedicate ? "&dedicate=1" : "";
    redirect(`/compose?draft=${draft.id}${extra}`);
  }

  const detail = await getPackWithItems(sp.draft);
  if (!detail || detail.pack.authorId !== user.id) {
    redirect("/compose");
  }

  const shelf: ItemView[] = (await shelfForUser(user.id)).map((it) => ({
    id: it.id,
    canonicalUrl: it.canonicalUrl,
    title: it.title,
    imageUrl: it.imageUrl,
    domain: it.domain,
    sourceType: it.sourceType,
    unfurlStatus: it.unfurlStatus,
  }));

  const isDedication = detail.pack.dedicationRecipient !== null || Boolean(sp.dedicate);

  return (
    <ComposerClient
      initialPack={detailToView(detail)}
      shelf={shelf}
      isRemix={Boolean(detail.pack.remixParentId)}
      isDedication={isDedication}
    />
  );
}
