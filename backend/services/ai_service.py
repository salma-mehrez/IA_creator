import os
import google.generativeai as genai
import json
import re
from typing import List, Dict, Optional

def _parse_json_response(text: str) -> Dict:
    """Safely extracts and parses JSON from a model's response, handling markdown blocks."""
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON inside markdown code blocks
        match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Last resort: try simple stripping of common characters
        stripped = text.strip().strip('`')
        if stripped.startswith('json'):
            stripped = stripped[4:].strip()
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            print(f"CRITICAL ERROR: Could not parse JSON from response: {text[:200]}...")
            return {}

def generate_script_scenes(title: str, description: str, niche: str, style_context: str = "", duration_minutes: int = 5, language: str = "en") -> List[Dict]:
    """
    Génère une liste de scènes pour une vidéo YouTube de DURÉE SPÉCIFIQUE en utilisant Gemini.
    Chaque scène contient : order, visual_description, audio_description, duration.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY non configurée")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')

    # Calcul des cibles pour l'IA
    target_words = duration_minutes * 140 # Un peu moins que 150 pour laisser respirer
    min_scenes = max(5, duration_minutes * 2) # Au moins 2 scènes par minute

    prompt = f"""
    Tu es un scénariste YouTube ELITE spécialisé dans la niche "{niche}". 
    Ta mission est de rédiger le script INTÉGRAL d'une vidéo de {duration_minutes} MINUTES. 
    
    ### LANGAGE OBLIGATOIRE :
    Tu DOIS générer tout le contenu et rédiger le script dans la langue suivante : {language}
    
    ### RÉFÉRENCES DE STYLE ET DE STRUCTURE (MODÈLES) :
    Voici les transcriptions ou descriptions de tes meilleures vidéos. 
    ANALYSE leur structure (comment le sujet est introduit, comment les arguments sont développés, le type d'humour ou de sérieux) et IMITE ce style de développement :
    {style_context if style_context else "Style viral par défaut."}

    ### BRIEF DE LA NOUVELLE VIDÉO :
    Titre : {title}
    Sujet/Détails : {description}

    ### CONSIGNES DE RÉDACTION "ULTRA-DÉTAILLÉE" :
    1. PAS DE RÉSUMÉ : Écris chaque phrase qui sera dite. Pas de "L'IA explique...".
    2. DÉVELOPPEMENT PROFOND : Ne survole pas les points. Si tu parles d'un concept, explique le POURQUOI et le COMMENT avec des détails techniques ou des exemples concrets, comme dans tes meilleures vidéos.
    3. VOLUME CIBLE : Tu DOIS atteindre environ {target_words} MOTS. Sois verbeux.
    4. DYNAMISME : Génère au moins {min_scenes} scènes. Chaque scène doit faire avancer l'histoire.
    5. DURÉE : La somme des durées doit être de {duration_minutes * 60} secondes.

    ### FORMAT DE RÉPONSE (JSON STRICT) :
    {{
      "scenes": [
        {{
          "order": 1,
          "section_name": "NOM DE LA PARTIE (ex: 'Introduction', 'Le problème', 'La solution', 'Conclusion')",
          "visual_description": "Instructions de montage (ex: Archives, split-screen, zoom...)",
          "audio_description": "TEXTE INTÉGRAL À LIRE",
          "duration": 20
        }},
        ...
      ]
    }}
    
    IMPORTANT : Ne numérote pas les titres des parties dans le JSON. L'IA doit structurer le contenu en 'Parties' logiques et fluides.
    SOIS UN EXPERT. Développe le sujet de façon exhaustive et passionnante.
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                max_output_tokens=8192,
            )
        )
        data = _parse_json_response(response.text)
        return data.get("scenes", [])
    except Exception as e:
        print(f"CRITICAL ERROR Script Gemini: {str(e)}")
        # Fallback Mock Scenes
        return [
            {
                "order": 1, 
                "section_name": "Hook", 
                "visual_description": "Cinematic B-roll of coding", 
                "audio_description": "Welcome to this complete guide on learning Python from scratch! Today we dive deep into the basics.", 
                "duration": 30
            },
            {
                "order": 2, 
                "section_name": "Setup", 
                "visual_description": "Screen recording showing VS Code", 
                "audio_description": "First, we need to install the latest version of Python. Go to python.org and download the installer.", 
                "duration": 60
            }
        ]

