import { getCollection } from "@/lib/actions/collection";
import StickerGrid from "@/components/StickerGrid";
import BulkInput from "@/components/BulkInput";

export default async function CollectionPage() {
  const collection = await getCollection();

  return (
    <main className="max-w-6xl mx-auto px-3 py-5">
      <div className="flex items-baseline justify-between mb-5">
        <h1 className="font-title font-bold text-2xl  text-text uppercase">
          Ma Collection
        </h1>
      </div>
      <div className="mb-5">
        <BulkInput />
      </div>
      <StickerGrid initialCollection={collection} />
    </main>
  );
}
