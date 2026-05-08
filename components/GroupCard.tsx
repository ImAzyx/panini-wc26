import Link from "next/link";

interface GroupCardProps {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
}

export default function GroupCard({
  id,
  name,
  inviteCode,
  memberCount,
}: GroupCardProps) {
  return (
    <Link href={`/groups/${id}`} className="block group">
      <div className="border border-white/[0.07] hover:border-lime/20 rounded-xl p-4 bg-surface hover:bg-elevated transition-all">
        <div className="flex justify-between items-start mb-2.5">
          <h3 className="font-title font-bold text-base  text-text group-hover:text-lime transition-colors">
            {name}
          </h3>
          <span className="text-[9px] font-mono text-text/30 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded uppercase">
            {inviteCode}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-lime/40" />
          <p className="text-[10px] font-title font-semibold  uppercase text-text/35">
            {memberCount} membre{memberCount > 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