def generate_script_plan(title: str, description: str, niche: str, reference_transcript: str = "", persona: str = "Expert", duration_minutes: int = 5, research_facts: str = "", language: str = "en") -> List[Dict]:
    """
    Génère un plan de script (outline) pour une vidéo YouTube.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY non configurée")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')

    prompt = f"""
    Tu es un STRATÈGE YouTube EXPERT (Niveau: MrBeast / Veritasium). 
    Ton Persona est : {persona}
    Ta mission est de concevoir le PLAN STRATÉGIQUE d'une vidéo de {duration_minutes} minutes.
    
    ### LANGAGE OBLIGATOIRE :
    Tu DOIS générer ce plan (titres, objectifs) dans la langue suivante : {language}
    
    ### CONTEXTE DU SUJET :
    Titre : {title}
    Description/Brief : {description}
    Niche : {niche}
    Faits/Recherches spécifiques : {research_facts if research_facts else "Utilise tes connaissances générales."}

    ### ANALYSE DE STYLE (VOIX DU CRÉATEUR) :
    Voici un exemple de script réussi de ce créateur. IMMITE la structure et le ton (humour, sérieux, type d'accroche) :
    {reference_transcript if reference_transcript else "Style viral standard."}

    ### RÈGLES DE STRATÉGIE NARRATIVE :
    1. LE HOOK (Accroche) : Doit être en adéquation avec le persona {persona}.
    2. LA RÉTENTION : Introduis des "boucles de curiosité" basées sur les faits réels fournis.
    3. LE RYTHME : Pas de temps morts.
    4. DÉTAIL : Propose entre 3 et 6 sections distinctes (MAXIMUM 6 SECTIONS). Il est strictement interdit de dépasser 6 sections au total dans la liste.

    ### STRUCTURE MAX 6 SECTIONS :
       - Hook (0-15s) : Capture l'attention.
       - Intro (15-60s) : Promesse de la vidéo et enjeu.
       - Développement (Corps) : 1 à 3 points clés pour garantir la limite globale de 6 sections.
       - Conclusion & CTA.

    ### FORMAT DE RÉPONSE (JSON STRICT) :
    {{
      "plan": [
        {{
          "order": 1,
          "title": "Nom stratégique de la section",
          "goal": "Objectif de rétention/information précise",
          "estimated_duration": 30
        }},
        ...
      ]
    }}
    L'utilisateur veut une vidéo de {duration_minutes} minutes ancrée dans le style du créateur et les faits fournis.
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                max_output_tokens=8192,
            )
        )
        data = _parse_json_response(response.text)
        return data.get("plan", [])
    except Exception as e:
        print(f"ERROR Plan Gemini: {str(e)}")
        # Fallback Mock Data to keep the app functional
        return [
            {"order": 1, "title": "Hook & Hook (0-30s)", "goal": "Capture attention with a quick teaser", "estimated_duration": 30},
            {"order": 2, "title": "Introduction & Concept", "goal": "Explain what we will learn today", "estimated_duration": 60},
            {"order": 3, "title": "Main Tutorial Part 1", "goal": "First steps and environment setup", "estimated_duration": 180},
            {"order": 4, "title": "Practical Examples", "goal": "Show real-world usage", "estimated_duration": 120},
            {"order": 5, "title": "Conclusion & Next Steps", "goal": "Summarize and Call to Action", "estimated_duration": 60}
        ]

