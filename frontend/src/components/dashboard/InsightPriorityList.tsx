"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface InsightAction {
  type: string;
  label: string;
  text: string;
  cta_label: string;
  cta_href: string;
}

interface InsightPriorityListProps {
  insights: InsightAction[];
}

export default function InsightPriorityList({ insights }: InsightPriorityListProps) {
  const getDotColor = (type: string) => {
    switch (type) {
      case "success": return "bg-emerald-500 shadow-emerald-500/50";
      case "warning": return "bg-amber-500 shadow-amber-500/50";
      case "danger": return "bg-rose-500 shadow-rose-500/50";
      case "info": default: return "bg-indigo-500 shadow-indigo-500/50";
    }
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm group hover:border-brand-border transition-all h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Insights de la semaine</h3>
                <p className="text-[10px] text-subtle font-bold">RECOMMANDATIONS IA</p>
            </div>
        </div>
        <button className="text-xs font-black text-muted hover:text-brand transition-colors p-2 bg-surface-secondary border border-border rounded-xl">
           Voir tout ↗
        </button>
      </div>

      <div className="space-y-8">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex gap-5 group/item">
            <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 shadow-lg", getDotColor(insight.type))} />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground leading-tight group-hover/item:text-brand transition-colors">{insight.text}</h4>
              <Link
                href={insight.cta_href}
                className="inline-flex items-center gap-1.5 text-xs font-black text-brand hover:gap-2.5 transition-all uppercase tracking-widest"
              >
                {insight.cta_label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
