"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Save, Loader2, CheckCircle2, AlertTriangle, Type, FileText, Target, Mic } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export default function SettingsPage() {
 const { workspaceId } = useParams();
 const { t, language } = useLanguage();
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState("");

 const [formData, setFormData] = useState({
  name:"",
  niche:"",
  default_persona:"Expert",
  reference_transcript:"",
 });

 useEffect(() => {
  fetchApi(`/workspaces/${workspaceId}`).then(res => {
   if (res.data) {
    const w = res.data as any;
    setFormData({
     name: w.name ||"",
     niche: w.niche ||"",
     default_persona: w.default_persona ||"Expert",
     reference_transcript: w.reference_transcript ||"",
    });
   }
   setLoading(false);
  });
 }, [workspaceId]);

 const handleSave = async () => {
  setSaving(true);
  setError("");
  setSaved(false);
  const res = await fetchApi(`/workspaces/${workspaceId}`, {
   method:"PATCH",
   body: JSON.stringify(formData),
  });
  if (res.error) {
   setError(res.error);
  } else {
   setSaved(true);
   setTimeout(() => setSaved(false), 3000);
  }
  setSaving(false);
 };

 if (loading) {
  return (
   <div className="flex-1 flex items-center justify-center h-full bg-background">
    <Loader2 className="h-8 w-8 text-brand animate-spin" />
   </div>
  );
 }

 return (
  <div className="flex flex-col min-h-full bg-background font-sans">

   {/* Header */}
   <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-30 shadow-sm">
    <div>
     <h1 className="text-2xl font-heading text-foreground tracking-tight">{t("settings.title")}</h1>
     <p className="text-xs text-subtle mt-0.5">{t("settings.channel")}</p>
    </div>
    <div className="flex items-center gap-3">
     {saved && (
      <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in duration-200">
       <CheckCircle2 className="h-4 w-4" /> {t("settings.saved")}
      </span>
     )}
     {error && (
      <span className="flex items-center gap-1.5 text-xs text-danger font-medium">
       <AlertTriangle className="h-4 w-4" /> {error}
      </span>
     )}
     <button
      onClick={handleSave}
      disabled={saving}
      className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
     >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {t("settings.save")}
     </button>
    </div>
   </header>

   {/* Content */}
   <div className="flex-1 p-8">
    <div className="max-w-5xl mx-auto space-y-6">

     {/* Identity */}
     <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="px-7 py-5 border-b border-border-subtle flex items-center gap-3">
       <div className="w-8 h-8 bg-brand-light rounded-xl flex items-center justify-center">
        <Type className="h-4 w-4 text-brand" />
       </div>
       <div>
        <h2 className="text-sm font-bold text-foreground">{t("settings.channel")}</h2>
        <p className="text-xs text-subtle">{t("settings.channel_name")} & {t("settings.niche")}</p>
       </div>
      </div>
      <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="space-y-1.5">
        <label className="text-xs font-bold text-subtle uppercase tracking-wide">{t("settings.channel_name")}</label>
        <input
         type="text"
         value={formData.name}
         onChange={e => setFormData({ ...formData, name: e.target.value })}
         placeholder="Ex: Tech With John"
         className="input-base"
        />
       </div>
       <div className="space-y-1.5">
        <label className="text-xs font-bold text-subtle uppercase tracking-wide flex items-center gap-1.5">
         <Target className="h-3.5 w-3.5 text-brand" /> {t("settings.niche")}
        </label>
        <input
         type="text"
         value={formData.niche}
         onChange={e => setFormData({ ...formData, niche: e.target.value })}
         placeholder="Ex: Entrepreneurship, Gaming, Fitness..."
         className="input-base"
        />
       </div>
      </div>
     </div>

     {/* Reference Transcript */}
     <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="px-7 py-5 border-b border-border-subtle flex items-center justify-between">
       <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-light rounded-xl flex items-center justify-center">
         <FileText className="h-4 w-4 text-brand" />
        </div>
        <div>
         <h2 className="text-sm font-bold text-foreground">{t("script.research_anchor")}</h2>
         <p className="text-xs text-subtle">{t("script.ai_disclaimer")}</p>
        </div>
       </div>
       <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand-light border border-brand-border px-2.5 py-1 rounded-full">
        {language === "fr" ? "Avancé" : language === "es" ? "Avanzado" : "Advanced"}
       </span>
      </div>
      <div className="p-7">
       <textarea
        value={formData.reference_transcript}
        onChange={e => setFormData({ ...formData, reference_transcript: e.target.value })}
        placeholder={t("script.research_placeholder")}
        rows={10}
        className="input-base font-mono text-xs leading-relaxed resize-none"
       />
       <div className="mt-4 flex items-start gap-3 p-4 bg-info-bg border border-info-border rounded-2xl">
        <CheckCircle2 className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
        <div>
         <p className="text-xs font-bold text-info mb-0.5">{t("script.research")}</p>
         <p className="text-xs text-foreground-2 leading-relaxed opacity-80">
          {t("script.ai_disclaimer")}
         </p>
        </div>
       </div>
      </div>
     </div>

     {/* Save bottom */}
     <div className="flex justify-end pb-8">
      <button
       onClick={handleSave}
       disabled={saving}
       className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
      >
       {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
       {t("settings.save")}
      </button>
     </div>
    </div>
   </div>
  </div>
 );
}
