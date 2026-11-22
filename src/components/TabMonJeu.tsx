"use client";

import { useEffect, useState } from "react";
import { NumBall } from "./NumBall";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const SOURCES = [
  { k: "bot", l: "Bot", c: "#00e676" },
  { k: "nn", l: "IA Neural", c: "#e040fb" },
  { k: "lstm", l: "LSTM", c: "#ffab40" },
  { k: "consensus", l: "Consensus", c: "#18ffff" },
];

const TYPES_PARIS = [
  { k: "chance5dc", l: "Chance 5+ DC", pick: 5, mise: 100 },
  { k: "chance4dc", l: "Chance 4+ DC", pick: 4, mise: 100 },
  { k: "chance3dc", l: "Chance 3+ DC", pick: 3, mise: 100 },
  { k: "chance5", l: "Chance 5", pick: 5, mise: 100 },
  { k: "chance4", l: "Chance 4", pick: 4, mise: 100 },
  { k: "chance3", l: "Chance 3", pick: 3, mise: 100 },
];

interface Tirage {
  nom: string;
  heure: string;
  sources: { bot: number[]; nn: number[]; lstm: number[]; consensus: number[] };
}

interface Bet {
  id: string;
  tirage: string;
  mode: string;
  modeLabel?: string;
  source: string;
  nums: number[];
  mise: number;
  date: string;
  resolved: boolean;
  gain?: number;
  net?: number;
  hitsGagnants?: number;
  hitsMachine?: number;
  totalHits?: number;
  resultat?: number[];
  machine?: number[];
}

interface Stats {
  totalMise: number;
  totalGain: number;
  totalNet: number;
  roi: string;
  nbParis: number;
  nbWins: number;
}

interface ByEntry {
  mise: number;
  gain: number;
  count: number;
  wins: number;
}

interface AccessInfo {
  allowed: boolean;
  reason: string;
  remaining: number;
  plan: string;
}

interface TabMonJeuProps {
  access: AccessInfo | null;
}

function fmtF(n: number): string {
  return n.toLocaleString("fr-FR") + " F";
}

