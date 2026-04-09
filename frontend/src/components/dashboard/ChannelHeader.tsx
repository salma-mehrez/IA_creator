"use client";

import { Users, Eye, Video as VideoIcon, Tv, Sparkles, RefreshCw, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface ChannelHeaderProps {
  workspace: any;
  stats: any;
  lastSync?: string;
  onSync: () => void;
  onAudit: () => void;
  syncing: boolean;
  auditing: boolean;
  onOpenSubs?: () => void;
  onOpenViews?: () => void;
  onOpenRetention?: () => void;
  onOpenRevenue?: () => void;
}

function formatNumber(n: number) {
  if (!n === undefined || n === null) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function ChannelHeader({ 
  workspace, stats, lastSync, onSync, onAudit, syncing, auditing,
  onOpenSubs, onOpenViews, onOpenRetention, onOpenRevenue 
}: ChannelHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-xl mb-8 group transition-all duration-500 hover:shadow-indigo-500/5">
      {/* Banner */}
      <div className="h-44 relative overflow-hidden">
        {workspace?.channel_banner_image ? (
          <img src={workspace.channel_banner_image} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-6 right-8 flex items-center gap-3">
          <button 
            onClick={onSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all shadow-lg shadow-black/20"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            {syncing ? t("channel.syncing") : t("channel.sync")}
          </button>
          <button
            onClick={onAudit}
            disabled={auditing}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            {auditing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {auditing ? t("channel.auditing") : t("channel.audit")}
          </button>
        </div>
      </div>

      <div className="px-10 pb-8 -mt-12 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-end gap-6">
            <div className="relative group/logo">
              <div className="w-24 h-24 rounded-[2rem] border-4 border-surface bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-2xl flex-shrink-0 group-hover/logo:scale-110 transition-all duration-500 ring-4 ring-black/5">
                {workspace?.channel_profile_image ? (
                  <img src={workspace.channel_profile_image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-brand-light flex items-center justify-center">
                    <Tv className="h-9 w-9 text-brand" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-4 border-surface rounded-full shadow-lg pulse-shadow" title="Vérifié" />
            </div>
            <div className="pb-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none">{workspace?.name || "Canal Pro"}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-subtle uppercase tracking-widest">
                <span>@{workspace?.channel_id || "handle"}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                <span>{workspace?.niche || "YouTube"}</span>
              </div>
            </div>
          </div>

          {/* Performance Stats row - Floating Box Design */}
          <div className="flex items-center gap-0 bg-[#0f172a]/95 backdrop-blur-xl p-1.5 rounded-[2rem] border border-white/5 shadow-2xl ring-1 ring-white/5">
            <StatBlock 
              icon={Users} 
              label={t("dash.stat.subscribers")} 
              value={formatNumber(stats?.subs_total)} 
              color="text-indigo-400" 
              onClick={onOpenSubs}
            />
            <div className="w-px h-10 bg-white/5" />
            <StatBlock 
              icon={Eye} 
              label={t("dash.stat.views_30d")} 
              value={formatNumber(stats?.views_total)} 
              color="text-fuchsia-400" 
              onClick={onOpenViews}
            />
            <div className="w-px h-10 bg-white/5" />
            <StatBlock 
              icon={Zap} 
              label={t("dash.stat.retention")} 
              value={`${stats?.retention_avg ?? 0}%`} 
              color="text-emerald-400" 
              onClick={onOpenRetention}
            />
            <div className="w-px h-10 bg-white/5" />
            <StatBlock 
              icon={Sparkles} 
              label={t("dash.stat.revenue")} 
              value={`€${formatNumber(stats?.revenue_est)}`} 
              color="text-amber-400" 
              onClick={onOpenRevenue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value, color, onClick }: { icon: any, label: string, value: string, color: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "px-6 py-3 rounded-2xl flex flex-col items-start gap-1 transition-all duration-300 group/stat",
        onClick ? "hover:bg-white/5 active:scale-95 cursor-pointer" : "cursor-default"
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("p-1 rounded-lg bg-surface/50 border border-white/5 group-hover/stat:scale-110 transition-transform", color)}>
          <Icon className="h-3 w-3" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover/stat:text-white transition-colors">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-white tracking-tight ml-5">
        {value}
      </p>
    </button>
  );
}

