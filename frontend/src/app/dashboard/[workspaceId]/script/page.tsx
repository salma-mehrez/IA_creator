"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
 FileText, Plus, Loader2, CheckCircle2, AlertTriangle,
 Wand2, ChevronRight, Clock, Copy, Save, ArrowLeft,
 Users, Target, BookOpen, Zap, Lightbulb, Mic, Flag,
 Sparkles, BarChart2, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

interface Video {
 id: number;
 title: string;
 status: string;
 script_plan?: string;
}

interface Scene {
 id?: number;
 order: number;
 section_name?: string;
 visual_description: string;
 audio_description: string;
 duration: number;
}

interface PlanItem {
 order: number;
 title: string;
 goal: string;
 estimated_duration: number;
}

interface GuidedBrief {
 age_group: string;
 script_language: string;
 style: string;
 key_points: string;
 hook_style: string;
 duration: number;
 research_facts: string;
 cta: string;
}

type Step = 1 | 2 | 3;

const STATUS_COLORS: Record<string, string> = {
 idea:"bg-surface-hover text-muted",
 scripted:"bg-blue-100 text-blue-600",
 recorded:"bg-amber-100 text-amber-600",
 edited:"bg-purple-100 text-purple-600",
 published:"bg-emerald-100 text-emerald-600",
};

