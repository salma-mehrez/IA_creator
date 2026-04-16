"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { 
  Rocket, 
  Type, 
  Image as ImageIcon, 
  PenTool,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  FileText,
  Key,
  Sparkles,
  Download
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function PublishHub() {
  const { workspaceId } = useParams();
  const { language, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<"titles" | "thumbnails" | "seo">("titles");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | string | null>(null);

  // Form states
  const [videoTitle, setVideoTitle] = useState("");
  const [scriptOrSummary, setScriptOrSummary] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imageModel, setImageModel] = useState("flux");

  // Result states
  const [titles, setTitles] = useState<any[]>([]);
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [seo, setSeo] = useState<any>(null);

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
      // Fallback: open in new tab
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

      if (activeTab === "titles") {
        const res = await fetchApi(`/workspaces/${workspaceId}/generate-titles`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (res.data) setTitles((res.data as any).titles);
      } 
      else if (activeTab === "thumbnails") {
        const res = await fetchApi(`/workspaces/${workspaceId}/generate-thumbnail-concepts`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (res.data) setThumbnails((res.data as any).concepts);
      }
      else if (activeTab === "seo") {
        const res = await fetchApi(`/workspaces/${workspaceId}/generate-description`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (res.data) setSeo(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-semibold mb-4">
          <Rocket className="h-4 w-4" />
          Publishing Toolkit
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          {t("publish.title")} <span className="text-brand">{t("publish.title_highlight")}</span>
        </h1>
        <p className="text-muted mt-2">
          {t("publish.subtitle")}
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Context Form */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-2xl p-6 shadow-sm h-fit sticky top-6">
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
              <div>
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
              className="w-full flex items-center justify-center gap-2 bg-brand text-white px-4 py-3 rounded-xl font-bold hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("publish.loading.generating")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  {t("publish.label.generate")} ({t(`publish.tabs.${activeTab}`)})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: AI Results */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs */}
          <div className="bg-surface border border-border rounded-xl p-1 flex gap-1 shadow-sm">
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
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                    isActive 
                      ? "bg-surface-secondary text-brand shadow-sm" 
                      : "text-muted hover:text-foreground hover:bg-surface-secondary/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Results Area */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[500px]">
            
            {/* NO RESULTS VIEW */}
            {activeTab === "titles" && titles.length === 0 && !loading && (
              <EmptyState message={t("publish.empty.titles_msg")} />
            )}
            {activeTab === "thumbnails" && thumbnails.length === 0 && !loading && (
              <EmptyState message={t("publish.empty.thumbnails_msg")} />
            )}
            {activeTab === "seo" && !seo && !loading && (
              <EmptyState message={t("publish.empty.seo_msg")} />
            )}

            {/* LOADING VIEW */}
            {loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <Loader2 className="h-10 w-10 text-brand animate-spin mb-4" />
                <p className="text-foreground-2 font-medium">{t("publish.loading.ai")}</p>
                <p className="text-sm text-muted mt-2 max-w-sm">
                  {t("publish.loading.desc")}
                </p>
              </div>
            )}

            {/* RESULTS VIEW - TITLES */}
            {!loading && activeTab === "titles" && titles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mb-4">{t("publish.results.titles_title")}</h3>
                {titles.map((t, idx) => (
                  <div key={idx} className="group relative bg-surface-secondary border border-border rounded-xl p-4 flex items-center justify-between hover:border-indigo-500/30 hover:shadow-md transition-all">
                    <div className="flex-1 pr-6">
                      <p className="font-medium text-foreground text-lg">{t.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                           t.ctr_score > 90 ? 'bg-emerald-500/10 text-emerald-500' :
                           t.ctr_score > 75 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-orange-500/10 text-orange-500'
                         }`}>
                           {t("publish.results.ctr_score")} : {t.ctr_score}/100
                         </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCopy(t.title, `t-${idx}`)}
                      className="p-3 bg-surface border border-border rounded-xl text-foreground hover:text-brand transition-colors flex-shrink-0"
                    >
                      {copiedIndex === `t-${idx}` ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* RESULTS VIEW - THUMBNAILS */}
            {!loading && activeTab === "thumbnails" && thumbnails.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mb-4">{t("publish.results.thumbnails_title")}</h3>
                {thumbnails.map((tm, idx) => (
                  <div key={idx} className="bg-surface-secondary border border-border rounded-xl overflow-hidden hover:border-violet-500/30 transition-all shadow-sm group">
                    <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-4 border-b border-border flex items-center justify-between">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <span className="bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                        {tm.concept_name}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-1 bg-surface rounded-md border border-border text-foreground-2">
                        Style : {tm.style}
                      </span>
                    </div>

                    {/* Gen AI Image Preview using Pollinations */}
                    {tm.image_url && (
                      <div className="w-full relative aspect-video bg-surface-secondary border-b border-border overflow-hidden group flex items-center justify-center">
                        {/* Loader (Always beneath the image via z-index) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-secondary">
                          <Loader2 className="h-8 w-8 text-brand animate-spin mb-3 opacity-60" />
                          <span className="text-sm text-muted font-medium">{t("publish.results.thumbnail_image_gen")}</span>
                          <span className="text-[10px] text-muted/60 mt-1">{t("publish.results.thumbnail_image_time")}</span>
                        </div>
                        
                        {/* Real Image */}
                        <img 
                          src={tm.image_url} 
                          alt={tm.concept_name}
                          className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-1000 ease-in-out"
                          onLoad={(e) => {
                            (e.target as HTMLImageElement).classList.remove('opacity-0');
                            (e.target as HTMLImageElement).classList.add('opacity-100');
                          }}
                          onError={(e) => {
                            // If first load fails, we can try to reload after a delay or show a placeholder
                            console.error("Image load failed", tm.image_url);
                          }}
                        />
                        
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                           <button 
                             onClick={() => handleDownload(tm.image_url, tm.concept_name)}
                             className="flex items-center gap-2 bg-indigo-500/80 hover:bg-indigo-600 text-white backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all border border-white/10 shadow-xl"
                           >
                             <Download className="h-3.5 w-3.5" />
                             {t("publish.results.download")}
                           </button>
                           <a href={tm.image_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all border border-white/10 shadow-xl">
                             <Sparkles className="h-3.5 w-3.5" />
                             {t("publish.results.open_hd")}
                           </a>
                        </div>
                      </div>
                    )}

                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted text-xs uppercase font-bold tracking-wider">{t("publish.results.text_overlay")}</span>
                          <p className="font-heading font-black text-xl text-yellow-400 mt-1 uppercase leading-none">&quot;{tm.text_overlay}&quot;</p>
                        </div>
                        <div>
                          <span className="text-muted text-xs uppercase font-bold tracking-wider">{t("publish.results.visual_subject")}</span>
                          <p className="text-foreground-2 mt-1">{tm.visual_subject}</p>
                        </div>
                      </div>
                      <div className="space-y-3 md:border-l border-border md:pl-4">
                        <div>
                          <span className="text-muted text-xs uppercase font-bold tracking-wider">{t("publish.results.emotion")}</span>
                          <p className="text-foreground-2 mt-1 flex items-center gap-2">
                            {tm.emotion}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted text-xs uppercase font-bold tracking-wider">{t("publish.results.color")}</span>
                          <p className="mt-1 flex items-center gap-2 font-medium">
                            {tm.dominant_color}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

             {/* RESULTS VIEW - SEO */}
             {!loading && activeTab === "seo" && seo && (
                <div className="space-y-6">
                 <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                   <h3 className="text-lg font-bold text-foreground">{t("publish.results.seo_title")}</h3>
                   <button 
                     onClick={() => handleCopy(seo.full_description, 'seo')}
                     className="flex items-center gap-2 px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-sm font-semibold hover:bg-brand/20 transition-colors"
                   >
                     {copiedIndex === 'seo' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                     {t("publish.results.copy_all")}
                   </button>
                 </div>
                
                <div className="bg-surface-secondary border border-border rounded-xl p-5 font-mono text-sm text-foreground overflow-y-auto max-h-[500px] whitespace-pre-wrap">
                  {seo.full_description}
                </div>

                 <div className="grid grid-cols-2 gap-4 mt-6">
                   <div className="bg-surface-secondary border border-border rounded-xl p-4">
                     <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{t("publish.results.tags")}</p>
                     <p className="text-sm font-medium text-foreground-2">{seo.keywords}</p>
                   </div>
                   <div className="bg-surface-secondary border border-border rounded-xl p-4">
                     <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{t("publish.results.hashtags")}</p>
                     <p className="text-sm font-medium text-brand">{seo.hashtags}</p>
                   </div>
                 </div>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  const { t } = useLanguage();
  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-70">
      <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mb-4">
        <Sparkles className="h-8 w-8 text-foreground-2" />
      </div>
      <p className="text-foreground-2 font-medium">{t("publish.empty.title")}</p>
      <p className="text-sm text-muted mt-2 max-w-sm">{message}</p>
    </div>
  );
}
