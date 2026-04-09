"use client";

import { useEffect, useRef } from "react";
import { X, ArrowUpRight, ArrowDownRight, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Info, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────────────── */

export type DrawerConfig =
  | {
      type: "stat";
      label: string;
      value: string;
      delta: string;
      description: string;
      data: { date: string; value: number }[];
      color: string;
      actionHref?: string;
      actionLabel?: string;
    }
  | {
      type: "health";
      score: number;
      status: string;
      findings: { type: string; label: string; text: string }[];
      recommendations: string[];
    }
  | {
      type: "module";
      title: string;
      description: string;
      features: string[];
      href: string;
      colorClass: string;
      icon: LucideIcon;
    };

interface DetailDrawerProps {
  config: DrawerConfig | null;
  onClose: () => void;
}

/* ─── Custom tooltip for charts ───────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-subtle font-medium mb-0.5">{label}</p>
      <p className="font-black text-foreground">{payload[0].value?.toLocaleString("fr-FR")}</p>
    </div>
  );
}

/* ─── Stat Drawer Content ─────────────────────────────────────────────── */

function StatContent({ config }: { config: Extract<DrawerConfig, { type: "stat" }> }) {
  const { t, language } = useLanguage();
  const isPositive = config.delta?.includes("+") || config.delta?.includes("au-dessus") || config.delta?.includes("above");
  const min = Math.min(...(config.data?.map(d => d.value) ?? [0]));
  const max = Math.max(...(config.data?.map(d => d.value) ?? [1]));
  const avg = config.data?.length
    ? Math.round(config.data.reduce((s, d) => s + d.value, 0) / config.data.length)
    : 0;
  const locale = language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";
  const dateLocale = language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";

  return (
    <div className="space-y-6">
      {/* Big KPI */}
      <div className="bg-surface-secondary rounded-2xl p-5 border border-border">
        <p className="text-[10px] font-black uppercase tracking-widest text-subtle mb-1">{config.label}</p>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-foreground">{config.value}</span>
          <span className={cn(
            "flex items-center gap-1 text-sm font-bold mb-1",
            isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {config.delta}
          </span>
        </div>
      </div>

      {/* Full chart */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-subtle mb-3">{t("drawer.evolution")}</p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={config.data ?? []} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "var(--subtle)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={d => {
                  try { return new Date(d).toLocaleDateString(dateLocale, { day: "numeric", month: "short" }); }
                  catch { return d; }
                }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--subtle)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2.5}
                dot={false}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("drawer.minimum"), value: min.toLocaleString(locale) },
          { label: t("drawer.average"), value: avg.toLocaleString(locale) },
          { label: t("drawer.maximum"), value: max.toLocaleString(locale) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-secondary border border-border rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-wider text-subtle mb-1">{label}</p>
            <p className="text-sm font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Description / context */}
      {config.description && (
        <div className="bg-brand-light border border-brand-border rounded-2xl p-4 flex gap-3">
          <TrendingUp className="h-4 w-4 text-brand flex-shrink-0 mt-0.5" />
          <p className="text-xs text-brand-text leading-relaxed">{config.description}</p>
        </div>
      )}

      {/* CTA */}
      {config.actionHref && (
        <Link
          href={config.actionHref}
          className="flex items-center justify-between w-full bg-brand hover:bg-brand-hover text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all group"
        >
          {config.actionLabel ?? t("drawer.see_analysis")}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

/* ─── Health Drawer Content ───────────────────────────────────────────── */

function HealthContent({ config }: { config: Extract<DrawerConfig, { type: "health" }> }) {
  const { t } = useLanguage();
  const color =
    config.score >= 80 ? "text-emerald-600" :
    config.score >= 60 ? "text-amber-600" : "text-rose-500";
  const barColor =
    config.score >= 80 ? "bg-emerald-500" :
    config.score >= 60 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="bg-surface-secondary rounded-2xl p-6 border border-border text-center">
        <div className={cn("text-6xl font-black mb-1", color)}>{config.score}</div>
        <p className="text-xs text-subtle font-bold uppercase tracking-widest">{t("drawer.score_100")}</p>
        <div className="mt-4 h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-1000", barColor)}
            style={{ width: `${config.score}%` }}
          />
        </div>
        <p className="text-[10px] text-subtle font-medium mt-2">{config.status}</p>
      </div>

      {/* Findings */}
      {config.findings?.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-subtle">{t("drawer.detailed_analysis")}</p>
          {config.findings.map((f, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 p-3 rounded-xl border",
              f.type === "success" ? "bg-emerald-50 border-emerald-100" :
              f.type === "warning" ? "bg-amber-50 border-amber-100" :
              "bg-blue-50 border-blue-100"
            )}>
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                f.type === "success" ? "bg-emerald-100 text-emerald-600" :
                f.type === "warning" ? "bg-amber-100 text-amber-600" :
                "bg-blue-100 text-blue-600"
              )}>
                {f.type === "success"
                  ? <CheckCircle2 className="h-3.5 w-3.5" />
                  : f.type === "warning"
                  ? <AlertTriangle className="h-3.5 w-3.5" />
                  : <Info className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-muted mb-0.5">{f.label}</p>
                <p className="text-xs text-foreground-2 leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {config.recommendations?.length > 0 && (
        <div className="bg-brand-light border border-brand-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand">{t("drawer.ai_recommendations")}</p>
          </div>
          <ul className="space-y-2">
            {config.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 items-start text-xs text-brand-text leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Module Drawer Content ───────────────────────────────────────────── */

function ModuleContent({ config }: { config: Extract<DrawerConfig, { type: "module" }> }) {
  const { t } = useLanguage();
  const Icon = config.icon;
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-surface-secondary rounded-2xl p-6 border border-border flex flex-col items-center text-center gap-4">
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", config.colorClass)}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-foreground">{config.title}</h3>
          <p className="text-sm text-subtle mt-1 leading-relaxed">{config.description}</p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-subtle">{t("drawer.features")}</p>
        {config.features.map((f, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
            <p className="text-sm text-foreground-2 font-medium">{f}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href={config.href}
        className="flex items-center justify-between w-full bg-brand hover:bg-brand-hover text-white px-5 py-4 rounded-xl font-bold text-sm transition-all group"
      >
        {t("drawer.open")} {config.title}
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

/* ─── Main Drawer ─────────────────────────────────────────────────────── */

export default function DetailDrawer({ config, onClose }: DetailDrawerProps) {
  const { t } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (config) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [config]);

  const title =
    config?.type === "stat" ? config.label :
    config?.type === "health" ? t("drawer.health.title") :
    config?.type === "module" ? config.title : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
          config ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-[460px] bg-surface shadow-2xl border-l border-border flex flex-col transition-transform duration-300 ease-out",
          config ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <h2 className="text-base font-black text-foreground tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border flex items-center justify-center transition-all"
            aria-label="Fermer"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {config?.type === "stat"    && <StatContent    config={config} />}
          {config?.type === "health"  && <HealthContent  config={config} />}
          {config?.type === "module"  && <ModuleContent  config={config} />}
        </div>

        {/* Footer hint */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-border flex items-center justify-center">
          <p className="text-[10px] text-subtle font-medium">
            {t("drawer.close_hint").split("Esc").map((part, i, arr) =>
              i < arr.length - 1
                ? <span key={i}>{part}<kbd className="px-1.5 py-0.5 bg-surface-secondary border border-border rounded text-[9px] font-bold mx-0.5">Esc</kbd></span>
                : <span key={i}>{part}</span>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
