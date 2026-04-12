"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, AlertTriangle, User, Lock, Mail } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchApi("/auth/me").then((res) => {
      if (res.data) {
        const u = res.data as any;
        setFormData({
          username: u.username || "",
          email: u.email || "",
          password: "",
        });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    const updatePayload: any = { username: formData.username };
    if (formData.password) {
      updatePayload.password = formData.password;
    }

    const res = await fetchApi("/auth/me", {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    });

    if (res.error) {
      // Basic translation fallback for potential hardcoded backend string
      setError(res.error === "Ce nom d'utilisateur est déjà pris" ? (language === "en" ? "This username is already taken" : res.error) : res.error);
    } else {
      setSaved(true);
      setFormData(prev => ({ ...prev, password: "" })); // clear password field
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-background">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-background font-sans">
      {/* Header */}
      <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-2xl font-heading text-foreground tracking-tight">
            {language === 'en' ? 'My Profile' : language === 'es' ? 'Mi Perfil' : 'Mon Profil'}
          </h1>
          <p className="text-xs text-subtle mt-0.5">
            {language === 'en' ? 'Manage your account information.' : language === 'es' ? 'Gestiona la información de tu cuenta.' : 'Gérez vos informations de compte.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4" /> {t("common.success") || "Success!"}
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1.5 text-xs text-danger font-medium">
              <AlertTriangle className="h-4 w-4" /> {error}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("common.save") || "Save"}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="px-7 py-5 border-b border-border-subtle flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-light rounded-xl flex items-center justify-center">
                <User className="h-4 w-4 text-brand" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {language === 'en' ? 'Account Details' : language === 'es' ? 'Detalles de la Cuenta' : 'Détails du compte'}
                </h2>
              </div>
            </div>
            <div className="p-7 space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-subtle uppercase tracking-wide flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input-base bg-surface-secondary text-subtle cursor-not-allowed opacity-70"
                />
                <p className="text-[10px] text-foreground-2 pl-1 opacity-70">
                  {language === 'en' ? 'Email address cannot be changed.' : language === 'es' ? 'La dirección de correo electrónico no se puede cambiar.' : 'L\'adresse email ne peut pas être modifiée.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-subtle uppercase tracking-wide flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand" /> 
                  {language === 'en' ? 'Username' : language === 'es' ? 'Nombre de usuario' : 'Nom d\'utilisateur'}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Ex: MyAwesomePseudo"
                  className="input-base"
                />
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-subtle uppercase tracking-wide flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-danger" /> 
                    {language === 'en' ? 'New Password' : language === 'es' ? 'Nueva Contraseña' : 'Nouveau mot de passe'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="input-base"
                  />
                  <p className="text-[10px] text-foreground-2 pl-1 opacity-70">
                    {language === 'en' ? 'Leave empty to keep your current password.' : language === 'es' ? 'Dejar en blanco para mantener su contraseña actual.' : 'Laissez vide pour conserver votre mot de passe actuel.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
