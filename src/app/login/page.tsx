"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      const formatted = phone.startsWith("+") ? phone : `+225${phone}`;
      const result = await signInWithPhoneNumber(auth, formatted, recaptcha);
      setConfirmResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur d'envoi du code");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmResult) return;
    setError("");
    setLoading(true);
    try {
      await confirmResult.confirm(otp);
      router.push("/dashboard");
    } catch {
      setError("Code incorrect");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
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

        {/* Mode tabs */}
        <div className="flex bg-[#1a1d27] rounded-lg p-1 mb-6 border border-[#2d3140]">
          <button
            onClick={() => setMode("phone")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${mode === "phone" ? "bg-[#00e676] text-black" : "text-[#9aa0a6]"}`}
          >
            Telephone
          </button>
          <button
            onClick={() => setMode("email")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${mode === "email" ? "bg-[#00e676] text-black" : "text-[#9aa0a6]"}`}
          >
            Email
          </button>
        </div>

        {error && (
          <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 rounded-lg px-4 py-2 mb-4 text-sm text-[#ff5252]">
            {error}
          </div>
        )}

        {mode === "phone" ? (
          confirmResult ? (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">Code OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#1a1d27] border border-[#2d3140] rounded-lg px-4 py-3 text-[#e8eaed] focus:border-[#00e676] outline-none"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00e676] text-black font-bold py-3 rounded-lg hover:bg-[#69f0ae] transition-colors disabled:opacity-50"
              >
                {loading ? "Verification..." : "Verifier le code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">Numero de telephone</label>
                <div className="flex gap-2">
                  <span className="bg-[#1a1d27] border border-[#2d3140] rounded-lg px-3 py-3 text-sm text-[#9aa0a6]">+225</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07 XX XX XX XX"
                    className="flex-1 bg-[#1a1d27] border border-[#2d3140] rounded-lg px-4 py-3 text-[#e8eaed] focus:border-[#00e676] outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00e676] text-black font-bold py-3 rounded-lg hover:bg-[#69f0ae] transition-colors disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Recevoir le code SMS"}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
            <div>
              <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-[#448aff] hover:underline"
          >
            {isRegister ? "Deja un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </button>
        </div>

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
