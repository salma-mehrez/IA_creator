export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Interface standard pour les réponses API
export interface ApiResponse<T = any> {
 data?: T;
 error?: string;
 detail?: any;
}

/**
 * Fonction générique pour faire des requêtes API avec ou sans token
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // S'assurer que l'endpoint commence par /
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${cleanEndpoint}`;
 
 // Récupérer le token s'il existe (côté client uniquement)
 let token ="";
 if (typeof window !=="undefined") {
  token = localStorage.getItem("token") ||"";
 }

 const headers: any = {
 "Content-Type":"application/json",
  ...options.headers,
 };

 if (token) {
  headers["Authorization"] =`Bearer ${token}`;
 }

 try {
  const res = await fetch(url, {
   ...options,
   headers,
  });

  const data = await res.json();

  if (!res.ok) {
   // Si le token est invalide ou expiré, rediriger vers login
   if (res.status === 401 && typeof window !=="undefined") {
    localStorage.removeItem("token");
    window.location.href ="/login?expired=true";
   }

   // Les erreurs FastAPI sont souvent sous la forme {"detail":"..."}
   return {
    error: data.detail && typeof data.detail === 'string' ? data.detail :"An error occurred",
    detail: data.detail
   };
  }

  return { data };
 } catch (err: any) {
  if (err.message ==="Unauthorized"&& typeof window !=="undefined") {
    window.location.href ="/login?expired=true";
  }
  return { error: err.message ||"Server connection error"};
 }
}
