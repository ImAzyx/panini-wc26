import { getTradeMatrix } from "@/lib/actions/trades";
import { getGroupWithMembers } from "@/lib/actions/groups";
import { auth } from "@/lib/auth";
import TradesClient from "./TradesClient";

export default async function TradesPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const session = await auth();
  const currentUserId = session!.user!.id!;

  const [pairs, group] = await Promise.all([
    getTradeMatrix(groupId),
    getGroupWithMembers(groupId),
  ]);

  return (
    <TradesClient
      pairs={pairs}
      currentUserId={currentUserId}
      memberStats={group.memberStats}
      groupId={groupId}
      groupName={group.name}
    />
  );
}
