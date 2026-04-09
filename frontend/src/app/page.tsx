"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import {
 Sparkles, FileText, Zap, BarChart3, Lightbulb,
 Calendar, Coins, Rocket, ArrowRight, Target,
 Plus, Minus
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
 const { t } = useLanguage();

 return (
  <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
   <Navbar />

   {/* Hero */}
   <section className="relative pt-36 pb-28 overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
     <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/50 dark:bg-indigo-950/30 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4" />
     <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-100/40 dark:bg-violet-950/20 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
    </div>

    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-light border border-brand-border text-brand text-xs font-semibold mb-8">
      <Sparkles className="h-3.5 w-3.5" />
      <span>{t("landing.hero.badge")}</span>
     </div>

     <h1 className="text-5xl md:text-8xl font-heading tracking-tighter mb-8 max-w-5xl mx-auto leading-[0.95] text-slate-900 dark:text-white drop-shadow-sm font-black italic-none">
      {t("landing.hero.title_p1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">{t("landing.hero.title_p2")}</span>
     </h1>

     <p className="text-xl md:text-2xl text-muted mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
      {t("landing.hero.subtitle")}
     </p>

     <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
      <Link
       href="/register"
       className="bg-brand hover:bg-brand-hover text-white px-9 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center gap-3 group active:scale-95 shadow-lg"
      >
       {t("landing.hero.cta")}
       <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Link>
     </div>

     {/* Stats */}
     <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto py-12 border-y border-border bg-surface/70 backdrop-blur-sm rounded-3xl px-10 shadow-sm">
      {[
       { num:"3", label: t("landing.stats.levels")},
       { num:"4", label: t("landing.stats.modules")},
       { num:"∞", label: t("landing.stats.channels")},
      ].map(({ num, label }) => (
       <div key={label} className={cn("flex flex-col items-center", num ==="∞"&&"col-span-2 md:col-span-1")}>
        <div className="text-5xl md:text-6xl font-heading text-brand mb-2">{num}</div>
        <div className="text-[10px] md:text-xs text-subtle uppercase tracking-[0.25em] font-bold">{label}</div>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* Présentation */}
   <section id="presentation" className="py-28 bg-surface border-y border-border">
    <div className="max-w-7xl mx-auto px-6">
     <div className="flex flex-col md:flex-row gap-20 items-center">
      <div className="flex-1">
       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light border border-brand-border text-brand text-xs font-semibold mb-6">
        <Zap className="h-3 w-3" />
        {t("landing.presentation.badge")}
       </div>
       <h2 className="text-4xl md:text-5xl font-heading mb-6 leading-tight text-foreground">
        {t("landing.presentation.title")}
       </h2>
       <p className="text-muted text-lg mb-10 leading-relaxed">
        {t("landing.presentation.subtitle")}
       </p>
       <div className="grid gap-6">
        <OpportunityItem icon={<Zap className="text-brand" />} title={t("landing.presentation.item1.title")} desc={t("landing.presentation.item1.desc")} />
        <OpportunityItem icon={<Target className="text-violet-500" />} title={t("landing.presentation.item2.title")} desc={t("landing.presentation.item2.desc")} />
        <OpportunityItem icon={<Rocket className="text-emerald-500" />} title={t("landing.presentation.item3.title")} desc={t("landing.presentation.item3.desc")} />
       </div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
       {[
        { icon: <Coins className="h-9 w-9 text-amber-500" />, title: t("landing.presentation.card1.title"), desc: t("landing.presentation.card1.desc")},
        { icon: <BarChart3 className="h-9 w-9 text-brand" />, title: t("landing.presentation.card2.title"), desc: t("landing.presentation.card2.desc"), offset: true },
       ].map(({ icon, title, desc, offset }) => (
        <div key={title} className={cn("bg-background p-8 rounded-3xl border border-border space-y-4 hover:border-brand-border hover:shadow-md transition-all group", offset &&"sm:mt-10")}>
         {icon}
         <h4 className="text-xl font-heading text-foreground">{title}</h4>
         <p className="text-muted text-sm leading-relaxed">{desc}</p>
        </div>
       ))}
      </div>
     </div>
    </div>
   </section>

   {/* Modules */}
   <section id="modules" className="py-28 bg-background">
    <div className="max-w-7xl mx-auto px-6">
     <div className="text-center mb-20">
      <h2 className="text-4xl md:text-6xl font-heading mb-4 text-foreground">{t("landing.modules.title")}</h2>
      <p className="text-muted max-w-xl mx-auto text-base font-medium">{t("landing.modules.subtitle")}</p>
     </div>
     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ModuleCard num="01" icon={<BarChart3 />} title={t("landing.modules.m1.title")} desc={t("landing.modules.m1.desc")} accent="indigo" />
      <ModuleCard num="02" icon={<Lightbulb />} title={t("landing.modules.m2.title")} desc={t("landing.modules.m2.desc")} accent="violet" />
      <ModuleCard num="03" icon={<FileText />} title={t("landing.modules.m3.title")} desc={t("landing.modules.m3.desc")} accent="blue" />
      <ModuleCard num="04" icon={<Calendar />} title={t("landing.modules.m4.title")} desc={t("landing.modules.m4.desc")} accent="emerald" />
     </div>
    </div>
   </section>

   {/* Formats */}
   <section className="py-24 bg-surface border-y border-border">
    <div className="max-w-7xl mx-auto px-6 text-center">
     <h2 className="text-4xl md:text-5xl font-heading mb-6 text-foreground">
      {t("landing.formats.title")} <span className="text-brand">{t("landing.formats.title_highlight")}</span>
     </h2>
     <p className="text-muted max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
      {t("landing.formats.subtitle")}
     </p>
     <div className="flex flex-wrap justify-center gap-3">
      {[
       t("landing.formats.finance"),
       t("landing.formats.tech"),
       t("landing.formats.cooking"),
       t("landing.formats.fitness"),
       t("landing.formats.travel"),
       t("landing.formats.gaming"),
       t("landing.formats.dev"),
       t("landing.formats.vlogs"),
       t("landing.formats.tutorials"),
       t("landing.formats.podcasts")
      ].map((tag) => (
       <span key={tag} className="px-5 py-2.5 rounded-xl bg-background border border-border text-muted text-sm font-semibold hover:border-brand-border hover:text-brand hover:bg-brand-light transition-all cursor-default">
        {tag}
       </span>
      ))}
     </div>
    </div>
   </section>

   {/* FAQ */}
   <section id="faq" className="py-28 bg-background">
    <div className="max-w-2xl mx-auto px-6">
     <h2 className="text-3xl md:text-4xl font-heading mb-14 text-center text-foreground">{t("landing.faq.title")}</h2>
     <div className="space-y-3">
      <FAQItem question={t("landing.faq.q1")} answer={t("landing.faq.a1")} />
      <FAQItem question={t("landing.faq.q2")} answer={t("landing.faq.a2")} />
      <FAQItem question={t("landing.faq.q3")} answer={t("landing.faq.a3")} />
      <FAQItem question={t("landing.faq.q4")} answer={t("landing.faq.a4")} />
     </div>
    </div>
   </section>

   {/* CTA Final */}
   <section className="py-28 bg-brand relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
     <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px]" />
     <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-indigo-800/20 rounded-full blur-[100px]" />
    </div>
    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
     <h2 className="text-4xl md:text-6xl font-heading mb-6 text-white leading-tight">
      {t("landing.cta.title")}
     </h2>
     <p className="text-indigo-200 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
      {t("landing.cta.subtitle")}
     </p>
     <Link
      href="/register"
      className="bg-white text-brand-text px-10 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl inline-flex items-center gap-3 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
     >
      {t("landing.cta.button")}
      <Rocket className="h-5 w-5" />
     </Link>
     <p className="mt-10 text-indigo-300 text-xs uppercase tracking-[0.3em] font-semibold">
      {t("landing.cta.version")}
     </p>
    </div>
   </section>

   {/* Footer */}
   <footer className="py-16 border-t border-border bg-surface">
    <div className="max-w-7xl mx-auto px-6">
     <div className="flex flex-col md:flex-row justify-between items-center gap-10">
      <div className="flex flex-col items-center md:items-start gap-3">
       <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
         <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-heading text-foreground">TubeAI Creator</span>
       </div>
       <p className="text-subtle text-sm max-w-xs text-center md:text-left">
        {t("landing.footer.desc")}
       </p>
      </div>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-muted text-sm font-semibold">
       <a href="#presentation" className="hover:text-brand transition-colors">{t("landing.footer.project")}</a>
       <a href="#modules" className="hover:text-brand transition-colors">{t("landing.footer.modules")}</a>
       <a href="#faq" className="hover:text-brand transition-colors">{t("landing.footer.faq")}</a>
       <Link href="/login" className="hover:text-brand transition-colors">{t("landing.footer.login")}</Link>
      </div>
     </div>
     <div className="mt-12 pt-8 border-t border-border-subtle text-center text-subtle text-xs">
      {t("landing.footer.rights")}
     </div>
    </div>
   </footer>
  </div>
 );
}

function OpportunityItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
 return (
  <div className="flex gap-4 group">
   <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-surface-secondary flex items-center justify-center border border-border group-hover:border-brand-border group-hover:bg-brand-light transition-all">
    {icon}
   </div>
   <div>
    <h3 className="text-foreground font-semibold text-base mb-1">{title}</h3>
    <p className="text-muted text-sm leading-relaxed">{desc}</p>
   </div>
  </div>
 );
}

const accentMap: Record<string, { bg: string; icon: string; border: string; num: string }> = {
 indigo: { bg:"bg-brand-light",           icon:"text-brand",    border:"border-brand-border",      num:"text-brand-border"},
 violet: { bg:"bg-violet-50 dark:bg-violet-950/30", icon:"text-violet-600",  border:"border-violet-200 dark:border-violet-800", num:"text-violet-200 dark:text-violet-900"},
 blue:  { bg:"bg-blue-50 dark:bg-blue-950/30",   icon:"text-blue-600",   border:"border-blue-200 dark:border-blue-800",   num:"text-blue-200 dark:text-blue-900"},
 emerald: { bg:"bg-emerald-50 dark:bg-emerald-950/30",icon:"text-emerald-600", border:"border-emerald-200 dark:border-emerald-800",num:"text-emerald-200 dark:text-emerald-900"},
};

function ModuleCard({ num, icon, title, desc, accent }: { num: string; icon: React.ReactNode; title: string; desc: string; accent: string }) {
 const a = accentMap[accent] || accentMap.indigo;
 return (
  <div className={cn("group p-8 rounded-3xl bg-surface border hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden h-full flex flex-col", a.border)}>
   <div className={cn("absolute top-4 right-5 text-6xl font-heading pointer-events-none select-none", a.num)}>{num}</div>
   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110", a.bg, a.border)}>
    <span className={a.icon}>{icon}</span>
   </div>
   <h3 className="text-xl font-heading text-foreground mb-3">{title}</h3>
   <p className="text-muted text-sm leading-relaxed flex-1">{desc}</p>
  </div>
 );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
 const [isOpen, setIsOpen] = useState(false);
 return (
  <div className="border border-border rounded-2xl overflow-hidden bg-surface hover:border-brand-border transition-all">
   <button onClick={() => setIsOpen(!isOpen)} className="w-full px-7 py-5 flex justify-between items-center text-left">
    <span className="font-semibold text-foreground text-base pr-4">{question}</span>
    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all", isOpen ?"bg-brand text-white":"bg-surface-secondary text-subtle")}>
     {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
    </div>
   </button>
   {isOpen && (
    <div className="px-7 pb-6 animate-in fade-in duration-200">
     <p className="text-muted leading-relaxed text-sm">{answer}</p>
    </div>
   )}
  </div>
 );
}
