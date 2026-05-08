import { getUserGroups } from "@/lib/actions/groups";
import GroupCard from "@/components/GroupCard";
import Link from "next/link";

export default async function GroupsPage() {
  const groups = await getUserGroups();

  return (
    <main className="max-w-xl mx-auto px-4 py-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-title font-bold text-2xl  text-text uppercase">
          Mes Groupes
        </h1>
        <Link
          href="/groups/join"
          className="text-[10px] font-title font-bold  uppercase border border-lime/20 text-lime/60 hover:text-lime hover:border-lime/45 px-3 py-2 rounded-lg transition-colors"
        >
          + Rejoindre
        </Link>
      </div>

      {groups.length === 0 && (
        <div className="text-center py-14">
          <p className="font-title  uppercase text-text/22 text-sm mb-1.5">
            Aucun groupe pour l&apos;instant
          </p>
          <p className="text-[10px] text-text/15 font-title  uppercase">
            Créez ou rejoignez un groupe pour échanger
          </p>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {groups.map((g) => (
          <GroupCard
            key={g.id}
            id={g.id}
            name={g.name}
            inviteCode={g.inviteCode}
            memberCount={g._count.members}
          />
        ))}
      </div>

      <CreateGroupForm />
    </main>
  );
}

function CreateGroupForm() {
  async function action(formData: FormData) {
    "use server";
    const { createGroup } = await import("@/lib/actions/groups");
    const { redirect } = await import("next/navigation");
    const name = formData.get("name") as string;
    if (!name?.trim()) return;
    const group = await createGroup(name.trim());
    redirect(`/groups/${group.id}`);
  }

  return (
    <div className="border-t border-white/[0.06] pt-5">
      <p className="text-[10px] font-title font-semibold  uppercase text-text/28 mb-3">
        Créer un groupe
      </p>
      <form action={action} className="flex gap-2">
        <input
          name="name"
          placeholder="Nom du groupe..."
          required
          className="flex-1 bg-surface border border-white/[0.07] focus:border-lime/35 rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none placeholder:text-text/22 transition-colors"
        />
        <button
          type="submit"
          className="bg-lime text-void font-title font-bold px-5 py-2.5 rounded-xl text-xs  uppercase hover:opacity-90 transition-opacity"
        >
          Créer
        </button>
      </form>
    </div>
  );
}
