"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { email, phone, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erreur reseau. Reessaye.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#00e676] mb-2">LONACI Pro</h1>
          <p className="text-sm text-[#9aa0a6]">
            {isRegister ? "Cree ton compte" : "Connecte-toi"}
          </p>
        </div>

        {error && (
          <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 rounded-lg px-4 py-2 mb-4 text-sm text-[#ff5252]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full bg-[#1a1d27] border border-[#2d3140] rounded-lg px-4 py-3 text-[#e8eaed] focus:border-[#00e676] outline-none"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">
                Telephone <span className="text-[#9aa0a6]/50">(optionnel)</span>
              </label>
              <div className="flex gap-2">
                <span className="bg-[#1a1d27] border border-[#2d3140] rounded-lg px-3 py-3 text-sm text-[#9aa0a6]">+225</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07 XX XX XX XX"
                  className="flex-1 bg-[#1a1d27] border border-[#2d3140] rounded-lg px-4 py-3 text-[#e8eaed] focus:border-[#00e676] outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 caracteres minimum"
              className="w-full bg-[#1a1d27] border border-[#2d3140] rounded-lg px-4 py-3 text-[#e8eaed] focus:border-[#00e676] outline-none"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00e676] text-black font-bold py-3 rounded-lg hover:bg-[#69f0ae] transition-colors disabled:opacity-50"
          >
            {loading ? "Chargement..." : isRegister ? "Creer mon compte" : "Se connecter"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="text-sm text-[#448aff] hover:underline"
          >
            {isRegister ? "Deja un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}
