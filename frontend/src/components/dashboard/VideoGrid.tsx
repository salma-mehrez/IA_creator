"use client";

import { Eye, ThumbsUp, MessageSquare, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Video {
  id: number;
  title: string;
  thumbnail_url: string;
  youtube_video_id: string;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration: string;
}

interface VideoGridProps {
  videos: Video[];
  language: string;
  viewMode?: "grid" | "list";
  gridCols?: 2 | 3 | 4;
}

function formatNumber(n: number) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function formatDuration(d: string) {
  if (!d) return "";
  return d.replace("PT", "").replace("H", "h").replace("M", "min").replace("S", "s");
}

const gridColsClass: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export default function VideoGrid({ videos, language, viewMode = "grid", gridCols = 4 }: VideoGridProps) {
  const formatDate = (d: string) => {
    const locale = language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";
    try {
        return new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
    } catch(e) {
        return d;
    }
  };

  if (videos.length === 0) {
      return (
          <div className="bg-surface border border-border border-dashed rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-subtle uppercase tracking-widest">Aucune vidéo synchronisée</p>
          </div>
      );
  }

  // ── LIST MODE ─────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand-border hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 flex items-center gap-4 p-3"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video w-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {video.duration && (
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded text-[9px] font-black text-white">
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-foreground line-clamp-1 group-hover:text-brand transition-colors">
                {video.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-subtle uppercase tracking-wider">
                <Calendar className="h-3 w-3 opacity-50" />
                {formatDate(video.published_at)}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {[
                { icon: Eye, value: video.view_count, color: "text-blue-400" },
                { icon: ThumbsUp, value: video.like_count, color: "text-emerald-400" },
                { icon: MessageSquare, value: video.comment_count, color: "text-amber-400" },
              ].map(({ icon: Icon, value, color }, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", color)} />
                  <span className="text-xs font-black text-foreground">{formatNumber(value)}</span>
                </div>
              ))}
            </div>

            {/* Open link */}
            <a
              href={`https://youtube.com/watch?v=${video.youtube_video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand/10 hover:text-brand transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>
    );
  }

  // ── GRID MODE ─────────────────────────────────────────────────────────────
  return (
    <div className={cn("grid gap-6", gridColsClass[gridCols])}>
      {videos.map((video) => (
        <div 
          key={video.id} 
          className="group bg-surface border border-border rounded-[2rem] overflow-hidden hover:border-brand-border hover:shadow-xl hover:shadow-brand/5 transition-all duration-500 flex flex-col transform hover:-translate-y-1"
        >
          {/* Thumbnail Container */}
          <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900/50">
            <img 
              src={video.thumbnail_url} 
              alt={video.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <a 
                href={`https://youtube.com/watch?v=${video.youtube_video_id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-5 w-5 text-brand" />
              </a>
            </div>
            {video.duration && (
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[9px] font-black text-white shadow-lg">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h4 className="text-xs font-black text-foreground line-clamp-2 leading-relaxed mb-4 group-hover:text-brand transition-colors h-9">
              {video.title}
            </h4>
            
            <div className="flex items-center gap-2 text-[9px] font-black text-subtle uppercase tracking-wider mb-5">
              <Calendar className="h-3 w-3 opacity-50" />
              {formatDate(video.published_at)}
            </div>

            {/* Engagement Stats Row */}
            <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border-subtle pt-4">
              {[
                { icon: Eye, value: video.view_count, label: "Vues", hover: "hover:text-blue-500" },
                { icon: ThumbsUp, value: video.like_count, label: "Likes", hover: "hover:text-emerald-500" },
                { icon: MessageSquare, value: video.comment_count, label: "Coms", hover: "hover:text-amber-500" },
              ].map(({ icon: Icon, value, label, hover }, i) => (
                <div 
                  key={i} 
                  className={cn("flex flex-col items-center gap-1 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 transition-all duration-300 group/s", hover)}
                  title={label}
                >
                  <Icon className="h-3 w-3 text-subtle group-hover/s:text-current transition-colors" />
                  <span className="text-[10px] font-black text-foreground group-hover/s:text-current">{formatNumber(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