def generate_script_from_plan(title: str, plan: List[Dict], niche: str, reference_transcript: str = "", persona: str = "Expert", duration_minutes: int = 5, user_brief: str = "", research_facts: str = "", language: str = "en") -> List[Dict]:
    """
    Génère le script complet et détaillé à partir d'un plan pré-approuvé.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY non configurée")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')

    # Formatting plan for the prompt
    plan_str = "\n".join([f"- {p['order']}. {p['title']} ({p['estimated_duration']}s) : {p['goal']}" for p in plan])
    
    prompt = f"""
    Tu es un SCÉNARISTE YouTube "MASTER CLASS".
    Ton Persona est : {persona}
    Ton écriture doit être le reflet exact de ce persona.
    
    ### LANGAGE OBLIGATOIRE :
    Tu DOIS rédiger tout le texte parlé de ce script dans la langue suivante : {language}
    
    ### MISSION CRITIQUE :
    Rédiger le script intégral ({duration_minutes} min) en suivant ce plan :
    {plan_str}
    
    ### CONTEXTE & SOURCES :
    Titre : {title}
    Brief : {user_brief}
    Niche : {niche}
    FAITS ET DONNÉES À INCLURE (PRIORITAIRE) : {research_facts if research_facts else "Utilise tes connaissances."}

    ### CLONAGE DE STYLE (RÉFÉRENCE) :
    ANALYSE ce texte de référence et reproduis le même VOCABULAIRE, les mêmes TICS DE LANGAGE et la même ÉNERGIE :
    {reference_transcript if reference_transcript else "Style professionnel standard."}

    ### RÈGLES DE RÉDACTION "ULTRA-DÉTAILLÉE" :
    1. RATIO DE MOTS : Écris environ 2.5 à 3 mots par seconde.
    2. ANCRAGE RÉEL : Intègre les faits fournis dans {research_facts} de façon naturelle mais visible.
    3. INCARNATION DU PERSONA : Le ton "{persona}" doit transparaître dans chaque phrase.
    4. PAS DE RÉSUMÉ : Écris le texte parlé INTÉGRAL.
    5. VOLUME TOTAL : Vise {duration_minutes * 150} à {duration_minutes * 170} mots.

    ### FORMAT DE RÉPONSE :
    {{
      "scenes": [
        {{
          "order": 1,
          "section_name": "Titre du plan",
          "visual_description": "Instruction de montage précise",
          "audio_description": "TEXTE PARLÉ INTÉGRAL (DÉVELOPPÉ AU MAXIMUM)",
          "duration": 20
        }},
        ...
      ]
    }}
    Fais en sorte que le créateur se reconnaisse dans chaque mot.
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                max_output_tokens=8192,
            )
        )
        data = _parse_json_response(response.text)
        return data.get("scenes", [])
    except Exception as e:
        print(f"ERROR Script From Plan Gemini: {str(e)}")
        # Fallback Mock Script
        return [
            {
                "order": 1, 
                "section_name": "Introduction", 
                "visual_description": "Host talking to camera", 
                "audio_description": "If you ever wanted to master Python, you are in the right place. This structured guide will take you from zero to hero.", 
                "duration": 45
            }
        ]

