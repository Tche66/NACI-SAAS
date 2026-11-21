"use client";

import { useEffect, useState } from "react";
import { NumBall } from "./NumBall";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

type Variant = "green" | "red" | "blue" | "orange" | "purple" | "hit" | "close" | "miss" | "hidden";

interface Comparaison {
  tirage: string;
  prediction: number[];
  neuralPrediction?: number[];
  lstmPrediction?: number[];
  resultat: number[];
  machine?: number[];
  comp: { nbExacts: number; nbMachineExacts?: number; proches: number[] };
  neuralComp?: { nbExacts: number; nbMachineExacts?: number; proches: number[] };
  lstmComp?: { nbExacts: number; nbMachineExacts?: number; proches: number[] };
}

interface DayAnalysis {
  date: string;
  comparaisons: Comparaison[];
}

interface HistData {
  stats: {
    totalPredictions: number;
    totalExacts: number;
    totalComparisons: number;
  };
  allAnalyses: DayAnalysis[];
}

interface PerfData {
  avgHits: number;
  eRandom: number;
  byCategory: { category: string; hits: number; lift: string }[];
  byWeek: { week: string; avg: number }[];
}

const CAT_NOMS: Record<string, string> = {
  digital: "Digital", matin: "Matin", midi: "Midi",
  aprem: "Apres-midi", soir: "Soir", afterwork: "Afterwork", weekend: "Weekend",
};

const TOP_TIRAGES = [
  { n: "Sika", p: "+19246%", j: "Mar 15h55" },
  { n: "Reveil", p: "+622%", j: "Lun 09h55" },
  { n: "Cash", p: "+535%", j: "Ven 09h55" },
  { n: "Sp. Weekend 3h", p: "+289%", j: "Sam/Dim 03h" },
  { n: "Digital Rev. 8h", p: "+222%", j: "Tous 07h58" },
  { n: "Digital Rev. 7h", p: "+159%", j: "Tous 06h58" },
  { n: "Digital 23h", p: "+120%", j: "Tous 22h58" },
];

const WORST_TIRAGES = [
  { n: "Monday Special", p: "-100%", j: "Lun 18h30" },
  { n: "Lucky Tuesday", p: "-100%", j: "Mar 18h30" },
  { n: "Midweek", p: "-100%", j: "Mer 18h30" },
  { n: "Espoir", p: "-100%", j: "Dim 18h30" },
  { n: "National", p: "-100%", j: "Sam 18h30" },
  { n: "Kado", p: "-100%", j: "Jeu 09h55" },
  { n: "Friday Bonanza", p: "-35%", j: "Ven 18h30" },
];

const JOUR_DATA = [
  { j: "Mardi", pct: 2001, lbl: "JACKPOT", col: "#ffd740" },
  { j: "Dimanche", pct: 143, lbl: "EXCELLENT", col: "#00e676" },
  { j: "Samedi", pct: 72, lbl: "BON", col: "#18ffff" },
  { j: "Vendredi", pct: 75, lbl: "BON", col: "#18ffff" },
  { j: "Lundi", pct: 44, lbl: "BON", col: "#18ffff" },
  { j: "Jeudi", pct: 22, lbl: "NEUTRE", col: "#ffab40" },
  { j: "Mercredi", pct: -19, lbl: "EVITER", col: "#ff5252" },
];

const CLASSEMENT_PARIS = [
  { n: "Chance 4+ DC", k: 4, g: "572 000F", p: "+517 600F", r: "+951%", top: true },
  { n: "Chance 5+ DC", k: 5, g: "167 000F", p: "+112 600F", r: "+207%" },
  { n: "Chance 3+ DC", k: 3, g: "144 500F", p: "+90 100F", r: "+166%" },
  { n: "3N DC", k: 3, g: "100 000F", p: "+45 600F", r: "+84%" },
  { n: "2N DC", k: 2, g: "96 000F", p: "+41 600F", r: "+76%" },
  { n: "Tous Standard", k: 0, g: "—", p: "PERDANT", r: "-12% a -100%", bad: true },
];

