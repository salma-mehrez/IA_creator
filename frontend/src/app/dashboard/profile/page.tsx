"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Loader2, CheckCircle2, AlertTriangle, User, Lock, Mail, Upload, Camera } from "lucide-react";
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    current_password: "",
    password: "",
    confirm_password: "",
    avatar_url: ""
  });

  useEffect(() => {
    fetchApi("/auth/me").then((res) => {
      if (res.data) {
        const u = res.data as any;
        setFormData({
          username: u.username || "",
          email: u.email || "",
          current_password: "",
          password: "",
          confirm_password: "",
          avatar_url: u.avatar_url || ""
        });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
  }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError(language === 'en' ? 'Image must be less than 2MB' : language === 'es' ? 'La imagen debe tener menos de 2 MB' : 'L\'image doit faire moins de 2 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Resize logic using a canvas for optimization
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // compress as light jpeg
        const base64String = canvas.toDataURL("image/jpeg", 0.8);
        setFormData(prev => ({ ...prev, avatar_url: base64String }));
      };
      
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");

    // Validation
    if (formData.password && formData.password !== formData.confirm_password) {
      setError(language === "en" ? "Passwords do not match." : language === "es" ? "Las contraseñas no coinciden." : "Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.password && !formData.current_password) {
      setError(language === "en" ? "Please enter your current password to change it." : language === "es" ? "Ingrese su contraseña actual para cambiarla." : "Veuillez entrer votre mot de passe actuel pour le changer.");
      return;
    }

    setSaving(true);
    setSaved(false);

    const updatePayload: any = { 
      username: formData.username,
      avatar_url: formData.avatar_url
    };
    if (formData.password) {
      updatePayload.password = formData.password;
      updatePayload.current_password = formData.current_password;
    }

    const res = await fetchApi("/auth/me", {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    });

    if (res.error) {
      setError(res.error === "Ce nom d'utilisateur est déjà pris" ? (language === "en" ? "This username is already taken" : res.error) : 
               res.error === "Le mot de passe actuel est incorrect" ? (language === "en" ? "Current password is incorrect" : res.error) : res.error);
    } else {
      setSaved(true);
      setFormData(prev => ({ ...prev, current_password: "", password: "", confirm_password: "" }));
      window.dispatchEvent(new Event("user-updated")); // Optional: simple way to tell other components to refresh
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
            {language === 'en' ? 'Manage your account information and avatar.' : language === 'es' ? 'Gestiona la información de tu cuenta y avatar.' : 'Gérez vos informations de compte et votre avatar.'}
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
            <div className="p-7 space-y-8">
              
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div 
                  className="w-20 h-20 rounded-full border-2 border-border bg-surface-secondary flex items-center justify-center relative overflow-hidden group cursor-pointer shrink-0 shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-subtle" />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white mb-1" />
                    <span className="text-[9px] text-white font-bold uppercase tracking-wider">
                      {language === "en" ? "Change" : "Modifier"}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-1">
                    {language === "en" ? "Profile Picture" : "Photo de profil"}
                  </h3>
                  <p className="text-xs text-subtle max-w-sm">
                    {language === "en" ? "Click to upload an image. Real formats are automatically compressed. Max 2MB." : "Cliquez pour importer une image. Les vrais formats sont automatiquement compressés. Max 2Mo."}
                  </p>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-border-subtle">
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

              {/* Password Section */}
              <div className="pt-6 border-t border-border-subtle space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-warning" />
                  <h3 className="font-bold text-sm text-foreground">
                    {language === 'en' ? 'Change Password' : language === 'es' ? 'Cambiar Contraseña' : 'Changer le mot de passe'}
                  </h3>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-subtle uppercase tracking-wide">
                      {language === 'en' ? 'Current Password' : 'Mot de passe actuel'}
                    </label>
                    <input
                      type="password"
                      value={formData.current_password}
                      onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                      placeholder="••••••••"
                      className="input-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-subtle uppercase tracking-wide">
                        {language === 'en' ? 'New Password' : 'Nouveau mot de passe'}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="input-base"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-subtle uppercase tracking-wide">
                        {language === 'en' ? 'Confirm Password' : 'Confirmer le mot de passe'}
                      </label>
                      <input
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                        placeholder="••••••••"
                        className="input-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
