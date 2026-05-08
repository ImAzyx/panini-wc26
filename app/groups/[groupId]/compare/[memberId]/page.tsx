import { getTradeMatrix } from "@/lib/actions/trades";
import { getGroupWithMembers } from "@/lib/actions/groups";
import { auth } from "@/lib/auth";
import CompareClient from "@/components/CompareClient";
import { notFound } from "next/navigation";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ groupId: string; memberId: string }>;
}) {
  const { groupId, memberId } = await params;

  const session = await auth();
  const currentUserId = session!.user!.id!;

  const [pairs, group] = await Promise.all([
    getTradeMatrix(groupId),
    getGroupWithMembers(groupId),
  ]);

  const member = group.memberStats.find((m) => m.userId === memberId);
  if (!member) notFound();

  const pair = pairs.find(
    (p) =>
      (p.userAId === currentUserId && p.userBId === memberId) ||
      (p.userBId === currentUserId && p.userAId === memberId),
  );

  const myGive = !pair
    ? []
    : pair.userAId === currentUserId
      ? pair.canGive
      : pair.canReceive;
  const myReceive = !pair
    ? []
    : pair.userAId === currentUserId
      ? pair.canReceive
      : pair.canGive;

  return (
    <CompareClient
      memberName={member.username}
      memberId={memberId}
      groupId={groupId}
      groupName={group.name}
      myGive={myGive}
      myReceive={myReceive}
    />
  );
}
