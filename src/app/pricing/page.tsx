"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (r.ok) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  async function handlePurchase(plan: "day_pass" | "monthly") {
    if (!isLoggedIn) { router.push("/login"); return; }
    setLoading(plan);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert("Erreur de paiement. Reessaye.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2">Choisis ton plan</h1>
          <p className="text-[#9aa0a6]">Paye avec Orange Money, MTN MoMo ou Wave</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-6">
            <div className="text-sm font-semibold text-[#9aa0a6] mb-2">GRATUIT</div>
            <div className="text-4xl font-black mb-1">0<span className="text-lg text-[#9aa0a6]">F</span></div>
            <div className="text-xs text-[#9aa0a6] mb-6">pour toujours</div>
            <ul className="space-y-3 text-sm mb-6">
              <li className="text-[#00e676]">&#10003; 2 predictions / jour</li>
              <li className="text-[#00e676]">&#10003; Suivi des paris</li>
              <li className="text-[#9aa0a6]">&#10007; Predictions illimitees</li>
              <li className="text-[#9aa0a6]">&#10007; Backtest</li>
            </ul>
            <button
              onClick={() => router.push(isLoggedIn ? "/dashboard" : "/login")}
              className="w-full border border-[#2d3140] text-[#9aa0a6] font-semibold py-3 rounded-lg text-sm"
            >
              {isLoggedIn ? "Aller au dashboard" : "Commencer"}
            </button>
          </div>

          <div className="bg-[#1a1d27] border-2 border-[#00e676] rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00e676] text-black text-xs font-bold px-3 py-1 rounded-full">POPULAIRE</div>
            <div className="text-sm font-semibold text-[#00e676] mb-2">PASS 24H</div>
            <div className="text-4xl font-black mb-1">100<span className="text-lg text-[#9aa0a6]">F</span></div>
            <div className="text-xs text-[#9aa0a6] mb-6">24h d&apos;acces illimite</div>
            <ul className="space-y-3 text-sm mb-6">
              <li className="text-[#00e676]">&#10003; Predictions illimitees</li>
              <li className="text-[#00e676]">&#10003; Tous les tirages</li>
              <li className="text-[#00e676]">&#10003; 3 sources IA</li>
              <li className="text-[#00e676]">&#10003; Grille des gains</li>
            </ul>
            <button
              onClick={() => handlePurchase("day_pass")}
              disabled={loading === "day_pass"}
              className="w-full bg-[#00e676] text-black font-bold py-3 rounded-lg text-sm hover:bg-[#69f0ae] disabled:opacity-50"
            >
              {loading === "day_pass" ? "Redirection..." : "Payer 100F"}
            </button>
          </div>

          <div className="bg-[#1a1d27] border border-[#ffd740]/50 rounded-xl p-6">
            <div className="text-sm font-semibold text-[#ffd740] mb-2">MENSUEL</div>
            <div className="text-4xl font-black mb-1">2 000<span className="text-lg text-[#9aa0a6]">F</span></div>
            <div className="text-xs text-[#9aa0a6] mb-6">par mois</div>
            <ul className="space-y-3 text-sm mb-6">
              <li className="text-[#00e676]">&#10003; Tout le Pass 24h</li>
              <li className="text-[#00e676]">&#10003; Backtest avance</li>
              <li className="text-[#00e676]">&#10003; Alertes tirages</li>
              <li className="text-[#00e676]">&#10003; Historique complet</li>
            </ul>
            <button
              onClick={() => handlePurchase("monthly")}
              disabled={loading === "monthly"}
              className="w-full bg-[#ffd740] text-black font-bold py-3 rounded-lg text-sm hover:bg-[#ffe082] disabled:opacity-50"
            >
              {loading === "monthly" ? "Redirection..." : "Payer 2 000F/mois"}
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => router.back()} className="text-sm text-[#448aff] hover:underline">
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