export function TabMonJeu({ access }: TabMonJeuProps) {
  const [tirages, setTirages] = useState<Tirage[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bySource, setBySource] = useState<Record<string, ByEntry>>({});
  const [byTirage, setByTirage] = useState<Record<string, ByEntry>>({});
  const [pending, setPending] = useState(0);
  const [selTirage, setSelTirage] = useState("");
  const [selSource, setSelSource] = useState("lstm");
  const [selType, setSelType] = useState("chance4dc");
  const [selMise, setSelMise] = useState(100);
  const [placing, setPlacing] = useState(false);
  const [msg, setMsg] = useState("");
  const [showStats, setShowStats] = useState(false);

  function loadData() {
    Promise.all([
      fetch(`${API}/api/tirages-du-jour`).then((r) => r.json()),
      fetch(`${API}/api/mes-paris`).then((r) => r.json()),
    ]).then(([tData, pData]) => {
      setTirages(tData.tirages || []);
      setBets(pData.bets || []);
      setStats(pData.stats || null);
      setBySource(pData.bySource || {});
      setByTirage(pData.byTirage || {});
      setPending(pData.pending || 0);
    }).catch(() => {});
  }

  useEffect(() => { loadData(); }, []);

  const isPremium = access?.plan === "monthly" || access?.plan === "day_pass";
  const typePari = TYPES_PARIS.find((t) => t.k === selType);
  const selectedTirageData = tirages.find((t) => t.nom === selTirage);
  const previewNums = selectedTirageData
    ? (selectedTirageData.sources[selSource as keyof typeof selectedTirageData.sources] || []).slice(0, typePari?.pick || 4)
    : [];

  async function placerPari() {
    if (!selTirage) { setMsg("Choisis un tirage"); return; }
    if (previewNums.length === 0) { setMsg("Pas de numeros disponibles"); return; }
    setPlacing(true);
    setMsg("");
    try {
      const res = await fetch(`${API}/api/placer-pari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tirage: selTirage,
          source: selSource,
          mode: selType,
          mise: selMise,
          nums: previewNums,
        }),
      });
      const data = await res.json();
      if (data.error) { setMsg(data.error); }
      else {
        setMsg(`Pari place ! ${data.bet?.resolved ? (data.bet.gain > 0 ? "GAGNE +" + fmtF(data.bet.gain) : "Perdu") : "En attente de resultat"}`);
        loadData();
      }
    } catch { setMsg("Erreur serveur"); }
    setPlacing(false);
  }

  async function supprimerPari(id: string) {
    await fetch(`${API}/api/supprimer-pari/${id}`, { method: "DELETE" });
    loadData();
  }

  const roiColor = stats && parseFloat(stats.roi) > 0 ? "#00e676" : stats && parseFloat(stats.roi) < 0 ? "#ff5252" : "#9aa0a6";

  const recentBets = [...bets].reverse().slice(0, 50);

  return (
    <div>
      {/* Stats portfolio */}
      {stats && stats.nbParis > 0 && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[#ffd740] text-xs font-bold">&#128176; Mon Portefeuille</div>
            <button onClick={() => setShowStats(!showStats)} className="text-[9px] text-[#18ffff] hover:underline">
              {showStats ? "Masquer details" : "Voir details"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#ff5252]">{fmtF(stats.totalMise)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Total mise</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#00e676]">{fmtF(stats.totalGain)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Total gagne</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold" style={{ color: roiColor }}>{fmtF(stats.totalNet)}</div>
              <div className="text-[9px] text-[#9aa0a6]">Benefice net</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold" style={{ color: roiColor }}>{stats.roi}%</div>
              <div className="text-[9px] text-[#9aa0a6]">ROI</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold">{stats.nbParis}</div>
              <div className="text-[9px] text-[#9aa0a6]">Paris</div>
            </div>
            <div className="bg-[#222533] rounded-lg p-3 text-center">
              <div className="text-lg font-extrabold text-[#00e676]">{stats.nbWins}</div>
              <div className="text-[9px] text-[#9aa0a6]">Gagnes</div>
            </div>
          </div>
          {pending > 0 && (
            <div className="mt-2 text-center text-[10px] text-[#ffab40]">{pending} paris en attente de resultat</div>
          )}

          {/* Stats detaillees par source */}
          {showStats && Object.keys(bySource).length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#2d3140]">
              <div className="text-[10px] text-[#9aa0a6] font-bold mb-2">PAR SOURCE</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(bySource).map(([src, s]) => {
                  const roi = s.mise > 0 ? ((s.gain / s.mise - 1) * 100).toFixed(0) : "0";
                  const col = parseFloat(roi) > 0 ? "#00e676" : "#ff5252";
                  return (
                    <div key={src} className="bg-[#222533] rounded-lg p-2 text-center min-w-[70px]">
                      <div className="text-[9px] font-bold text-[#9aa0a6]">{src.toUpperCase()}</div>
                      <div className="text-sm font-bold" style={{ color: col }}>{parseInt(roi) > 0 ? "+" : ""}{roi}%</div>
                      <div className="text-[8px] text-[#9aa0a6]">{s.wins}/{s.count} gagnes</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats detaillees par tirage */}
          {showStats && Object.keys(byTirage).length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#2d3140]">
              <div className="text-[10px] text-[#9aa0a6] font-bold mb-2">PAR TIRAGE</div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {Object.entries(byTirage)
                  .sort(([, a], [, b]) => (b.gain - b.mise) - (a.gain - a.mise))
                  .map(([tirage, s]) => {
                    const net = s.gain - s.mise;
                    const col = net > 0 ? "#00e676" : "#ff5252";
                    return (
                      <div key={tirage} className="flex items-center justify-between bg-[#222533] rounded px-2 py-1.5">
                        <span className="text-[10px] font-semibold">{tirage}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-[#9aa0a6]">{s.wins}/{s.count}</span>
                          <span className="text-[10px] font-bold" style={{ color: col }}>
                            {net >= 0 ? "+" : ""}{fmtF(net)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placer un pari */}
      <div className="bg-[#1a1d27] border border-[#00e676]/30 rounded-xl p-4 mb-4">
        <div className="text-xs font-bold mb-3">&#127922; Placer un pari</div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">1. TIRAGE</div>
          <div className="flex flex-wrap gap-1">
            {tirages.map((t) => (
              <button
                key={t.nom}
                onClick={() => setSelTirage(t.nom)}
                className={`text-[10px] px-2 py-1 rounded border transition-all ${
                  selTirage === t.nom
                    ? "bg-[#00e676] text-black border-[#00e676] font-bold"
                    : "border-[#2d3140] bg-[#222533] text-white hover:border-[#00e676]"
                }`}
              >
                <span className={selTirage === t.nom ? "text-black" : "text-[#18ffff]"}>{t.heure}</span> {t.nom}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">2. SOURCE</div>
          <div className="flex flex-wrap gap-1">
            {SOURCES.map((s) => (
              <button
                key={s.k}
                onClick={() => setSelSource(s.k)}
                className={`text-[10px] px-3 py-1 rounded border font-bold transition-all ${
                  selSource === s.k ? "text-black" : "text-[#9aa0a6] border-[#2d3140]"
                }`}
                style={selSource === s.k ? { backgroundColor: s.c, borderColor: s.c } : {}}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">3. TYPE DE PARI</div>
          <div className="flex flex-wrap gap-1">
            {TYPES_PARIS.map((tp) => {
              const isDC = tp.k.includes("dc");
              return (
                <button
                  key={tp.k}
                  onClick={() => setSelType(tp.k)}
                  className={`text-[10px] px-3 py-1 rounded border font-bold transition-all ${
                    selType === tp.k
                      ? "bg-[#ffd740] text-black border-[#ffd740]"
                      : "text-[#9aa0a6] border-[#2d3140] hover:border-[#ffd740]"
                  }`}
                >
                  {tp.l}
                  {isDC && <span className="ml-1 text-[8px]">★</span>}
                </button>
              );
            })}
          </div>
          {!selType.includes("dc") && (
            <div className="text-[9px] text-[#ff5252] mt-1">Le standard est perdant — Double Chance (DC) recommande</div>
          )}
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[#18ffff] font-bold mb-2">4. MISE</div>
          <div className="flex items-center gap-2">
            {[100, 200, 500, 1000].map((m) => (
              <button
                key={m}
                onClick={() => setSelMise(m)}
                className={`text-[10px] px-3 py-1 rounded border font-bold transition-all ${
                  selMise === m ? "bg-[#448aff] text-white border-[#448aff]" : "text-[#9aa0a6] border-[#2d3140]"
                }`}
              >
                {m}F
              </button>
            ))}
            <input
              type="number"
              value={selMise}
              onChange={(e) => setSelMise(Math.max(25, parseInt(e.target.value) || 100))}
              min={25}
              className="w-20 bg-[#222533] border border-[#2d3140] rounded px-2 py-1 text-[10px] text-white focus:border-[#00e676] outline-none"
            />
          </div>
        </div>

        {/* Preview nums — masques pour les gratuits */}
        {selTirage && previewNums.length > 0 && (
          <div className="mb-3 p-3 bg-[#222533] rounded-lg">
            <div className="text-[9px] text-[#9aa0a6] mb-2">
              {typePari?.l} • {selSource.toUpperCase()} • {selMise}F
            </div>
            <div className="flex gap-1.5">
              {previewNums.map((n, i) => (
                <NumBall key={i} num={n} variant={isPremium ? "green" : "hidden"} size="sm" />
              ))}
            </div>
            {!isPremium && (
              <div className="text-[9px] text-[#ffab40] mt-2">
                Numeros masques — passe au Pass 24h ou PRO pour voir les predictions
              </div>
            )}
          </div>
        )}

        <button
          onClick={placerPari}
          disabled={placing || !selTirage || previewNums.length === 0 || !isPremium}
          className="w-full bg-[#00e676] text-black font-bold py-2.5 rounded-lg text-sm hover:bg-[#69f0ae] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {placing ? "..." : !isPremium ? "Passer PRO pour placer des paris" : `Placer le pari — ${selMise}F`}
        </button>
        {msg && (
          <div className={`text-xs mt-2 text-center ${msg.includes("place") || msg.includes("GAGNE") ? "text-[#00e676]" : "text-[#ff5252]"}`}>
            {msg}
          </div>
        )}
      </div>

      {/* Historique des paris */}
      {recentBets.length > 0 && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4">
          <div className="text-xs font-bold mb-3">&#128203; Historique ({bets.length} paris)</div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {recentBets.map((b) => {
              const isWon = b.resolved && (b.gain || 0) > 0;
              const isLost = b.resolved && (b.gain || 0) === 0;
              const isPending = !b.resolved;
              return (
                <div key={b.id} className="bg-[#222533] rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-semibold">{b.tirage}</div>
                      <div className="text-[9px] text-[#9aa0a6]">
                        {b.modeLabel || b.mode} • {b.source} • {b.date} • {fmtF(b.mise)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isWon ? "bg-[#00e676]/20 text-[#00e676]" :
                        isLost ? "bg-[#ff5252]/20 text-[#ff5252]" :
                        "bg-[#ffab40]/20 text-[#ffab40]"
                      }`}>
                        {isWon ? `GAGNE +${fmtF(b.gain || 0)}` : isLost ? "PERDU" : "EN ATTENTE"}
                      </div>
                      {isPending && (
                        <button
                          onClick={() => supprimerPari(b.id)}
                          className="text-[9px] text-[#ff5252] hover:underline"
                        >
                          &#10005;
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nums predits */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#9aa0a6] min-w-[35px]">Predit</span>
                    <div className="flex gap-1">
                      {b.nums.map((n, i) => {
                        let variant: "green" | "hit" | "orange" | "close" | "miss" = "green";
                        if (b.resolved && b.resultat) {
                          const isExact = b.resultat.includes(n);
                          const isMachine = !isExact && (b.machine || []).includes(n);
                          if (isExact) variant = "hit";
                          else if (isMachine) variant = "orange";
                          else {
                            let isClose = false;
                            for (const r of b.resultat) {
                              if (Math.abs(r - n) <= 2) { isClose = true; break; }
                            }
                            variant = isClose ? "close" : "miss";
                          }
                        }
                        return <NumBall key={i} num={n} variant={variant} size="sm" />;
                      })}
                    </div>
                    {b.resolved && (
                      <span className="text-[10px] ml-auto">
                        <span className="text-[#00e676] font-bold">{b.hitsGagnants || 0}g</span>
                        {(b.hitsMachine || 0) > 0 && <span className="text-[#18ffff]"> +{b.hitsMachine}m</span>}
                      </span>
                    )}
                  </div>

                  {/* Resultat reel */}
                  {b.resolved && b.resultat && (
                    <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[#2d3140]">
                      <span className="text-[9px] text-[#9aa0a6] min-w-[35px]">Sorti</span>
                      <div className="flex gap-1">
                        {b.resultat.map((n, i) => (
                          <NumBall key={i} num={n} variant="green" size="sm" />
                        ))}
                        {b.machine && b.machine.length > 0 && (
                          <>
                            <span className="text-[#9aa0a6] text-[9px] mx-0.5">|</span>
                            {b.machine.map((n, i) => (
                              <NumBall key={`m${i}`} num={n} variant="orange" size="sm" />
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {bets.length === 0 && (
        <div className="text-center text-[#9aa0a6] py-8">
          <p className="text-2xl mb-2">&#127922;</p>
          <p className="text-sm">Aucun pari encore</p>
          <p className="text-xs mt-1">Place ton premier pari ci-dessus</p>
        </div>
      )}
    </div>
  );
}