def chat_idea_refinement(messages: List[Dict], niche: str, channel_context: str = "", language: str = "en") -> Dict:
    """Chatbot conversationnel pour affiner des idées de vidéos YouTube."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY non configurée")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')

    history_str = ""
    for msg in messages[:-1]:
        role = "Utilisateur" if msg["role"] == "user" else "Assistant"
        history_str += f"{role}: {msg['content']}\n"

    last_message = messages[-1]["content"] if messages else ""

    prompt = f"""
    Tu es un expert en stratégie YouTube et brainstorming de contenu vidéo.
    Aide le créateur à développer et affiner ses idées de vidéos.

    ### CONTEXTE DE LA CHAÎNE :
    Niche : {niche}
    {channel_context}

    ### LANGUE OBLIGATOIRE :
    Réponds UNIQUEMENT en : {language}

    ### HISTORIQUE :
    {history_str if history_str else "Début de conversation."}

    ### MESSAGE ACTUEL :
    {last_message}

    ### INSTRUCTIONS :
    1. Réponds de façon conversationnelle, utile et concise
    2. Aide à affiner l'idée, propose des angles et titres accrocheurs
    3. Si l'idée est claire, propose un titre YouTube optimisé avec un score viral estimé
    4. Pose une question de clarification si nécessaire
    5. Marque add_to_planning à true si l'idée est assez mature pour être planifiée

    ### FORMAT DE RÉPONSE (JSON STRICT) :
    {{
      "message": "Ta réponse conversationnelle",
      "suggested_title": "Titre YouTube optimisé si applicable, sinon null",
      "viral_score": 85,
      "add_to_planning": false
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                max_output_tokens=1024,
            )
        )
        return _parse_json_response(response.text)
    except Exception as e:
        error_detail = str(e)
        print(f"CRITICAL ERROR Chat Gemini: {error_detail}")
        return {
            "message": f"Désolé, une erreur IA s'est produite : {error_detail}. Vérifie ta GEMINI_API_KEY sur Render.",
            "suggested_title": None, 
            "viral_score": None, 
            "add_to_planning": False
        }


def generate_quick_suggestions(niche: str, channel_context: str = "", language: str = "en") -> List[Dict]:
    """Génère 6 suggestions rapides basées sur l'analyse de la chaîne YouTube."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY non configurée")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')

    prompt = f"""
    Tu es un expert en stratégie YouTube. Analyse ce profil de chaîne et génère 6 idées de vidéos stratégiques.

    ### PROFIL :
    Niche : {niche}
    {channel_context}

    ### LANGUE : {language}

    ### INSTRUCTIONS :
    1. Identifie les lacunes de contenu (sujets pertinents non encore couverts)
    2. Varie les formats : tutoriel, opinion, cas pratique, comparaison, top N, etc.
    3. Titres optimisés pour le CTR YouTube
    4. Base-toi sur les performances existantes pour affiner les suggestions

    ### FORMAT DE RÉPONSE (JSON STRICT) :
    {{
      "suggestions": [
        {{
          "title": "Titre accrocheur YouTube",
          "why": "Pourquoi ce sujet est stratégique (1 phrase)",
          "viral_score": 87,
          "format": "Tutoriel"
        }}
      ]
    }}
    Génère exactement 6 suggestions variées.
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                max_output_tokens=2048,
            )
        )
        data = _parse_json_response(response.text)
        return data.get("suggestions", [])
    except Exception as e:
        print(f"ERROR Suggestions Gemini: {str(e)}")
        return []


def generate_video_topics(niche: str, workspace_context: str = "", language: str = "en") -> List[Dict]:
    """
    Génère 5 idées de vidéos virales basées sur la niche.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY non configurée")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')

    prompt = f"""
    En tant qu'expert en stratégie YouTube, génère 5 idées de vidéos à fort potentiel viral pour une chaîne dans la niche : {niche}.
    
    ### CONTEXTE DE LA CHAÎNE :
    {workspace_context}

    ### INSTRUCTIONS :
    1. Analyse les dernières vidéos (si fournies) pour comprendre ce qui fonctionne (vues élevées) et le style habituel.
    2. Propose des sujets qui complètent l'existant ou explorent des angles connexes à fort potentiel.
    3. Assure-toi que les titres sont ultra-accrocheurs (fort CTR).
    4. Reste uniquement dans la langue : {language}.

    Réponds UNIQUEMENT avec un objet JSON valide sous ce format :
    {{
      "topics": [
        {{
          "title": "Titre accrocheur",
          "description": "Explique pourquoi ce sujet est stratégique par rapport à l'historique ou à la niche",
          "viral_score": 90
        }},
        ...
      ]
    }}
    Sois créatif et spécifique. Évite les titres génériques.
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                max_output_tokens=8192,
            )
        )
        data = _parse_json_response(response.text)
        return data.get("topics", [])
    except Exception as e:
        print(f"CRITICAL ERROR Gemini: {str(e)}")
        return []

