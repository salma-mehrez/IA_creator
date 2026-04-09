"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Play, Eye, ThumbsUp, MessageSquare, Calendar, RefreshCw, ExternalLink, Search, Video } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface VideoItem {
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

function formatNumber(num: number) {
 if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) +"M";
 if (num >= 1_000) return (num / 1_000).toFixed(1) +"K";
 return num.toString();
}

function formatDuration(d: string) {
 if (!d) return "";
 return d.replace("PT","").replace("H","h").replace("M","m").replace("S","s");
}

function SkeletonCard() {
 return (
  <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
   <div className="aspect-video bg-surface-secondary" />
   <div className="p-4 space-y-3">
    <div className="h-4 bg-surface-secondary rounded w-3/4" />
    <div className="h-3 bg-surface-secondary rounded w-1/2" />
    <div className="flex gap-2 pt-2">
     <div className="h-8 bg-surface-secondary rounded flex-1" />
     <div className="h-8 bg-surface-secondary rounded flex-1" />
     <div className="h-8 bg-surface-secondary rounded flex-1" />
    </div>
   </div>
  </div>
 );
}

export default function VideosPage() {
 const { workspaceId } = useParams();
 const { t, language } = useLanguage();
 const [videos, setVideos] = useState<VideoItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [syncing, setSyncing] = useState(false);
 const [search, setSearch] = useState("");

 const formatDate = (dateStr: string) => {
  const locale = language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";
  return new Date(dateStr).toLocaleDateString(locale, { day:"numeric", month:"short", year:"numeric"});
 };

 const fetchVideos = useCallback(async () => {
  setLoading(true);
  const res = await fetchApi<VideoItem[]>(`/workspaces/${workspaceId}/videos`);
  if (res.data) setVideos(res.data);
  setLoading(false);
 }, [workspaceId]);

 const handleSync = async () => {
  setSyncing(true);
  const res = await fetchApi<VideoItem[]>(`/workspaces/${workspaceId}/videos/sync`, { method:"POST"});
  if (res.data) setVideos(res.data);
  setSyncing(false);
 };

 useEffect(() => { fetchVideos(); }, [fetchVideos]);

 const filtered = videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));

 const syncYTLabel = language === "fr" ? "Synchroniser YouTube" : language === "es" ? "Sincronizar YouTube" : "Sync YouTube";
 const syncingLabel = language === "fr" ? "Synchronisation..." : language === "es" ? "Sincronizando..." : "Syncing...";
 const searchPlaceholder = language === "fr" ? "Rechercher une vidéo..." : language === "es" ? "Buscar un vídeo..." : "Search a video...";
 const noResultsLabel = language === "fr" ? "Aucun résultat" : language === "es" ? "Sin resultados" : "No results";
 const noVideosLabel = language === "fr" ? "Aucune vidéo synchronisée" : language === "es" ? "Ningún vídeo sincronizado" : "No videos synced";
 const noSearchDesc = language === "fr" ? "Synchronisez votre chaîne YouTube pour importer vos vidéos publiées et analyser leurs performances." : language === "es" ? "Sincroniza tu canal de YouTube para importar tus vídeos publicados y analizar su rendimiento." : "Sync your YouTube channel to import your published videos and analyze their performance.";
 const noSearchResultDesc = language === "fr" ? "Essaie un autre terme de recherche." : language === "es" ? "Intenta con otro término de búsqueda." : "Try a different search term.";
 const firstSyncLabel = language === "fr" ? "Première synchronisation" : language === "es" ? "Primera sincronización" : "First sync";
 const videosLabel = language === "fr" ? "vidéo" : language === "es" ? "vídeo" : "video";

 return (
  <div className="flex flex-col min-h-full bg-background font-sans">

   {/* Header */}
   <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-30 shadow-sm">
    <div>
     <h1 className="text-2xl font-heading text-foreground tracking-tight flex items-center gap-3">
      <Video className="h-6 w-6 text-subtle" />
      {t("videos.title")} <span className="text-brand">{t("videos.title_highlight")}</span>
     </h1>
     <p className="text-xs text-subtle mt-0.5">
      {videos.length} {videosLabel}{videos.length !== 1 ?"s":""} {t("videos.subtitle").toLowerCase()}
     </p>
    </div>
    <button
     onClick={handleSync}
     disabled={syncing}
     className={cn(
     "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border",
      syncing
       ?"bg-surface-secondary border-border text-subtle cursor-not-allowed"
       :"bg-surface border-border text-foreground-2 hover:border-brand-border hover:text-brand hover:bg-brand-light active:scale-95"
     )}
    >
     <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
     {syncing ? syncingLabel : syncYTLabel}
    </button>
   </header>

   {/* Search */}
   <div className="px-8 py-4 border-b border-border bg-surface">
    <div className="relative max-w-sm">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtle" />
     <input
      type="text"
      placeholder={searchPlaceholder}
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="w-full pl-9 pr-4 py-2.5 bg-surface-secondary border border-border rounded-xl text-sm text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
     />
    </div>
   </div>

   {/* Content */}
   <div className="flex-1 p-8">
    {loading ? (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
     </div>
    ) : filtered.length === 0 ? (
     <div className="bg-surface border-2 border-dashed border-border rounded-3xl py-24 flex flex-col items-center text-center px-6">
      <div className="w-16 h-16 bg-surface-secondary rounded-2xl flex items-center justify-center mb-6">
       <Video className="h-8 w-8 text-subtle" />
      </div>
      <h3 className="text-xl font-heading text-foreground mb-2">
       {search ? noResultsLabel : noVideosLabel}
      </h3>
      <p className="text-subtle max-w-sm text-sm mb-8 leading-relaxed">
       {search ? noSearchResultDesc : noSearchDesc}
      </p>
      {!search && (
       <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-all active:scale-95 disabled:opacity-50"
       >
        <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
        {firstSyncLabel}
       </button>
      )}
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {filtered.map(video => (
       <div
        key={video.id}
        className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand-border hover:shadow-md transition-all duration-300 flex flex-col"
       >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-surface-secondary">
         {video.thumbnail_url ? (
          <img
           src={video.thumbnail_url}
           alt={video.title}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
         ) : (
          <div className="w-full h-full flex items-center justify-center">
           <Play className="h-10 w-10 text-border-strong" />
          </div>
         )}
         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <a
           href={`https://youtube.com/watch?v=${video.youtube_video_id}`}
           target="_blank"
           rel="noopener noreferrer"
           className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg"
           onClick={e => e.stopPropagation()}
          >
           <ExternalLink className="h-4 w-4 text-gray-700" />
          </a>
         </div>
         {video.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/75 backdrop-blur-sm rounded-md text-[10px] font-bold text-white">
           {formatDuration(video.duration)}
          </div>
         )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
         <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-brand transition-colors">
          {video.title}
         </h3>
         <div className="flex items-center gap-1.5 text-xs text-subtle mb-4">
          <Calendar className="h-3 w-3" />
          {formatDate(video.published_at)}
         </div>

         {/* Stats */}
         <div className="mt-auto grid grid-cols-3 gap-2 pt-3 border-t border-border-subtle">
          {[
           { icon: Eye, value: video.view_count, hoverBg:"hover:bg-blue-50 dark:hover:bg-blue-950/40", hoverText:"group-hover/s:text-blue-500"},
           { icon: ThumbsUp, value: video.like_count, hoverBg:"hover:bg-rose-50 dark:hover:bg-rose-950/40", hoverText:"group-hover/s:text-rose-500"},
           { icon: MessageSquare, value: video.comment_count, hoverBg:"hover:bg-emerald-50 dark:hover:bg-emerald-950/40", hoverText:"group-hover/s:text-emerald-500"},
          ].map(({ icon: Icon, value, hoverBg, hoverText }, i) => (
           <div key={i} className={cn("group/s flex flex-col items-center gap-1 py-1.5 rounded-xl bg-surface-secondary transition-colors", hoverBg)}>
            <Icon className={cn("h-3 w-3 text-subtle transition-colors", hoverText)} />
            <span className={cn("text-xs font-bold text-foreground-2 transition-colors", hoverText)}>
             {formatNumber(value)}
            </span>
           </div>
          ))}
         </div>
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 );
}
