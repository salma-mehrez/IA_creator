"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number;
  status: string;
  onClick?: () => void;
}

export default function HealthGauge({ score, status, onClick }: HealthGaugeProps) {
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  const COLORS = ["#6366f1", "#f3f4f6"];
  if (score < 60) COLORS[0] = "#ef4444";
  else if (score < 80) COLORS[0] = "#f59e0b";
  else COLORS[0] = "#10b981";

  return (
    <div
      onClick={onClick}
      className={cn("bg-surface border border-border rounded-3xl p-5 flex items-center justify-between shadow-sm group hover:border-brand-border transition-all", onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5")}
    >
      <div className="flex-1">
        <h4 className="text-3xl font-black text-foreground">{score} <span className="text-xs font-normal text-muted">/100</span></h4>
        <div className="flex items-center gap-2 mt-1">
            <div className={cn("w-2 h-2 rounded-full", (score > 80 ? "bg-emerald-500" : score > 60 ? "bg-amber-500" : "bg-rose-500"))} />
            <p className="text-[10px] font-black uppercase tracking-widest text-subtle">{status}</p>
        </div>
      </div>
      
      <div className="w-16 h-16 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={24}
              outerRadius={32}
              startAngle={90}
              endAngle={450}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={COLORS[0]} />
              <Cell fill="rgba(0,0,0,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-foreground">{score}%</span>
        </div>
      </div>
    </div>
  );
}
