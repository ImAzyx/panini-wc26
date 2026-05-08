import { getGroupWithMembers } from "@/lib/actions/groups";
import { getUserCollectionById } from "@/lib/actions/collection";
import StickerGrid from "@/components/StickerGrid";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STICKERS } from "@/data/stickers";
import { auth } from "@/lib/auth";

export default async function MemberCollectionPage({
  params,
}: {
  params: Promise<{ groupId: string; memberId: string }>;
}) {
  const { groupId, memberId } = await params;

  const [group, collection, session] = await Promise.all([
    getGroupWithMembers(groupId),
    getUserCollectionById(memberId),
    auth(),
  ]);
  const currentUserId = session?.user?.id;

  const member = group.memberStats.find((m) => m.userId === memberId);
  if (!member) notFound();

  return (
    <main className="max-w-6xl mx-auto px-3 py-5">
      <div className="mb-6">
        <p className="text-[9px] font-title font-semibold uppercase text-text/30 mb-0.5">
          <Link
            href={`/groups/${groupId}`}
            className="hover:text-text/60 transition-colors"
          >
            {group.name}
          </Link>
          {" / "}
          {member.username}
        </p>
        <div className="flex justify-between items-end">
          <h1 className="font-title font-bold text-xl text-text">
            {member.username}
          </h1>
          <span className="font-mono text-[10px] text-text/32">
            {member.collectionCount}
            <span className="text-text/18">/{STICKERS.length}</span>
          </span>
        </div>
        <div className="mt-2.5">
          <ProgressBar
            current={member.collectionCount}
            total={STICKERS.length}
            size="sm"
          />
        </div>
      </div>

      {memberId !== currentUserId && (
        <Link
          href={`/groups/${groupId}/compare/${memberId}`}
          className="flex items-center justify-between w-full bg-sky-400/8 border border-sky-400/20 hover:bg-sky-400/12 hover:border-sky-400/35 text-sky-400 font-title font-bold py-3.5 rounded-xl mb-6 px-5 transition-all text-sm uppercase"
        >
          <span>Comparer avec ma collection</span>
          <span className="text-sky-400/50">→</span>
        </Link>
      )}

      <StickerGrid initialCollection={collection} readOnly />
    </main>
  );
}
