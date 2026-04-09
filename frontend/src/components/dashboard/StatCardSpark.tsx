"use client";

import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardSparkProps {
  label: string;
  value: string;
  delta: string;
  data: { date: string; value: number }[];
  color?: string;
  onClick?: () => void;
}

export default function StatCardSpark({ label, value, delta = "0", data = [], color = "#6366f1", onClick }: StatCardSparkProps) {
  const isPositive = delta?.includes("+") || delta?.includes("au-dessus");

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface border border-border rounded-3xl p-5 hover:border-brand-border transition-all group shadow-sm",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-subtle mb-1">{label}</p>
          <h3 className="text-2xl font-black text-foreground tracking-tight">{value}</h3>
          <div className={cn("flex items-center gap-1 text-[10px] font-bold mt-1", isPositive ? "text-emerald-500" : "text-rose-500")}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </div>
        </div>
      </div>
      
      <div className="h-16 w-full mt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3} 
              dot={false}
              animationDuration={1500}
            />
            <Tooltip 
               content={() => null}
               cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
