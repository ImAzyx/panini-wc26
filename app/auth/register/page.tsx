import { registerUser } from "@/lib/actions/auth";
import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form action={registerUser} className="space-y-4">
      <div>
        <label className="block text-[9px] font-title font-semibold  uppercase text-text/35 mb-2">
          Nom d&apos;utilisateur
        </label>
        <input
          name="username"
          required
          minLength={2}
          maxLength={20}
          className="w-full bg-surface border border-white/[0.08] focus:border-lime/40 rounded-xl px-4 py-3 text-text focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-[9px] font-title font-semibold  uppercase text-text/35 mb-2">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full bg-surface border border-white/[0.08] focus:border-lime/40 rounded-xl px-4 py-3 text-text focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-[9px] font-title font-semibold  uppercase text-text/35 mb-2">
          Mot de passe
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full bg-surface border border-white/[0.08] focus:border-lime/40 rounded-xl px-4 py-3 text-text focus:outline-none transition-colors"
        />
      </div>
      {error === "exists" && (
        <p className="text-red/70 text-xs font-mono">
          Cet email ou nom d&apos;utilisateur est déjà utilisé.
        </p>
      )}
      <button
        type="submit"
        className="w-full bg-lime text-void font-title font-bold py-3.5 rounded-xl text-sm  uppercase hover:opacity-90 transition-opacity"
      >
        Créer mon compte
      </button>
      <p className="text-center text-[10px] font-title  uppercase text-text/28">
        Déjà un compte ?{" "}
        <Link
          href="/auth/login"
          className="text-lime/65 hover:text-lime transition-colors"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
