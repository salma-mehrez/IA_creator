"use client";

import { Video, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PipelineProject {
  id: number;
  title: string;
  status: string;
  is_blocked: bool;
}

interface PipelineManagerProps {
  current: number;
  total: number;
  blockedCount: number;
  projects: PipelineProject[];
}

export default function PipelineManager({ current, total, blockedCount, projects }: PipelineManagerProps) {
  const progress = (current / total) * 100;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "published": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "edited": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "recorded": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "scripted": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "idea": default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published": return "Publié";
      case "edited": return "Monté";
      case "recorded": return "Enregistré";
      case "scripted": return "Scripté";
      case "idea": default: return "Idée";
    }
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm group hover:border-brand-border transition-all h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Pipeline de contenu</h3>
                <p className="text-[10px] text-subtle font-bold">PIPELINE ACTUALISÉ</p>
            </div>
        </div>
        <button className="text-xs font-black text-muted hover:text-brand transition-colors p-2 bg-surface-secondary border border-border rounded-xl">
           Planning ↗
        </button>
      </div>

      {/* Goal Progress */}
      <div className="mb-10 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-muted">Objectif mensuel</span>
            <span className="text-foreground">{current} / {total} vidéos</span>
        </div>
        <div className="h-3 w-full bg-surface-secondary rounded-full overflow-hidden border border-border-subtle">
           <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/20"
            style={{ width: `${progress}%` }}
           />
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center gap-4 group/item">
            <div className={cn(
                "px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest w-20 text-center flex-shrink-0",
                getStatusStyle(project.status)
            )}>
                {getStatusLabel(project.status)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover/item:text-brand transition-colors">
                    {project.title}
                </p>
                {project.is_blocked && (
                    <div className="flex items-center gap-1 mt-0.5">
                        <AlertCircle className="h-2.5 w-2.5 text-rose-500" />
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Bloqué</span>
                    </div>
                )}
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-border opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border-subtle">
        <div className="text-center">
            <p className="text-xl font-black text-foreground leading-none">{current}</p>
            <p className="text-[9px] font-black text-subtle uppercase tracking-widest mt-1">En cours</p>
        </div>
        <div className="text-center">
            <p className={cn("text-xl font-black leading-none", blockedCount > 0 ? "text-rose-500 animate-pulse" : "text-foreground")}>{blockedCount}</p>
            <p className="text-[9px] font-black text-subtle uppercase tracking-widest mt-1">Bloquées</p>
        </div>
      </div>
    </div>
  );
}
