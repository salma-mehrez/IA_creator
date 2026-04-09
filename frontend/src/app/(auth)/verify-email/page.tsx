"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const { t } = useLanguage();
 const token = searchParams.get("token");
 const [status, setStatus] = useState<"loading"|"success"|"error">("loading");
 const [message, setMessage] = useState("");

 useEffect(() => {
  if (!token) {
   setStatus("error");
   setMessage(t("auth.verify.missing_token"));
   return;
  }
  const verify = async () => {
   const response = await fetchApi(`/auth/verify-email/${token}`);
   if (response.error) {
    setStatus("error");
    setMessage(response.error);
   } else {
    setStatus("success");
    setMessage(t("auth.verify.success.title"));
    setTimeout(() => router.push("/login"), 3000);
   }
  };
  verify();
 }, [token, router, t]);

 return (
  <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden">
   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-light/60 dark:bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none" />

   <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-12 text-center shadow-sm relative z-10">
    {/* Logo */}
    <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-10 group">
     <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:rotate-6">
      <Sparkles className="h-4 w-4 text-white" />
     </div>
     <span className="font-heading text-xl text-foreground">
      Tube<span className="text-brand">AI</span>
     </span>
    </Link>

    {status ==="loading" && (
     <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative">
       <div className="w-16 h-16 border-[3px] border-border-strong border-t-brand rounded-full animate-spin" />
       <Sparkles className="h-5 w-5 text-brand absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h1 className="text-2xl font-heading text-foreground">{t("auth.verify.loading.title")}</h1>
      <p className="text-muted text-sm">{t("auth.verify.loading.subtitle")}</p>
     </div>
    )}

    {status ==="success" && (
     <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-20 h-20 bg-success-bg rounded-2xl flex items-center justify-center border border-success-border">
       <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <h1 className="text-2xl font-heading text-foreground">{t("auth.verify.success.title")}</h1>
      <p className="text-muted leading-relaxed text-sm">{message}</p>
      <div className="w-full space-y-3 pt-2">
       <p className="text-[10px] text-subtle font-bold uppercase tracking-[0.2em]">{t("auth.verify.success.redirect")}</p>
       <Link
        href="/login"
        className="block w-full py-3.5 px-4 bg-brand hover:bg-brand-hover text-white rounded-2xl font-semibold text-sm transition-all active:scale-95"
       >
        {t("auth.verify.success.cta")}
       </Link>
      </div>
     </div>
    )}

    {status ==="error" && (
     <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-20 h-20 bg-danger-bg rounded-2xl flex items-center justify-center border border-danger-border">
       <XCircle className="h-10 w-10 text-danger" />
      </div>
      <h1 className="text-2xl font-heading text-foreground">{t("auth.verify.error.title")}</h1>
      <p className="text-muted leading-relaxed text-sm">{message}</p>
      <Link
       href="/register"
       className="block w-full py-3.5 px-4 bg-surface-secondary hover:bg-surface-hover text-foreground-2 rounded-2xl font-semibold text-sm transition-all active:scale-95 border border-border"
      >
       {t("auth.verify.error.retry")}
      </Link>
     </div>
    )}
   </div>
  </div>
 );
}

export default function VerifyEmailPage() {
 return (
  <Suspense fallback={
   <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-[3px] border-border-strong border-t-brand rounded-full animate-spin" />
   </div>
  }>
   <VerifyEmailContent />
  </Suspense>
 );
}
