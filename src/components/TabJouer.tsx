"use client";

import { useEffect, useState } from "react";
import { NumBall } from "./NumBall";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const SOURCES = [
  { k: "bot", l: "Bot", c: "#00e676" },
  { k: "nn", l: "IA Neural", c: "#e040fb" },
  { k: "lstm", l: "LSTM", c: "#ffab40" },
  { k: "consensus", l: "Consensus", c: "#18ffff" },
] as const;

const JOUR_QUALITY: Record<number, { lbl: string; col: string }> = {
  0: { lbl: "TRES BON", col: "#00e676" },
  1: { lbl: "BON", col: "#ffab40" },
  2: { lbl: "JACKPOT", col: "#00e676" },
  3: { lbl: "FAIBLE", col: "#ff5252" },
  4: { lbl: "NEUTRE", col: "#ffab40" },
  5: { lbl: "BON", col: "#00e676" },
  6: { lbl: "BON", col: "#00e676" },
};

const TOP_TIRAGES: Record<number, string[]> = {
  0: ["Prestige", "Benediction", "Digital Reveil 7h"],
  1: ["Reveil", "Cash", "Digital 23h"],
  2: ["Sika", "Digital Reveil 8h", "Digital 23h"],
  3: ["Baraka", "Digital Reveil 7h", "Digital 23h"],
  4: ["Digital Reveil 8h", "Digital 23h", "Digital 21h"],
  5: ["Digital Reveil 7h", "Digital 23h", "Afterwork"],
  6: ["Special Weekend 3h", "Diamant", "Digital 23h"],
};

const EVITER_TIRAGES: Record<number, string[]> = {
  0: ["Espoir", "National"],
  1: ["Monday Special", "Premiere Heure"],
  2: ["Lucky Tuesday", "Emergence"],
  3: ["Midweek", "Premiere Heure"],
  4: ["Kado", "Fortune Thursday"],
  5: ["Friday Bonanza", "Solution"],
  6: ["National", "Moaye"],
};

interface Tirage {
  nom: string;
  heure: string;
  sources: { bot: number[]; nn: number[]; lstm: number[]; consensus: number[] };
}

interface Paire {
  paire: [number, number];
  freq: number;
}

interface AccessInfo {
  allowed: boolean;
  reason: string;
  remaining: number;
  plan: string;
}

interface TabJouerProps {
  access: AccessInfo | null;
  onAccessUpdate: (a: AccessInfo) => void;
}

