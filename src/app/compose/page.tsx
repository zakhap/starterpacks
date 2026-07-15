import { getPackWithItems } from "@/lib/packs";
import { detailToView } from "@/lib/view";
import { ComposerClient } from "./ComposerClient";
import type { CanvasItemView } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ fork?: string; add?: string }>;
}) {
  const sp = await searchParams;

  let forkOf: string | null = null;
  let forkTitle = "";
  let initialItems: CanvasItemView[] = [];

  if (sp.fork) {
    const parent = await getPackWithItems(sp.fork);
    if (parent) {
      forkOf = parent.pack.id;
      forkTitle = parent.pack.title;
      initialItems = detailToView(parent).items;
    }
  }

  return (
    <ComposerClient
      forkOf={forkOf}
      initialTitle={forkTitle}
      initialItems={initialItems}
      initialAddUrl={sp.add ?? null}
    />
  );
}