export default function ScriptPage() {
 const { workspaceId } = useParams();
 const { language, t } = useLanguage();

 // Language-specific label helpers
 const STATUS_LABELS: Record<string, string> = {
  idea: t("planning.status.idea"),
  scripted: t("planning.status.scripted"),
  recorded: t("planning.status.recorded"),
  edited: t("planning.status.edited"),
  published: t("planning.status.published"),
 };


 const SCRIPT_LANGUAGES = ["Français", "English", "Español", "Deutsch", "Italiano", "العربية"];

 const HOOKS = language === "fr"
  ? ["Question choc","Statistique surprenante","Anecdote personnelle","Démonstration directe"]
  : language === "es"
  ? ["Pregunta impactante","Estadística sorprendente","Anécdota personal","Demostración directa"]
  : ["Shock Question","Surprising Statistic","Personal Anecdote","Direct Demo"];

 const STYLES = language === "fr"
  ? ["Critique", "Professionnel", "Informatif", "Divertissant", "Convaincant", "Pédagogique"]
  : language === "es"
  ? ["Crítico", "Profesional", "Informativo", "Entretenido", "Convincente", "Pedagógico"]
  : ["Critical", "Professional", "Informative", "Entertaining", "Convincing", "Pedagogical"];

 // UI labels
 const newScriptLabel = language === "fr" ? "Nouveau script" : language === "es" ? "Nuevo guion" : "New Script";
 const noProjectsLabel = language === "fr" ? "Aucun projet. Créez-en un pour commencer." : language === "es" ? "Sin proyectos. Crea uno para empezar." : "No projects. Create one to start.";
 const selectProjectLabel = language === "fr" ? "Sélectionne un projet" : language === "es" ? "Selecciona un proyecto" : "Select a Project";
 const selectProjectDesc = language === "fr" ? "Choisis un script dans la liste ou crée-en un nouveau" : language === "es" ? "Elige un guion de la lista o crea uno nuevo" : "Choose a script from the list or create a new one";
 const briefTitle = language === "fr" ? "Brief guidé" : language === "es" ? "Brief guiado" : "Guided Brief";
 const briefDesc = language === "fr" ? "Réponds à ces questions pour que l'IA génère la meilleure structure possible." : language === "es" ? "Responde estas preguntas para que la IA genere la mejor estructura posible." : "Answer these questions so the AI generates the best structure possible.";
 const ageGroupLabel = language === "fr" ? "Tranche d'âge ciblée" : language === "es" ? "Grupo de edad" : "Target Age Group";
 const scriptLanguageLabel = language === "fr" ? "Langue de génération" : language === "es" ? "Idioma de generación" : "Generation Language";
 const requiredLabel = language === "fr" ? "obligatoire" : language === "es" ? "obligatorio" : "required";
 const optionalLabel = language === "fr" ? "optionnel" : language === "es" ? "opcional" : "optional";
 const keyPointsLabel = language === "fr" ? "Points clés à couvrir" : language === "es" ? "Puntos clave a cubrir" : "Key Points to Cover";
 const hookLabel = language === "fr" ? "Style d'accroche" : language === "es" ? "Estilo de gancho" : "Hook Style";
 const durationLabel = language === "fr" ? "Durée cible" : language === "es" ? "Duración objetivo" : "Target Duration";
 const researchLabel = language === "fr" ? "Données & recherches" : language === "es" ? "Datos e investigación" : "Data & Research";
 const ctaLabel = language === "fr" ? "Appel à l'action (CTA)" : language === "es" ? "Llamada a la acción (CTA)" : "Call to Action (CTA)";
 const styleLabel = language === "fr" ? "Style / Ton" : language === "es" ? "Estilo / Tono" : "Style / Tone";
 const generateStructureBtn = language === "fr" ? "Générer la structure →" : language === "es" ? "Generar la estructura →" : "Generate Structure →";
 const generatingStructureLabel = language === "fr" ? "Génération de la structure..." : language === "es" ? "Generando la estructura..." : "Generating structure...";
 const structureTitle = language === "fr" ? "Structure du script" : language === "es" ? "Estructura del guion" : "Script Structure";
 const structureDesc = language === "fr" ? "Modifie ou valide la structure avant de générer le script complet." : language === "es" ? "Edita o valida la estructura antes de generar el guion completo." : "Edit or validate the structure before generating the full script.";
 const editBriefLabel = language === "fr" ? "Modifier le brief" : language === "es" ? "Editar el brief" : "Edit Brief";
 const sectionGoalPlaceholder = language === "fr" ? "Objectif de cette section..." : language === "es" ? "Objetivo de esta sección..." : "Section goal...";
 const regenerateLabel = language === "fr" ? "Régénérer" : language === "es" ? "Regenerar" : "Regenerate";
 const generateScriptBtn = language === "fr" ? "Générer le script complet →" : language === "es" ? "Generar el guion completo →" : "Generate Full Script →";
 const generatingScriptLabel = language === "fr" ? "Génération du script..." : language === "es" ? "Generando el guion..." : "Generating script...";
 const fullScriptTitle = language === "fr" ? "Script complet" : language === "es" ? "Guion completo" : "Full Script";
 const fullScriptDesc = language === "fr" ? "Modifie chaque scène directement dans l'éditeur." : language === "es" ? "Edita cada escena directamente en el editor." : "Edit each scene directly in the editor.";
 const viewStructureLabel = language === "fr" ? "Voir la structure" : language === "es" ? "Ver la estructura" : "View Structure";
 const noScriptLabel = language === "fr" ? "Aucun script généré" : language === "es" ? "Ningún guion generado" : "No script generated";
 const generateFromStructureLabel = language === "fr" ? "Générer depuis la structure →" : language === "es" ? "Generar desde la estructura →" : "Generate from Structure →";
 const createBriefLabel = language === "fr" ? "Créer le brief →" : language === "es" ? "Crear el brief →" : "Create Brief →";
 const visualLabel = language === "fr" ? "Montage / Visuel" : language === "es" ? "Montaje / Visual" : "Editing / Visual";
 const spokenScriptLabel = language === "fr" ? "Script — texte parlé" : language === "es" ? "Guion — texto hablado" : "Script — Spoken Text";
 const saveScriptLabel = language === "fr" ? "Sauvegarder le script" : language === "es" ? "Guardar el guion" : "Save Script";
 const newProjectTitle = language === "fr" ? "Nouveau projet de script" : language === "es" ? "Nuevo proyecto de guion" : "New Script Project";
 const videoTitleLabel = language === "fr" ? "Titre de la vidéo" : language === "es" ? "Título del vídeo" : "Video Title";
 const createLabel = language === "fr" ? "Créer" : language === "es" ? "Crear" : "Create";
 const copiedLabel = language === "fr" ? "Copié !" : language === "es" ? "Copiado!" : "Copied!";
 const copyLabel = language === "fr" ? "Copier" : language === "es" ? "Copiar" : "Copy";
 const wordsLabel = language === "fr" ? "mots" : language === "es" ? "palabras" : "words";
 const scenesLabel = language === "fr" ? "scènes" : language === "es" ? "escenas" : "scenes";
 const briefStepLabel = language === "fr" ? "Brief guidé" : language === "es" ? "Brief guiado" : "Guided Brief";
 const structureStepLabel = language === "fr" ? "Structure" : language === "es" ? "Estructura" : "Structure";
 const scriptStepLabel = language === "fr" ? "Script complet" : language === "es" ? "Guion completo" : "Full Script";
 const anglePlaceholder = language === "fr" ? "Ex: Pourquoi 90% des créateurs font cette erreur..." : language === "es" ? "Ej: Por qué el 90% de los creadores comete este error..." : "Ex: Why 90% of creators make this mistake...";
 const keyPointsPlaceholder = language === "fr" ? "Liste les 3 à 5 points essentiels de la vidéo..." : language === "es" ? "Lista los 3 a 5 puntos esenciales del vídeo..." : "List the 3 to 5 essential points of the video...";
 const researchPlaceholder = language === "fr" ? "Statistiques, études, faits précis à inclure dans la vidéo..." : language === "es" ? "Estadísticas, estudios, hechos precisos a incluir en el vídeo..." : "Statistics, studies, precise facts to include in the video...";
 const ctaPlaceholder = language === "fr" ? "Ex: S'abonner, rejoindre la newsletter, visiter un lien..." : language === "es" ? "Ej: Suscribirse, unirse al boletín, visitar un enlace..." : "Ex: Subscribe, join the newsletter, visit a link...";
 const sceneDefaultName = (i: number) => language === "fr" ? `Scène ${i}` : language === "es" ? `Escena ${i}` : `Scene ${i}`;
 const successScriptLabel = language === "fr" ? "Script généré avec succès !" : language === "es" ? "¡Guion generado con éxito!" : "Script generated successfully!";
 const savedLabel = language === "fr" ? "Script sauvegardé !" : language === "es" ? "¡Guion guardado!" : "Script saved!";
 const saveButtonLabel = language === "fr" ? "Sauvegarder" : language === "es" ? "Guardar" : "Save";

 const [videos, setVideos] = useState<Video[]>([]);
 const [selected, setSelected] = useState<Video | null>(null);
 const [scenes, setScenes] = useState<Scene[]>([]);
 const [plan, setPlan] = useState<PlanItem[]>([]);
 const [step, setStep] = useState<Step>(1);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [genPlan, setGenPlan] = useState(false);
 const [genScript, setGenScript] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");
 const [showModal, setShowModal] = useState(false);
 const [newTitle, setNewTitle] = useState("");
 const [copied, setCopied] = useState(false);

 const [brief, setBrief] = useState<GuidedBrief>({
  age_group: "",
  script_language: language === "fr" ? "Français" : language === "es" ? "Español" : "English",
  style: STYLES[1],
  key_points:"",
  hook_style: HOOKS[0],
  duration: 10,
  research_facts:"",
  cta:"",
 });

 const loadVideos = useCallback(async () => {
  setLoading(true);
  const res = await fetchApi(`/workspaces/${workspaceId}/planning-vids`);
  if (res.data) setVideos(res.data as Video[]);
  setLoading(false);
 }, [workspaceId]);

 useEffect(() => { loadVideos(); }, [loadVideos]);

 const handleSelect = async (video: Video) => {
  setSelected(video);
  setError("");
  setSuccess("");

  if (video.script_plan) {
   try { setPlan(JSON.parse(video.script_plan)); }
   catch { setPlan([]); }
  } else {
   setPlan([]);
  }

  const res = await fetchApi(`/videos/${video.id}/scenes`);
  const loadedScenes = (res.data as Scene[]) || [];
  setScenes(loadedScenes);

  if (loadedScenes.length > 0) setStep(3);
  else if (video.script_plan) setStep(2);
  else setStep(1);

  const wsRes = await fetchApi(`/workspaces/${workspaceId}`);
  if (wsRes.data) setBrief(prev => ({ ...prev, style: (wsRes.data as any).default_persona || STYLES[1] }));
 };

 const buildBriefText = () =>
 `Age Group: ${brief.age_group}\nLanguage: ${brief.script_language}\nStyle: ${brief.style}\nKey Points: ${brief.key_points}\nHook Style: ${brief.hook_style}\nCTA: ${brief.cta}`;

 const handleGeneratePlan = async () => {
  if (!selected) return;
  setGenPlan(true);
  setError("");
  const res = await fetchApi(`/videos/${selected.id}/plan`, {
   method:"POST",
   body: JSON.stringify({
    brief: buildBriefText(),
    duration_minutes: brief.duration,
    persona: brief.style,
    research_facts: brief.research_facts,
    language: brief.script_language,
   }),
  });
  if (res.error) { setError(res.error); }
  else {
   setPlan((res.data as any).plan as PlanItem[]);
   setStep(2);
  }
  setGenPlan(false);
 };

 const handleGenerateScript = async () => {
  if (!selected) return;
  setGenScript(true);
  setError("");
  const res = await fetchApi(`/videos/${selected.id}/generate-script`, {
   method:"POST",
   body: JSON.stringify({
    brief: buildBriefText(),
    duration_minutes: brief.duration,
    persona: brief.style,
    research_facts: brief.research_facts,
    language: brief.script_language,
   }),
  });
  if (res.error) { setError(res.error); }
  else {
   setScenes(res.data as Scene[]);
   setStep(3);
   setSuccess(successScriptLabel);
   setTimeout(() => setSuccess(""), 3000);
  }
  setGenScript(false);
 };

 const handleSave = async () => {
  if (!selected) return;
  setSaving(true);
  const res = await fetchApi(`/videos/${selected.id}/scenes`, {
   method:"POST",
   body: JSON.stringify(scenes),
  });
  if (!res.error) {
   setSuccess(savedLabel);
   setTimeout(() => setSuccess(""), 3000);
  } else setError(res.error);
  setSaving(false);
 };

 const handleCopy = () => {
  const text = scenes.map(s =>`## ${s.section_name || sceneDefaultName(s.order)}\n${s.audio_description}`).join("\n\n");
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
 };

 const updatePlan = (i: number, field: keyof PlanItem, value: any) => {
  const updated = [...plan];
  updated[i] = { ...updated[i], [field]: value };
  setPlan(updated);
 };

 const updateScene = (i: number, field: keyof Scene, value: any) => {
  const updated = [...scenes];
  updated[i] = { ...updated[i], [field]: value };
  setScenes(updated);
 };

 const handleCreate = async () => {
  if (!newTitle) return;
  setLoading(true);
  const res = await fetchApi(`/workspaces/${workspaceId}/videos/create`, {
   method:"POST",
   body: JSON.stringify({ title: newTitle, status:"idea", category:"Manual", viral_score: 50 }),
  });
  if (res.data) {
   const vid = res.data as Video;
   setVideos([vid, ...videos]);
   handleSelect(vid);
   setShowModal(false);
   setNewTitle("");
  }
  setLoading(false);
 };

 const totalWords = scenes.reduce((acc, s) => acc + (s.audio_description?.split(" ").length || 0), 0);
 const totalSec = scenes.reduce((acc, s) => acc + (s.duration || 0), 0);

 const canGoToStep = (n: number) => n < step || scenes.length > 0 || (n === 2 && plan.length > 0);

 // ── Script statistics ─────────────────────────────────────────────────
 const scriptText = scenes.map(s => s.audio_description || "").join("\n\n");
 const statWords = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
 const statChars = scriptText.length;
 const statSentences = scriptText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
 const statScenes = scenes.length;
 const readingTimeSec = Math.round((statWords / 238) * 60);
 const speakingTimeSec = Math.round((statWords / 130) * 60);
 const avgWps = statSentences > 0 ? statWords / statSentences : 0;
 const readingLevel =
   avgWps < 8  ? "Élémentaire" :
   avgWps < 12 ? "Collège" :
   avgWps < 17 ? "Lycée" :
   avgWps < 22 ? "Supérieur" : "Expert";
 const fmtTime = (s: number) => {
   const m = Math.floor(s / 60);
   const sec = s % 60;
   return m > 0 ? `${m} min${sec > 0 ? ` ${sec}s` : ""}` : `${sec}s`;
 };

 return (
  <div className="flex h-screen overflow-hidden bg-background font-sans">

   {/* Sidebar removed for simplicity */}

   {/* Main area */}
   <div className="flex-1 flex overflow-hidden min-w-0">
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
    {!selected ? (
     <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
      <div className="w-20 h-20 bg-brand-light rounded-[2rem] flex items-center justify-center mb-2">
       <FileText className="h-10 w-10 text-indigo-300" />
      </div>
      <div className="text-center mb-2">
       <h3 className="text-xl font-heading text-foreground-2 mb-2">{videos.length > 0 ? selectProjectLabel : noProjectsLabel}</h3>
       <p className="text-sm text-subtle">{selectProjectDesc}</p>
      </div>
      
      {videos.length > 0 && (
       <div className="w-full max-w-md space-y-2 mb-4 max-h-[300px] overflow-y-auto px-2">
        {videos.map(v => (
         <button
          key={v.id}
          onClick={() => handleSelect(v)}
          className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-brand-border transition-all text-left"
         >
          <span className="font-semibold text-sm truncate pr-4 text-foreground">{v.title}</span>
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0", STATUS_COLORS[v.status] || "bg-surface-hover text-muted")}>
           {STATUS_LABELS[v.status] || v.status}
          </span>
         </button>
        ))}
       </div>
      )}

      <button
       onClick={() => setShowModal(true)}
       className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-all"
      >
       <Plus className="h-4 w-4" /> {newScriptLabel}
      </button>
     </div>
    ) : (
     <>
      {/* Topbar */}
      <div className="px-8 py-4 bg-surface border-b border-border flex items-center justify-between">
       <div className="flex items-center gap-3 min-w-0">
        <select
         value={selected.id}
         onChange={(e) => {
          if (e.target.value === "NEW") {
            setShowModal(true);
          } else {
            const vid = videos.find(v => v.id === parseInt(e.target.value));
            if (vid) handleSelect(vid);
          }
         }}
         className="text-sm font-semibold text-foreground-2 bg-transparent focus:outline-none cursor-pointer max-w-sm truncate py-1"
        >
         {videos.map(v => (
          <option key={v.id} value={v.id} className="text-foreground">{v.title}</option>
         ))}
         <option value="NEW" className="font-bold text-brand bg-brand-light">＋ {newScriptLabel}</option>
        </select>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0", STATUS_COLORS[selected.status])}>
         {STATUS_LABELS[selected.status]}
        </span>
       </div>
       <div className="flex items-center gap-3">
        {error && <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium"><AlertTriangle className="h-3.5 w-3.5" />{error}</span>}
        {success && <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5" />{success}</span>}
        {step === 3 && scenes.length > 0 && (
         <>
          <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground-2 px-3 py-2 border border-border rounded-xl hover:bg-surface-secondary transition-all">
           <Copy className="h-3.5 w-3.5" /> {copied ? copiedLabel : copyLabel}
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
           {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
           {saveButtonLabel}
          </button>
         </>
        )}
       </div>
      </div>

      {/* Step indicator */}
      <div className="px-8 py-3 bg-surface-secondary border-b border-border flex items-center gap-2">
       {[
        { n: 1, label: briefStepLabel },
        { n: 2, label: structureStepLabel },
        { n: 3, label: scriptStepLabel },
       ].map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-2">
         <button
          onClick={() => canGoToStep(n) && setStep(n as Step)}
          className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
           step === n ?"bg-brand text-white shadow-sm":
           n < step ?"bg-brand-light text-brand hover:bg-indigo-200 cursor-pointer":
          "bg-stone-200 text-subtle cursor-default"
          )}
         >
          <span className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
           step === n ?"bg-surface text-brand":
           n < step ?"bg-indigo-200 text-brand-text":"bg-stone-300 text-muted"
          )}>
           {n < step ?"✓": n}
          </span>
          {label}
         </button>
         {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-subtle" />}
        </div>
       ))}

      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">

       {/* STEP 1: BRIEF */}
       {step === 1 && (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-7">

         {/* Age Group */}
         <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wide">
           <Users className="h-3.5 w-3.5 text-indigo-400" /> {ageGroupLabel}
          </label>
          <input
           type="text"
           value={brief.age_group}
           onChange={e => setBrief({ ...brief, age_group: e.target.value })}
           placeholder={language === "fr" ? "ex: 18-35 ans, 25+ ans, tous publics..." : language === "es" ? "ej: 18-35 años, 25+ años..." : "ex: 18-35 yrs, 25+ yrs..."}
           className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
          />
         </div>

         {/* Script Language */}
         <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wide">
           <Globe className="h-3.5 w-3.5 text-indigo-400" /> {scriptLanguageLabel}
          </label>
          <select
           value={brief.script_language}
           onChange={e => setBrief({ ...brief, script_language: e.target.value })}
           className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
          >
           {SCRIPT_LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
          </select>
         </div>

         {/* Angle condition removed as requested */}

         {/* Key Points */}
         <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wide">
           <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> {keyPointsLabel}
          </label>
          <textarea
           value={brief.key_points}
           onChange={e => setBrief({ ...brief, key_points: e.target.value })}
           placeholder={keyPointsPlaceholder}
           rows={3}
           className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
          />
         </div>

         {/* Hook */}
         <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wide">
           <Zap className="h-3.5 w-3.5 text-indigo-400" /> {hookLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
           {HOOKS.map(hook => (
            <button
             key={hook}
             onClick={() => setBrief({ ...brief, hook_style: hook })}
             className={cn(
             "px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left",
              brief.hook_style === hook
               ?"bg-brand text-white border-indigo-600"
               :"bg-surface text-muted border-border hover:border-brand-border hover:text-brand"
             )}
            >
             {hook}
            </button>
           ))}
          </div>
         </div>

         {/* Duration */}
         <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wide">
           <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-indigo-400" /> {durationLabel}</span>
           <span className="text-brand font-black normal-case tracking-normal text-sm">{brief.duration} min</span>
          </label>
          <input
           type="range" min={3} max={25} step={1}
           value={brief.duration}
           onChange={e => setBrief({ ...brief, duration: parseInt(e.target.value) })}
           className="w-full accent-[color:var(--brand)]"
          />
          <div className="flex justify-between text-[10px] text-subtle">
           <span>3 min</span><span>15 min</span><span>25 min</span>
          </div>
         </div>

         {/* Research */}
         <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wide">
           <Lightbulb className="h-3.5 w-3.5 text-indigo-400" /> {researchLabel}
           <span className="text-subtle font-normal normal-case tracking-normal text-[10px]">{optionalLabel}</span>
          </label>
          <textarea
           value={brief.research_facts}
           onChange={e => setBrief({ ...brief, research_facts: e.target.value })}
           placeholder={researchPlaceholder}
           rows={3}
           className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all resize-none"
          />
         </div>

         {/* CTA */}
         <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wide">
           <Flag className="h-3.5 w-3.5 text-indigo-400" /> {ctaLabel}
          </label>
          <input
           type="text"
           value={brief.cta}
           onChange={e => setBrief({ ...brief, cta: e.target.value })}
           placeholder={ctaPlaceholder}
           className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
          />
         </div>

         {/* Style */}
         <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wide">
           <Mic className="h-3.5 w-3.5 text-indigo-400" /> {styleLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
           {STYLES.map(p => (
            <button
             key={p}
             onClick={() => setBrief({ ...brief, style: p })}
             className={cn(
             "px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
              brief.style === p ?"bg-brand text-white border-indigo-600":"bg-surface text-muted border-border hover:border-brand-border hover:text-brand"
             )}
            >
             {p}
            </button>
           ))}
          </div>
         </div>

         <button
          onClick={handleGeneratePlan}
          disabled={genPlan}
          className="w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-100"
         >
          {genPlan ? (
           <><Loader2 className="h-5 w-5 animate-spin" /> {generatingStructureLabel}</>
          ) : (
           <><Wand2 className="h-5 w-5" /> {generateStructureBtn}</>
          )}
         </button>
        </div>
       )}

       {/* STEP 2: PLAN */}
       {step === 2 && (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

         <div className="space-y-2">
          {plan.map((item, i) => (
           <div key={i} className="group py-3 px-2 border-b border-border/40 last:border-0 hover:bg-surface-secondary/30 transition-colors">
            <div className="flex items-start gap-3">
             <div className="text-brand text-sm font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.order}.
             </div>
             <div className="flex-1 space-y-1">
              <input
               value={item.title}
               onChange={e => updatePlan(i,"title", e.target.value)}
               className="w-full text-sm font-semibold text-foreground bg-transparent focus:outline-none hover:bg-surface-secondary/50 focus:bg-surface-secondary focus:px-2 focus:-mx-2 rounded-lg transition-all"
              />
              <input
               value={item.goal}
               onChange={e => updatePlan(i,"goal", e.target.value)}
               className="w-full text-xs text-subtle bg-transparent focus:outline-none hover:bg-surface-secondary/50 focus:bg-surface-secondary focus:px-2 focus:-mx-2 rounded-lg transition-all placeholder-subtle/50"
               placeholder={sectionGoalPlaceholder}
              />
             </div>
             <div className="flex items-center gap-1.5 text-xs text-subtle flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
              <Clock className="h-3 w-3" />
              <span>{Math.round(item.estimated_duration / 60 * 10) / 10}m</span>
             </div>
            </div>
           </div>
          ))}
         </div>

         <div className="flex gap-3">
          <button
           onClick={handleGeneratePlan}
           disabled={genPlan}
           className="flex items-center gap-2 px-5 py-3 border border-border text-muted font-semibold text-sm rounded-xl hover:border-brand-border hover:text-brand transition-all disabled:opacity-50"
          >
           <Sparkles className="h-4 w-4" /> {regenerateLabel}
          </button>
          <button
           onClick={handleGenerateScript}
           disabled={genScript}
           className="flex-1 flex items-center justify-center gap-3 bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
           {genScript ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {generatingScriptLabel}</>
           ) : (
            <><Wand2 className="h-4 w-4" /> {generateScriptBtn}</>
           )}
          </button>
         </div>
        </div>
       )}

       {/* STEP 3: SCRIPT */}
       {step === 3 && (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">

         {scenes.length === 0 ? (
          <div className="text-center py-12">
           <p className="text-subtle mb-4">{noScriptLabel}</p>
           <button onClick={() => setStep(plan.length > 0 ? 2 : 1)} className="text-brand font-semibold text-sm hover:underline">
            {plan.length > 0 ? generateFromStructureLabel : createBriefLabel}
           </button>
          </div>
         ) : scenes.map((scene, i) => (
          <div key={i} className="py-8 border-b border-border/40 last:border-0 px-2 group transition-colors hover:bg-surface-secondary/10">
           <div className="flex items-center gap-3 mb-5 px-2">
            <div className="text-brand text-sm font-semibold flex items-center justify-center flex-shrink-0">
             #{i + 1}
            </div>
            <input
             value={scene.section_name || sceneDefaultName(i + 1)}
             onChange={e => updateScene(i,"section_name", e.target.value)}
             className="flex-1 text-sm font-semibold text-foreground bg-transparent focus:outline-none placeholder-subtle"
             placeholder="Titre de la scène..."
            />
            <div className="flex items-center gap-1.5 text-xs text-subtle opacity-40 group-hover:opacity-100 transition-opacity">
             <Clock className="h-3.5 w-3.5" />
             <input
              type="number"
              value={scene.duration}
              onChange={e => updateScene(i,"duration", parseInt(e.target.value) || 0)}
              className="w-10 bg-transparent text-right focus:outline-none"
             />
             <span>s</span>
            </div>
           </div>
           <div className="space-y-6 px-2">
            {scene.visual_description && (
             <div className="pl-4 border-l-2 border-border-subtle/50">
              <p className="text-xs font-medium text-subtle mb-2 opacity-70">{visualLabel}</p>
              <textarea
               value={scene.visual_description}
               onChange={e => updateScene(i,"visual_description", e.target.value)}
               onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
               }}
               ref={(el) => {
                if (el) {
                 el.style.height = 'auto';
                 el.style.height = `${el.scrollHeight}px`;
                }
               }}
               rows={1}
               style={{ fontFamily: 'Georgia, serif', overflow: 'hidden' }}
               className="w-full text-sm text-subtle bg-transparent focus:bg-surface-secondary/40 hover:bg-surface-secondary/20 rounded-lg p-2 -ml-2 focus:outline-none resize-none transition-colors border border-transparent focus:border-border-subtle placeholder-subtle/50"
              />
             </div>
            )}
            <div className="pl-4 border-l-[3px] border-indigo-400/30">
             <p className="text-[11px] font-semibold text-indigo-400 mb-2">{spokenScriptLabel}</p>
             <textarea
              value={scene.audio_description}
              onChange={e => updateScene(i,"audio_description", e.target.value)}
              onInput={(e) => {
               const target = e.target as HTMLTextAreaElement;
               target.style.height = 'auto';
               target.style.height = `${target.scrollHeight}px`;
              }}
              ref={(el) => {
               if (el) {
                el.style.height = 'auto';
                el.style.height = `${el.scrollHeight}px`;
               }
              }}
              rows={1}
              style={{ fontFamily: 'Georgia, serif', overflow: 'hidden' }}
              className="w-full text-lg text-foreground leading-loose bg-transparent focus:bg-surface hover:bg-surface-secondary/30 rounded-xl p-3 -ml-3 focus:outline-none resize-none transition-colors border border-transparent focus:border-indigo-400/20 shadow-none"
             />
            </div>
           </div>
          </div>
         ))}

         {scenes.length > 0 && (
          <button
           onClick={handleSave}
           disabled={saving}
           className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
           {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
           {saveScriptLabel}
          </button>
         )}
        </div>
       )}

      </div>
     </>
    )}
   </div>

   {/* Script Stats Panel */}
   {selected && (
    <div className="w-[220px] flex-shrink-0 border-l border-border bg-surface flex flex-col overflow-hidden">
     <div className="px-4 py-3 border-b border-border flex items-center gap-2 flex-shrink-0">
      <BarChart2 className="h-3.5 w-3.5 text-subtle" />
      <span className="text-[10px] font-black uppercase tracking-widest text-subtle">Détails</span>
     </div>
     <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-0.5">
       {[
        { label: "Mots",        value: statWords.toLocaleString("fr-FR") },
        { label: "Caractères",  value: statChars.toLocaleString("fr-FR") },
        { label: "Phrases",     value: statSentences.toLocaleString("fr-FR") },
        { label: "Scènes",      value: statScenes.toLocaleString("fr-FR") },
       ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
         <span className="text-xs text-muted">{label}</span>
         <span className="text-xs font-black text-foreground bg-surface-hover px-2 py-0.5 rounded-lg">{value}</span>
        </div>
       ))}
      </div>

      <div className="mt-4 py-2.5 border-b border-border-subtle">
       <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Niveau de lecture</span>
       </div>
       <div className="mt-1.5 text-[10px] font-black text-foreground-2 bg-surface-secondary border border-border px-2.5 py-1.5 rounded-lg text-center">
        {readingLevel}
       </div>
      </div>

      <div className="mt-4 space-y-3">
       <p className="text-[9px] font-black uppercase tracking-widest text-subtle">Temps estimés</p>
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
         <BookOpen className="h-3 w-3 text-subtle" />
         <span className="text-xs text-muted">Lecture</span>
        </div>
        <span className="text-xs font-black text-foreground">{fmtTime(readingTimeSec)}</span>
       </div>
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
         <Mic className="h-3 w-3 text-subtle" />
         <span className="text-xs text-muted">Prise de parole</span>
        </div>
        <span className="text-xs font-black text-foreground">{fmtTime(speakingTimeSec)}</span>
       </div>
      </div>
     </div>
    </div>
   )}
   </div>

   {/* Modal: New video */}
   {showModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
     <div className="bg-surface rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-lg font-heading text-foreground mb-6">{newProjectTitle}</h3>
      <div className="space-y-2">
       <label className="text-xs font-bold text-muted uppercase tracking-wide">{videoTitleLabel}</label>
       <input
        type="text"
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
        onKeyDown={e => e.key ==="Enter" && handleCreate()}
        placeholder={t("script.modal.video_title_placeholder")}
        className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
        autoFocus
       />
      </div>
      <div className="flex gap-3 mt-6">
       <button
        onClick={handleCreate}
        disabled={!newTitle || loading}
        className="flex-1 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
       >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {createLabel}
       </button>
       <button
        onClick={() => { setShowModal(false); setNewTitle(""); }}
        className="px-6 py-3 border border-border text-muted hover:text-foreground rounded-xl font-semibold text-sm transition-all"
       >
        {t("common.cancel")}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
