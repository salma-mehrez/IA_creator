"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Sparkles, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";

export default function RegisterPage() {
 const router = useRouter();
 const { t } = useLanguage();
 const [formData, setFormData] = useState({ username:"", email:"", password:""});
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState(false);
 const [showPwd, setShowPwd] = useState(false);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
   const response = await fetchApi("/auth/register", {
    method:"POST",
    body: JSON.stringify(formData),
   });
   if (response.error) {
    setError(response.error);
   } else {
    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
   }
  } catch {
   setError(t("auth.server_error"));
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
   <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-100/50 dark:bg-violet-950/20 rounded-full blur-[130px] pointer-events-none -translate-y-1/4 -translate-x-1/4" />
   <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-100/40 dark:bg-indigo-950/15 rounded-full blur-[110px] pointer-events-none translate-y-1/4 translate-x-1/4" />

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

    <h1 className="text-center text-3xl font-heading text-foreground mb-2">
     {t("auth.register.title")}
    </h1>
    <p className="text-center text-sm text-subtle mb-8">
     {t("auth.already_account")}{" "}
     <Link href="/login" className="font-semibold text-brand hover:text-brand-hover transition-colors">
      {t("auth.login.link")}
     </Link>
    </p>

    <div className="bg-surface border border-border rounded-3xl py-10 px-8 shadow-sm">
     {error && (
      <div className="bg-danger-bg border border-danger-border text-danger p-4 mb-6 rounded-2xl text-sm font-medium flex items-start gap-3">
       <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
       {error}
      </div>
     )}
     {success && (
      <div className="bg-success-bg border border-success-border text-success p-4 mb-6 rounded-2xl text-sm font-semibold flex items-center gap-3">
       <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
       {t("auth.register.success")}
      </div>
     )}

     <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
       <label htmlFor="username" className="block text-xs font-bold uppercase tracking-widest text-subtle">
        {t("auth.username")}
       </label>
       <input
        id="username"
        name="username"
        type="text"
        required
        className="input-base"
        placeholder={t("auth.username.placeholder")}
        value={formData.username}
        onChange={handleChange}
       />
      </div>

      <div className="space-y-1.5">
       <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-subtle">
        {t("auth.email")}
       </label>
       <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="input-base"
        placeholder={t("auth.email.placeholder")}
        value={formData.email}
        onChange={handleChange}
       />
      </div>

      <div className="space-y-1.5">
       <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-subtle">
        {t("auth.password")}
       </label>
       <div className="relative">
        <input
         id="password"
         name="password"
         type={showPwd ?"text":"password"}
         autoComplete="new-password"
         required
         className="input-base pr-12"
         placeholder="••••••••"
         value={formData.password}
         onChange={handleChange}
        />
        <button
         type="button"
         onClick={() => setShowPwd(!showPwd)}
         className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors"
        >
         {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
       </div>
      </div>

      <button
       type="submit"
       disabled={loading || success}
       className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 transition-all active:scale-95 mt-2"
      >
       {loading ? t("auth.register.loading") : t("auth.register.button")}
      </button>
     </form>
    </div>
   </div>
  </div>
 );
}
