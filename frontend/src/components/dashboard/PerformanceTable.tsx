"use client";

import { Play, TrendingUp, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RecentVideoPerf {
  youtube_video_id: string;
  title: string;
  published_at: string;
  view_count: number;
  retention_score: number;
  category: string;
}

interface PerformanceTableProps {
  videos: RecentVideoPerf[];
}

export default function PerformanceTable({ videos }: PerformanceTableProps) {
  const formatViews = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n.toString();
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm group hover:border-brand-border transition-all h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <BarChart className="h-5 w-5" />
            </div>
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Vidéos récentes</h3>
                <p className="text-[10px] text-subtle font-bold">PERFORMANCES</p>
            </div>
        </div>
        <button className="text-xs font-black text-muted hover:text-brand transition-colors p-2 bg-surface-secondary border border-border rounded-xl">
           Analyser ↗
        </button>
      </div>

      <div className="space-y-6">
        {videos.map((video) => (
          <div key={video.youtube_video_id} className="flex items-center gap-4 group/item">
            {/* Thumbnail Placeholder with Play Icon */}
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-all duration-300 group-hover/item:scale-110">
                <Play className="h-4 w-4 text-slate-400 group-hover/item:text-brand transition-colors fill-current" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h4 className="text-xs font-black text-foreground line-clamp-1 leading-tight group-hover/item:text-brand transition-colors">
                            {video.title}
                        </h4>
                        <p className="text-[10px] text-subtle font-bold mt-1 uppercase tracking-tight">
                            Publié le {formatDate(video.published_at)} · {video.category}
                        </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-xs font-black text-foreground">{formatViews(video.view_count)} vues</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-border-subtle">
                                <div 
                                    className={cn("h-full rounded-full transition-all duration-1000", video.retention_score > 60 ? "bg-emerald-500 shadow-lg shadow-emerald-500/40" : "bg-amber-500 shadow-lg shadow-amber-500/40")}
                                    style={{ width: `${video.retention_score}%` }}
                                />
                            </div>
                            <span className="text-[9px] font-black text-muted w-6">{video.retention_score}%</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
