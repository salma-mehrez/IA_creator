"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
 Search, Plus, Sparkles, Loader2, Trash2, Edit3,
 ChevronRight, Calendar, FileText, Columns,
 TrendingUp, Clock, CheckCircle2, Circle, ChevronDown, Video as VideoIcon, Scissors, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

type Status ="idea"|"scripted"|"recorded"|"edited"|"published";
type View ="table"|"kanban"|"calendar";

interface Video {
 id: number;
 title: string;
 category: string;
 status: Status;
 planned_date: string;
 viral_score: number;
 notes?: string;
 thumbnail_url?: string;
 youtube_video_id?: string;
  created_at: string;
}

const stageIndex = (s: Status) => ["idea","scripted","recorded","edited","published"].indexOf(s);

function StatusStepper({ status, onChange, stages }: { status: Status; onChange: (s: Status) => void; stages: any[] }) {
 const current = stageIndex(status);
 return (
  <div className="flex items-center gap-1">
   {stages.map((st, i) => (
    <button
     key={st.key}
     onClick={() => onChange(st.key)}
     title={st.label}
     className={cn(
     "w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110",
      i <= current ? cn(st.bg, st.color) :"bg-surface-hover text-subtle hover:bg-stone-200"
     )}
    >
     {i < current ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
     ) : (
      <Circle className="h-3 w-3" />
     )}
    </button>
   ))}
  </div>
 );
}

function ScoreBadge({ score }: { score: number }) {
 const color = score >= 80 ?"text-emerald-600 bg-emerald-50 border-emerald-200"
  : score >= 60 ?"text-amber-600 bg-amber-50 border-amber-200"
  :"text-muted bg-surface-hover border-border";
 return (
  <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border", color)}>
   <TrendingUp className="h-3 w-3" /> {score}%
  </span>
 );
}

