"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
 BarChart3,
 Lightbulb,
 FileText,
 Calendar,
 LayoutDashboard,
 Settings,
 LogOut,
 Sparkles,
 Video,
 Globe, Sun, Moon,
 Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { useLanguage } from "@/lib/i18n";

export default function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
 const pathname = usePathname();
 const { workspaceId } = useParams();
 const router = useRouter();
 const { theme, toggleTheme } = useTheme();
 const { t, language, setLanguage } = useLanguage();

 const [user, setUser] = useState<{ email: string; username: string } | null>(null);
 const [workspace, setWorkspace] = useState<any>(null);
 const [stats, setStats] = useState<any>(null);

 useEffect(() => {
  fetchApi("/auth/me").then((res) => { if (res.data) setUser(res.data as any); });
 }, []);

 useEffect(() => {
  if (workspaceId) {
   fetchApi(`/workspaces/${workspaceId}`).then((res) => { if (res.data) setWorkspace(res.data); });
   fetchApi(`/workspaces/${workspaceId}/dashboard-stats`).then((res) => { if (res.data) setStats(res.data); });
  }
 }, [workspaceId]);

 const handleLogout = () => {
  localStorage.removeItem("token");
  router.push("/login");
 };

 const isInsideWorkspace = !!workspaceId;

 const navItems = [
  { name: t("sidebar.control_center"), icon: LayoutDashboard, href:`/dashboard/${workspaceId}`, match:"/dashboard/" + workspaceId, exact: true },
  { name: t("sidebar.topics_label"),   icon: Lightbulb,       href:`/dashboard/${workspaceId}/topics`,  match:"/topics" },
  { name: t("sidebar.script_label"),   icon: FileText,         href:`/dashboard/${workspaceId}/script`,  match:"/script" },
  { name: t("sidebar.planning_label"), icon: Calendar,         href:`/dashboard/${workspaceId}/planning`, match:"/planning" },
 ];

 return (
  <aside
   className={cn("flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300", isCollapsed ? "w-[80px]" : "w-[240px]")}
   style={{ background:"var(--sidebar-bg)", borderRight:"1px solid var(--sidebar-border)"}}
  >
   {/* Logo */}
   <div className="px-6 py-6 border-b border-white/5 flex justify-center">
    <Link href="/dashboard" className="flex items-center gap-3 group">
     <div className="w-9 h-9 bg-brand rounded-2xl flex items-center justify-center shadow-indigo-500/20 shadow-xl flex-shrink-0 group-hover:scale-110 transition-all duration-300">
      <Sparkles className="h-5 w-5 text-white" />
     </div>
     {!isCollapsed && (
      <span className="font-heading text-xl tracking-tight font-black" style={{ color:"var(--sidebar-text-active)"}}>
       Tube<span style={{ color:"var(--sidebar-accent)"}}>AI</span>
      </span>
     )}
    </Link>
   </div>

   {/* Navigation */}
   <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto no-scrollbar">
    {/* Principal */}
    <div className="space-y-1">
     {!isInsideWorkspace && (
       <NavItem
         href="/dashboard"
         icon={LayoutDashboard}
         label={t("sidebar.my_channels")}
         active={pathname === "/dashboard"}
         isCollapsed={isCollapsed}
       />
     )}
     {isInsideWorkspace &&
      navItems.map((item) => (
       <NavItem
        key={item.name}
        href={item.href}
        icon={item.icon}
        label={item.name}
        active={item.exact ? pathname === item.match : pathname.includes(item.match)}
        isCollapsed={isCollapsed}
       />
      ))}
    </div>

    {/* Outils & Paramètres */}
    {isInsideWorkspace && (
      <div className="space-y-1 mt-6">
       {!isCollapsed && (
         <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-4 opacity-40" style={{ color:"var(--sidebar-text)"}}>
          {t("sidebar.config_section")}
         </p>
       )}
       {isCollapsed && <div className="h-px bg-white/5 my-4 mx-4"></div>}
       <NavItem
        href={`/dashboard/${workspaceId}/settings`}
        icon={Settings}
        label={t("sidebar.settings_label")}
        active={pathname.includes("/settings")}
        isCollapsed={isCollapsed}
       />
      </div>
    )}
   </nav>

   <div className="p-3 space-y-2 border-t border-white/5">
    {/* Language toggle */}
    <div className="relative group">
     <button className={cn("w-full flex items-center rounded-xl transition-colors text-xs font-medium", isCollapsed ? "justify-center p-3" : "justify-between px-3 py-2")}
       style={{ color:"var(--sidebar-text)"}}
       onMouseEnter={(e) => (e.currentTarget.style.background ="var(--sidebar-hover)")}
       onMouseLeave={(e) => (e.currentTarget.style.background ="transparent")}
       title={isCollapsed ? (language === "en" ? "Language" : "Langue") : undefined}
     >
      <div className={cn("flex items-center", isCollapsed ? "" : "gap-2.5")}>
       <Globe className="h-4 w-4 flex-shrink-0" />
       {!isCollapsed && <span>{language === "en" ? "English" : language === "fr" ? "Français" : "Español"}</span>}
      </div>
     </button>
     <div className="absolute left-0 right-0 bottom-full mb-1 hidden group-hover:flex flex-col z-50">
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg flex flex-col w-full">
       {(["en","fr","es"] as const).map((lang) => (
        <button
         key={lang}
         onClick={() => setLanguage(lang)}
         className={`px-3 py-2.5 text-xs font-medium text-left hover:bg-surface-secondary transition-colors ${language === lang ?"text-brand font-semibold":"text-foreground-2"}`}
        >
         {lang ==="en"?"English": lang ==="fr"?"Français":"Español"}
        </button>
       ))}
      </div>
     </div>
    </div>

    {/* Theme toggle */}
    <button
     onClick={toggleTheme}
     className={cn("w-full flex items-center rounded-xl transition-colors text-xs font-medium", isCollapsed ? "justify-center p-3" : "gap-2.5 px-3 py-2")}
     style={{ color:"var(--sidebar-text)"}}
     onMouseEnter={(e) => (e.currentTarget.style.background ="var(--sidebar-hover)")}
     onMouseLeave={(e) => (e.currentTarget.style.background ="transparent")}
     title={isCollapsed ? (theme === "light" ? t("sidebar.theme_dark") : t("sidebar.theme_light")) : undefined}
    >
     {theme ==="light"? (
      <Moon className="h-4 w-4 flex-shrink-0" />
     ) : (
      <Sun className="h-4 w-4 flex-shrink-0" />
     )}
     {!isCollapsed && <span>{theme ==="light" ? t("sidebar.theme_dark") : t("sidebar.theme_light")}</span>}
    </button>

    {/* User footer */}
    <div className={cn("flex items-center rounded-xl transition-colors group cursor-pointer relative", isCollapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-2")}
     onMouseEnter={(e) => (e.currentTarget.style.background ="var(--sidebar-hover)")}
     onMouseLeave={(e) => (e.currentTarget.style.background ="transparent")}
     onClick={() => router.push("/dashboard/profile")}
    >
     <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
      {user?.username?.[0]?.toUpperCase() ||"U"}
     </div>
     {!isCollapsed && (
      <div className="flex-1 min-w-0">
       <p className="text-xs font-semibold truncate" style={{ color:"var(--sidebar-text-active)"}}>
        {user?.username ||"..."}
       </p>
       <p className="text-[10px] truncate opacity-50" style={{ color:"var(--sidebar-text)"}}>
        {user?.email}
       </p>
      </div>
     )}
     {!isCollapsed ? (
      <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="p-1 opacity-40 hover:opacity-100 transition-opacity">
       <LogOut className="h-4 w-4" />
      </button>
     ) : (
      <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="absolute left-full ml-4 p-2 bg-red-500/10 text-red-500 rounded-lg hidden group-hover:block whitespace-nowrap shadow-xl">
       <div className="flex items-center gap-2">
         <LogOut className="h-4 w-4" />
         <span className="text-xs font-bold">Logout</span>
       </div>
      </button>
     )}
    </div>
   </div>
  </aside>
 );
}

function NavItem({
 href,
 icon: Icon,
 label,
 active,
 badge,
 isCollapsed
}: {
 href: string;
 icon: any;
 label: string;
 active: boolean;
 badge?: string | null;
 isCollapsed?: boolean;
}) {
 return (
  <Link
   href={href}
   title={isCollapsed ? label : undefined}
   className={cn("flex items-center rounded-xl text-xs font-medium transition-all duration-200 relative group", isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3")}
   style={{
    background: active ?"var(--sidebar-active)":"transparent",
    color: active ?"var(--sidebar-text-active)":"var(--sidebar-text)",
   }}
  >
   {active && (
    <div
     className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-6 rounded-r-full"
     style={{ background:"var(--sidebar-accent)"}}
    />
   )}
   <Icon
    className={cn("h-4 w-4 flex-shrink-0 transition-colors", active ? "text-brand" : "opacity-50 group-hover:opacity-100", isCollapsed && active ? "scale-110" : "")}
    style={{ color: active ?"var(--sidebar-accent)":undefined}}
   />
   {!isCollapsed && <span className="flex-1">{label}</span>}
   {badge && !isCollapsed && (
     <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[9px] font-bold animate-pulse">
       {badge}
     </span>
   )}
   {badge && isCollapsed && (
     <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
   )}
  </Link>
 );
}
