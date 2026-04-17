"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import {
 Sparkles, FileText, Zap, BarChart3, Lightbulb,
 Calendar, Coins, Rocket, ArrowRight, Target,
 Plus, Minus, Check, X
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
    </div>
   </section>


   {/* Workflow Compact */}
   <section id="workflow" className="py-24 bg-background border-y border-border relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
     <div className="text-center mb-16 space-y-4">
      <h2 className="text-4xl md:text-5xl font-heading mb-4 text-foreground">{t("landing.modules.title")}</h2>
      <p className="text-muted max-w-xl mx-auto text-lg">{t("landing.modules.subtitle")}</p>
     </div>
     
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative">
      {/* Ligne de connexion au fond (desktop) */}
      <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

      {[
        { num: "01", icon: <BarChart3 className="w-6 h-6" />, title: t("landing.modules.m1.title"), desc: t("landing.modules.m1.desc"), color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
        { num: "02", icon: <Lightbulb className="w-6 h-6" />, title: t("landing.modules.m2.title"), desc: t("landing.modules.m2.desc"), color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
        { num: "03", icon: <FileText className="w-6 h-6" />, title: t("landing.modules.m3.title"), desc: t("landing.modules.m3.desc"), color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { num: "04", icon: <Calendar className="w-6 h-6" />, title: t("landing.modules.m4.title"), desc: t("landing.modules.m4.desc"), color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { num: "05", icon: <Rocket className="w-6 h-6" />, title: t("dash.module.publish.title"), desc: t("dash.module.publish.desc"), color: "text-brand", bg: "bg-brand/10", border: "border-brand/20" },
      ].map((step, i) => (
       <div key={i} className="flex flex-col bg-surface/50 backdrop-blur-sm border border-border p-8 rounded-[2rem] hover:shadow-[0_0_30px_rgba(var(--brand),0.08)] hover:-translate-y-1 transition-all duration-300 group hover:border-brand/30">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-transform duration-500 group-hover:scale-110", step.bg, step.color, step.border)}>
          {step.icon}
        </div>
        <div className="text-xs font-mono font-bold tracking-[0.2em] text-brand/70 mb-3">ÉTAPE {step.num}</div>
        <h3 className="text-2xl font-heading text-foreground mb-3 leading-tight">{step.title}</h3>
        <p className="text-sm text-muted leading-relaxed flex-1">{step.desc}</p>
       </div>
      ))}
     </div>

     <div className="mt-16 flex justify-center">
      <Link
       href="/register"
       className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-2xl font-semibold text-base transition-all flex items-center gap-2 group shadow-lg hover:shadow-brand/25 active:scale-95"
      >
       {t("landing.hero.cta")}
       <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Link>
     </div>
    </div>
   </section>

   {/* Comparison */}
   <section id="comparison" className="py-24 bg-background">
    <div className="max-w-5xl mx-auto px-6">
     <div className="text-center mb-16 space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-500 text-xs font-mono font-bold uppercase tracking-widest">
        {t("landing.compare.badge")}
      </div>
      <h2 className="text-4xl md:text-5xl font-heading mb-4 text-foreground">
       <span className="text-foreground">TubeAI Creator</span> <span className="text-brand">vs</span> ChatGPT <span className="text-brand">vs</span> Claude
      </h2>
     </div>

     <div className="bg-surface border border-border rounded-[2rem] overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
       <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
         <tr className="border-b border-border bg-surface-secondary">
          <th className="p-6 font-heading text-lg font-semibold w-[40%] text-foreground">{t("landing.compare.feature")}</th>
          <th className="p-6 font-heading text-lg font-semibold text-center w-[20%] text-foreground">
           <div className="flex items-center justify-center gap-2"><Zap className="h-5 w-5 text-brand" /> TubeAI Creator</div>
          </th>
          <th className="p-6 font-heading text-lg font-semibold text-center w-[20%] opacity-60">ChatGPT</th>
          <th className="p-6 font-heading text-lg font-semibold text-center w-[20%] opacity-60">Claude</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-border">
         {[
          { feature: t("landing.compare.f1"), tube: true, gpt: false, claude: false },
          { feature: t("landing.compare.f2"), tube: true, gpt: false, claude: false },
          { feature: t("landing.compare.f3"), tube: true, gpt: false, claude: false },
          { feature: t("landing.compare.f4"), tube: true, gpt: false, claude: false },
         ].map((row, i) => (
          <tr key={i} className="hover:bg-surface-secondary/50 transition-colors">
           <td className="p-6 font-medium text-foreground">{row.feature}</td>
           <td className="p-6 text-center">
            {row.tube ? <Check className="w-6 h-6 text-emerald-500 mx-auto" /> : <X className="w-6 h-6 text-rose-500 mx-auto opacity-50" />}
           </td>
           <td className="p-6 text-center">
            {row.gpt ? <Check className="w-6 h-6 text-emerald-500 mx-auto" /> : <X className="w-6 h-6 text-rose-500 mx-auto opacity-50" />}
           </td>
           <td className="p-6 text-center">
            {row.claude ? <Check className="w-6 h-6 text-emerald-500 mx-auto" /> : <X className="w-6 h-6 text-rose-500 mx-auto opacity-50" />}
           </td>
          </tr>
         ))}
         <tr className="hover:bg-surface-secondary/50 transition-colors">
          <td className="p-6 font-medium text-foreground">{t("landing.compare.f5")}</td>
          <td className="p-6 text-center font-bold text-emerald-500">{t("landing.compare.t5_tubeai")}</td>
          <td className="p-6 text-center text-muted">{t("landing.compare.t5_gpt")}</td>
          <td className="p-6 text-center text-muted">{t("landing.compare.t5_claude")}</td>
         </tr>
        </tbody>
       </table>
      </div>
     </div>
    </div>
   </section>

   {/* Explorez la Machine (Détails des Modèles) */}
   <section id="features" className="py-28 bg-background">
    <div className="max-w-7xl mx-auto px-6">
     <div className="text-center mb-24 space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border text-xs font-mono font-bold uppercase tracking-widest text-muted">
        Intelligence Artificielle
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading mb-4 text-foreground">{t("landing.features.title")}</h2>
      <p className="text-muted max-w-xl mx-auto text-lg">{t("landing.features.subtitle")}</p>
     </div>
     <div className="flex flex-col gap-10">
      <ModelShowcase 
       num="01" 
       icon={<BarChart3 />} 
       title={t("landing.features.m1.title")} 
       desc={t("landing.features.m1.desc")} 
       accent="indigo"
       features={[
         t("landing.features.m1.f1"),
         t("landing.features.m1.f2"),
         t("landing.features.m1.f3")
       ]}
       mediaSrc="/auditor_dashboard.png"
      />
      <ModelShowcase 
       num="02" 
       icon={<Lightbulb />} 
       title={t("landing.features.m2.title")} 
       desc={t("landing.features.m2.desc")} 
       accent="violet" 
       reverse 
       features={[
         t("landing.features.m2.f1"),
         t("landing.features.m2.f2"),
         t("landing.features.m2.f3")
       ]}
       mediaSrc="/strategist_chat.png"
      />
       <ModelShowcase 
        num="03" 
        icon={<FileText />} 
        title={t("landing.features.m3.title")} 
        desc={t("landing.features.m3.desc")} 
        accent="blue"
        features={[
          t("landing.features.m3.f1"),
          t("landing.features.m3.f2"),
          t("landing.features.m3.f3")
        ]}
        mediaSrc="/script_editor.png"
       />
      <ModelShowcase 
       num="04" 
       icon={<Calendar />} 
       title={t("landing.features.m4.title")} 
       desc={t("landing.features.m4.desc")} 
       accent="emerald" 
       reverse 
       features={[
         t("landing.features.m4.f1"),
         t("landing.features.m4.f2"),
         t("landing.features.m4.f3")
       ]}
       mediaSrc="/maestro_planning.png"
      />
       <ModelShowcase 
        num="05" 
        icon={<Rocket />} 
        title={t("landing.features.m5.title")} 
        desc={t("landing.features.m5.desc")} 
        accent="indigo"
        features={[
          t("landing.features.m5.f1"),
          t("landing.features.m5.f2"),
          t("landing.features.m5.f3")
        ]}
        mediaSrc="/publish_hub.png"
       />
     </div>
    </div>
   </section>

   {/* Formats */}
   <section className="py-24 bg-surface border-b border-border">
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
  <div className="flex gap-5 group p-4 -ml-4 rounded-2xl hover:bg-surface/50 border border-transparent hover:border-border/50 transition-all duration-300">
   <div className="flex-shrink-0 w-14 h-14 rounded-[1.25rem] bg-background shadow-sm flex items-center justify-center border border-border group-hover:border-brand/30 group-hover:shadow-[0_0_20px_rgba(var(--brand),0.15)] transition-all duration-300 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">{icon}</span>
   </div>
   <div className="flex flex-col justify-center">
    <h3 className="text-foreground font-heading text-lg mb-1.5 group-hover:text-brand transition-colors">{title}</h3>
    <p className="text-muted text-sm leading-relaxed max-w-sm">{desc}</p>
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

function ModelShowcase({ num, icon, title, desc, accent, reverse, features, mediaSrc }: { num: string; icon: React.ReactNode; title: string; desc: string; accent: string; reverse?: boolean; features?: string[]; mediaSrc?: string }) {
 const a = accentMap[accent] || accentMap.indigo;
 return (
  <div className={cn("flex flex-col md:flex-row items-center gap-12 md:gap-20 py-10", reverse ? "md:flex-row-reverse" : "")}>
   <div className="flex-1 space-y-6">
    <div className={cn("inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-mono font-bold tracking-widest", a.bg, a.border, a.icon)}>
     [MODEL_{num}]
    </div>
    <div className="flex flex-col gap-4">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm", a.bg, a.border, a.icon)}>
        {icon}
      </div>
      <h3 className="text-3xl md:text-4xl font-heading text-foreground leading-tight">{title}</h3>
    </div>
    <p className="text-muted text-lg leading-relaxed">{desc}</p>
    
    {features && (
      <ul className="space-y-3 pt-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-foreground font-medium">
            <div className={cn("mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", a.bg)}>
              <Check className="w-3 h-3" />
            </div>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    )}
   </div>
   <div className="flex-1 w-full">
    <div className="aspect-[4/3] sm:aspect-video md:aspect-[4/3] lg:aspect-video rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden relative group transition-all duration-500 hover:shadow-3xl hover:-translate-y-1">
      {mediaSrc ? (
        <div className="w-full h-full relative">
          <img src={mediaSrc} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Fake UI Mockup */
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-secondary flex flex-col">
          {/* Mockup Header */}
          <div className="h-10 border-b border-border bg-background/50 flex items-center px-4 gap-2 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner" />
          </div>
          {/* Mockup Content */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
            <div className={cn("absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-30 pointer-events-none transition-all duration-700 group-hover:scale-110", a.bg)} />
            <div className={cn("absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-30 pointer-events-none transition-all duration-700 group-hover:scale-110", a.bg)} />
            
            <div className="w-full h-full border border-border/60 rounded-2xl bg-background/80 backdrop-blur-md shadow-sm flex flex-col items-center justify-center p-6 gap-4 relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-background border shadow-md", a.border, a.icon)}>
                {icon}
              </div>
              <div className="text-center">
                <div className="font-heading text-foreground text-xl mb-2">{title}</div>
                <div className="w-32 h-2 rounded-full bg-border mx-auto mb-2" />
                <div className="w-48 h-2 rounded-full bg-border/50 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
   </div>
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