export default function PlanningPage() {
 const { workspaceId } = useParams();
 const router = useRouter();
 const { t, language } = useLanguage();

 const STAGES = [
  { key: "idea", label: t("planning.status.idea"), short: "Idea", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", dot: "bg-amber-500" },
  { key: "scripted", label: t("planning.status.scripted"), short: "Script", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", dot: "bg-blue-500" },
  { key: "recorded", label: t("planning.status.recorded"), short: "Recording", icon: VideoIcon, color: "text-orange-500", bg: "bg-orange-500/10", dot: "bg-orange-500" },
  { key: "edited", label: t("planning.status.edited"), short: "Editing", icon: Scissors, color: "text-purple-500", bg: "bg-purple-500/10", dot: "bg-purple-500" },
  { key: "published", label: t("planning.status.published"), short: "Published", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", dot: "bg-emerald-500" },
 ];

 const [videos, setVideos] = useState<Video[]>([]);
 const [loading, setLoading] = useState(true);
 const [view, setView] = useState<View>("table");
 const [search, setSearch] = useState("");
 const [statusFilter, setStatusFilter] = useState<Status | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishingVideoId, setPublishingVideoId] = useState<number | null>(null);
  const [publishUrl, setPublishUrl] = useState("");
 const [editingVideo, setEditingVideo] = useState<Video | null>(null);
 const [deleting, setDeleting] = useState<number | null>(null);
 const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
 const [currentMonth, setCurrentMonth] = useState(new Date());

 const [form, setForm] = useState({
  title:"", category:"General", status:"idea" as Status,
  viral_score: 70, planned_date:"", notes: "", youtube_video_id: ""
  });

 const load = async () => {
  setLoading(true);
  const res = await fetchApi(`/workspaces/${workspaceId}/planning-vids`);
  if (res.data) setVideos(res.data as Video[]);
  setLoading(false);
 };

 const saveTimer = useRef<any>(null);

 useEffect(() => { load(); }, [workspaceId]);

 const openAdd = () => {
  setEditingVideo(null);
  setForm({ title:"", category:"General", status:"idea", viral_score: 70, planned_date: new Date().toISOString().split("T")[0], notes: "", youtube_video_id: "" });
  setIsModalOpen(true);
 };

 const openEdit = (v: Video) => {
  setEditingVideo(v);
  setForm({
   title: v.title, category: v.category ||"General",
   status: v.status, viral_score: v.viral_score, notes: v.notes || "",
   planned_date: v.planned_date ? new Date(v.planned_date).toISOString().split("T")[0] :"", youtube_video_id: v.youtube_video_id || ""
  });
  setIsModalOpen(true);
 };

 const handleSubmit = async () => {
  if (!form.title) return;
  const payload = { ...form, planned_date: form.planned_date ? new Date(form.planned_date).toISOString() : null };
  let res;
  if (editingVideo) {
   res = await fetchApi(`/videos/${editingVideo.id}`, { method:"PUT", body: JSON.stringify(payload) });
  } else {
   res = await fetchApi(`/workspaces/${workspaceId}/videos/create`, { method:"POST", body: JSON.stringify(payload) });
  }
  if (res.data) { load(); setIsModalOpen(false); }
 };

 const handleStatusChange = async (id: number, newStatus: Status) => {
  setVideos(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
  await fetchApi(`/videos/${id}`, { method:"PUT", body: JSON.stringify({ status: newStatus }) });
 };

 const handleNoteChange = async (id: number, newNote: string) => {
  setVideos(prev => prev.map(v => v.id === id ? { ...v, notes: newNote } : v));
  
  if (saveTimer.current) clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(async () => {
    await fetchApi(`/videos/${id}`, { method:"PUT", body: JSON.stringify({ notes: newNote }) });
  }, 1000); // 1 seconde de répit pour le serveur
 };

   const handleConfirmPublish = async () => {
    if (!publishingVideoId || !publishUrl) return;
    const res = await fetchApi(`/videos/${publishingVideoId}`, { 
      method: "PUT", 
      body: JSON.stringify({ status: "published", youtube_video_id: publishUrl }) 
    });
    if (res.data) {
      load();
      setIsPublishModalOpen(false);
      setPublishingVideoId(null);
      setPublishUrl("");
    }
  };

  const handleDelete = async (id: number) => {
  setDeleting(id);
  await fetchApi(`/videos/${id}`, { method:"DELETE"});
  setVideos(prev => prev.filter(v => v.id !== id));
  setConfirmDelete(null);
  setDeleting(null);
 };

 const handleGenerateAI = async () => {
  setLoading(true);
  await fetchApi(`/videos/generate-ideas?workspace_id=${workspaceId}`, { method:"POST"});
  load();
 };

  const filtered = videos.filter(v => {
   const lowerSearch = search.toLowerCase();
   const matchTitle = (v.title || "").toLowerCase().includes(lowerSearch);
   const matchStatus = statusFilter ? v.status === statusFilter : true;
   return matchTitle && matchStatus;
  });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
   let day = new Date(year, month, 1).getDay();
   return day === 0 ? 6 : day - 1; // Ajustement pour commencer le lundi (0=Lundi, 6=Dimanche)
  };

 const formatDate = (d: string) => {
  if (!d) return "—";
  const locale = language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";
  return new Date(d).toLocaleDateString(locale, { day:"numeric", month:"short"});
 };

 const yesLabel = language === "fr" ? "Oui" : language === "es" ? "Sí" : "Yes";
 const noLabel = language === "fr" ? "Non" : language === "es" ? "No" : "No";
 const confirmDeleteMsg = language === "fr" ? "Supprimer cette vidéo ?" : language === "es" ? "¿Eliminar este vídeo?" : "Delete this video?";
 const searchPlaceholder = language === "fr" ? "Rechercher une vidéo..." : language === "es" ? "Buscar un vídeo..." : "Search a video...";
 const categoryLabel = language === "fr" ? "Catégorie" : language === "es" ? "Categoría" : "Category";
 const statusLabel = language === "fr" ? "Statut" : language === "es" ? "Estado" : "Status";
 const plannedDateLabel = language === "fr" ? "Date prévue" : language === "es" ? "Fecha prevista" : "Planned date";
 const titleLabel = language === "fr" ? "Titre" : language === "es" ? "Título" : "Title";
 const allLabel = language === "fr" ? "Tous" : language === "es" ? "Todos" : "All";
 const generateAILabel = language === "fr" ? "Générer des idées IA" : language === "es" ? "Generar ideas IA" : "Generate AI Ideas";
 const noVideosMsg = language === "fr" ? "Aucune vidéo" : language === "es" ? "Ningún vídeo" : "No videos";
 const noResultsMsg = language === "fr" ? "Aucun résultat pour cette recherche." : language === "es" ? "Sin resultados para esta búsqueda." : "No results for this search.";
 const startAddingMsg = language === "fr" ? "Commencez par ajouter vos premières idées de vidéos." : language === "es" ? "Comience añadiendo sus primeras ideas de vídeos." : "Start by adding your first video ideas.";
 const addVideoLabel = language === "fr" ? "Ajouter une vidéo" : language === "es" ? "Añadir un vídeo" : "Add a video";
 const editVideoLabel = language === "fr" ? "Modifier la vidéo" : language === "es" ? "Editar el vídeo" : "Edit video";
 const newVideoLabel = language === "fr" ? "Nouvelle vidéo" : language === "es" ? "Nuevo vídeo" : "New video";
 const saveLabel = language === "fr" ? "Enregistrer" : language === "es" ? "Guardar" : "Save";
 const createLabel = language === "fr" ? "Créer" : language === "es" ? "Crear" : "Create";
 const goToScriptLabel = language === "fr" ? "Aller au script" : language === "es" ? "Ir au guion" : "Go to script";
 const editLabel = language === "fr" ? "Modifier" : language === "es" ? "Editar" : "Edit";
 const deleteLabel = language === "fr" ? "Supprimer" : language === "es" ? "Eliminar" : "Delete";
 const viralScoreLabel = t("planning.viral_score");

 return (
  <div className="flex flex-col h-full bg-background font-sans text-foreground">

   {/* Header */}
   <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-30 shadow-sm">
    <div>
     <h1 className="text-2xl font-heading text-foreground tracking-tight flex items-center gap-3">
      <Calendar className="h-6 w-6 text-emerald-500" />
      {t("planning.title")} <span className="text-brand">{t("planning.title_highlight")}</span>
     </h1>
     <p className="text-xs text-subtle mt-0.5">{t("planning.subtitle")}</p>
    </div>
    <div className="flex items-center gap-3">
     {/* View toggle */}
     <div className="flex bg-surface-hover border border-border rounded-xl p-1">
      <button
       onClick={() => setView("table")}
       className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
        view ==="table"?"bg-surface text-foreground-2 shadow-sm":"text-subtle hover:text-muted")}
      >
       <FileText className="h-3.5 w-3.5" /> Table
      </button>
      <button
       onClick={() => setView("kanban")}
       className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
        view ==="kanban"?"bg-surface text-foreground-2 shadow-sm":"text-subtle hover:text-muted")}
      >
       <Columns className="h-3.5 w-3.5" /> Kanban
      </button>
      <button
       onClick={() => setView("calendar")}
       className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
        view ==="calendar"?"bg-surface text-foreground-2 shadow-sm":"text-subtle hover:text-muted")}
      >
       <Calendar className="h-3.5 w-3.5" /> Calendar
      </button>
     </div>
     <button
      onClick={openAdd}
      className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-brand/20 active:scale-95 border border-white/10"
     >
      <Plus className="h-4 w-4" /> {t("planning.add_video")}
     </button>
    </div>
   </header>

   {/* Filters */}
   <div className="px-8 py-3 bg-surface border-b border-border flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtle" />
        <input
         type="text"
         placeholder={searchPlaceholder}
         value={search}
         onChange={e => setSearch(e.target.value)}
         className="pl-9 pr-4 py-2 bg-surface-secondary border border-border rounded-xl text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all w-64"
        />
       </div>
       <div className="relative">
        <select
         value={statusFilter || ""}
         onChange={e => setStatusFilter((e.target.value as Status) || null)}
         className="pl-4 pr-10 py-2 bg-surface-secondary border border-border rounded-xl text-sm text-foreground-2 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all appearance-none cursor-pointer min-w-[140px]"
        >
         <option value="">All Status</option>
         {STAGES.map(s => (
          <option key={s.key} value={s.key}>{s.short}</option>
         ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtle pointer-events-none" />
       </div>
      </div>

      {view === "calendar" && (
       <div className="flex items-center gap-4 bg-surface-secondary border border-border rounded-xl px-4 py-1.5 shadow-sm">
         <button onClick={prevMonth} className="p-1 hover:bg-surface rounded-lg transition-colors"><ChevronRight className="h-4 w-4 rotate-180 text-subtle" /></button>
         <span className="text-sm font-bold text-foreground min-w-[120px] text-center uppercase tracking-widest px-2">
           {currentMonth.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "long", year: "numeric" })}
         </span>
         <button onClick={nextMonth} className="p-1 hover:bg-surface rounded-lg transition-colors"><ChevronRight className="h-4 w-4 text-subtle" /></button>
       </div>
      )}
    </div>

   {/* Content */}
   <div className="flex-1 overflow-y-auto p-8">
    {loading ? (
     <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      <p className="text-subtle text-sm font-medium">{t("common.loading")}</p>
     </div>
    ) : filtered.length === 0 ? (
     <div className="bg-surface border-2 border-dashed border-border rounded-3xl py-24 flex flex-col items-center text-center px-6">
      <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mb-6 rotate-3">
       <Calendar className="h-8 w-8 text-indigo-400" />
      </div>
      <h3 className="text-xl font-heading text-foreground-2 mb-2">{noVideosMsg}</h3>
      <p className="text-subtle max-w-sm text-sm mb-8">
       {search ? noResultsMsg : startAddingMsg}
      </p>
      {!search && (
       <button onClick={openAdd} className="flex items-center gap-2 text-brand font-semibold text-sm hover:text-brand-hover transition-colors">
        <Plus className="h-4 w-4" /> {addVideoLabel}
       </button>
      )}
     </div>

    ) : view ==="table" ? (
     /* REDESIGNED DASHBOARD VIEW */
     <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col">

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-border">
              <th rowSpan={2} className="text-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-subtle border-r border-border min-w-[50px]">#</th>
              <th rowSpan={2} className="text-left px-6 py-2 text-[10px] font-black uppercase tracking-widest text-subtle border-r border-border min-w-[250px]">VIDEO / Title</th>
              <th colSpan={2} className="text-center px-4 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/30 border-r border-border">DATES</th>
              <th colSpan={5} className="text-center px-4 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/30 border-r border-border">VIDEO PROGRESS</th>
              <th rowSpan={2} className="text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-subtle min-w-[150px]">Notes / Actions</th>
            </tr>
            <tr className="bg-slate-900 border-b border-border">
              <th className="text-center px-3 py-2 text-[9px] font-black uppercase text-subtle border-r border-border min-w-[90px]">Idea Date</th>
              <th className="text-center px-3 py-2 text-[9px] font-black uppercase text-subtle border-r border-border min-w-[90px]">Pub. Date</th>
              <th className="text-center px-2 py-2 text-[9px] font-black uppercase text-amber-500 border-r border-border min-w-[70px]">Idea</th>
              <th className="text-center px-2 py-2 text-[9px] font-black uppercase text-blue-500 border-r border-border min-w-[70px]">Script</th>
              <th className="text-center px-2 py-2 text-[9px] font-black uppercase text-orange-500 border-r border-border min-w-[70px]">Recording</th>
              <th className="text-center px-2 py-2 text-[9px] font-black uppercase text-purple-500 border-r border-border min-w-[70px]">Editing</th>
              <th className="text-center px-2 py-2 text-[9px] font-black uppercase text-emerald-500 border-r border-border min-w-[70px]">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((v, i) => {
              const current = stageIndex(v.status);
              const getStageIcon = (idx: number) => {
                if (idx < current) return <span className="text-emerald-500 font-bold text-lg">✅</span>;
                if (idx === current) {
                  if (v.status === "published") return <span className="text-emerald-500 font-bold text-lg">✅</span>;
                  return <span className="text-amber-500 animate-pulse text-lg">⏳</span>;
                }
                return <span className="text-subtle opacity-50 text-xl font-thin">—</span>;
              };
              
              const stageColor = (idx: number) => {
                if (idx < current) return "bg-emerald-500/5";
                if (idx === current && v.status !== "published") return "bg-amber-500/5";
                return "";
              };

              return (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-4 py-4 text-[10px] text-center text-subtle font-black border-r border-border-subtle">{i + 1}</td>
                  <td className="px-6 py-4 border-r border-border-subtle">
                    <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-brand transition-colors">
                      {v.title}
                    </p>
                    <span className="text-[10px] text-subtle font-medium bg-surface-hover px-2 rounded-full mt-1 inline-block">
                      {v.category || "General"}
                    </span>
                  </td>
                  {/* DATES */}
                  <td className="px-3 py-4 text-center text-xs text-subtle border-r border-border-subtle">{formatDate(v.created_at)}</td>
                  <td className="px-3 py-4 text-center text-xs font-bold text-emerald-500 border-r border-border-subtle whitespace-nowrap">
                    {formatDate(v.planned_date)}
                  </td>
                  {/* AVANCEMENT CELLS */}
                  <td className={cn("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor(0))} onClick={() => handleStatusChange(v.id, "idea")}>{getStageIcon(0)}</td>
                  <td className={cn("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor(1))} onClick={() => handleStatusChange(v.id, "scripted")}>{getStageIcon(1)}</td>
                  <td className={cn("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor(2))} onClick={() => handleStatusChange(v.id, "recorded")}>{getStageIcon(2)}</td>
                  <td className={cn("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor(3))} onClick={() => handleStatusChange(v.id, "edited")}>{getStageIcon(3)}</td>
                  <td className={cn("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor(4))}>
                    {v.youtube_video_id ? (
                      <a 
                        href={v.youtube_video_id.startsWith('http') ? v.youtube_video_id : `https://www.youtube.com/watch?v=${v.youtube_video_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:scale-125 transition-transform inline-block"
                        title="Voir sur YouTube"
                        onClick={(e) => e.stopPropagation()}
                      >
                         <CheckCircle2 className="h-5 w-5" />
                      </a>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2" onClick={() => { setPublishingVideoId(v.id); setPublishUrl(""); setIsPublishModalOpen(true); }}>
                        {getStageIcon(4)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-4 py-3 min-w-[200px]">
                    <div className="flex items-start gap-3 group/note relative">
                      <textarea
                        value={v.notes || ""}
                        onChange={(e) => handleNoteChange(v.id, e.target.value)}
                        placeholder="Ajouter une note..."
                        className="flex-1 bg-transparent text-[11px] text-subtle placeholder:opacity-30 focus:outline-none resize-none scrollbar-hide py-1 min-h-[40px] border-b border-transparent focus:border-indigo-500/30 transition-all"
                      />
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within/note:opacity-100 transition-opacity pt-1 bg-surface/80 backdrop-blur-sm rounded-lg p-1">
                        <button onClick={() => router.push(`/dashboard/${workspaceId}/script`)} className="p-1.5 text-subtle hover:text-brand hover:bg-brand/10 rounded-lg transition-all" title="Ouvrir le Script">
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => openEdit(v)} className="p-1.5 text-subtle hover:text-foreground hover:bg-stone-800 rounded-lg transition-all" title="Modifier">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(v.id)} className="p-1.5 text-subtle hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Supprimer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* SUMMARY FOOTER: RÉSUMÉ */}
          <tfoot>
            <tr className="bg-slate-950/80 border-t-2 border-slate-800 text-white font-black">
              <td colSpan={2} className="px-6 py-4 text-right pr-12">
                <span className="flex items-center justify-end gap-3 text-xs tracking-[0.2em] uppercase opacity-60">
                   📊 RÉSUMÉ GÉNÉRAL
                </span>
              </td>
              <td colSpan={2} className="bg-slate-900/50"></td>
              <td className="text-center py-4 bg-stone-900/40 text-lg border-r border-slate-800">{filtered.filter(v => stageIndex(v.status) >= 0).length}</td>
              <td className="text-center py-4 bg-blue-900/10 text-lg border-r border-slate-800">{filtered.filter(v => stageIndex(v.status) >= 1).length}</td>
              <td className="text-center py-4 bg-amber-900/10 text-lg border-r border-slate-800">{filtered.filter(v => stageIndex(v.status) >= 2).length}</td>
              <td className="text-center py-4 bg-purple-900/10 text-lg border-r border-slate-800">{filtered.filter(v => stageIndex(v.status) >= 3).length}</td>
              <td className="text-center py-4 bg-emerald-900/10 text-lg border-r border-slate-800">{filtered.filter(v => v.status === "published").length}</td>
              <td className="bg-slate-900/50"></td>
            </tr>
          </tfoot>
        </table>
      </div>
     </div>

    ) : view ==="calendar" ? (
      /* CALENDAR VIEW */
      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 bg-slate-900 border-b border-border">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-subtle border-r border-border last:border-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {(() => {
            const days = [];
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = getFirstDayOfMonth(year, month);
            
            // Previous month padding
            for (let i = 0; i < firstDay; i++) {
              days.push(<div key={`pad-${i}`} className="bg-surface-secondary/30 border-r border-b border-border opacity-20" />);
            }
            
            // Current month days
            for (let d = 1; d <= daysInMonth; d++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const dayVideos = filtered.filter(v => v.planned_date && v.planned_date.split("T")[0] === dateStr);
              const isToday = new Date().toISOString().split("T")[0] === dateStr;
              
              days.push(
                <div key={d} className={cn("bg-surface border-r border-b border-border p-2 group hover:bg-slate-800/10 transition-colors overflow-hidden")}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full", isToday ? "bg-brand text-white" : "text-subtle")}>{d}</span>
                  </div>
                  <div className="space-y-1">
                    {dayVideos.map(v => {
                      const st = STAGES.find(s => s.key === v.status);
                      return (
                        <div 
                          key={v.id} 
                          onClick={() => openEdit(v)}
                          className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer transition-all hover:scale-[1.02] border", st?.bg, st?.color, "border-current/10")}
                          title={v.title}
                        >
                          {v.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            return days;
          })()}
        </div>
      </div>
     ) : (
     /* KANBAN VIEW */
     <div className="flex gap-5 overflow-x-auto pb-4">
      {STAGES.map(st => {
       const stageVideos = filtered.filter(v => v.status === st.key);
       return (
        <div key={st.key} className="flex-shrink-0 w-64">
         <div className="flex items-center gap-2 mb-4">
          <div className={cn("w-2.5 h-2.5 rounded-full", st.dot)} />
          <span className="text-xs font-black uppercase tracking-widest text-muted">{st.label}</span>
          <span className="ml-auto text-xs font-bold text-subtle">{stageVideos.length}</span>
         </div>
         <div className="space-y-3">
          {stageVideos.map(v => (
           <div key={v.id} className="bg-surface border border-border rounded-2xl p-4 hover:border-brand-border hover:shadow-sm transition-all group">
            <p className="text-sm font-semibold text-foreground-2 leading-tight mb-3 line-clamp-2 group-hover:text-brand-text transition-colors">
             {v.title}
            </p>
            <div className="flex items-center justify-between">
             <div className="flex items-center gap-1.5 text-xs text-subtle">
              <Clock className="h-3 w-3" />
              {formatDate(v.planned_date)}
             </div>
             <ScoreBadge score={v.viral_score} />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle opacity-0 group-hover:opacity-100 transition-opacity">
             <select
              value={v.status}
              onChange={e => handleStatusChange(v.id, e.target.value as Status)}
              className="text-xs text-muted bg-transparent focus:outline-none cursor-pointer"
             >
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
             </select>
             <div className="flex gap-1">
              <button onClick={() => openEdit(v)} className="p-1 text-subtle hover:text-muted transition-colors">
               <Edit3 className="h-3 w-3" />
              </button>
              <button onClick={() => setConfirmDelete(v.id)} className="p-1 text-subtle hover:text-red-500 transition-colors">
               <Trash2 className="h-3 w-3" />
              </button>
             </div>
            </div>
           </div>
          ))}
          {stageVideos.length === 0 && (
           <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center">
            <p className="text-xs text-subtle">{noVideosMsg}</p>
           </div>
          )}
         </div>
        </div>
       );
      })}
     </div>
    )}
   </div>

   {/* Modal: Add / Edit */}
   {isModalOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
     <div className="bg-surface rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-lg font-heading text-foreground mb-6">
       {editingVideo ? editVideoLabel : newVideoLabel}
      </h3>
      <div className="space-y-5">
       <div className="space-y-2">
        <label className="text-xs font-bold text-muted uppercase tracking-wide">{titleLabel} *</label>
        <input
         type="text"
         value={form.title}
         onChange={e => setForm({ ...form, title: e.target.value })}
         placeholder={t("planning.modal.video_title_placeholder")}
         className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
         autoFocus
        />
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
         <label className="text-xs font-bold text-muted uppercase tracking-wide">{categoryLabel}</label>
         <input
          type="text"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
         />
        </div>
        <div className="space-y-2">
         <label className="text-xs font-bold text-muted uppercase tracking-wide">{statusLabel}</label>
         <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value as Status })}
          className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
         >
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
         </select>
        </div>
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
         <label className="text-xs font-bold text-muted uppercase tracking-wide">Date de Publication</label>
         <input
          type="date"
          value={form.planned_date}
          onChange={e => setForm({ ...form, planned_date: e.target.value })}
          className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
         />
        </div>
        <div className="space-y-2">
         <label className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wide">
          {viralScoreLabel} <span className="normal-case font-black text-brand">{form.viral_score}%</span>
         </label>
         <input
          type="range" min={0} max={100} step={5}
          value={form.viral_score}
          onChange={e => setForm({ ...form, viral_score: parseInt(e.target.value) })}
          className="w-full accent-[color:var(--brand)] mt-3"
         />
        </div>
        <div className="space-y-2">
         <label className="text-xs font-bold text-muted uppercase tracking-wide">YouTube Video ID / URL</label>
         <input
          type="text"
          value={form.youtube_video_id}
          onChange={e => setForm({ ...form, youtube_video_id: e.target.value })}
          placeholder="e.g. dQw4w9WgXcQ or full link"
          className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
         />
        </div>
       </div>
       <div className="space-y-2 col-span-2">
         <label className="text-xs font-bold text-muted uppercase tracking-wide">Notes</label>
         <textarea
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="Notes de production..."
          className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all min-h-[100px]"
         />
       </div>
      </div>
      <div className="flex gap-3 mt-7 pt-5 border-t border-border-subtle">
       <button
        onClick={handleSubmit}
        disabled={!form.title}
        className="flex-1 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 active:scale-95"
       >
        {editingVideo ? saveLabel : createLabel}
       </button>
       <button
        onClick={() => setIsModalOpen(false)}
        className="px-6 py-3 border border-border text-muted hover:text-foreground rounded-xl font-semibold text-sm transition-all"
       >
        {t("common.cancel")}
       </button>
      </div>
     </div>
    </div>
   
    )}

   {/* Modal: Confirm Publication */}
   {isPublishModalOpen && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
     <div className="bg-surface rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-border">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
            <h3 className="text-xl font-heading text-foreground">Publier la vidéo</h3>
            <p className="text-xs text-subtle">Entrez le lien YouTube pour finaliser</p>
        </div>
      </div>
      
      <div className="space-y-4">
       <div className="space-y-2">
        <label className="text-xs font-bold text-muted uppercase tracking-wide">Lien YouTube / ID</label>
        <input
         type="text"
         value={publishUrl}
         onChange={e => setPublishUrl(e.target.value)}
         placeholder="https://www.youtube.com/watch?v=..."
         className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
         autoFocus
        />
       </div>
      </div>
      
      <div className="flex gap-3 mt-8">
       <button
        onClick={handleConfirmPublish}
        disabled={!publishUrl}
        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
       >
        Confirmer la publication
       </button>
       <button
        onClick={() => setIsPublishModalOpen(false)}
        className="px-6 py-3 border border-border text-muted hover:text-foreground rounded-xl font-semibold text-sm transition-all"
       >
        Annuler
       </button>
      </div>
     </div>
    </div>
   )}

   {/* Confirm delete modal (for kanban) */}
   {confirmDelete && view ==="kanban" && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
     <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <p className="text-sm font-semibold text-foreground-2 mb-4">{confirmDeleteMsg}</p>
      <div className="flex gap-3">
       <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all">
        {deleteLabel}
       </button>
       <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-border text-muted px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-secondary transition-all">
        {t("common.cancel")}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
