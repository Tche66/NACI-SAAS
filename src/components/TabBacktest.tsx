"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const SOURCES_BT = [
  { k: "bot", l: "Bot" },
  { k: "nn", l: "IA Neural" },
  { k: "lstm", l: "LSTM" },
  { k: "consensus", l: "Consensus" },
];

const TYPES_PARIS_BT = [
  { k: "chance5", l: "Chance 5" },
  { k: "chance4", l: "Chance 4" },
  { k: "chance3", l: "Chance 3" },
  { k: "chance4dc", l: "Chance 4+ DC" },
  { k: "chance3dc", l: "Chance 3+ DC" },
];

const PERIODES = [
  { k: "1m", l: "1 mois" },
  { k: "3m", l: "3 mois" },
  { k: "6m", l: "6 mois" },
  { k: "12m", l: "12 mois" },
];

interface BacktestResult {
  totalMise: number;
  totalGain: number;
  net: number;
  roi: number;
  nbParis: number;
  nbWins: number;
  winRate: number;
  details?: { tirage: string; gain: number; roi: number; wins: number; total: number }[];
}

function fmtF(n: number): string {
  return n.toLocaleString("fr-FR") + " F";
}

export function TabBacktest() {
  const [source, setSource] = useState("lstm");
  const [type, setType] = useState("chance4dc");
  const [periode, setPeriode] = useState("6m");
  const [mise, setMise] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState("");

  async function runBacktest() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/api/backtest-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, type, periode, mise }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setResult(data); }
    } catch { setError("Erreur serveur"); }
    setLoading(false);
  }

  const roiColor = result && result.roi > 0 ? "#00e676" : result && result.roi < 0 ? "#ff5252" : "#9aa0a6";

  return (
    <div>
      {/* Config */}
      <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
        <div className="text-xs font-bold mb-3">&#9881; Configuration du backtest</div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">SOURCE IA</div>
          <div className="flex flex-wrap gap-1">
            {SOURCES_BT.map((s) => (
              <button
                key={s.k}
                onClick={() => setSource(s.k)}
                className={`text-[10px] px-3 py-1.5 rounded border font-bold transition-all ${
                  source === s.k ? "bg-[#18ffff] text-black border-[#18ffff]" : "text-[#9aa0a6] border-[#2d3140]"
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">TYPE DE PARI</div>
          <div className="flex flex-wrap gap-1">
            {TYPES_PARIS_BT.map((tp) => (
              <button
                key={tp.k}
                onClick={() => setType(tp.k)}
                className={`text-[10px] px-3 py-1.5 rounded border font-bold transition-all ${
                  type === tp.k ? "bg-[#ffd740] text-black border-[#ffd740]" : "text-[#9aa0a6] border-[#2d3140]"
                }`}
              >
                {tp.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">PERIODE</div>
          <div className="flex flex-wrap gap-1">
            {PERIODES.map((p) => (
              <button
                key={p.k}
                onClick={() => setPeriode(p.k)}
                className={`text-[10px] px-3 py-1.5 rounded border font-bold transition-all ${
                  periode === p.k ? "bg-[#e040fb] text-black border-[#e040fb]" : "text-[#9aa0a6] border-[#2d3140]"
                }`}
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">MISE PAR PARI</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={mise}
              onChange={(e) => setMise(parseInt(e.target.value) || 100)}
              min={50}
              step={50}
              className="w-24 bg-[#222533] border border-[#2d3140] rounded-lg px-3 py-2 text-sm text-white focus:border-[#00e676] outline-none"
            />
            <span className="text-xs text-[#9aa0a6]">FCFA</span>
          </div>
        </div>

        <button
          onClick={runBacktest}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#00e676] to-[#69f0ae] text-black font-bold py-3 rounded-lg text-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? "Simulation en cours..." : "Lancer le backtest"}
        </button>
        {error && <div className="text-xs text-[#ff5252] mt-2 text-center">{error}</div>}
      </div>

      {/* Résultats */}
      {result && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
          <div className="text-xs font-bold mb-3">&#128200; Resultats du backtest</div>

          <div className="grid grid-cols-3 gap-2 mb-4 sm:grid-cols-6">
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#ff5252]">{fmtF(result.totalMise)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Total mise</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#00e676]">{fmtF(result.totalGain)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Total gagne</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold" style={{ color: roiColor }}>{fmtF(result.net)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Benefice net</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-xl font-extrabold" style={{ color: roiColor }}>{result.roi > 0 ? "+" : ""}{result.roi}%</div>
              <div className="text-[9px] text-[#9aa0a6]">ROI</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold">{result.nbParis}</div>
              <div className="text-[9px] text-[#9aa0a6]">Paris</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#00e676]">{result.winRate}%</div>
              <div className="text-[9px] text-[#9aa0a6]">Win rate</div>
            </div>
          </div>

          {/* Détail par tirage */}
          {result.details && result.details.length > 0 && (
            <div>
              <div className="text-[10px] text-[#9aa0a6] font-bold mb-2">DETAIL PAR TIRAGE</div>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {result.details
                  .sort((a, b) => b.roi - a.roi)
                  .map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#222533] rounded-lg px-3 py-2">
                      <div>
                        <span className="text-xs font-semibold">{d.tirage}</span>
                        <span className="text-[9px] text-[#9aa0a6] ml-2">{d.wins}/{d.total} gagnes</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${d.gain >= 0 ? "text-[#00e676]" : "text-[#ff5252]"}`}>
                          {d.gain >= 0 ? "+" : ""}{fmtF(d.gain)}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          d.roi > 0 ? "bg-[#00e676]/20 text-[#00e676]" : "bg-[#ff5252]/20 text-[#ff5252]"
                        }`}>
                          {d.roi > 0 ? "+" : ""}{d.roi}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center text-[#9aa0a6] py-8">
          <p className="text-2xl mb-2">&#128202;</p>
          <p className="text-sm">Configure les parametres et lance un backtest</p>
          <p className="text-xs mt-1">Simule tes paris sur l&apos;historique reel des tirages</p>
        </div>
      )}
    </div>
  );
}
