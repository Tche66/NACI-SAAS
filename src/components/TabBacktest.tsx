"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const SOURCES_BT = [
  { k: "both", l: "Bot + IA" },
  { k: "bot", l: "Bot seul" },
  { k: "ia", l: "IA Neural" },
  { k: "lstm", l: "LSTM" },
  { k: "consensus", l: "Consensus" },
  { k: "all", l: "Tous" },
];

const MODES_BT = [
  { k: "ch4dc", l: "Chance 4+ DC", star: true },
  { k: "ch5dc", l: "Chance 5+ DC", star: true },
  { k: "ch3dc", l: "Chance 3+ DC", star: true },
  { k: "ch4", l: "Chance 4" },
  { k: "ch5", l: "Chance 5" },
  { k: "ch3", l: "Chance 3" },
  { k: "2ndc", l: "2N DC" },
  { k: "3ndc", l: "3N DC" },
];

const PERIODES = [
  { k: 1, l: "1 mois" },
  { k: 3, l: "3 mois" },
  { k: 6, l: "6 mois" },
  { k: 12, l: "12 mois" },
];

interface PerDraw {
  tirage: string;
  plays: number;
  dep: number;
  gain: number;
  wins: number;
  profit: number;
  roi: number;
}

interface Summary {
  totalPlays: number;
  totalDep: number;
  totalGain: number;
  totalGainBot: number;
  totalGainIA: number;
  totalGainLSTM: number;
  profit: number;
  roi: number;
}

interface BacktestResult {
  summary: Summary;
  perDraw: PerDraw[];
  totalWins: number;
}

function fmtF(n: number): string {
  return n.toLocaleString("fr-FR") + " F";
}

export function TabBacktest() {
  const [source, setSource] = useState("both");
  const [mode, setMode] = useState("ch4dc");
  const [periode, setPeriode] = useState(6);
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
        body: JSON.stringify({ source, mode, periode, mise }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else if (data.summary) { setResult(data); }
      else { setError("Reponse inattendue du serveur"); }
    } catch { setError("Erreur serveur — verifie que le backend tourne"); }
    setLoading(false);
  }

  const s = result?.summary;
  const roiColor = s && s.roi > 0 ? "#00e676" : s && s.roi < 0 ? "#ff5252" : "#9aa0a6";

  return (
    <div>
      {/* Config */}
      <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
        <div className="text-xs font-bold mb-3">&#9881; Configuration du backtest</div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">SOURCE IA</div>
          <div className="flex flex-wrap gap-1">
            {SOURCES_BT.map((src) => (
              <button
                key={src.k}
                onClick={() => setSource(src.k)}
                className={`text-[10px] px-3 py-1.5 rounded border font-bold transition-all ${
                  source === src.k ? "bg-[#18ffff] text-black border-[#18ffff]" : "text-[#9aa0a6] border-[#2d3140]"
                }`}
              >
                {src.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">TYPE DE PARI</div>
          <div className="flex flex-wrap gap-1">
            {MODES_BT.map((m) => (
              <button
                key={m.k}
                onClick={() => setMode(m.k)}
                className={`text-[10px] px-3 py-1.5 rounded border font-bold transition-all ${
                  mode === m.k ? "bg-[#ffd740] text-black border-[#ffd740]" : "text-[#9aa0a6] border-[#2d3140]"
                }`}
              >
                {m.l}{m.star ? " ★" : ""}
              </button>
            ))}
          </div>
          {!mode.includes("dc") && (
            <div className="text-[9px] text-[#ff5252] mt-1">Le standard est generalement perdant — Double Chance recommande</div>
          )}
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
            {[100, 200, 500, 1000].map((m) => (
              <button
                key={m}
                onClick={() => setMise(m)}
                className={`text-[10px] px-3 py-1.5 rounded border font-bold transition-all ${
                  mise === m ? "bg-[#448aff] text-white border-[#448aff]" : "text-[#9aa0a6] border-[#2d3140]"
                }`}
              >
                {m}F
              </button>
            ))}
            <input
              type="number"
              value={mise}
              onChange={(e) => setMise(Math.max(50, parseInt(e.target.value) || 100))}
              min={50}
              step={50}
              className="w-20 bg-[#222533] border border-[#2d3140] rounded px-2 py-1.5 text-[10px] text-white focus:border-[#00e676] outline-none"
            />
            <span className="text-[9px] text-[#9aa0a6]">FCFA</span>
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
      {s && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
          <div className="text-xs font-bold mb-3">&#128200; Resultats du backtest</div>

          <div className="grid grid-cols-3 gap-2 mb-4 sm:grid-cols-6">
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#ff5252]">{fmtF(s.totalDep)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Total mise</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#00e676]">{fmtF(s.totalGain)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Total gagne</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold" style={{ color: roiColor }}>{fmtF(s.profit)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Benefice net</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-xl font-extrabold" style={{ color: roiColor }}>{s.roi > 0 ? "+" : ""}{s.roi}%</div>
              <div className="text-[9px] text-[#9aa0a6]">ROI</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold">{s.totalPlays}</div>
              <div className="text-[9px] text-[#9aa0a6]">Tirages</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#00e676]">{result?.totalWins || 0}</div>
              <div className="text-[9px] text-[#9aa0a6]">Gains</div>
            </div>
          </div>

          {/* Gains par source */}
          {(s.totalGainBot > 0 || s.totalGainIA > 0 || s.totalGainLSTM > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {s.totalGainBot > 0 && (
                <div className="bg-[#00e676]/10 border border-[#00e676]/30 rounded-lg p-2 text-center flex-1 min-w-[80px]">
                  <div className="text-[9px] font-bold text-[#00e676]">BOT</div>
                  <div className="text-sm font-bold text-[#00e676]">{fmtF(s.totalGainBot)}</div>
                </div>
              )}
              {s.totalGainIA > 0 && (
                <div className="bg-[#e040fb]/10 border border-[#e040fb]/30 rounded-lg p-2 text-center flex-1 min-w-[80px]">
                  <div className="text-[9px] font-bold text-[#e040fb]">IA</div>
                  <div className="text-sm font-bold text-[#e040fb]">{fmtF(s.totalGainIA)}</div>
                </div>
              )}
              {s.totalGainLSTM > 0 && (
                <div className="bg-[#ffab40]/10 border border-[#ffab40]/30 rounded-lg p-2 text-center flex-1 min-w-[80px]">
                  <div className="text-[9px] font-bold text-[#ffab40]">LSTM</div>
                  <div className="text-sm font-bold text-[#ffab40]">{fmtF(s.totalGainLSTM)}</div>
                </div>
              )}
            </div>
          )}

          {/* Détail par tirage */}
          {result?.perDraw && result.perDraw.length > 0 && (
            <div>
              <div className="text-[10px] text-[#9aa0a6] font-bold mb-2">DETAIL PAR TIRAGE</div>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {result.perDraw.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#222533] rounded-lg px-3 py-2">
                    <div>
                      <span className="text-xs font-semibold">{d.tirage}</span>
                      <span className="text-[9px] text-[#9aa0a6] ml-2">{d.wins}/{d.plays} gagnes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${d.profit >= 0 ? "text-[#00e676]" : "text-[#ff5252]"}`}>
                        {d.profit >= 0 ? "+" : ""}{fmtF(d.profit)}
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
