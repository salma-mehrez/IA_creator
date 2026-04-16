"use client";

import Link from "next/link";
import { Sparkles, Globe, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export default function Navbar() {
 const { t, language, setLanguage } = useLanguage();
 const { theme, toggleTheme } = useTheme();

 return (
  <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-border shadow-sm">
   <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="flex justify-between h-16 items-center">
     {/* Logo */}
     <Link href="/" className="flex items-center gap-2.5 group">
      <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform shadow-sm">
       <Sparkles className="h-4 w-4 text-white" />
      </div>
      <span className="text-lg font-heading text-foreground tracking-tight">
       TubeAI <span className="text-brand">Creator</span>
      </span>
     </Link>



     {/* Actions */}
     <div className="flex items-center gap-2">
      {/* Theme toggle */}
      <button
       onClick={toggleTheme}
       className="p-2 rounded-xl text-subtle hover:text-foreground hover:bg-surface-secondary transition-all"
       title={theme ==="light"? t("sidebar.toggle_dark") : t("sidebar.toggle_light")}
      >
       {theme ==="light"? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>

      {/* Language */}
      <div className="relative group">
       <button className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground transition-colors px-2.5 py-2 rounded-xl hover:bg-surface-secondary">
        <Globe className="w-3.5 h-3.5" />
        {language.toUpperCase()}
       </button>
       <div className="absolute right-0 top-full pt-2 hidden group-hover:flex flex-col min-w-[130px]">
        <div className="bg-surface-overlay border border-border rounded-xl overflow-hidden shadow-lg flex flex-col w-full">
         {(["en","fr","es"] as const).map((lang) => (
          <button
           key={lang}
           onClick={() => setLanguage(lang)}
           className={`px-4 py-2.5 text-sm font-medium text-left hover:bg-surface-secondary transition-colors ${language === lang ?"text-brand font-semibold":"text-foreground-2"}`}
          >
           {lang ==="en"?"English": lang ==="fr"?"Français":"Español"}
          </button>
         ))}
        </div>
       </div>
      </div>

      <Link
       href="/login"
       className="text-sm font-semibold text-muted hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-surface-secondary"
      >
       {t("nav.login")}
      </Link>
      <Link
       href="/register"
       className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-hover transition-all active:scale-95"
      >
       {t("nav.signup")}
      </Link>
     </div>
    </div>
   </div>
  </nav>
 );
}