function getVariant(num: number, resultat: number[], machine: number[]): Variant {
  if (resultat.includes(num)) return "hit";
  if (machine.includes(num)) return "orange";
  for (const r of resultat) {
    if (Math.abs(r - num) <= 2) return "close";
  }
  return "miss";
}

export function TabSuivi() {
  const [hist, setHist] = useState<HistData | null>(null);
  const [perf, setPerf] = useState<PerfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDays, setShowDays] = useState(5);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/historique`).then((r) => r.json()),
      fetch(`${API}/api/performance`).then((r) => r.json()).catch(() => null),
    ]).then(([h, p]) => {
      setHist(h);
      setPerf(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = hist?.stats;
  const pctExact = stats && stats.totalPredictions > 0
    ? (stats.totalExacts / stats.totalPredictions * 100).toFixed(1)
    : "0";

  const recentDays = (hist?.allAnalyses || []).slice(-showDays * 2).reverse().slice(0, showDays);

  return (
    <div>
      {/* Stats principales */}
      {stats && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
          <div className="text-xs font-bold text-[#00e676] mb-3">Resultats du bot</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-xl font-extrabold text-[#00e676]">{pctExact}%</div>
              <div className="text-[9px] text-[#9aa0a6]">Taux de reussite</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-xl font-extrabold text-[#9aa0a6]">5.6%</div>
              <div className="text-[9px] text-[#9aa0a6]">Hasard (base)</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-xl font-extrabold text-[#00e676]">{stats.totalExacts}</div>
              <div className="text-[9px] text-[#9aa0a6]">Numeros trouves</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-xl font-extrabold">{stats.totalComparisons}</div>
              <div className="text-[9px] text-[#9aa0a6]">Tirages compares</div>
            </div>
          </div>
        </div>
      )}

      {/* Par categorie */}
      {perf?.byCategory && perf.byCategory.length > 0 && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
          <div className="text-xs font-bold mb-1">Par type de tirage</div>
          <div className="text-[9px] text-[#9aa0a6] mb-3">Ou le bot performe le mieux</div>
          <div className="flex flex-wrap gap-2">
            {perf.byCategory.map((c, i) => {
              const lift = parseFloat(c.lift);
              const col = lift >= 1.15 ? "#00e676" : lift >= 1.05 ? "#ffab40" : "#ff5252";
              const pctVsH = ((lift - 1) * 100).toFixed(0);
              return (
                <div key={i} className="rounded-lg p-3 text-center flex-1 min-w-[80px] border" style={{ borderColor: col, background: `${col}10` }}>
                  <div className="text-[9px] font-bold uppercase" style={{ color: col }}>{CAT_NOMS[c.category] || c.category}</div>
                  <div className="text-lg font-extrabold" style={{ color: col }}>
                    {parseInt(pctVsH) >= 0 ? "+" : ""}{pctVsH}%
                  </div>
                  <div className="text-[9px] text-[#9aa0a6]">{c.hits} trouves</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparaisons recentes */}
      {recentDays.length > 0 && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
          <div className="text-xs font-bold mb-2">Derniers resultats</div>
          <div className="text-[9px] text-[#9aa0a6] mb-3 flex flex-wrap gap-2">
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#00c853] to-[#69f0ae] align-middle" /> Gagnant</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#ef6c00] to-[#fb8c00] align-middle" /> Machine</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#1565c0] to-[#42a5f5] align-middle" /> Proche</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#222533] border border-[#2d3140] align-middle" /> Manque</span>
          </div>

          {recentDays.map((day, di) => (
            <div key={di} className="mb-4">
              <div className="font-bold text-xs text-[#18ffff] mb-2 pb-1 border-b-2 border-[#2d3140]">{day.date}</div>
              {day.comparaisons.filter((c) => c.comp).map((c, ci) => {
                const mach = c.machine || [];
                return (
                  <div key={ci} className="bg-[#222533] rounded-lg p-3 mb-2">
                    <div className="font-semibold text-xs mb-2">{c.tirage}</div>

                    {/* Bot */}
                    <div className="flex items-center gap-2 py-1">
                      <span className="text-[9px] text-[#9aa0a6] min-w-[40px]">Bot</span>
                      <div className="flex gap-1">
                        {c.prediction.map((n, ni) => (
                          <NumBall key={ni} num={n} variant={getVariant(n, c.resultat, mach)} size="sm" />
                        ))}
                      </div>
                      <span className="text-[10px] ml-auto whitespace-nowrap">
                        <span className="text-[#00e676] font-bold">{c.comp.nbExacts}g</span>
                        {(c.comp.nbMachineExacts || 0) > 0 && <span className="text-[#18ffff]"> +{c.comp.nbMachineExacts}m</span>}
                        {c.comp.proches.length > 0 && <span className="text-[#448aff]"> +{c.comp.proches.length}p</span>}
                      </span>
                    </div>

                    {/* IA Neural */}
                    {c.neuralPrediction && c.neuralComp && (
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-[9px] text-[#e040fb] min-w-[40px]">IA</span>
                        <div className="flex gap-1">
                          {c.neuralPrediction.map((n, ni) => (
                            <NumBall key={ni} num={n} variant={getVariant(n, c.resultat, mach)} size="sm" />
                          ))}
                        </div>
                        <span className="text-[10px] ml-auto whitespace-nowrap">
                          <span className="text-[#00e676] font-bold">{c.neuralComp.nbExacts}g</span>
                          {(c.neuralComp.nbMachineExacts || 0) > 0 && <span className="text-[#18ffff]"> +{c.neuralComp.nbMachineExacts}m</span>}
                          {c.neuralComp.proches.length > 0 && <span className="text-[#448aff]"> +{c.neuralComp.proches.length}p</span>}
                        </span>
                      </div>
                    )}

                    {/* LSTM */}
                    {c.lstmPrediction && c.lstmComp && (
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-[9px] text-[#ffab40] min-w-[40px]">LSTM</span>
                        <div className="flex gap-1">
                          {c.lstmPrediction.map((n, ni) => (
                            <NumBall key={ni} num={n} variant={getVariant(n, c.resultat, mach)} size="sm" />
                          ))}
                        </div>
                        <span className="text-[10px] ml-auto whitespace-nowrap">
                          <span className="text-[#00e676] font-bold">{c.lstmComp.nbExacts}g</span>
                          {(c.lstmComp.nbMachineExacts || 0) > 0 && <span className="text-[#18ffff]"> +{c.lstmComp.nbMachineExacts}m</span>}
                          {c.lstmComp.proches.length > 0 && <span className="text-[#448aff]"> +{c.lstmComp.proches.length}p</span>}
                        </span>
                      </div>
                    )}

                    {/* Resultat réel */}
                    <div className="flex items-center gap-2 py-1 border-t border-[#2d3140] mt-1 pt-1">
                      <span className="text-[9px] text-[#9aa0a6] min-w-[40px]">Sorti</span>
                      <div className="flex gap-1">
                        {c.resultat.map((n, ni) => (
                          <NumBall key={ni} num={n} variant="green" size="sm" />
                        ))}
                        {mach.length > 0 && (
                          <>
                            <span className="text-[#9aa0a6] text-[9px] mx-0.5">|</span>
                            {mach.map((n, ni) => (
                              <NumBall key={`m${ni}`} num={n} variant="orange" size="sm" />
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <button
            onClick={() => setShowDays((d) => d + 5)}
            className="w-full text-xs text-[#18ffff] font-bold py-2 hover:underline"
          >
            Voir plus de resultats
          </button>
        </div>
      )}

      {/* Meilleurs jours */}
      <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
        <div className="text-xs font-bold text-[#18ffff] mb-1">Meilleurs jours pour jouer</div>
        <div className="text-[9px] text-[#9aa0a6] mb-3">Base sur le backtest 6 mois</div>
        <div className="space-y-0">
          {JOUR_DATA.map((jd, i) => {
            const barW = Math.min(100, Math.max(5, Math.round(Math.abs(jd.pct) / 20)));
            return (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-[#2d3140] last:border-0">
                <span className="min-w-[70px] font-semibold text-xs">{jd.j}</span>
                <div className="flex-1 h-1.5 bg-[#222533] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${barW}%`, background: jd.col }} />
                </div>
                <span className="min-w-[50px] text-right text-xs font-bold" style={{ color: jd.col }}>
                  {jd.pct >= 0 ? "+" : ""}{jd.pct}%
                </span>
                <span className="min-w-[60px] text-right text-[9px] font-semibold" style={{ color: jd.col }}>{jd.lbl}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top tirages + A eviter */}
      <div className="flex gap-3 flex-wrap mb-4">
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 flex-1 min-w-[250px]">
          <div className="text-xs font-bold text-[#00e676] mb-3">Top tirages</div>
          {TOP_TIRAGES.map((t, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#2d3140] last:border-0 text-[11px]">
              <span className="text-[#00e676] font-extrabold min-w-[14px]">{i + 1}</span>
              <span className="font-semibold flex-1">{t.n}</span>
              <span className="text-[9px] text-[#9aa0a6]">{t.j}</span>
              <span className="text-[#00e676] font-bold min-w-[50px] text-right">{t.p}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 flex-1 min-w-[250px]">
          <div className="text-xs font-bold text-[#ff5252] mb-3">A eviter</div>
          {WORST_TIRAGES.map((t, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#2d3140] last:border-0 text-[11px]">
              <span className="text-[#ff5252] font-extrabold min-w-[14px]">&#10005;</span>
              <span className="font-semibold flex-1 text-[#9aa0a6]">{t.n}</span>
              <span className="text-[9px] text-[#9aa0a6]">{t.j}</span>
              <span className="text-[#ff5252] font-bold min-w-[50px] text-right">{t.p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guide strategique — classement des paris */}
      <div className="bg-[#1a1d27] border border-[#448aff]/30 rounded-xl p-4 mb-4">
        <div className="text-xs font-bold text-[#448aff] mb-1">Guide strategique</div>
        <div className="text-[9px] text-[#9aa0a6] mb-3">Classement des paris (backtest 6 mois, 100F/pari, Double Chance)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#2d3140]">
                <th className="text-left py-2 font-bold">Pari</th>
                <th className="text-center py-2 font-bold">Nums</th>
                <th className="text-center py-2 font-bold">Gains</th>
                <th className="text-center py-2 font-bold text-[#00e676]">Profit</th>
                <th className="text-center py-2 font-bold">ROI</th>
              </tr>
            </thead>
            <tbody>
              {CLASSEMENT_PARIS.map((p, i) => (
                <tr key={i} className={`border-b border-[#2d3140] last:border-0 ${p.top ? "bg-[#00e676]/5" : p.bad ? "bg-[#ff5252]/5" : ""}`}>
                  <td className={`py-2 text-left ${p.top ? "font-extrabold" : ""}`}>
                    {p.n}{p.top && " ★"}
                  </td>
                  <td className="py-2 text-center">{p.k}</td>
                  <td className="py-2 text-center">{p.g}</td>
                  <td className={`py-2 text-center font-bold ${p.bad ? "text-[#ff5252]" : "text-[#00e676]"}`}>{p.p}</td>
                  <td className={`py-2 text-center font-bold ${p.bad ? "text-[#ff5252]" : "text-[#00e676]"}`}>{p.r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
