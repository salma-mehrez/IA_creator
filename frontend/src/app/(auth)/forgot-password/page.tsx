"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
 const { t } = useLanguage();
 const [email, setEmail] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [submitted, setSubmitted] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
   const response = await fetchApi("/auth/forgot-password", {
    method:"POST",
    body: JSON.stringify({ email }),
   });
   if (response.error) {
    setError(response.error);
   } else {
    setSubmitted(true);
   }
  } catch {
   setError(t("auth.server_error"));
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
   <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-100/50 dark:bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
   <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-100/40 dark:bg-violet-950/15 rounded-full blur-[90px] pointer-events-none" />

   <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    {/* Logo */}
    <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
     <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:rotate-6">
      <Sparkles className="h-5 w-5 text-white" />
     </div>
     <span className="font-heading text-2xl text-foreground">
      Tube<span className="text-brand">AI</span>
     </span>
    </Link>

    <Link href="/login" className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-subtle hover:text-brand mb-8 transition-colors group">
     <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
     {t("auth.forgot.back")}
    </Link>

    <h1 className="text-3xl font-heading text-foreground leading-tight mb-2">
     {t("auth.forgot.title")} <span className="text-brand">{t("auth.forgot.title_highlight")}</span>
    </h1>
    <p className="text-sm text-muted mb-8">
     {t("auth.forgot.subtitle")}
    </p>

    <div className="bg-surface border border-border rounded-3xl py-10 px-8 shadow-sm">
     {submitted ? (
      <div className="text-center py-4">
       <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-success-bg rounded-2xl flex items-center justify-center border border-success-border">
         <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
       </div>
       <h3 className="text-2xl font-heading text-foreground mb-3">{t("auth.forgot.success.title")}</h3>
       <p className="text-muted text-sm mb-8 leading-relaxed">
        {t("auth.forgot.success.message")}
       </p>
       <Link href="/login" className="text-brand font-semibold text-sm hover:text-brand-hover transition-colors">
        {t("auth.forgot.success.back")}
       </Link>
      </div>
     ) : (
      <form className="space-y-6" onSubmit={handleSubmit}>
       {error && (
        <div className="bg-danger-bg border border-danger-border text-danger p-4 rounded-2xl text-sm font-medium flex items-start gap-3">
         <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
         {error}
        </div>
       )}
       <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-subtle">
         {t("auth.forgot.label")}
        </label>
        <div className="relative">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Mail className="h-4 w-4 text-subtle" />
         </div>
         <input
          id="email"
          type="email"
          required
          className="input-base pl-11"
          placeholder={t("auth.email.placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
         />
        </div>
       </div>

       <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 transition-all active:scale-95"
       >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? t("auth.forgot.sending") : t("auth.forgot.send")}
       </button>
      </form>
     )}
    </div>
   </div>
  </div>
 );
}
