"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Sparkles, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function LoginPage() {
 const router = useRouter();
 const { t } = useLanguage();
 const [formData, setFormData] = useState({ username:"", password:""});
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [showPwd, setShowPwd] = useState(false);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
   const response = await fetchApi("/auth/login", {
    method:"POST",
    body: JSON.stringify({ email: formData.username, password: formData.password }),
   });
   if (response.error) {
    setError(response.error);
   } else if (response.data && (response.data as any).access_token) {
    localStorage.setItem("token", (response.data as any).access_token);
    router.push("/dashboard");
   }
  } catch {
   setError(t("auth.server_error"));
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
   {/* Blobs décoratifs */}
   <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 dark:bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
   <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-violet-100/40 dark:bg-violet-950/15 rounded-full blur-[100px] pointer-events-none translate-y-1/4 -translate-x-1/4" />

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
     {t("auth.login.title")}
    </h1>
    <p className="text-center text-sm text-subtle mb-8">
     <Link href="/register" className="font-semibold text-brand hover:text-brand-hover transition-colors">
      {t("auth.register.link")}
     </Link>
    </p>

    {/* Card */}
    <div className="bg-surface border border-border rounded-3xl py-10 px-8 shadow-sm">
     {error && (
      <div className="bg-danger-bg border border-danger-border text-danger p-4 mb-6 rounded-2xl text-sm font-medium flex items-start gap-3">
       <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
       {error}
      </div>
     )}

     <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
       <label htmlFor="username" className="block text-xs font-bold uppercase tracking-widest text-subtle">
        {t("auth.email")}
       </label>
       <input
        id="username"
        name="username"
        type="email"
        autoComplete="email"
        required
        className="input-base"
        placeholder="nom@exemple.com"
        value={formData.username}
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
         autoComplete="current-password"
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

      <div className="flex justify-end">
       <Link href="/forgot-password" className="text-xs font-semibold text-subtle hover:text-brand transition-colors">
        {t("auth.forgot")}
       </Link>
      </div>

      <button
       type="submit"
       disabled={loading}
       className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 transition-all active:scale-95 mt-2"
      >
       {loading ? t("auth.login.loading") : t("auth.login.button")}
      </button>
     </form>
    </div>
   </div>
  </div>
 );
}
