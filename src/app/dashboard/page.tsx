"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { canAccessPrediction, consumePrediction, getUserAccess, type UserAccess } from "@/lib/access";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface TirageData {
  nom: string;
  heure: string;
  type: string;
  sources: { bot: number[]; nn: number[]; lstm: number[]; consensus: number[] };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<UserAccess | null>(null);
  const [accessInfo, setAccessInfo] = useState<{ allowed: boolean; reason: string; remaining: number; plan: string } | null>(null);
  const [tirages, setTirages] = useState<TirageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTirage, setSelectedTirage] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState("lstm");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);
      const acc = await getUserAccess(u.uid);
      setAccess(acc);
      const info = await canAccessPrediction(u.uid);
      setAccessInfo(info);
      setLoading(false);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    fetch(`${API_BASE}/api/tirages-du-jour`)
      .then((r) => r.json())
      .then((d) => setTirages(d.tirages || []))
      .catch(() => {});
  }, []);

  async function handleViewPrediction(tirage: TirageData) {
    if (!user) return;
    const info = await canAccessPrediction(user.uid);
    if (!info.allowed) {
      setAccessInfo(info);
      return;
    }
    await consumePrediction(user.uid);
    setSelectedTirage(tirage.nom);
    const updatedInfo = await canAccessPrediction(user.uid);
    setAccessInfo(updatedInfo);
  }

  function getNumsForSource(tirage: TirageData): number[] {
    return tirage.sources[selectedSource as keyof typeof tirage.sources] || [];
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#1a1d27] border-b border-[#2d3140] px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-[#00e676]">LONACI Pro</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9aa0a6]">{user?.email || user?.phoneNumber}</span>
            {accessInfo && (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                accessInfo.plan === "monthly" ? "bg-[#ffd740]/20 text-[#ffd740]" :
                accessInfo.plan === "day_pass" ? "bg-[#00e676]/20 text-[#00e676]" :
                "bg-[#448aff]/20 text-[#448aff]"
              }`}>
                {accessInfo.plan === "monthly" ? "PRO" : accessInfo.plan === "day_pass" ? "PASS 24H" : `${accessInfo.remaining}/2 gratuit`}
              </span>
            )}
            <button
              onClick={() => signOut(auth)}
              className="text-xs text-[#ff5252] hover:underline"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Access banner */}
        {accessInfo && !accessInfo.allowed && (
          <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 rounded-xl p-4 mb-6">
            <div className="font-bold text-[#ff5252] mb-1">Limite atteinte</div>
            <p className="text-sm text-[#9aa0a6] mb-3">{accessInfo.reason}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/pricing")}
                className="bg-[#00e676] text-black font-bold px-4 py-2 rounded-lg text-sm"
              >
                Pass 24h — 100F
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="border border-[#ffd740] text-[#ffd740] font-semibold px-4 py-2 rounded-lg text-sm"
              >
                Abonnement mensuel
              </button>
            </div>
          </div>
        )}

        {/* Source selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { k: "bot", l: "Bot", c: "#00e676" },
            { k: "nn", l: "IA Neural", c: "#e040fb" },
            { k: "lstm", l: "LSTM", c: "#ffab40" },
            { k: "consensus", l: "Consensus", c: "#18ffff" },
          ].map((s) => (
            <button
              key={s.k}
              onClick={() => setSelectedSource(s.k)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                selectedSource === s.k
                  ? "text-black"
                  : "text-[#9aa0a6] border-[#2d3140] hover:border-[#9aa0a6]"
              }`}
              style={selectedSource === s.k ? { backgroundColor: s.c, borderColor: s.c } : {}}
            >
              {s.l}
            </button>
          ))}
        </div>

        {/* Tirages */}
        <div className="space-y-3">
          {tirages.map((t) => {
            const nums = getNumsForSource(t);
            const isRevealed = selectedTirage === t.nom;
            return (
              <div key={t.nom} className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-[#18ffff] text-xs font-bold mr-2">{t.heure}</span>
                    <span className="font-semibold">{t.nom}</span>
                  </div>
                  {!isRevealed && (
                    <button
                      onClick={() => handleViewPrediction(t)}
                      disabled={!accessInfo?.allowed && accessInfo?.remaining === 0}
                      className="bg-[#00e676] text-black font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-[#69f0ae] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Voir prediction
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {nums.slice(0, 5).map((n, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isRevealed
                          ? "bg-gradient-to-br from-[#2e7d32] to-[#43a047] text-white shadow-lg shadow-green-500/30"
                          : "bg-[#222533] text-[#9aa0a6] border border-[#2d3140]"
                      }`}
                    >
                      {isRevealed ? String(n).padStart(2, "0") : "?"}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {tirages.length === 0 && (
          <div className="text-center text-[#9aa0a6] py-12">
            <p>Chargement des tirages...</p>
            <p className="text-xs mt-2">Verifie que le serveur de predictions tourne sur {API_BASE}</p>
          </div>
        )}
      </div>
    </div>
  );
}
