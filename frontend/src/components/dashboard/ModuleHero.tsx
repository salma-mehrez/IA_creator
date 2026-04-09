"use client";

import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ModuleHeroProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  colorClass: string;
  iconColor: string;
  onClick?: () => void;
}

export default function ModuleHero({ title, description, icon: Icon, href, colorClass, iconColor, onClick }: ModuleHeroProps) {
  const inner = (
    <>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", colorClass)}>
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black text-foreground tracking-tight group-hover:text-brand transition-colors">{title}</h3>
        <p className="text-[10px] text-subtle font-medium leading-tight line-clamp-1 mt-0.5">
          {description}
        </p>
      </div>

      <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
        <ArrowRight className="h-4 w-4 text-brand" />
      </div>
    </>
  );

  const className = cn(
    "group relative overflow-hidden rounded-[1.5rem] p-4 border border-border bg-surface hover:border-brand-border transition-all duration-300 shadow-sm flex items-center gap-4",
    onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
  );

  if (onClick) {
    return (
      <div onClick={onClick} className={className}>
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
