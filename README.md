# 🎬 TubeAI Creator

> **Plateforme SaaS propulsée par l'IA pour les créateurs YouTube** — Générez des scripts viraux, analysez vos performances et planifiez votre contenu en quelques clics.

---

## 📌 Vue d'ensemble

**TubeAI Creator** est une application web full-stack conçue pour aider les créateurs YouTube à produire du contenu de haute qualité plus rapidement. Elle connecte l'API YouTube à Google Gemini (IA générative) pour analyser une chaîne, suggérer des idées de vidéos stratégiques et rédiger automatiquement des scripts détaillés, scène par scène.

La plateforme fonctionne selon un système de **Workspaces** : chaque espace de travail est lié à une chaîne YouTube spécifique, ce qui permet de gérer plusieurs chaînes indépendamment.

---

## ✨ Fonctionnalités principales

### 🤖 Assistance IA (Google Gemini 2.5 Flash)
- **Génération d'idées virales** : suggère 5 à 6 sujets stratégiques basés sur la niche et l'historique de la chaîne
- **Plan de script (outline)** : structure une vidéo section par section avec objectifs de rétention
- **Script complet scène par scène** : rédige le texte parlé intégral, les instructions de montage et la durée de chaque scène
- **Chatbot de brainstorming** : affine les idées en mode conversationnel avec score viral estimé
- **Clonage de style** : analyse les transcriptions de référence pour imiter le ton et le vocabulaire du créateur
- **Support multilingue** : génération de contenu dans la langue choisie par l'utilisateur

### 📊 Analyse de chaîne YouTube
- Synchronisation des données de la chaîne (abonnés, vues, nombre de vidéos)
- Import et stockage des vidéos existantes avec leurs statistiques (vues, likes, commentaires)
- Transcription des vidéos de référence pour le clonage de style
- Analyse des performances pour orienter les prochaines idées

### 📋 Gestion de contenu
- **Pipeline de production** : suivi du statut de chaque vidéo (`idea → scripted → recorded → edited → published`)
- **Planning éditorial** : planification des dates de publication
- **Bibliothèque de vidéos** : stockage des scripts, plans et scènes en base de données
- **Score viral** : évaluation de chaque idée de 0 à 100

### 🔐 Authentification & Sécurité
- Inscription / Connexion avec hachage de mot de passe (bcrypt)
- Vérification d'email
- Réinitialisation de mot de passe par token
- JWT pour la gestion des sessions

---

## 🏗️ Architecture technique

```
plateforme/
├── backend/                    # API REST (Python)
│   ├── main.py                 # Point d'entrée FastAPI
│   ├── models.py               # Modèles SQLAlchemy (User, Workspace, Video, Scene...)
│   ├── schemas.py              # Schémas Pydantic (validation des données)
│   ├── database.py             # Connexion SQLite / SQLAlchemy
│   ├── auth.py                 # JWT & gestion des tokens
│   ├── email_service.py        # Envoi d'emails (vérification, reset)
│   ├── routers/
│   │   ├── auth_router.py      # Routes : inscription, login, vérification
│   │   ├── video_router.py     # Routes : création, script, scènes
│   │   └── workspace_router.py # Routes : workspace, YouTube sync, IA
│   └── services/
│       ├── ai_service.py       # Intégration Google Gemini (scripts, idées, chat)
│       ├── youtube_service.py  # Intégration YouTube Data API v3
│       └── audit_service.py    # Journalisation des actions
│
└── frontend/                   # Interface utilisateur (TypeScript)
    └── src/
        ├── app/
        │   ├── page.tsx        # Landing page
        │   ├── (auth)/         # Pages login / register
        │   └── dashboard/      # Interface principale
        ├── components/
        │   ├── Navbar.tsx      # Barre de navigation
        │   └── Sidebar.tsx     # Menu latéral du dashboard
        └── lib/                # Utilitaires et appels API
```

---

## 🛠️ Stack technologique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.10+ |
| **Base de données** | SQLite (SQLAlchemy ORM) |
| **IA générative** | Google Gemini 2.5 Flash (`google-generativeai`) |
| **API externe** | YouTube Data API v3 (`google-api-python-client`) |
| **Auth** | JWT (`python-jose`), bcrypt (`passlib`) |
| **Validation** | Pydantic v2 |
| **Email** | SMTP via `email_service.py` |

---

## 🚀 Démarrage rapide

### Prérequis
- Python 3.10+
- Node.js 18+
- Une clé API **Google Gemini** → [aistudio.google.com](https://aistudio.google.com)
- Une clé API **YouTube Data v3** → [console.cloud.google.com](https://console.cloud.google.com)

### 1. Backend

```bash
cd backend

# Créer et activer l'environnement virtuel
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Remplir .env avec vos clés API

# Lancer le serveur
uvicorn main:app --reload
# API disponible sur http://localhost:8000
# Documentation interactive : http://localhost:8000/docs
```

### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
# Application disponible sur http://localhost:3000
```

---

## ⚙️ Variables d'environnement

Créer un fichier `.env` dans `/backend` basé sur `.env.example` :

```env
GEMINI_API_KEY=votre_cle_gemini
YOUTUBE_API_KEY=votre_cle_youtube
SECRET_KEY=votre_secret_jwt
DATABASE_URL=sqlite:///./tubeai.db
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe
```

---

## 📈 Modèle de données

```
User (1) ──── (N) Workspace
                    │
                    ├── (N) Video
                    │         └── (N) Scene
                    │
                    └── (N) YouTubeVideo (vidéos importées)
```

- **User** : compte utilisateur avec authentification
- **Workspace** : espace lié à une chaîne YouTube (profil, stats, style de référence)
- **Video** : projet vidéo avec titre, script, plan, statut et score viral
- **Scene** : unité de script (description visuelle + texte audio + durée)
- **YouTubeVideo** : vidéos importées depuis YouTube pour l'analyse

---

## 📄 Licence

Projet privé — Tous droits réservés.
