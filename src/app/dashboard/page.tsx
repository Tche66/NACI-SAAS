"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/Tabs";
import { TabJouer } from "@/components/TabJouer";
import { TabMonJeu } from "@/components/TabMonJeu";
import { TabSemaine } from "@/components/TabSemaine";
import { TabSuivi } from "@/components/TabSuivi";
import { TabBacktest } from "@/components/TabBacktest";

interface AccessInfo {
  allowed: boolean;
  reason: string;
  remaining: number;
  plan: string;
}

const TAB_DEFS = [
  { key: "jouer", label: "Jouer" },
  { key: "monjeu", label: "Mon Jeu" },
  { key: "suivi", label: "Suivi" },
  { key: "semaine", label: "Semaine" },
  { key: "backtest", label: "Backtest" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; phone: string } | null>(null);
  const [access, setAccess] = useState<AccessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("jouer");

  const loadSession = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) { router.push("/login"); return; }
    const data = await res.json();
    setUser(data.user);
    setAccess(data.access);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadSession(); }, [loadSession]);

  function formatPhone(phone: string): string {
    if (phone.startsWith("225") && phone.length === 13) {
      return `+225 ${phone.slice(3, 5)} ${phone.slice(5, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)} ${phone.slice(11)}`;
    }
    return phone;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const isPremium = access?.plan === "monthly" || access?.plan === "day_pass";
  const isMonthly = access?.plan === "monthly";

  const tabs = TAB_DEFS.map((t) => ({
    ...t,
    locked:
      (t.key === "semaine" && !isPremium) ||
      (t.key === "backtest" && !isMonthly),
  }));

  function handleTabChange(key: string) {
    if (key === "semaine" && !isPremium) {
      return;
    }
    if (key === "backtest" && !isMonthly) {
      return;
    }
    setTab(key);
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
      <header className="bg-gradient-to-r from-[#1a3a1a] to-[#0d2818] border-b border-[#2d5a2d] px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
            <h1 className="text-lg font-bold text-[#00e676]">LONACI Pro</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9aa0a6]">{user ? formatPhone(user.phone) : ""}</span>
            {access && (
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                access.plan === "monthly" ? "bg-[#ffd740]/20 text-[#ffd740]" :
                access.plan === "day_pass" ? "bg-[#00e676]/20 text-[#00e676]" :
                "bg-[#448aff]/20 text-[#448aff]"
              }`}>
                {access.plan === "monthly" ? "PRO" : access.plan === "day_pass" ? "PASS 24H" : `${access.remaining}/2`}
              </span>
            )}
            <button onClick={handleLogout} className="text-xs text-[#ff5252] hover:underline">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Bannière limite atteinte */}
        {access && !access.allowed && (
          <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 rounded-xl p-4 mb-4">
            <div className="font-bold text-[#ff5252] text-sm mb-1">Limite atteinte</div>
            <p className="text-xs text-[#9aa0a6] mb-3">{access.reason}</p>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/pricing")}
                className="bg-[#00e676] text-black font-bold px-4 py-2 rounded-lg text-xs"
              >
                Pass 24h — 100F
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="border border-[#ffd740] text-[#ffd740] font-semibold px-4 py-2 rounded-lg text-xs"
              >
                Mensuel — 2000F
              </button>
            </div>
          </div>
        )}

        {/* Bannière upgrade pour gratuit */}
        {access && access.plan === "free" && access.allowed && (
          <div className="bg-[#448aff]/5 border border-[#448aff]/20 rounded-xl p-3 mb-4 flex justify-between items-center">
            <div>
              <span className="text-xs text-[#448aff] font-bold">Plan gratuit</span>
              <span className="text-[10px] text-[#9aa0a6] ml-2">
                {access.remaining} prediction{access.remaining > 1 ? "s" : ""} restante{access.remaining > 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => router.push("/pricing")}
              className="text-[10px] text-[#ffd740] font-bold hover:underline"
            >
              Passer PRO
            </button>
          </div>
        )}

        {/* Tabs */}
        <Tabs tabs={tabs} active={tab} onChange={handleTabChange} />

        {/* Tab content */}
        {tab === "jouer" && <TabJouer access={access} onAccessUpdate={setAccess} />}
        {tab === "monjeu" && <TabMonJeu />}
        {tab === "suivi" && <TabSuivi />}
        {tab === "semaine" && <TabSemaine />}
        {tab === "backtest" && <TabBacktest />}
      </div>
    </div>
  );
}
