"use client";

interface Tab {
  key: string;
  label: string;
  locked?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-0.5 mb-4 bg-[#1a1d27] rounded-xl p-1 border border-[#2d3140]">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => !t.locked && onChange(t.key)}
          className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all text-center relative ${
            active === t.key
              ? "bg-[#00e676] text-black"
              : t.locked
              ? "text-[#555] cursor-not-allowed"
              : "text-[#9aa0a6] hover:text-white"
          }`}
        >
          {t.label}
          {t.locked && <span className="ml-1 text-[8px]">&#128274;</span>}
        </button>
      ))}
    </div>
  );
}
