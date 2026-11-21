"use client";

import { useEffect, useState } from "react";
import { NumBall } from "./NumBall";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface Prediction {
  tirage: string;
  heure: string;
  combo: number[];
  isTop: boolean;
}

interface JourData {
  jour: string;
  date: string;
  perf: number;
  predictions: Prediction[];
}

function perfColor(pct: number): string {
  return pct >= 6.5 ? "#00e676" : pct >= 5.5 ? "#ffab40" : "#ff5252";
}

export function TabSemaine() {
  const [data, setData] = useState<JourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    fetch(`${API}/api/semaine`)
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Vue semaine compacte */}
      <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-4 mb-4">
        <div className="text-xs font-bold text-[#00e676] mb-3">7 prochains jours</div>
        <div className="flex gap-1.5 flex-wrap">
          {data.map((j, i) => {
            const pc = perfColor(j.perf);
            return (
              <div
                key={i}
                onClick={() => toggle(i)}
                className={`bg-[#222533] rounded-lg p-3 text-center flex-1 min-w-[75px] cursor-pointer transition-all hover:scale-105 ${
                  i === 0 ? "border-2 border-[#00e676]" : "border border-transparent"
                }`}
              >
                <div className="text-[9px] text-[#9aa0a6]">{i === 0 ? "Auj." : j.jour.slice(0, 3)}</div>
                <div className="text-sm font-bold">{j.date}</div>
                <div className="text-base font-extrabold" style={{ color: pc }}>{j.perf}%</div>
              </div>
            );
          })}
        </div>
        <div className="text-[9px] text-[#9aa0a6] text-center mt-2">Taux de reussite du bot par jour</div>
      </div>

      {/* Détail par jour */}
      {data.map((j, i) => {
        const isOpen = expanded.has(i);
        const pc = perfColor(j.perf);
        const tops = j.predictions.filter((p) => p.isTop && p.combo?.length > 0);
        const others = j.predictions.filter((p) => !p.isTop && p.combo?.length > 0);

        return (
          <div key={i} className={`bg-[#1a1d27] border rounded-xl mb-3 overflow-hidden ${i === 0 ? "border-[#00e676]/40" : "border-[#2d3140]"}`}>
            <button
              onClick={() => toggle(i)}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{j.jour} {j.date}</span>
                <span className="text-xs font-bold" style={{ color: pc }}>{j.perf}%</span>
                {i === 0 && <span className="text-[8px] bg-[#00e676] text-black px-1.5 py-0.5 rounded font-bold">AUJOURD&apos;HUI</span>}
              </div>
              <span className="text-[#9aa0a6] text-sm">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4">
                {tops.length > 0 && (
                  <div className="bg-[#00e676]/5 border border-[#00e676]/20 rounded-lg p-3 mb-3">
                    <div className="text-[#00e676] text-[10px] font-bold mb-2">A PRIVILEGIER</div>
                    {tops.map((t, k) => (
                      <div key={k} className="flex items-center gap-2 py-1">
                        <span className="text-[10px] font-bold text-[#18ffff] bg-[#222533] px-1.5 py-0.5 rounded min-w-[36px] text-center">{t.heure}</span>
                        <span className="text-xs font-semibold min-w-[100px]">{t.tirage}</span>
                        <div className="flex gap-1">
                          {t.combo.map((n, m) => (
                            <NumBall key={m} num={n} variant="green" size="sm" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {others.length > 0 && (
                  <div className="space-y-1">
                    {others.map((t, k) => (
                      <div key={k} className="flex items-center gap-2 py-1 border-b border-[#2d3140] last:border-0">
                        <span className="text-[10px] font-bold text-[#18ffff] bg-[#222533] px-1.5 py-0.5 rounded min-w-[36px] text-center">{t.heure}</span>
                        <span className="text-xs min-w-[100px] text-[#9aa0a6]">{t.tirage}</span>
                        <div className="flex gap-1">
                          {t.combo.map((n, m) => (
                            <NumBall key={m} num={n} variant="miss" size="sm" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
