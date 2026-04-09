"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
 Lightbulb, Sparkles, Plus, Loader2, CheckCircle2,
 TrendingUp, Send, Bot, User, RefreshCw, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";



interface ChatMessage {
 role:"user"|"assistant";
 content: string;
 suggested_title?: string;
 viral_score?: number;
 add_to_planning?: boolean;
}

interface QuickSuggestion {
 title: string;
 why: string;
 viral_score: number;
 format: string;
}

export default function TopicsPage() {
 const { workspaceId } = useParams();
 const { language, t } = useLanguage();

 const [messages, setMessages] = useState<ChatMessage[]>([
  {
   role:"assistant",
   content: t("topics.chat.welcome")
  }
 ]);
 const [input, setInput] = useState("");
 const [chatLoading, setChatLoading] = useState(false);
 const chatBottomRef = useRef<HTMLDivElement>(null);

 const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([]);
 const [suggestionsLoading, setSuggestionsLoading] = useState(false);

 const [success, setSuccess] = useState("");

 useEffect(() => {
  chatBottomRef.current?.scrollIntoView({ behavior:"smooth"});
 }, [messages]);

 const loadSuggestions = async () => {
  setSuggestionsLoading(true);
  const res = await fetchApi(`/workspaces/${workspaceId}/quick-suggestions?language=${language}`);
  if (res.data) setSuggestions(res.data as QuickSuggestion[]);
  setSuggestionsLoading(false);
 };

 useEffect(() => { loadSuggestions(); }, [workspaceId]);

 const showSuccess = (msg: string) => {
  setSuccess(msg);
  setTimeout(() => setSuccess(""), 3000);
 };

 const handleSendMessage = async () => {
  if (!input.trim() || chatLoading) return;
  const userMsg: ChatMessage = { role:"user", content: input };
  const newMessages = [...messages, userMsg];
  setMessages(newMessages);
  setInput("");
  setChatLoading(true);

  const res = await fetchApi(`/workspaces/${workspaceId}/chat-ideas`, {
   method:"POST",
   body: JSON.stringify({
    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
    language
   })
  });

  if (res.data) {
   const data = res.data as any;
   setMessages(prev => [...prev, {
    role:"assistant",
    content: data.message,
    suggested_title: data.suggested_title,
    viral_score: data.viral_score,
    add_to_planning: data.add_to_planning
   }]);
  } else {
   setMessages(prev => [...prev, {
    role:"assistant",
    content: t("topics.chat.error")
   }]);
  }
  setChatLoading(false);
 };

 const addTopicToPlanning = async (title: string, description: string, viral_score: number) => {
  const res = await fetchApi(`/workspaces/${workspaceId}/topics/add`, {
   method:"POST",
   body: JSON.stringify({ title, description, viral_score })
  });
  if (res.data) showSuccess(`"${title}" ${t("topics.chat.added_success")}`);
  return !res.error;
 };



 const handleAddSuggestion = async (s: QuickSuggestion) => {
  await addTopicToPlanning(s.title, s.why, s.viral_score);
 };

 const handleAddChatTitle = async (title: string, score: number) => {
  await addTopicToPlanning(title, t("topics.chat.suggested_title"), score || 75);
 };

 return (
  <div className="flex flex-col h-screen bg-background font-sans text-foreground">

   {/* Header */}
   <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-30 shadow-sm">
    <div>
     <h1 className="text-2xl font-heading text-foreground tracking-tight flex items-center gap-3">
      <Lightbulb className="h-6 w-6 text-amber-500" />
      {t("topics.chat.title")}
     </h1>
     <p className="text-xs text-subtle mt-0.5">
      {t("topics.chat.subtitle")}
     </p>
    </div>
    {success && (
     <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium animate-in fade-in duration-200">
      <CheckCircle2 className="h-4 w-4" /> {success}
     </div>
    )}
   </header>

   {/* 2-column layout */}
   <div className="flex flex-1 overflow-hidden">

    {/* LEFT: Chatbot */}
    <div className="flex-1 flex flex-col border-r border-border bg-surface min-w-0">
     <div className="px-6 py-3 border-b border-border-subtle flex items-center justify-between">
      <div className="flex items-center gap-2">
       <Bot className="h-4 w-4 text-brand" />
       <span className="text-sm font-semibold text-foreground-2">{t("topics.chat.assistant")}</span>
      </div>
      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t("topics.chat.online")}
      </span>
     </div>

     {/* Messages */}
     <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg, i) => (
       <div key={i} className={cn("flex gap-3", msg.role ==="user"?"flex-row-reverse":"flex-row")}>
        <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
         msg.role ==="user"?"bg-brand text-white":"bg-amber-100 text-amber-600"
        )}>
         {msg.role ==="user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className={cn("max-w-[80%] space-y-2", msg.role ==="user"?"items-end flex flex-col":"items-start flex flex-col")}>
         <div className={cn(
         "px-4 py-3 rounded-2xl text-sm leading-relaxed",
          msg.role ==="user"
           ?"bg-brand text-white rounded-tr-sm"
           :"bg-surface-hover text-foreground-2 rounded-tl-sm"
         )}>
          {msg.content}
         </div>

         {msg.suggested_title && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 w-full">
           <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
             {t("topics.chat.suggested_title")}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
             {msg.viral_score}% {t("topics.chat.viral")}
            </span>
           </div>
           <p className="text-sm font-semibold text-foreground-2 leading-snug">{msg.suggested_title}</p>
           {msg.add_to_planning && (
            <button
             onClick={() => handleAddChatTitle(msg.suggested_title!, msg.viral_score || 75)}
             className="flex items-center gap-2 text-xs font-bold text-brand hover:text-brand-hover transition-colors mt-1"
            >
             <Plus className="h-3.5 w-3.5" /> {t("topics.chat.add_planning")}
            </button>
           )}
          </div>
         )}
        </div>
       </div>
      ))}

      {chatLoading && (
       <div className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
         <Bot className="h-4 w-4 text-amber-600" />
        </div>
        <div className="px-4 py-3 bg-surface-hover rounded-2xl rounded-tl-sm flex items-center gap-2">
         <Loader2 className="h-4 w-4 text-subtle animate-spin" />
         <span className="text-sm text-subtle">{t("topics.chat.thinking")}</span>
        </div>
       </div>
      )}
      <div ref={chatBottomRef} />
     </div>

     {/* Input */}
     <div className="p-4 border-t border-border">
      <div className="flex gap-3">
       <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key ==="Enter" && handleSendMessage()}
        placeholder={t("topics.chat.placeholder")}
        className="flex-1 bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
       />
       <button
        onClick={handleSendMessage}
        disabled={!input.trim() || chatLoading}
        className="w-12 h-12 rounded-xl bg-brand hover:bg-brand-hover text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
       >
        <Send className="h-4 w-4" />
       </button>
      </div>
     </div>
    </div>

    {/* RIGHT: Quick Suggestions */}
    <div className="w-[360px] flex-shrink-0 flex flex-col bg-background">
     <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-surface">
      <div className="flex items-center gap-2">
       <Zap className="h-4 w-4 text-brand" />
       <span className="text-sm font-semibold text-foreground-2">{t("topics.chat.suggestions_title")}</span>
      </div>
      <button
       onClick={loadSuggestions}
       disabled={suggestionsLoading}
       className="p-1.5 text-subtle hover:text-brand hover:bg-brand-light rounded-lg transition-all"
       title={t("topics.chat.refresh")}
      >
       <RefreshCw className={cn("h-3.5 w-3.5", suggestionsLoading && "animate-spin")} />
      </button>
     </div>

     <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {suggestionsLoading ? (
       <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-subtle font-medium text-center">{t("topics.chat.analyzing")}</p>
       </div>
      ) : suggestions.length === 0 ? (
       <div className="text-center py-12">
        <Sparkles className="h-10 w-10 text-subtle mx-auto mb-4" />
        <p className="text-sm text-subtle mb-4">{t("topics.chat.no_suggestions")}</p>
        <button
         onClick={loadSuggestions}
         className="text-brand text-sm font-semibold hover:underline"
        >
         {t("topics.chat.generate_suggestions")}
        </button>
       </div>
      ) : suggestions.map((s, i) => (
       <div key={i} className="bg-surface border border-border rounded-2xl p-4 hover:border-brand-border hover:shadow-sm transition-all group">
        <div className="flex items-start justify-between gap-2 mb-2">
         <span className="text-[10px] font-bold text-subtle uppercase tracking-wide px-2 py-0.5 bg-surface-hover rounded-lg flex-shrink-0">
          {s.format}
         </span>
         <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-indigo-400" />
          <span className="text-xs font-black text-brand">{s.viral_score}%</span>
         </div>
        </div>
        <p className="text-sm font-semibold text-foreground-2 leading-tight mb-2 group-hover:text-brand-text transition-colors">
         {s.title}
        </p>
        <p className="text-xs text-subtle leading-relaxed mb-3 line-clamp-2">{s.why}</p>
        <div className="flex gap-2">
         <button
          onClick={() => setInput(s.title)}
          className="flex-1 text-center text-xs font-semibold text-muted hover:text-brand py-1.5 border border-border hover:border-brand-border rounded-lg transition-all"
         >
          {t("topics.chat.refine")}
         </button>
         <button
          onClick={() => handleAddSuggestion(s)}
          className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-white hover:bg-brand py-1.5 px-3 border border-brand-border hover:border-indigo-600 rounded-lg transition-all"
         >
          <Plus className="h-3 w-3" /> {t("topics.chat.planning")}
         </button>
        </div>
       </div>
      ))}
     </div>
    </div>
   </div>


  </div>
 );
}
