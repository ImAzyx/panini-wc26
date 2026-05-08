"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      window.location.href = "/collection";
    }
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", { email, redirect: false });
    setMagicSent(true);
    setLoading(false);
  }

  if (magicSent) {
    return (
      <div className="text-center py-8">
        <p className="text-lime font-mono text-sm mb-1.5">✓ Lien envoyé</p>
        <p className="text-text/35 text-xs font-title tracking-wide">
          Vérifiez <strong className="text-text/55 font-semibold">{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <label className="block text-[9px] font-title font-semibold tracking-widest uppercase text-text/35 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-surface border border-white/[0.08] focus:border-lime/40 rounded-xl px-4 py-3 text-text focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[9px] font-title font-semibold tracking-widest uppercase text-text/35 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-surface border border-white/[0.08] focus:border-lime/40 rounded-xl px-4 py-3 text-text focus:outline-none transition-colors"
          />
        </div>
        {error && <p className="text-red/75 text-xs font-mono">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lime text-void font-title font-bold py-3.5 rounded-xl text-sm tracking-widest uppercase disabled:opacity-35 hover:opacity-90 transition-opacity"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-white/[0.07]" />
        <span className="px-3 text-[9px] font-title tracking-widest uppercase text-text/22">ou</span>
        <div className="flex-1 border-t border-white/[0.07]" />
      </div>

      <form onSubmit={handleMagicLink}>
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full border border-white/[0.09] hover:border-lime/20 text-text/45 hover:text-lime/65 font-title font-bold py-3.5 rounded-xl text-sm tracking-widest uppercase disabled:opacity-28 transition-all"
        >
          Lien magique par email
        </button>
      </form>

      <p className="text-center text-[10px] font-title tracking-widest uppercase text-text/28">
        Pas de compte ?{" "}
        <Link href="/auth/register" className="text-lime/65 hover:text-lime transition-colors">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
