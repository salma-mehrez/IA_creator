"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, Sparkles, Loader2, Trash2, Tv, AlertTriangle, Rocket } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Workspace {
 id: number;
 name: string;
 niche: string;
 channel_url?: string;
 channel_profile_image?: string;
 channel_banner_image?: string;
}

function WorkspaceCard({ ws, onDelete, openLabel, deleteLabel, confirmLabel, yesLabel, noLabel }:
 { ws: Workspace; onDelete: (id: number) => void; openLabel: string; deleteLabel: string; confirmLabel: string; yesLabel: string; noLabel: string }) {
 const [confirmDelete, setConfirmDelete] = useState(false);

 return (
  <div className="group relative bg-surface border border-border rounded-3xl overflow-hidden hover:border-brand-border hover:shadow-lg transition-all duration-300 flex flex-col">
   {/* Banner */}
   <div className="h-24 w-full relative overflow-hidden">
    {ws.channel_banner_image ? (
     <img src={ws.channel_banner_image} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
    ) : (
     <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-violet-50 to-sky-100 dark:from-indigo-950 dark:via-violet-950 dark:to-slate-900" />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-surface/70 to-transparent" />

    {/* Delete zone */}
    <div className="absolute top-3 right-3 z-10">
     {confirmDelete ? (
      <div className="flex items-center gap-1.5 bg-surface/95 backdrop-blur-sm border border-danger-border rounded-xl p-1.5 shadow-sm animate-in fade-in duration-150">
       <span className="text-[10px] font-bold text-danger px-1">{confirmLabel}</span>
       <button onClick={() => onDelete(ws.id)} className="px-2 py-1 bg-danger text-white rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity">
        {yesLabel}
       </button>
       <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 bg-surface-secondary text-muted rounded-lg text-[10px] font-bold hover:bg-surface-hover transition-colors">
        {noLabel}
       </button>
      </div>
     ) : (
      <button
       onClick={() => setConfirmDelete(true)}
       className="p-1.5 bg-surface/90 backdrop-blur-sm text-subtle hover:text-danger rounded-xl border border-border transition-all shadow-sm opacity-0 group-hover:opacity-100"
      >
       <Trash2 className="h-3.5 w-3.5" />
      </button>
     )}
    </div>
   </div>

   {/* Content */}
   <div className="px-6 pb-6 -mt-7 relative z-10 flex flex-col flex-1">
    <div className="w-14 h-14 bg-surface rounded-2xl border-2 border-border flex items-center justify-center mb-3 overflow-hidden shadow-md">
     {ws.channel_profile_image ? (
      <img src={ws.channel_profile_image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={ws.name} />
     ) : (
      <Tv className="h-6 w-6 text-brand" />
     )}
    </div>

    <h3 className="text-base font-bold text-foreground mb-5 tracking-tight group-hover:text-brand transition-colors line-clamp-1">
     {ws.name}
    </h3>

    <div className="mt-auto">
     <div className="flex items-center justify-between mt-auto">
      <Link href={`/dashboard/${ws.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors group/link">
       {openLabel}
       <ArrowUpRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
      </Link>
      
      <Link 
        href={`/dashboard/${ws.id}/publish`} 
        className="w-8 h-8 rounded-xl bg-brand/5 text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-all shadow-sm border border-brand/10 group/pub"
        title="Direct Publish Toolkit"
      >
        <Rocket className="h-4 w-4" />
      </Link>
     </div>
    </div>
   </div>
  </div>
 );
}

export default function DashboardPage() {
 const { t, language } = useLanguage();
 const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [isAdding, setIsAdding] = useState(false);
 const [newWorkspace, setNewWorkspace] = useState({ name:"", niche:"", channel_url:""});
 const [isSubmitting, setIsSubmitting] = useState(false);

 const loadWorkspaces = async () => {
  setLoading(true);
  const response = await fetchApi("/workspaces");
  if (response.error) { setError(response.error); }
  else { setWorkspaces((response.data as Workspace[]) || []); }
  setLoading(false);
 };

 useEffect(() => { loadWorkspaces(); }, []);

 const handleAddWorkspace = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newWorkspace.name) return;
  setIsSubmitting(true);
  setError("");
  const response = await fetchApi("/workspaces", {
   method:"POST",
   body: JSON.stringify(newWorkspace),
  });
  if (response.error) { setError(response.error); }
  else {
   setNewWorkspace({ name:"", niche:"", channel_url:""});
   setIsAdding(false);
   loadWorkspaces();
  }
  setIsSubmitting(false);
 };

 const handleDelete = async (id: number) => {
  await fetchApi(`/workspaces/${id}`, { method:"DELETE"});
  loadWorkspaces();
 };

 const addChannelLabel = t("dash.common.add_channel");
 const connectNewLabel = t("dash.common.connect_new");
 const newChannelLabel = t("dash.common.new_channel_title");
 const yesLabel = t("dash.common.yes");
 const noLabel = t("dash.common.no");
 const deleteConfirmLabel = t("dash.common.confirm_delete");

 return (
  <div className="flex flex-col h-full bg-background font-sans">
   {/* Header */}
   <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-30 shadow-sm">
    <div>
     <h1 className="text-2xl font-heading text-foreground tracking-tight flex items-center gap-2.5">
      <Sparkles className="h-5 w-5 text-brand" />
      {t("dashboard.title")}
     </h1>
     <p className="text-xs text-subtle mt-0.5">{t("dashboard.subtitle")}</p>
    </div>
    <button
     onClick={() => setIsAdding(!isAdding)}
     className={cn(
     "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95",
      isAdding
       ?"bg-surface-secondary text-foreground-2 border border-border hover:bg-surface-hover"
       :"bg-brand hover:bg-brand-hover text-white"
     )}
    >
     <Plus className={cn("h-4 w-4 transition-transform duration-200", isAdding && "rotate-45")} />
     {isAdding ? t("common.cancel") : t("dashboard.add")}
    </button>
   </header>

   <div className="flex-1 p-8 space-y-6 overflow-y-auto">
    {error && (
     <div className="bg-danger-bg border border-danger-border text-danger p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      {error}
     </div>
    )}

    {/* Add form */}
    {isAdding && (
     <div className="bg-surface border border-border rounded-3xl p-7 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
       <div className="w-6 h-6 bg-brand-light rounded-lg flex items-center justify-center">
        <Plus className="h-3.5 w-3.5 text-brand" />
       </div>
       {newChannelLabel}
      </h2>
      <form onSubmit={handleAddWorkspace} className="flex flex-col gap-5">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
         <label className="text-xs font-bold text-subtle uppercase tracking-wide">
          {t("dashboard.form.name")} <span className="text-danger">*</span>
         </label>
         <input
          type="text"
          placeholder={t("dashboard.form.name_placeholder")}
          className="input-base"
          value={newWorkspace.name}
          onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
          required
          autoFocus
         />
        </div>
        <div className="space-y-1.5">
         <label className="text-xs font-bold text-subtle uppercase tracking-wide">{t("dashboard.form.niche")}</label>
         <input
          type="text"
          placeholder={t("dashboard.form.niche_placeholder")}
          className="input-base"
          value={newWorkspace.niche}
          onChange={(e) => setNewWorkspace({ ...newWorkspace, niche: e.target.value })}
         />
        </div>
       </div>

       <div className="space-y-1.5">
        <label className="text-xs font-bold text-subtle uppercase tracking-wide">{t("dashboard.form.url")}</label>
        <input
         type="text"
         placeholder="Ex: https://youtube.com/@yourhandle"
         className="input-base font-mono text-xs"
         value={newWorkspace.channel_url}
         onChange={(e) => setNewWorkspace({ ...newWorkspace, channel_url: e.target.value })}
        />
        <p className="text-xs text-subtle">{t("dashboard.form.url_desc")}</p>
       </div>

       <div className="flex gap-3 pt-2 border-t border-border-subtle">
        <button
         type="submit"
         disabled={isSubmitting}
         className="flex-1 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
         {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("dashboard.form.submit")}
        </button>
        <button
         type="button"
         onClick={() => setIsAdding(false)}
         className="px-6 py-3 border border-border text-muted hover:text-foreground hover:border-border-strong rounded-xl font-semibold text-sm transition-all bg-surface"
        >
         {t("common.cancel")}
        </button>
       </div>
      </form>
     </div>
    )}

    {/* Grid */}
    {loading ? (
     <div className="py-24 flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
      <p className="text-subtle text-sm">{t("common.loading")}</p>
     </div>
    ) : workspaces.length === 0 ? (
     <div className="bg-surface border-2 border-dashed border-border rounded-3xl py-24 flex flex-col items-center text-center px-6">
      <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mb-6">
       <Tv className="h-8 w-8 text-brand" />
      </div>
      <h3 className="text-xl font-heading text-foreground mb-2">{t("dashboard.empty.title")}</h3>
      <p className="text-subtle max-w-sm mb-8 leading-relaxed text-sm">{t("dashboard.empty.desc")}</p>
      <button
       onClick={() => setIsAdding(true)}
       className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
      >
       <Plus className="h-4 w-4" />
       {t("dashboard.empty.button")}
      </button>
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {workspaces.map((ws) => (
       <WorkspaceCard
        key={ws.id}
        ws={ws}
        onDelete={handleDelete}
        openLabel={t("dashboard.card.open")}
        deleteLabel={t("common.delete")}
        confirmLabel={deleteConfirmLabel}
        yesLabel={yesLabel}
        noLabel={noLabel}
       />
      ))}

      {/* Add card */}
      <button
       onClick={() => setIsAdding(true)}
       className="group bg-surface border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-brand-border hover:bg-brand-light/30 transition-all duration-300 min-h-[180px]"
      >
       <div className="w-12 h-12 bg-surface-secondary group-hover:bg-brand-light rounded-2xl flex items-center justify-center transition-colors">
        <Plus className="h-6 w-6 text-subtle group-hover:text-brand transition-colors" />
       </div>
       <div className="text-center">
        <p className="text-sm font-semibold text-muted group-hover:text-brand transition-colors">{addChannelLabel}</p>
        <p className="text-xs text-subtle mt-0.5">{connectNewLabel}</p>
       </div>
      </button>
     </div>
    )}
   </div>
  </div>
 );
}
