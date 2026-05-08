import { redirect } from "next/navigation";
import { joinGroup } from "@/lib/actions/groups";

async function joinAction(formData: FormData) {
  "use server";
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return;
  const group = await joinGroup(code);
  redirect(`/groups/${group.id}`);
}

export default async function JoinGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="max-w-sm mx-auto px-4 py-16">
      <div className="mb-8 text-center">
        <p className="text-[9px] font-title font-semibold  uppercase text-text/28 mb-1">
          Rejoindre
        </p>
        <h1 className="font-title font-bold text-3xl text-text  uppercase">
          Un Groupe
        </h1>
      </div>
      <form action={joinAction} className="space-y-4">
        <input
          name="code"
          placeholder="XXXXXX"
          maxLength={6}
          required
          className="w-full bg-surface border border-white/[0.07] focus:border-lime/40 rounded-xl px-4 py-4 text-text font-mono font-bold uppercase text-center text-2xl focus:outline-none placeholder:text-text/18 transition-colors"
        />
        {error && (
          <p className="text-red/70 text-xs font-mono text-center ">
            Code invalide.
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-lime text-void font-title font-bold py-3.5 rounded-xl text-sm  uppercase hover:opacity-90 transition-opacity"
        >
          Rejoindre
        </button>
      </form>
    </main>
  );
}
