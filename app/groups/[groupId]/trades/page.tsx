import { getTradeMatrix } from "@/lib/actions/trades";
import TradesClient from "./TradesClient";

export default async function TradesPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const pairs = await getTradeMatrix(groupId);
  return <TradesClient initialPairs={pairs} />;
}
