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
  { k: "chance5", l: "Chance 5", mise: 100 },
  { k: "chance4", l: "Chance 4", mise: 100 },
  { k: "chance3", l: "Chance 3", mise: 100 },
  { k: "chance4dc", l: "Chance 4+ DC", mise: 100 },
  { k: "chance3dc", l: "Chance 3+ DC", mise: 100 },
];

interface Tirage {
  nom: string;
  heure: string;
  sources: { bot: number[]; nn: number[]; lstm: number[]; consensus: number[] };
}

interface Pari {
  id: string;
  tirage: string;
  type: string;
  source: string;
  nums: number[];
  mise: number;
  date: string;
  status: "pending" | "won" | "lost";
  gain?: number;
}

interface Stats {
  totalMise: number;
  totalGain: number;
  totalNet: number;
  roi: string;
  nbParis: number;
  nbWins: number;
}

function fmtF(n: number): string {
  return n.toLocaleString("fr-FR") + " F";
}

export function TabMonJeu() {
  const [tirages, setTirages] = useState<Tirage[]>([]);
  const [paris, setParis] = useState<Pari[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState(0);
  const [selTirage, setSelTirage] = useState("");
  const [selSource, setSelSource] = useState("lstm");
  const [selType, setSelType] = useState("chance4dc");
  const [placing, setPlacing] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/tirages-du-jour`).then((r) => r.json()),
      fetch(`${API}/api/mes-paris`).then((r) => r.json()),
    ]).then(([tData, pData]) => {
      setTirages(tData.tirages || []);
      setParis(pData.paris || []);
      setStats(pData.stats || null);
      setPending(pData.pending || 0);
    }).catch(() => {});
  }, []);

  async function placerPari() {
    if (!selTirage) { setMsg("Choisis un tirage"); return; }
    setPlacing(true);
    setMsg("");
    try {
      const res = await fetch(`${API}/api/placer-pari`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tirage: selTirage, source: selSource, type: selType }),
      });
      const data = await res.json();
      if (data.error) { setMsg(data.error); }
      else {
        setMsg("Pari place !");
        const pData = await fetch(`${API}/api/mes-paris`).then((r) => r.json());
        setParis(pData.paris || []);
        setStats(pData.stats || null);
        setPending(pData.pending || 0);
      }
    } catch { setMsg("Erreur serveur"); }
    setPlacing(false);
  }

  const roiColor = stats && parseFloat(stats.roi) > 0 ? "#00e676" : stats && parseFloat(stats.roi) < 0 ? "#ff5252" : "#9aa0a6";

  return (
    <div>
      {/* Stats portfolio */}
      {stats && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
          <div className="text-[#ffd740] text-xs font-bold mb-3">&#128176; Mon Portefeuille</div>
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
                <span className="text-[#18ffff]">{t.heure}</span> {t.nom}
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
            {TYPES_PARIS.map((tp) => (
              <button
                key={tp.k}
                onClick={() => setSelType(tp.k)}
                className={`text-[10px] px-3 py-1 rounded border font-bold transition-all ${
                  selType === tp.k
                    ? "bg-[#ffd740] text-black border-[#ffd740]"
                    : "text-[#9aa0a6] border-[#2d3140] hover:border-[#ffd740]"
                }`}
              >
                {tp.l} ({tp.mise}F)
              </button>
            ))}
          </div>
        </div>

        {/* Preview nums */}
        {selTirage && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] text-[#9aa0a6]">Numeros :</span>
            <div className="flex gap-1">
              {(tirages.find((t) => t.nom === selTirage)?.sources[selSource as keyof Tirage["sources"]] || [])
                .slice(0, selType.includes("5") ? 5 : selType.includes("4") ? 4 : 3)
                .map((n, i) => (
                  <NumBall key={i} num={n} variant="green" size="sm" />
                ))}
            </div>
          </div>
        )}

        <button
          onClick={placerPari}
          disabled={placing || !selTirage}
          className="w-full bg-[#00e676] text-black font-bold py-2.5 rounded-lg text-sm hover:bg-[#69f0ae] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {placing ? "..." : "Placer le pari"}
        </button>
        {msg && <div className={`text-xs mt-2 text-center ${msg.includes("place") ? "text-[#00e676]" : "text-[#ff5252]"}`}>{msg}</div>}
      </div>

      {/* Historique des paris */}
      {paris.length > 0 && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4">
          <div className="text-xs font-bold mb-3">&#128203; Historique ({paris.length})</div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {paris.slice(0, 30).map((p) => (
              <div key={p.id} className="bg-[#222533] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">{p.tirage}</div>
                  <div className="text-[9px] text-[#9aa0a6]">
                    {p.type} • {p.source} • {p.date}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {p.nums.map((n, i) => (
                      <NumBall key={i} num={n} variant={p.status === "won" ? "hit" : p.status === "lost" ? "miss" : "orange"} size="sm" />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    p.status === "won" ? "text-[#00e676]" : p.status === "lost" ? "text-[#ff5252]" : "text-[#ffab40]"
                  }`}>
                    {p.status === "won" ? `+${fmtF(p.gain || 0)}` : p.status === "lost" ? `-${fmtF(p.mise)}` : "En attente"}
                  </div>
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                    p.status === "won" ? "bg-[#00e676]/20 text-[#00e676]" :
                    p.status === "lost" ? "bg-[#ff5252]/20 text-[#ff5252]" :
                    "bg-[#ffab40]/20 text-[#ffab40]"
                  }`}>
                    {p.status === "won" ? "GAGNE" : p.status === "lost" ? "PERDU" : "PENDING"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
