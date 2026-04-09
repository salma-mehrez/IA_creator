"use client";

import { Plus, Calendar, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ActionGridProps {
  workspaceId: string;
}

export default function ActionGrid({ workspaceId }: ActionGridProps) {
  const actions = [
    {
      label: "Générer des idées",
      sub: "Basées sur votre niche",
      icon: Plus,
      href: `/dashboard/${workspaceId}/topics`,
    },
    {
      label: "Planifier le mois",
      sub: "4 semaines à remplir",
      icon: Calendar,
      href: `/dashboard/${workspaceId}/planning`,
    },
    {
      label: "Optimiser les titres",
      sub: "Améliorer le CTR",
      icon: Zap,
      href: `/dashboard/${workspaceId}/script`,
    },
    {
      label: "Résoudre blocages",
      sub: "2 vidéos en attente",
      icon: AlertTriangle,
      iconColor: "text-rose-500",
      href: `/dashboard/${workspaceId}/planning`,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
      {actions.map((action, idx) => (
        <Link 
          key={idx}
          href={action.href}
          className="bg-surface border border-border rounded-3xl p-4 flex items-center gap-4 hover:border-brand-border hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300">
            <action.icon className={cn("h-5 w-5 text-slate-500", action.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-foreground group-hover:text-brand transition-colors">{action.label}</p>
            <p className="text-[10px] text-subtle font-bold uppercase tracking-tight">{action.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
