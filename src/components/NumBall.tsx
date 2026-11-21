"use client";

type Variant = "green" | "red" | "blue" | "orange" | "purple" | "hit" | "close" | "miss" | "hidden";

const VARIANT_CLASSES: Record<Variant, string> = {
  green: "bg-gradient-to-br from-[#2e7d32] to-[#43a047] text-white shadow-lg shadow-green-500/30",
  red: "bg-gradient-to-br from-[#c62828] to-[#e53935] text-white shadow-lg shadow-red-500/30",
  blue: "bg-gradient-to-br from-[#1565c0] to-[#1e88e5] text-white",
  orange: "bg-gradient-to-br from-[#ef6c00] to-[#fb8c00] text-white",
  purple: "bg-gradient-to-br from-[#7b1fa2] to-[#9c27b0] text-white",
  hit: "bg-gradient-to-br from-[#00c853] to-[#69f0ae] text-black shadow-lg shadow-green-400/40",
  close: "bg-gradient-to-br from-[#1565c0] to-[#42a5f5] text-white",
  miss: "bg-[#222533] text-[#9aa0a6] border border-[#2d3140]",
  hidden: "bg-[#222533] text-[#9aa0a6] border border-[#2d3140]",
};

interface NumBallProps {
  num: number;
  variant?: Variant;
  size?: "sm" | "md";
}

export function NumBall({ num, variant = "green", size = "md" }: NumBallProps) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-base";
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-extrabold ${VARIANT_CLASSES[variant]}`}>
      {variant === "hidden" ? "?" : String(num).padStart(2, "0")}
    </div>
  );
}
