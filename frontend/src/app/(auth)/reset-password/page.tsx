"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Lock, Loader2, CheckCircle2, XCircle, Sparkles, AlertTriangle } from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const { t } = useLanguage();
 const token = searchParams.get("token");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [status, setStatus] = useState<"idle"|"success"|"error">("idle");
 const [message, setMessage] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (password !== confirmPassword) {
   setStatus("error");
   setMessage(t("auth.reset.mismatch"));
   return;
  }
  setLoading(true);
  setStatus("idle");
  try {
   const response = await fetchApi("/auth/reset-password", {
    method:"POST",
    body: JSON.stringify({ token, new_password: password }),
   });
   if (response.error) {
    setStatus("error");
    setMessage(response.error);
   } else {
    setStatus("success");
    setMessage(t("auth.reset.success.message"));
    setTimeout(() => router.push("/login"), 3000);
   }
  } catch {
   setStatus("error");
   setMessage(t("auth.server_error"));
  } finally {
   setLoading(false);
  }
 };

 if (!token) {
  return (
   <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 font-sans">
    <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-12 text-center shadow-sm">
     <div className="w-16 h-16 bg-danger-bg rounded-2xl flex items-center justify-center border border-danger-border mx-auto mb-6">
      <XCircle className="h-9 w-9 text-danger" />
     </div>
     <h1 className="text-2xl font-heading text-foreground mb-3">{t("auth.reset.invalid.title")}</h1>
     <p className="text-muted text-sm mb-8 leading-relaxed">{t("auth.reset.invalid.message")}</p>
     <Link href="/login" className="text-brand font-semibold text-sm hover:text-brand-hover transition-colors">
      {t("auth.reset.back")}
     </Link>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
   <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-brand-light/60 dark:bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/4 -translate-x-1/4" />

   <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
     <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:rotate-6">
      <Sparkles className="h-5 w-5 text-white" />
     </div>
     <span className="font-heading text-2xl text-foreground">
      Tube<span className="text-brand">AI</span>
     </span>
    </Link>

    <h1 className="text-3xl font-heading text-foreground text-center mb-2">
     {t("auth.reset.title")} <span className="text-brand">{t("auth.reset.title_highlight")}</span>
    </h1>
    <p className="text-center text-sm text-muted mb-8">
     {t("auth.reset.subtitle")}
    </p>

    <div className="bg-surface border border-border rounded-3xl py-10 px-8 shadow-sm">
     {status ==="success" ? (
      <div className="text-center py-4">
       <div className="w-16 h-16 bg-success-bg rounded-2xl flex items-center justify-center border border-success-border mx-auto mb-6">
        <CheckCircle2 className="h-9 w-9 text-success" />
       </div>
       <h3 className="text-2xl font-heading text-foreground mb-3">{t("auth.reset.success.title")}</h3>
       <p className="text-muted text-sm mb-8 leading-relaxed">{message}</p>
       <Link href="/login" className="text-brand font-semibold text-sm hover:text-brand-hover transition-colors">
        {t("auth.reset.success.cta")}
       </Link>
      </div>
     ) : (
      <form className="space-y-5" onSubmit={handleSubmit}>
       {status ==="error" && (
        <div className="bg-danger-bg border border-danger-border text-danger p-4 rounded-2xl text-sm font-medium flex items-start gap-3">
         <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
         {message}
        </div>
       )}

       <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-widest text-subtle">
         {t("auth.reset.new_password")}
        </label>
        <div className="relative">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-subtle" />
         </div>
         <input
          type="password"
          required
          className="input-base pl-11"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
         />
        </div>
       </div>

       <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-widest text-subtle">
         {t("auth.reset.confirm_password")}
        </label>
        <div className="relative">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-subtle" />
         </div>
         <input
          type="password"
          required
          className="input-base pl-11"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
         />
        </div>
       </div>

       <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 transition-all active:scale-95 mt-2"
       >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? t("auth.reset.loading") : t("auth.reset.button")}
       </button>
      </form>
     )}
    </div>
   </div>
  </div>
 );
}

export default function ResetPasswordPage() {
 return (
  <Suspense fallback={
   <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-[3px] border-border-strong border-t-brand rounded-full animate-spin" />
   </div>
  }>
   <ResetPasswordContent />
  </Suspense>
 );
}
