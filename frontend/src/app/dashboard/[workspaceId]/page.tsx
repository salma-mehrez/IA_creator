"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Lightbulb, FileText, Search, Layers, List, LayoutGrid, Download, ChevronLeft, ChevronRight, Video, Rocket, Clock, ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

// Sub-components
import StatCardSpark from "@/components/dashboard/StatCardSpark";
import ModuleHero from "@/components/dashboard/ModuleHero";
import ChannelHeader from "@/components/dashboard/ChannelHeader";
import AuditReport from "@/components/dashboard/AuditReport";
import VideoGrid from "@/components/dashboard/VideoGrid";
import SimilarChannelGrid from "@/components/dashboard/SimilarChannelGrid";
import DetailDrawer, { type DrawerConfig } from "@/components/dashboard/DetailDrawer";

function fmt(n: number | undefined) {
    if (!n) return "0";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return n.toString();
}

export default function MasterDashboard() {
    const { workspaceId } = useParams();
    const { language, t } = useLanguage();

    // Data states
    const [workspace, setWorkspace] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [auditResult, setAuditResult] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [recentPublish, setRecentPublish] = useState<any[]>([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [auditing, setAuditing] = useState(false);
    const [search, setSearch] = useState("");

    // Video toolbar state
    const [activeTab, setActiveTab] = useState<"channel" | "similar">("channel");
    const [sortBy, setSortBy] = useState("views_desc");
    const [filterLength, setFilterLength] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Similar channels state
    const [similarChannels, setSimilarChannels] = useState<any[]>([]);
    const [similarLoading, setSimilarLoading] = useState(false);
    const [similarLoaded, setSimilarLoaded] = useState(false);

    const handleSimilarTabClick = async () => {
        setActiveTab("similar");
        setCurrentPage(1);
        if (!similarLoaded) {
            setSimilarLoading(true);
            const res = await fetchApi(`/workspaces/${workspaceId}/similar-channels`);
            if (!res.error) setSimilarChannels(res.data as any[]);
            setSimilarLoading(false);
            setSimilarLoaded(true);
        }
    };

    // Drawer state
    const [drawer, setDrawer] = useState<DrawerConfig | null>(null);
    const autoSyncTried = useRef(false);

    const loadData = useCallback(async () => {
        const [wsRes, statsRes, auditRes, vidRes] = await Promise.all([
            fetchApi(`/workspaces/${workspaceId}`),
            fetchApi(`/workspaces/${workspaceId}/dashboard-stats`),
            fetchApi(`/workspaces/${workspaceId}/audit`),
            fetchApi(`/workspaces/${workspaceId}/videos`)
        ]);

        if (!wsRes.error) setWorkspace(wsRes.data);
        if (!statsRes.error) setStats(statsRes.data);
        if (!auditRes.error) setAuditResult(auditRes.data);
        if (!vidRes.error) setVideos(vidRes.data as any[]);

        // Fetch recent publish projects
        const pubRes = await fetchApi(`/workspaces/${workspaceId}/publish/projects`);
        if (!pubRes.error) {
            setRecentPublish((pubRes.data as any[]).slice(0, 3));
        }

        setLoading(false);
        return vidRes.data as any[];
    }, [workspaceId]);

    useEffect(() => {
        loadData().then((vids: any[] | undefined) => {
            if (vids && vids.length === 0 && !autoSyncTried.current) {
                autoSyncTried.current = true;
                handleSync();
            }
        });
    }, [loadData]);

    const handleSync = async () => {
        setSyncing(true);
        await Promise.all([
            fetchApi(`/workspaces/${workspaceId}/sync`, { method: "POST" }),
            fetchApi(`/workspaces/${workspaceId}/videos/sync`, { method: "POST" })
        ]);
        await loadData();
        setSyncing(false);
    };

    const handleAudit = async () => {
        setAuditing(true);
        const res = await fetchApi(`/workspaces/${workspaceId}/audit`, { method: "POST" });
        if (!res.error) setAuditResult(res.data);
        setAuditing(false);
    };

    // Helper: parse ISO 8601 duration to seconds
    const parseDuration = (d: string) => {
        if (!d) return 0;
        const match = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;
        return (parseInt(match[1] || "0") * 3600) + (parseInt(match[2] || "0") * 60) + parseInt(match[3] || "0");
    };

    // Export CSV
    const handleExport = () => {
        const rows = [["Title", "Views", "Likes", "Comments", "Published", "URL"]];
        processedVideos.forEach(v => rows.push([
            v.title, v.view_count, v.like_count, v.comment_count,
            new Date(v.published_at).toLocaleDateString(),
            `https://youtube.com/watch?v=${v.youtube_video_id}`
        ]));
        const csv = rows.map(r => r.map(String).map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
        a.download = "videos_export.csv"; a.click();
    };

    // Full processing pipeline
    let processedVideos = videos
        .filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
        .filter(v => {
            if (filterLength === "short") return parseDuration(v.duration) < 600;
            if (filterLength === "long")  return parseDuration(v.duration) >= 600;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "views_desc")   return b.view_count - a.view_count;
            if (sortBy === "views_asc")    return a.view_count - b.view_count;
            if (sortBy === "likes_desc")   return b.like_count - a.like_count;
            if (sortBy === "newest")       return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
            if (sortBy === "oldest")       return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
            return 0;
        });

    const totalResults = processedVideos.length;
    const totalPages   = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
    const safePage     = Math.min(currentPage, totalPages);
    const pagedVideos  = processedVideos.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    const goToPage = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin shadow-indigo-500/20" />
            </div>
        );
    }

    // ── Drawer config builders ────────────────────────────────────────────

    const openSubscribers = () => setDrawer({
        type: "stat",
        label: t("dash.stat.subscribers"),
        value: fmt(stats?.subs_total),
        delta: stats?.subs_delta ?? "—",
        description: t("drawer.subs.desc"),
        data: stats?.subs_history ?? [],
        color: "#6366f1",
        actionHref: `/dashboard/${workspaceId}/analysis`,
        actionLabel: t("drawer.see_analysis"),
    });

    const openViews = () => setDrawer({
        type: "stat",
        label: t("dash.stat.views_30d"),
        value: fmt(stats?.views_total),
        delta: stats?.views_delta ?? "—",
        description: t("drawer.views.desc"),
        data: stats?.views_history ?? [],
        color: "#a855f7",
        actionHref: `/dashboard/${workspaceId}/analysis`,
        actionLabel: t("drawer.analyze_videos"),
    });

    const openRetention = () => setDrawer({
        type: "stat",
        label: t("dash.stat.retention"),
        value: `${stats?.retention_avg ?? 0}%`,
        delta: stats?.retention_delta ?? "—",
        description: t("drawer.retention.desc"),
        data: stats?.retention_history ?? [],
        color: "#10b981",
        actionHref: `/dashboard/${workspaceId}/analysis`,
        actionLabel: t("drawer.see_analysis"),
    });

    const openRevenue = () => setDrawer({
        type: "stat",
        label: t("dash.stat.revenue"),
        value: `€${fmt(stats?.revenue_est)}`,
        delta: stats?.revenue_delta ?? "—",
        description: t("drawer.revenue.desc"),
        data: stats?.revenue_history ?? [],
        color: "#f59e0b",
        actionHref: `/dashboard/${workspaceId}/analysis`,
        actionLabel: t("drawer.see_analysis"),
    });



    const openTopics = () => setDrawer({
        type: "module",
        title: t("dash.module.topics.title"),
        description: t("dash.module.topics.desc"),
        features: [
            t("dash.feat.topics.ai_chat"),
            t("dash.feat.topics.suggestions"),
            t("dash.feat.topics.viral"),
            t("dash.feat.topics.planning"),
        ],
        href: `/dashboard/${workspaceId}/topics`,
        colorClass: "bg-amber-400",
        icon: Lightbulb,
    });

    const openScript = () => setDrawer({
        type: "module",
        title: t("dash.module.script.title"),
        description: t("dash.module.script.desc"),
        features: [
            t("dash.feat.script.brief"),
            t("dash.feat.script.structure"),
            t("dash.feat.script.full"),
            t("dash.feat.script.export"),
        ],
        href: `/dashboard/${workspaceId}/script`,
        colorClass: "bg-indigo-600",
        icon: FileText,
    });

    return (
        <>
            <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans overflow-x-hidden p-8 gap-10">

                {/* 1. MASTER HEADER */}
                <ChannelHeader
                    workspace={workspace}
                    stats={stats}
                    syncing={syncing}
                    auditing={auditing}
                    onSync={handleSync}
                    onAudit={handleAudit}
                    onOpenSubs={openSubscribers}
                    onOpenViews={openViews}
                    onOpenRetention={openRetention}
                    onOpenRevenue={openRevenue}
                />

                {/* 2. CORE ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModuleHero
                      title={t("dash.module.topics.title")}
                      description={t("dash.module.topics.desc")}
                      icon={Lightbulb}
                      href={`/dashboard/${workspaceId}/topics`}
                      colorClass="bg-amber-400"
                      iconColor="text-white"
                    />
                    <ModuleHero
                      title={t("dash.module.script.title")}
                      description={t("dash.module.script.desc")}
                      icon={FileText}
                      href={`/dashboard/${workspaceId}/script`}
                      colorClass="bg-indigo-600"
                      iconColor="text-white"
                    />
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 to-violet-500/20 rounded-[1.6rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative">
                        <ModuleHero
                          title={t("dash.module.publish.title")}
                          description={t("dash.module.publish.desc")}
                          icon={Rocket}
                          href={`/dashboard/${workspaceId}/publish`}
                          colorClass="bg-gradient-to-br from-brand to-violet-600"
                          iconColor="text-white"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-brand text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                          {language === "fr" ? "Nouveau" : "New"}
                        </div>
                      </div>
                    </div>
                </div>

                {/* 2.5 RECENT PUBLISH SESSIONS */}
                {recentPublish.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-4 w-4 text-brand" />
                                {t("dash.recent_publish.title")}
                            </h3>
                            <Link href={`/dashboard/${workspaceId}/publish`} className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1">
                                {language === "fr" ? "Voir tout l'historique" : "View all history"}
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recentPublish.map((proj) => (
                                <Link 
                                    key={proj.id}
                                    href={`/dashboard/${workspaceId}/publish?projectId=${proj.id}`}
                                    className="bg-surface border border-border rounded-2xl p-4 hover:border-brand/40 hover:shadow-md transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-xs font-bold text-foreground line-clamp-1 mb-1 pr-4">{proj.video_title}</h4>
                                    <div className="flex items-center gap-2 text-[9px] text-subtle font-medium">
                                        <span className="bg-surface-secondary px-1.5 py-0.5 rounded border border-border">
                                            {proj.platform || "YouTube"}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(proj.updated_at).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}</span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                                        {t("dash.recent_publish.resume")}
                                        <ArrowRight className="h-3 w-3" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. AI AUDIT REPORT */}
                {auditResult && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                        <AuditReport auditResult={auditResult} language={language} />
                    </div>
                )}




                {/* 6. VIDEO GRID */}
                <div className="space-y-6 pt-10 border-t border-border/50">
                    
                    {/* Tabs */}
                    <div className="flex items-center gap-8 border-b border-white/5 pb-0">
                        <button
                            onClick={() => { setActiveTab("channel"); setCurrentPage(1); }}
                            className={`flex items-center gap-2 font-bold text-sm pb-3 border-b-2 transition-colors ${activeTab === "channel" ? "text-brand border-brand" : "text-subtle hover:text-foreground border-transparent"}`}
                        >
                            <Video className="w-4 h-4" />
                            {t("dash.tabs.videos")}
                        </button>
                        <button
                            onClick={handleSimilarTabClick}
                            className={`flex items-center gap-2 font-bold text-sm pb-3 border-b-2 transition-colors ${activeTab === "similar" ? "text-brand border-brand" : "text-subtle hover:text-foreground border-transparent"}`}
                        >
                            <Layers className="w-4 h-4" />
                            {t("dash.tabs.channels")}
                        </button>
                    </div>

                    {activeTab === "similar" ? (
                        <div className="py-6">
                            {similarLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : similarChannels.length === 0 && similarLoaded ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                    <Layers className="w-12 h-12 mb-4 text-subtle" />
                                    <p className="text-sm font-bold text-subtle uppercase tracking-widest">{t("dash.toolbar.no_results")}</p>
                                </div>
                            ) : (
                                <SimilarChannelGrid channels={similarChannels} />
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative w-full md:w-56">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                                        <input
                                            type="text"
                                            placeholder={t("dash.toolbar.search")}
                                            value={search}
                                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                            className="w-full pl-9 pr-4 py-2 bg-[#1e2336] border border-white/5 rounded-xl text-sm font-bold focus:ring-1 ring-brand outline-none transition-all placeholder:font-medium text-foreground"
                                        />
                                    </div>

                                    <select
                                        value={filterLength}
                                        onChange={e => { setFilterLength(e.target.value); setCurrentPage(1); }}
                                        className="appearance-none bg-[#1e2336] border border-white/5 text-sm font-bold px-4 py-2 rounded-xl outline-none focus:ring-1 ring-brand text-foreground cursor-pointer"
                                    >
                                        <option value="all">{t("dash.toolbar.filter_all")}</option>
                                        <option value="short">{"< 10 mins"}</option>
                                        <option value="long">{"> 10 mins"}</option>
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                                        className="appearance-none bg-[#1e2336] border border-white/5 text-sm font-bold px-4 py-2 rounded-xl outline-none focus:ring-1 ring-brand text-foreground cursor-pointer"
                                    >
                                        <option value="views_desc">{t("dash.toolbar.sort_views_high")}</option>
                                        <option value="views_asc">{t("dash.toolbar.sort_views_low")}</option>
                                        <option value="likes_desc">{t("dash.toolbar.sort_likes")}</option>
                                        <option value="newest">{t("dash.toolbar.sort_newest")}</option>
                                        <option value="oldest">{t("dash.toolbar.sort_oldest")}</option>
                                    </select>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 lg:gap-5">
                                    {/* View toggle: List / Grid */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-subtle">View:</span>
                                        <div className="flex bg-[#1e2336] border border-white/5 rounded-lg p-0.5">
                                            <button
                                                onClick={() => setViewMode("list")}
                                                className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-orange-500/10 text-orange-500" : "text-subtle hover:bg-white/5"}`}
                                                title="List view"
                                            ><List className="w-4 h-4" /></button>
                                            <button
                                                onClick={() => setViewMode("grid")}
                                                className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-orange-500/10 text-orange-500" : "text-subtle hover:bg-white/5"}`}
                                                title="Grid view"
                                            ><LayoutGrid className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    {/* Grid columns (only in grid mode) */}
                                    {viewMode === "grid" && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-subtle">Grid:</span>
                                            <div className="flex bg-[#1e2336] border border-white/5 rounded-lg p-0.5">
                                                {([2, 3, 4] as const).map(cols => (
                                                    <button
                                                        key={cols}
                                                        onClick={() => setGridCols(cols)}
                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-colors ${gridCols === cols ? "bg-orange-500/10 text-orange-500" : "text-subtle hover:bg-white/5"}`}
                                                        title={`${cols} columns`}
                                                    >{cols}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#1e2336] border border-white/5 hover:bg-white/10 transition-colors rounded-xl text-sm font-bold text-foreground"
                                        title={t("dash.toolbar.export")}
                                    >
                                        <Download className="w-4 h-4" />
                                        {t("dash.toolbar.export")}
                                    </button>
                                </div>
                            </div>

                            {/* Pagination Info + Controls */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between text-sm py-2 gap-4">
                                 <span className="text-subtle font-bold">
                                     {t("dash.toolbar.showing")} {totalResults === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, totalResults)} {language === "fr" ? "de" : "of"} {totalResults} {t("dash.toolbar.results")}
                                 </span>

                                {totalPages > 1 && (
                                    <div className="flex items-center bg-[#1e2336] border border-white/5 rounded-xl p-1 gap-1">
                                        <button
                                            onClick={() => goToPage(safePage - 1)}
                                            disabled={safePage <= 1}
                                            className="p-1.5 px-3 rounded-lg hover:bg-white/5 text-subtle disabled:opacity-30 transition-colors"
                                        ><ChevronLeft className="w-4 h-4 inline-block" /></button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Show pages around current
                                            let startPage = Math.max(1, safePage - 2);
                                            if (startPage + 4 > totalPages) startPage = Math.max(1, totalPages - 4);
                                            return startPage + i;
                                        }).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => goToPage(p)}
                                                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${p === safePage ? "bg-white/10 text-foreground" : "hover:bg-white/5 text-subtle"}`}
                                            >{p}</button>
                                        ))}

                                        {totalPages > 5 && safePage < totalPages - 2 && (
                                            <span className="px-2 text-subtle">...</span>
                                        )}
                                        {totalPages > 5 && safePage < totalPages - 1 && (
                                            <button onClick={() => goToPage(totalPages)} className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-subtle font-bold text-sm">{totalPages}</button>
                                        )}

                                        <button
                                            onClick={() => goToPage(safePage + 1)}
                                            disabled={safePage >= totalPages}
                                            className="p-1.5 px-3 rounded-lg hover:bg-white/5 text-subtle disabled:opacity-30 transition-colors"
                                        ><ChevronRight className="w-4 h-4 inline-block" /></button>
                                    </div>
                                )}
                            </div>

                            <VideoGrid videos={pagedVideos} language={language} viewMode={viewMode} gridCols={gridCols} />
                        </>
                    )}
                </div>
            </div>

            {/* Detail Drawer (portal-like, outside page scroll) */}
            <DetailDrawer config={drawer} onClose={() => setDrawer(null)} />
        </>
    );
}
