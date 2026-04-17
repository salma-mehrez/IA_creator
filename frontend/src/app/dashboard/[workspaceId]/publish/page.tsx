"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { 
  Rocket, Type, Image as ImageIcon, PenTool, Copy, Check, 
  RefreshCw, Loader2, FileText, Key, Sparkles, Download,
  History, Plus, Trash2, ChevronRight, MessageSquare
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PublishProject {
  id: number;
  video_title: string;
  script_summary?: string;
  keywords?: string;
  language: string;
  image_model: string;
  results_json?: string;
  created_at: string;
}

export default function PublishHub() {
  const { workspaceId } = useParams();
  const { language, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<"titles" | "thumbnails" | "seo">("titles");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | string | null>(null);

  // History states
  const [history, setHistory] = useState<PublishProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states
  const [videoTitle, setVideoTitle] = useState("");
  const [scriptOrSummary, setScriptOrSummary] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imageModel, setImageModel] = useState("flux");

  // Result states
  const [titles, setTitles] = useState<any[]>([]);
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [seo, setSeo] = useState<any>(null);

  // --- API CALLS ---

  const loadHistory = async () => {
    setHistoryLoading(true);
    const res = await fetchApi(`/workspaces/${workspaceId}/publish/projects`);
    if (res.data) setHistory(res.data as PublishProject[]);
    setHistoryLoading(false);
  };

  const loadProject = (project: PublishProject) => {
    setActiveProjectId(project.id);
    setVideoTitle(project.video_title);
    setScriptOrSummary(project.script_summary || "");
    setKeywords(project.keywords || "");
    setImageModel(project.image_model || "flux");
    
    if (project.results_json) {
      try {
        const results = JSON.parse(project.results_json);
        setTitles(results.titles || []);
        setThumbnails(results.thumbnails || []);
        setSeo(results.seo || null);
      } catch (e) {
        console.error("Failed to parse project results", e);
      }
    } else {
      setTitles([]);
      setThumbnails([]);
      setSeo(null);
    }
  };

  const handleNewSession = () => {
    setActiveProjectId(null);
    setVideoTitle("");
    setScriptOrSummary("");
    setKeywords("");
    setImageModel("flux");
    setTitles([]);
    setThumbnails([]);
    setSeo(null);
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm(t("common.confirm_delete") || "Supprimer cet historique ?")) return;
    
    const res = await fetchApi(`/workspaces/${workspaceId}/publish/projects/${id}`, { method: "DELETE" });
    if (!res.error) {
      setHistory(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) handleNewSession();
    }
  };

  const handleSave = async (currentResults?: any) => {
    if (!videoTitle.trim()) return;

    const resultsToSave = currentResults || { titles, thumbnails, seo };
    
    const payload = {
      id: activeProjectId,
      video_title: videoTitle,
      script_summary: scriptOrSummary,
      keywords: keywords,
      language,
      image_model: imageModel,
      results_json: JSON.stringify(resultsToSave)
    };

    const res = await fetchApi(`/workspaces/${workspaceId}/publish/save`, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (res.data) {
      const saved = res.data as PublishProject;
      if (!activeProjectId) {
        setActiveProjectId(saved.id);
        setHistory(prev => [saved, ...prev]);
      } else {
        setHistory(prev => prev.map(p => p.id === saved.id ? saved : p));
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, [workspaceId]);

  // -------------------------

  const handleCopy = (text: string, index: number | string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${filename.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      window.open(url, "_blank");
    }
  };

  const handleGenerate = async () => {
    if (!videoTitle) return;
    setLoading(true);
    
    try {
      const payload = {
        video_title: videoTitle,
        script_or_summary: scriptOrSummary,
        keywords: keywords,
        language: language,
        image_model: imageModel
      };

      let newResults = { titles: [...titles], thumbnails: [...thumbnails], seo: seo };

      if (activeTab === "titles") {
        const res = await fetchApi(`/workspaces/${workspaceId}/generate-titles`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (res.data) {
          const generatedTitles = (res.data as any).titles;
          setTitles(generatedTitles);
          newResults.titles = generatedTitles;
        }
      } 
      else if (activeTab === "thumbnails") {
        const res = await fetchApi(`/workspaces/${workspaceId}/generate-thumbnail-concepts`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (res.data) {
          const generatedConcepts = (res.data as any).concepts;
          setThumbnails(generatedConcepts);
          newResults.thumbnails = generatedConcepts;
        }
      }
      else if (activeTab === "seo") {
        const res = await fetchApi(`/workspaces/${workspaceId}/generate-description`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (res.data) {
          const generatedSeo = res.data;
          setSeo(generatedSeo);
          newResults.seo = generatedSeo;
        }
      }

      // Auto-save after generation
      await handleSave(newResults);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: MEMORY */}
      <div className={cn(
        "bg-surface border-r border-border transition-all duration-300 flex flex-col relative z-20 shadow-xl",
        sidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="p-4 border-b border-border">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 bg-brand/10 hover:bg-brand/20 text-brand py-3 px-4 rounded-xl border border-brand/20 font-bold transition-all text-sm group"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            {language === "fr" ? "Nouvelle Génération" : "New Assets"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2 space-y-1">
            <div className="px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-subtle/60 flex items-center gap-2">
                <History className="h-3 w-3" /> {language === "fr" ? "Mémoire" : "Memory"}
              </span>
            </div>
            
            {historyLoading ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <Loader2 className="h-5 w-5 text-brand animate-spin" />
                <span className="text-xs text-subtle">Chargement...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center">
                <Sparkles className="h-8 w-8 text-subtle/20 mx-auto mb-2" />
                <p className="text-xs text-subtle/60">{language === "fr" ? "Aucun historique" : "No history yet"}</p>
              </div>
            ) : history.map(proj => (
              <button
                key={proj.id}
                onClick={() => loadProject(proj)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all group relative text-left",
                  activeProjectId === proj.id ? "bg-brand text-white shadow-lg shadow-brand/20" : "hover:bg-surface-secondary text-foreground-2"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Rocket className={cn("h-4 w-4 flex-shrink-0", activeProjectId === proj.id ? "text-white" : "text-brand")} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate pr-4">
                      {proj.video_title || (language === "fr" ? "Sans titre" : "No title")}
                    </span>
                    <span className={cn("text-[10px] opacity-60 font-medium", activeProjectId === proj.id ? "text-white/80" : "text-subtle")}>
                      {new Date(proj.created_at).toLocaleDateString(language === "fr" ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleDeleteProject(e, proj.id)}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      activeProjectId === proj.id ? "hover:bg-white/20 text-white" : "hover:bg-red-50 text-subtle hover:text-red-500"
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2 & 3. MAIN CONTENT: FORM & RESULTS */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-background overflow-y-auto">
        
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-0 top-[26px] z-30 bg-surface border border-border rounded-full p-1.5 shadow-md hover:scale-110 transition-all text-subtle active:scale-95"
          style={{ 
            left: sidebarOpen ? '308px' : '12px',
            transition: 'left 0.3s ease-in-out'
          }}
        >
          <ChevronRight className={cn("h-3 w-3 transition-transform", sidebarOpen && "rotate-180")} />
        </button>

        <div className="max-w-6xl mx-auto w-full px-8 pt-8 pb-20 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t("publish.title")} <span className="text-brand">{t("publish.title_highlight")}</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Context Form (Sticky-ish) */}
            <div className="lg:col-span-4 bg-surface border border-border rounded-3xl p-6 shadow-xl h-fit sticky top-8">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-indigo-400" />
                {t("publish.context_title")}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground-2 mb-2">
                    {t("publish.label.title")}
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder={t("publish.label.title_placeholder")}
                    className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-muted"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-2 mb-2">
                    {t("publish.label.script")}
                  </label>
                  <textarea
                    value={scriptOrSummary}
                    onChange={(e) => setScriptOrSummary(e.target.value)}
                    placeholder={t("publish.label.script_placeholder")}
                    className="w-full h-40 bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-muted resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-2 mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {t("publish.label.keywords")}
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder={t("publish.label.keywords_placeholder")}
                    className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-muted"
                  />
                </div>

                {activeTab === "thumbnails" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-foreground-2 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      {t("publish.label.model")}
                    </label>
                    <select
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-foreground appearance-none cursor-pointer"
                    >
                      <option value="flux">{t("publish.style.flux")}</option>
                      <option value="flux-realism">{t("publish.style.realism")}</option>
                      <option value="flux-anime">{t("publish.style.anime")}</option>
                      <option value="flux-3d">{t("publish.style.3d")}</option>
                      <option value="any-dark">{t("publish.style.dark")}</option>
                      <option value="turbo">{t("publish.style.turbo")}</option>
                      <option value="sana">{t("publish.style.sana")}</option>
                    </select>
                  </div>
                )}
                
                <button
                  onClick={handleGenerate}
                  disabled={loading || !videoTitle}
                  className="w-full flex items-center justify-center gap-2 bg-brand text-white px-4 py-3 rounded-xl font-bold hover:bg-brand/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("publish.loading.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      {t("publish.label.generate")}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Tabs Picker */}
              <div className="bg-surface border border-border rounded-2xl p-1.5 flex gap-1.5 shadow-lg">
                {[
                  { id: "titles", label: t("publish.tabs.titles"), icon: Type },
                  { id: "thumbnails", label: t("publish.tabs.thumbnails"), icon: ImageIcon },
                  { id: "seo", label: t("publish.tabs.seo"), icon: PenTool },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all",
                        isActive 
                          ? "bg-brand text-white shadow-xl shadow-brand/20 scale-105 z-10" 
                          : "text-subtle hover:text-foreground hover:bg-surface-secondary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Content */}
              <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl min-h-[600px] relative overflow-hidden">
                
                {/* Result Views */}
                {!loading && activeTab === "titles" && titles.length === 0 && <EmptyState message={t("publish.empty.titles_msg")} />}
                {!loading && activeTab === "thumbnails" && thumbnails.length === 0 && <EmptyState message={t("publish.empty.thumbnails_msg")} />}
                {!loading && activeTab === "seo" && !seo && <EmptyState message={t("publish.empty.seo_msg")} />}

                {loading && (
                  <div className="absolute inset-0 z-50 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-brand/20 blur-3xl animate-pulse rounded-full" />
                      <Loader2 className="h-12 w-12 text-brand animate-spin relative z-10" />
                    </div>
                    <p className="text-xl font-heading font-bold text-foreground">{t("publish.loading.ai")}</p>
                    <p className="text-sm text-subtle mt-2 max-w-sm">
                      {t("publish.loading.desc")}
                    </p>
                  </div>
                )}

                {!loading && activeTab === "titles" && titles.length > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-heading font-bold text-foreground border-b border-border pb-4 mb-6">{t("publish.results.titles_title")}</h3>
                    {titles.map((t_item, idx) => (
                      <div key={idx} className="group relative bg-surface-secondary border border-border rounded-2xl p-5 flex items-center justify-between hover:border-brand/40 hover:bg-brand/5 hover:translate-x-1 transition-all">
                        <div className="flex-1 pr-6 text-foreground-2">
                          <p className="font-bold text-lg leading-snug">{t_item.title}</p>
                          <div className="flex items-center gap-3 mt-3">
                             <div className={cn(
                               "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                               t_item.ctr_score > 90 ? 'bg-emerald-500/10 text-emerald-500' :
                               t_item.ctr_score > 75 ? 'bg-brand/10 text-brand' : 'bg-orange-500/10 text-orange-500'
                             )}>
                               <Check className="h-3 w-3" />
                               {t("publish.results.ctr_score")} : {t_item.ctr_score}/100
                             </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCopy(t_item.title, `t-${idx}`)}
                          className="w-12 h-12 flex items-center justify-center bg-surface border border-border rounded-xl text-subtle hover:text-brand hover:border-brand/30 transition-all shadow-sm active:scale-90"
                        >
                          {copiedIndex === `t-${idx}` ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && activeTab === "thumbnails" && thumbnails.length > 0 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-heading font-bold text-foreground border-b border-border pb-4 mb-6">{t("publish.results.thumbnails_title")}</h3>
                    {thumbnails.map((tm, idx) => (
                      <div key={idx} className="bg-surface-secondary border border-border rounded-3xl overflow-hidden hover:border-brand/30 transition-all shadow-xl group">
                        <div className="bg-surface-hover p-4 border-b border-border flex items-center justify-between">
                          <h4 className="font-bold text-foreground flex items-center gap-2">
                            <span className="bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                            {tm.concept_name}
                          </h4>
                        </div>

                        {tm.image_url && (
                          <div className="w-full relative aspect-video bg-surface-secondary flex items-center justify-center group overflow-hidden">
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 animate-pulse">
                              <Loader2 className="h-8 w-8 text-brand animate-spin mb-3 opacity-60" />
                              <span className="text-xs text-subtle font-bold uppercase tracking-widest">{t("publish.results.thumbnail_image_gen")}</span>
                            </div>
                            
                            <img 
                              src={tm.image_url} 
                              alt={tm.concept_name}
                              className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-1000 group-hover:scale-105 transition-transform"
                              onLoad={(e) => (e.target as HTMLImageElement).classList.replace('opacity-0', 'opacity-100')}
                            />
                            
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => handleDownload(tm.image_url!, tm.concept_name)}
                                  className="flex-1 flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-xl text-xs font-bold shadow-xl active:scale-95 transition-all"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  {t("publish.results.download")}
                                </button>
                                <a href={tm.image_url} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all">
                                  <Sparkles className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-4">
                            <div>
                              <span className="text-subtle text-[10px] uppercase font-black tracking-widest">{t("publish.results.text_overlay")}</span>
                              <p className="font-heading font-black text-2xl text-yellow-500 mt-1 uppercase leading-none drop-shadow-sm italic">&quot;{tm.text_overlay}&quot;</p>
                            </div>
                            <div>
                              <span className="text-subtle text-[10px] uppercase font-black tracking-widest">{t("publish.results.visual_subject")}</span>
                              <p className="text-foreground-2 mt-1 leading-relaxed">{tm.visual_subject}</p>
                            </div>
                          </div>
                          <div className="space-y-4 md:border-l border-border md:pl-6">
                            <div>
                              <span className="text-subtle text-[10px] uppercase font-black tracking-widest">{t("publish.results.emotion")}</span>
                              <p className="text-foreground-2 mt-1 font-bold">{tm.emotion}</p>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <span className="text-subtle text-[10px] uppercase font-black tracking-widest">{t("publish.results.color")}</span>
                                <p className="mt-1 font-bold text-foreground-2">{tm.dominant_color}</p>
                              </div>
                              <div className="flex-1">
                                <span className="text-subtle text-[10px] uppercase font-black tracking-widest">Style</span>
                                <p className="mt-1 font-bold text-foreground-2">{tm.style}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && activeTab === "seo" && seo && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground-2">
                    <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                      <h3 className="text-xl font-heading font-bold text-foreground">{t("publish.results.seo_title")}</h3>
                      <button 
                        onClick={() => handleCopy(seo.full_description, 'seo')}
                        className="flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-xl text-sm font-bold hover:bg-brand hover:text-white transition-all active:scale-95 shadow-lg shadow-brand/5"
                      >
                        {copiedIndex === 'seo' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {t("publish.results.copy_all")}
                      </button>
                    </div>
                  
                    <div className="bg-surface-secondary border border-border rounded-2xl p-6 font-mono text-sm leading-relaxed overflow-y-auto max-h-[600px] whitespace-pre-wrap shadow-inner custom-scrollbar">
                      {seo.full_description}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="bg-surface-secondary border border-border rounded-2xl p-5 group hover:border-brand/30 transition-all">
                        <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Key className="h-3 w-3" /> {t("publish.results.tags")}
                        </p>
                        <p className="text-sm font-bold leading-relaxed">{seo.keywords}</p>
                      </div>
                      <div className="bg-surface-secondary border border-border rounded-2xl p-5 group hover:border-brand/30 transition-all">
                        <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-3 flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" /> {t("publish.results.hashtags")}
                        </p>
                        <p className="text-sm font-black text-brand tracking-tight">{seo.hashtags}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 rounded-[2.5rem] bg-surface-secondary flex items-center justify-center mb-6 shadow-xl relative group overflow-hidden">
        <div className="absolute inset-0 bg-brand/5 group-hover:scale-125 transition-transform duration-700" />
        <Sparkles className="h-10 w-10 text-brand relative z-10" />
      </div>
      <h3 className="text-xl font-heading font-bold text-foreground mb-2">Prêt à publier ?</h3>
      <p className="text-sm text-subtle max-w-sm leading-relaxed">{message}</p>
    </div>
  );
}
