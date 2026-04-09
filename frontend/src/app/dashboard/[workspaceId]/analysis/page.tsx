"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
 BarChart3, Zap, RefreshCw, AlertTriangle, CheckCircle2,
 Users, Eye, Video as VideoIcon, Loader2, Search,
 ThumbsUp, MessageSquare, Calendar, Trophy, Info,
 TrendingUp, Sparkles, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

interface Workspace {
 id: number;
 name: string;
 channel_id?: string;
 channel_url?: string;
 channel_profile_image?: string;
 channel_banner_image?: string;
 subscriber_count: number;
 total_views: number;
 total_videos: number;
 last_sync?: string;
}

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

function formatNumber(n: number) {
 if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) +"M";
 if (n >= 1_000) return (n / 1_000).toFixed(1) +"K";
 return n.toString();
}

function formatDuration(d: string) {
 if (!d) return "";
 return d.replace("PT","").replace("H","h").replace("M","min").replace("S","s");
}

export default function AnalysisPage() {
 const { workspaceId } = useParams();
 const { t, language } = useLanguage();

 const [workspace, setWorkspace] = useState<Workspace | null>(null);
 const [videos, setVideos] = useState<Video[]>([]);
 const [loading, setLoading] = useState(true);
 const [syncing, setSyncing] = useState(false);
 const [auditing, setAuditing] = useState(false);
 const [auditResult, setAuditResult] = useState<any>(null);
 const [showSetup, setShowSetup] = useState(false);
 const [channelInput, setChannelInput] = useState("");
 const [search, setSearch] = useState("");
 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");

 const formatDate = (d: string) => {
  const locale = language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";
  return new Date(d).toLocaleDateString(locale, { day:"numeric", month:"short", year:"numeric"});
 };

 const lastSyncLabel = language === "fr" ? "Dernière sync" : language === "es" ? "Última sync" : "Last sync";
 const connectLabel = language === "fr" ? "Connecter ta chaîne YouTube" : language === "es" ? "Conecta tu canal de YouTube" : "Connect your YouTube Channel";
 const connectDesc = language === "fr" ? "Entre l'URL ou l'ID de ta chaîne YouTube pour importer tes statistiques et vidéos." : language === "es" ? "Introduce la URL o ID de tu canal de YouTube para importar estadísticas y vídeos." : "Enter the URL or ID of your YouTube channel to import your stats and videos.";
 const connectBtnLabel = language === "fr" ? "Connecter la chaîne" : language === "es" ? "Conectar el canal" : "Connect Channel";
 const auditLabel = language === "fr" ? "Lancer l'audit IA" : language === "es" ? "Lanzar auditoría IA" : "Launch AI Audit";
 const auditingLabel = language === "fr" ? "Analyse en cours..." : language === "es" ? "Análisis en curso..." : "Analyzing...";
 const auditReportLabel = language === "fr" ? "Rapport d'audit IA" : language === "es" ? "Informe de auditoría IA" : "AI Audit Report";
 const detailedAnalysisLabel = language === "fr" ? "Analyse détaillée" : language === "es" ? "Análisis detallado" : "Detailed Analysis";
 const bestVideoLabel = language === "fr" ? "Meilleure vidéo" : language === "es" ? "Mejor vídeo" : "Best Video";
 const recommendationsLabel = language === "fr" ? "Recommandations IA" : language === "es" ? "Recomendaciones IA" : "AI Recommendations";
 const publishedVideosLabel = language === "fr" ? "Vidéos publiées" : language === "es" ? "Vídeos publicados" : "Published Videos";
 const searchPlaceholder = language === "fr" ? "Rechercher..." : language === "es" ? "Buscar..." : "Search...";
 const noVideosLabel = language === "fr" ? "Aucune vidéo synchronisée" : language === "es" ? "Ningún vídeo sincronizado" : "No videos synced";
 const syncNowLabel = language === "fr" ? "Synchroniser maintenant" : language === "es" ? "Sincronizar ahora" : "Sync now";

 const handleSync = useCallback(async () => {
  setSyncing(true);
  setError("");
  const [wsRes, vidRes] = await Promise.all([
   fetchApi(`/workspaces/${workspaceId}/sync`, { method:"POST"}),
   fetchApi(`/workspaces/${workspaceId}/videos/sync`, { method:"POST"}),
  ]);
  if (wsRes.error || vidRes.error) {
   setError(wsRes.error || vidRes.error || t("common.error"));
  } else {
   setWorkspace(wsRes.data as Workspace);
   setVideos(vidRes.data as Video[]);
   setSuccess(t("common.success"));
   setTimeout(() => setSuccess(""), 3000);
  }
  setSyncing(false);
 }, [workspaceId, t]);

 const loadData = useCallback(async () => {
  setLoading(true);
  const [wsRes, vidRes] = await Promise.all([
   fetchApi(`/workspaces/${workspaceId}`),
   fetchApi(`/workspaces/${workspaceId}/videos`),
  ]);
  if (wsRes.error) { setError(wsRes.error); }
  else {
   const wsData = wsRes.data as Workspace;
   setWorkspace(wsData);
   if (!wsData.channel_id) setShowSetup(true);
  }
  if (vidRes.data) {
   const vids = vidRes.data as Video[];
   setVideos(vids);
   if (vids.length === 0 && (wsRes.data as Workspace)?.channel_id) handleSync();
  }
  setLoading(false);
 }, [workspaceId, handleSync]);

 useEffect(() => { loadData(); }, [loadData]);

 const handleAudit = async () => {
  setAuditing(true);
  setError("");
  const res = await fetchApi(`/workspaces/${workspaceId}/audit`, { method:"POST"});
  if (res.error) { setError(res.error); }
  else {
   setAuditResult(res.data);
   setTimeout(() => document.getElementById("audit-report")?.scrollIntoView({ behavior:"smooth"}), 100);
  }
  setAuditing(false);
 };

 const handleSetup = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!channelInput) return;
  setLoading(true);
  const res = await fetchApi(`/workspaces/${workspaceId}/channel`, {
   method:"PUT",
   body: JSON.stringify({
    name: workspace?.name ||"",
    channel_url: channelInput.includes("youtube.com") ? channelInput : undefined,
    channel_id: !channelInput.includes("youtube.com") ? channelInput : undefined,
   }),
  });
  if (res.error) { setError(res.error); }
  else { setWorkspace(res.data as Workspace); setShowSetup(false); handleSync(); }
  setLoading(false);
 };

 const filtered = videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));

 if (loading && !workspace) {
  return (
   <div className="flex items-center justify-center h-full bg-background">
    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
   </div>
  );
 }

 const scoreColor = auditResult
  ? auditResult.score >= 80 ?"text-emerald-600"
  : auditResult.score >= 60 ?"text-amber-600"
  :"text-red-500"
  :"";

 return (
  <div className="flex flex-col min-h-full bg-background font-sans">

   {/* Header */}
   <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-30 shadow-sm">
    <div className="flex items-center gap-3">
     {workspace?.channel_profile_image && (
      <img src={workspace.channel_profile_image} className="w-9 h-9 rounded-full border-2 border-border" alt="" />
     )}
     <div>
      <h1 className="text-2xl font-heading text-foreground tracking-tight">
       {t("analysis.title")} <span className="text-brand">{t("analysis.title_highlight")}</span>
      </h1>
      {workspace?.last_sync && (
       <p className="text-[10px] text-subtle font-medium mt-0.5">
        {lastSyncLabel} : {new Date(workspace.last_sync).toLocaleDateString(language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US")}
       </p>
      )}
     </div>
    </div>
    <div className="flex items-center gap-3">
     {error && <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium"><AlertTriangle className="h-3.5 w-3.5" />{error}</span>}
     {success && <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5" />{success}</span>}
     {workspace?.channel_id && (
      <button
       onClick={handleSync}
       disabled={syncing}
       className="flex items-center gap-2 px-4 py-2.5 border border-border text-muted font-semibold text-sm rounded-xl hover:border-brand-border hover:text-brand hover:bg-brand-light transition-all disabled:opacity-50"
      >
       <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
       {syncing ? t("analysis.syncing") : t("analysis.sync")}
      </button>
     )}
     <button
      onClick={handleAudit}
      disabled={auditing || syncing || !workspace?.channel_id}
      className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm shadow-brand-border active:scale-95 disabled:opacity-50"
     >
      {auditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
      {auditing ? auditingLabel : auditLabel}
     </button>
    </div>
   </header>

   <div className="flex-1 p-8 space-y-8 pb-16">

    {/* Setup: No channel linked */}
    {showSetup ? (
     <div className="bg-surface border border-border rounded-3xl p-12 flex flex-col items-center text-center shadow-sm max-w-lg mx-auto mt-8">
      <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mb-6">
       <BarChart3 className="h-8 w-8 text-brand" />
      </div>
      <h3 className="text-xl font-heading text-foreground mb-2">{connectLabel}</h3>
      <p className="text-subtle max-w-sm mb-8 text-sm leading-relaxed">
       {connectDesc}
      </p>
      <form onSubmit={handleSetup} className="w-full space-y-4">
       <input
        type="text"
        placeholder="https://youtube.com/@handle or UCxxxxx"
        className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
        value={channelInput}
        onChange={e => setChannelInput(e.target.value)}
        required
       />
       <button
        type="submit"
        className="w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
       >
        {connectBtnLabel}
       </button>
      </form>
     </div>
    ) : (
     <>
      {/* Channel Banner */}
      {workspace?.channel_id && (
       <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="h-36 relative overflow-hidden">
         {workspace.channel_banner_image ? (
          <img src={workspace.channel_banner_image} className="w-full h-full object-cover" alt="" />
         ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-violet-50 to-stone-100" />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
        </div>
        <div className="px-8 pb-6 -mt-10 relative flex items-end gap-5">
         <div className="w-20 h-20 rounded-2xl border-4 border-white bg-surface overflow-hidden shadow-lg flex-shrink-0">
          {workspace.channel_profile_image ? (
           <img src={workspace.channel_profile_image} className="w-full h-full object-cover" alt="" />
          ) : (
           <div className="w-full h-full bg-brand-light flex items-center justify-center">
            <VideoIcon className="h-8 w-8 text-indigo-300" />
           </div>
          )}
         </div>
         <div className="pb-1">
          <h2 className="text-xl font-heading text-foreground">{workspace.name}</h2>
          <p className="text-xs text-subtle font-medium">@{workspace.channel_id}</p>
         </div>
        </div>

        {/* Stats row */}
        <div className="px-8 pb-6 grid grid-cols-3 gap-4">
         <div className="bg-brand-light border border-brand-border rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
           <Users className="h-4 w-4 text-brand" />
           <span className="text-xs text-brand font-bold uppercase tracking-wide">{t("analysis.subscribers")}</span>
          </div>
          <p className="text-2xl font-heading text-brand-text">{formatNumber(workspace.subscriber_count)}</p>
         </div>
         <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
           <Eye className="h-4 w-4 text-blue-500" />
           <span className="text-xs text-blue-600 font-bold uppercase tracking-wide">{t("analysis.total_views")}</span>
          </div>
          <p className="text-2xl font-heading text-blue-700">{formatNumber(workspace.total_views)}</p>
         </div>
         <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
           <VideoIcon className="h-4 w-4 text-emerald-500" />
           <span className="text-xs text-emerald-600 font-bold uppercase tracking-wide">{t("analysis.videos_count")}</span>
          </div>
          <p className="text-2xl font-heading text-emerald-700">{workspace.total_videos}</p>
         </div>
        </div>
       </div>
      )}

      {/* Audit Report */}
      {auditResult && (
       <div id="audit-report" className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="px-8 py-5 border-b border-border-subtle flex items-center justify-between">
         <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-light rounded-xl flex items-center justify-center">
           <Trophy className="h-4 w-4 text-brand" />
          </div>
          <h3 className="text-sm font-bold text-foreground-2">{auditReportLabel}</h3>
         </div>
         <span className={cn("text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
          auditResult.score >= 80 ?"bg-emerald-50 border-emerald-200 text-emerald-700":
          auditResult.score >= 60 ?"bg-amber-50 border-amber-200 text-amber-700":
         "bg-red-50 border-red-200 text-red-700"
         )}>
          {auditResult.status}
         </span>
        </div>
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Score */}
         <div className="flex flex-col items-center justify-center py-6 bg-surface-secondary rounded-2xl border border-border">
          <div className={cn("text-6xl font-heading mb-2", scoreColor)}>
           {auditResult.score}
          </div>
          <p className="text-xs font-bold text-subtle uppercase tracking-widest">Score / 100</p>
          <div className="w-full mt-4 px-4">
           <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
             className={cn("h-full rounded-full transition-all duration-1000",
              auditResult.score >= 80 ?"bg-emerald-500":
              auditResult.score >= 60 ?"bg-amber-500":"bg-red-500"
             )}
             style={{ width:`${auditResult.score}%`}}
            />
           </div>
          </div>
         </div>

         {/* Findings */}
         <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-subtle mb-3">{detailedAnalysisLabel}</p>
          {auditResult.findings.map((f: any, i: number) => (
           <div key={i} className={cn(
           "flex items-start gap-3 p-3 rounded-xl border",
            f.type ==="success"?"bg-emerald-50 border-emerald-100":
            f.type ==="warning"?"bg-amber-50 border-amber-100":
           "bg-blue-50 border-blue-100"
           )}>
            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
             f.type ==="success"?"bg-emerald-100 text-emerald-600":
             f.type ==="warning"?"bg-amber-100 text-amber-600":
            "bg-blue-100 text-blue-600"
            )}>
             {f.type ==="success" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
              f.type ==="warning" ? <AlertTriangle className="h-3.5 w-3.5" /> :
              <Info className="h-3.5 w-3.5" />}
            </div>
            <div>
             <p className="text-[10px] font-black uppercase tracking-wide text-muted mb-0.5">
              {f.label}{f.label ==="Engagement" && `(${auditResult.engagement_rate}%)`}
             </p>
             <p className="text-xs text-foreground-2 font-medium leading-relaxed">{f.text}</p>
            </div>
           </div>
          ))}
         </div>

         {/* Recommendations + Top video */}
         <div className="space-y-4">
          {auditResult.top_video && (
           <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-subtle mb-3">{bestVideoLabel}</p>
            <div className="bg-surface-secondary border border-border rounded-2xl overflow-hidden group">
             <div className="aspect-video relative overflow-hidden">
              <img src={auditResult.top_video.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
               <Trophy className="h-2.5 w-2.5" /> Top
              </div>
             </div>
             <div className="p-3">
              <p className="text-xs font-semibold text-foreground-2 line-clamp-2 mb-2">{auditResult.top_video.title}</p>
              <div className="flex items-center gap-3 text-[10px] text-subtle">
               <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(auditResult.top_video.view_count)}</span>
               <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{formatNumber(auditResult.top_video.like_count)}</span>
              </div>
             </div>
            </div>
           </div>
          )}
          <div className="bg-brand-light border border-brand-border rounded-2xl p-4">
           <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand">{recommendationsLabel}</p>
           </div>
           <ul className="space-y-2">
            {auditResult.recommendations.map((r: string, i: number) => (
             <li key={i} className="flex gap-2 items-start text-xs text-brand-text leading-relaxed">
              <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              {r}
             </li>
            ))}
           </ul>
          </div>
         </div>
        </div>
       </div>
      )}

      {/* Video Grid */}
      <div className="space-y-5">
       <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading text-foreground-2">
         {publishedVideosLabel}
         <span className="ml-2 text-sm font-sans font-normal text-subtle not-">({videos.length})</span>
        </h3>
        <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtle" />
         <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all w-56"
         />
        </div>
       </div>

       {videos.length === 0 ? (
        <div className="bg-surface border-2 border-dashed border-border rounded-3xl py-16 flex flex-col items-center text-center">
         <RefreshCw className="h-8 w-8 text-subtle mb-4" />
         <p className="text-subtle text-sm font-medium">{noVideosLabel}</p>
         <button onClick={handleSync} className="mt-4 text-brand text-sm font-semibold hover:underline">
          {syncNowLabel}
         </button>
        </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         {filtered.map(video => (
          <div key={video.id} className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand-border hover:shadow-md transition-all duration-300 flex flex-col">
           <div className="relative aspect-video overflow-hidden bg-surface-hover">
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
             <a href={`https://youtube.com/watch?v=${video.youtube_video_id}`} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-surface/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow"
              onClick={e => e.stopPropagation()}>
              <ExternalLink className="h-4 w-4 text-foreground-2" />
             </a>
            </div>
            {video.duration && (
             <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded-md text-[10px] font-bold text-white">
              {formatDuration(video.duration)}
             </div>
            )}
           </div>
           <div className="p-3 flex-1 flex flex-col">
            <h4 className="text-xs font-semibold text-foreground-2 line-clamp-2 leading-snug mb-2 group-hover:text-brand-text transition-colors">{video.title}</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-subtle mb-3">
             <Calendar className="h-3 w-3" />{formatDate(video.published_at)}
            </div>
            <div className="mt-auto grid grid-cols-3 gap-1.5 pt-2.5 border-t border-border-subtle">
             {[
              { icon: Eye, value: video.view_count, color:"hover:bg-blue-50 hover:text-blue-600"},
              { icon: ThumbsUp, value: video.like_count, color:"hover:bg-rose-50 hover:text-rose-600"},
              { icon: MessageSquare, value: video.comment_count, color:"hover:bg-emerald-50 hover:text-emerald-600"},
             ].map(({ icon: Icon, value, color }, i) => (
              <div key={i} className={cn("flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-surface-secondary transition-colors group/s", color)}>
               <Icon className="h-3 w-3 text-subtle group-hover/s:text-current" />
               <span className="text-[10px] font-bold text-muted group-hover/s:text-current">{formatNumber(value)}</span>
              </div>
             ))}
            </div>
           </div>
          </div>
         ))}
        </div>
       )}
      </div>
     </>
    )}
   </div>
  </div>
 );
}
