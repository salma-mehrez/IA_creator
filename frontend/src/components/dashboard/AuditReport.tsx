"use client";

import { AlertTriangle, CheckCircle2, Trophy, Info, Sparkles, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface AuditReportProps {
  auditResult: any;
  language: string;
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function AuditReport({ auditResult, language }: AuditReportProps) {
  const { t } = useLanguage();
  if (!auditResult) return null;

  const scoreColor = (auditResult?.score || 0) >= 80 ? "text-emerald-500" : (auditResult?.score || 0) >= 60 ? "text-amber-500" : "text-rose-500";
  const scoreBg = (auditResult?.score || 0) >= 80 ? "bg-emerald-500" : (auditResult?.score || 0) >= 60 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div id="audit-report" className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-8 py-5 border-b border-border-subtle flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-light rounded-xl flex items-center justify-center shadow-sm">
            <Trophy className="h-4 w-4 text-brand" />
          </div>
          <h3 className="text-sm font-black text-foreground tracking-tight uppercase">{t("audit.report")}</h3>
        </div>
        <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
          auditResult.score >= 80 ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
          auditResult.score >= 60 ? "bg-amber-50 border-amber-200 text-amber-700" :
          "bg-rose-50 border-rose-200 text-rose-700"
        )}>
          {auditResult.status}
        </span>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Column */}
        <div className="flex flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-border/50">
          <div className={cn("text-7xl font-black mb-2 tracking-tighter", scoreColor)}>
            {auditResult?.score || 0}
          </div>
          <p className="text-[10px] font-black text-subtle uppercase tracking-widest">{t("audit.score")}</p>
          <div className="w-full mt-6 px-6">
            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", scoreBg)}
                style={{ width: `${auditResult?.score || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Findings Column */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-4">{t("audit.analysis")}</p>
          {auditResult.findings?.map((f: any, i: number) => (
            <div key={i} className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border",
              f.type === "success" ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10" :
              f.type === "warning" ? "bg-amber-50/50 border-amber-100 dark:bg-amber-950/10" :
              "bg-indigo-50/50 border-indigo-100 dark:bg-indigo-950/10"
            )}>
              <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm",
                f.type === "success" ? "bg-emerald-500 text-white" :
                f.type === "warning" ? "bg-amber-500 text-white" :
                "bg-indigo-500 text-white"
              )}>
                {f.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                  f.type === "warning" ? <AlertTriangle className="h-3.5 w-3.5" /> :
                    <Info className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-subtle mb-0.5">
                  {f.label}
                </p>
                <p className="text-xs text-foreground font-bold leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations Column */}
        <div className="space-y-5">
          {auditResult.top_video && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-4">{t("audit.best_video")}</p>
              <div className="bg-surface border border-border rounded-2xl overflow-hidden group shadow-sm transition-all hover:shadow-md">
                <div className="aspect-video relative overflow-hidden">
                  <img src={auditResult.top_video.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                    <Trophy className="h-2.5 w-2.5" /> Best
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900/50">
                  <p className="text-xs font-black text-foreground line-clamp-1 mb-1">{auditResult.top_video.title}</p>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-subtle">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(auditResult.top_video.view_count)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-brand-light dark:bg-indigo-950/20 border border-brand/20 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-brand animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-brand">{t("audit.recommendations")}</p>
            </div>
            <ul className="space-y-3">
              {auditResult.recommendations?.map((r: string, i: number) => (
                <li key={i} className="flex gap-3 items-start text-xs text-brand/90 font-bold leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand/40 mt-1.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
