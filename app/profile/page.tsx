import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

async function updateUsername(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;
  const username = (formData.get("username") as string)?.trim();
  if (!username || username.length < 2) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username },
  });
  redirect("/profile?saved=1");
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");
  const { saved } = await searchParams;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { username: true, email: true, createdAt: true },
  });

  return (
    <main className="max-w-sm mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[9px] font-title font-semibold  uppercase text-text/28 mb-0.5">
          Compte
        </p>
        <h1 className="font-title font-bold text-2xl  text-text uppercase">
          Profil
        </h1>
      </div>

      <form action={updateUsername} className="space-y-4 mb-8">
        <div>
          <label className="block text-[9px] font-title font-semibold  uppercase text-text/35 mb-2">
            Nom d&apos;utilisateur
          </label>
          <input
            name="username"
            defaultValue={user.username}
            required
            minLength={2}
            maxLength={20}
            className="w-full bg-surface border border-white/[0.07] focus:border-lime/40 rounded-xl px-4 py-3 text-text focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[9px] font-title font-semibold  uppercase text-text/35 mb-2">
            Email
          </label>
          <input
            value={user.email}
            readOnly
            className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 text-text/28 cursor-not-allowed"
          />
        </div>
        {saved && (
          <p className="text-lime text-xs font-mono">✓ Pseudo mis à jour</p>
        )}
        <button
          type="submit"
          className="w-full bg-lime text-void font-title font-bold py-3 rounded-xl text-sm  uppercase hover:opacity-90 transition-opacity"
        >
          Sauvegarder
        </button>
      </form>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/auth/login" });
        }}
      >
        <button
          type="submit"
          className="w-full border border-red/18 text-red/50 hover:text-red/70 hover:border-red/35 py-3 rounded-xl text-xs font-title font-semibold  uppercase transition-colors"
        >
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