export function TabJouer({ access, onAccessUpdate }: TabJouerProps) {
  const [jour, setJour] = useState(new Date().getDay());
  const [tirages, setTirages] = useState<Tirage[]>([]);
  const [paires, setPaires] = useState<Paire[]>([]);
  const [source, setSource] = useState("lstm");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/tirages-du-jour?jour=${jour}`).then((r) => r.json()),
      fetch(`${API}/api/paires/${jour}`).then((r) => r.json()).catch(() => null),
    ]).then(([tData, pData]) => {
      setTirages(tData.tirages || []);
      setPaires(pData?.paires?.slice(0, 5) || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [jour]);

  async function handleReveal(nom: string) {
    const res = await fetch("/api/access/consume", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      if (data.access) onAccessUpdate(data.access);
      return;
    }
    setRevealed((prev) => new Set([...prev, nom]));
    if (data.access) onAccessUpdate(data.access);
  }

  const isPremium = access?.plan === "monthly" || access?.plan === "day_pass";
  const jq = JOUR_QUALITY[jour] || { lbl: "", col: "#9aa0a6" };
  const tops = TOP_TIRAGES[jour] || [];
  const eviter = EVITER_TIRAGES[jour] || [];

  function buildDayButtons() {
    const buttons = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const j = d.getDay();
      const label = i === 0 ? "Aujourd'hui" : i === 1 ? "Demain" : JOURS[j];
      const ds = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      buttons.push(
        <button
          key={j}
          onClick={() => setJour(j)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            jour === j
              ? "bg-[#00e676] text-black border-[#00e676] font-bold"
              : "border-[#2d3140] bg-[#222533] text-white hover:border-[#00e676] hover:text-[#00e676]"
          }`}
        >
          {label} {ds}
        </button>
      );
    }
    return buttons;
  }

  return (
    <div>
      {/* Sélecteur de jour */}
      <div className="flex gap-1.5 flex-wrap mb-4">{buildDayButtons()}</div>

      {/* Conseil du jour */}
      <div className="rounded-xl p-4 mb-4 border" style={{ borderColor: jq.col, background: "linear-gradient(135deg, rgba(0,0,0,0), rgba(0,0,0,0.3))" }}>
        <div className="font-bold text-sm mb-3" style={{ color: jq.col }}>
          &#9733; {JOURS[jour]} : {jq.lbl}
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          <div className="bg-[#222533] p-3 rounded-lg flex-1 min-w-[140px]">
            <div className="text-[#18ffff] font-bold text-[10px] mb-1">PARI RECOMMANDE</div>
            <div className="font-semibold text-white">Chance 4+ DC</div>
            <div className="text-[#9aa0a6] text-[9px] mt-1">4 nums LSTM en Chance 4+ Double Chance</div>
            <div className="text-[#ffd740] text-[9px] mt-1">ROI +332% sur 6 mois</div>
          </div>
          {tops.length > 0 && (
            <div className="bg-[#222533] p-3 rounded-lg flex-1 min-w-[140px]">
              <div className="text-[#00e676] font-bold text-[10px] mb-1">A CIBLER</div>
              <div className="text-white">{tops.join(", ")}</div>
            </div>
          )}
          {eviter.length > 0 && (
            <div className="bg-[#222533] p-3 rounded-lg flex-1 min-w-[140px]">
              <div className="text-[#ff5252] font-bold text-[10px] mb-1">EVITER</div>
              <div className="text-[#9aa0a6]">{eviter.join(", ")}</div>
            </div>
          )}
        </div>
        <div className="mt-3 p-2.5 rounded-lg text-[10px] text-[#9aa0a6] border border-[#448aff]/15 bg-[#448aff]/5">
          <span className="font-bold text-[#448aff]">Strategie :</span> Joue les{" "}
          <span className="font-bold text-[#ffab40]">4 premiers LSTM</span> en{" "}
          <span className="font-bold">Chance 4+ DC</span> (100F). Joue{" "}
          <span className="font-bold">seulement</span> les tirages ou il y a un{" "}
          <span className="font-bold text-[#18ffff]">vote</span> (numero en commun entre 2+ sources).
        </div>
      </div>

      {/* Paires chaudes */}
      {paires.length > 0 && (
        <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
          <div className="text-[#e040fb] text-xs font-bold mb-3">&#9830; PAIRES LES PLUS FREQUENTES</div>
          <div className="flex gap-2 flex-wrap">
            {paires.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-[#222533] px-3 py-2 rounded-lg">
                <NumBall num={p.paire[0]} variant="purple" size="sm" />
                <span className="text-[#9aa0a6]">-</span>
                <NumBall num={p.paire[1]} variant="purple" size="sm" />
                <span className="text-[10px] text-[#9aa0a6] ml-1">{p.freq}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source selector */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {SOURCES.map((s) => (
          <button
            key={s.k}
            onClick={() => setSource(s.k)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
              source === s.k ? "text-black" : "text-[#9aa0a6] border-[#2d3140] hover:border-[#9aa0a6]"
            }`}
            style={source === s.k ? { backgroundColor: s.c, borderColor: s.c } : {}}
          >
            {s.l}
          </button>
        ))}
      </div>

      {/* Liste des tirages */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {tirages.map((t) => {
            const nums: number[] = t.sources[source as keyof typeof t.sources] || [];
            const isRevealed = revealed.has(t.nom) || isPremium;
            const isTop = tops.includes(t.nom);
            const isEviter = eviter.includes(t.nom);

            return (
              <div
                key={t.nom}
                className={`bg-[#1a1d27] border rounded-xl p-4 ${
                  isTop ? "border-[#00e676]/40" : isEviter ? "border-[#ff5252]/20" : "border-[#2d3140]"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#18ffff] text-[10px] font-bold bg-[#222533] px-2 py-0.5 rounded">{t.heure}</span>
                    <span className="font-semibold text-sm">{t.nom}</span>
                    {isTop && <span className="text-[8px] bg-[#00e676]/20 text-[#00e676] px-1.5 py-0.5 rounded font-bold">TOP</span>}
                    {isEviter && <span className="text-[8px] bg-[#ff5252]/20 text-[#ff5252] px-1.5 py-0.5 rounded font-bold">EVITER</span>}
                  </div>
                  {!isRevealed && (
                    <button
                      onClick={() => handleReveal(t.nom)}
                      disabled={!access?.allowed}
                      className="bg-[#00e676] text-black font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-[#69f0ae] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Voir
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {nums.slice(0, 5).map((n, i) => (
                    <NumBall key={i} num={n} variant={isRevealed ? "green" : "hidden"} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tirages.length === 0 && !loading && (
        <div className="text-center text-[#9aa0a6] py-12">
          <p className="text-lg mb-2">&#128640;</p>
          <p>Aucun tirage disponible</p>
          <p className="text-xs mt-1">Le serveur de predictions ne repond pas</p>
        </div>
      )}
    </div>
  );
}
