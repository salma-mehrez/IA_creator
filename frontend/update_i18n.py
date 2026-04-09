import re
content = open('src/lib/i18n.tsx', 'r', encoding='utf-8').read()

en_adds = """
    "analysis.title": "Channel Analysis",
    "analysis.last_sync": "Last Sync",
    "analysis.refresh": "Refresh",
    "analysis.syncing": "Synchronizing...",
    "analysis.run_audit": "Run full audit",
    "analysis.auditing": "Audit in progress...",
    "analysis.setup.title": "Configure your channel",
    "analysis.setup.desc": "Enter your YouTube channel URL or ID to start real-time analysis.",
    "analysis.setup.input": "Ex: https://youtube.com/@handle",
    "analysis.setup.button": "Connect channel",
    "analysis.report.title": "Performance Report",
    "analysis.report.top_video": "Top Video",
    "analysis.report.ai_tips": "AI Actionable Tips (Precise)",
    "analysis.videos.title": "Published Videos",
    "analysis.videos.search": "Search for a video...",
    "analysis.videos.empty": "No synchronized videos",
    "analysis.loading": "Domain analysis in progress...",
    
    "settings.title": "Workspace Settings",
    "settings.subtitle": "Customization & Identity",
    "settings.save": "Save Changes",
    "settings.loading": "Loading control center...",
    "settings.identity": "Workspace Identity",
    "settings.name": "Workspace Name",
    "settings.niche": "YouTube Niche",
    "settings.niche_placeholder": "Ex: AI, Tech, Finance, Gaming...",
    "settings.persona": "Default Persona",
    "settings.reference": "Reference Voice / Style",
    "settings.reference_desc": "Paste the script or transcript of a video that perfectly represents your style. The AI will analyze it to extract your tone, vocabulary, and structure.",
    "settings.reference_placeholder": "Paste your transcript here...",
    "settings.style_active": "Style analysis active",
    "settings.style_desc": "Once saved, this transcript will serve as a 'Few-Shot' model for every new script generation.",
    
    "planning.title": "Production Planning",
    "planning.table": "Table",
    "planning.kanban": "Kanban",
    "planning.calendar": "Calendar",
    "planning.generate_ai": "Generate 30d AI",
    "planning.generating": "Generating...",
    "planning.add": "Add",
    "planning.all": "All",
    "planning.search": "Search for a video...",
    "planning.loading": "Planning in progress...",
    "planning.new_project": "New Project",
    "planning.edit_project": "Edit Project",
    "planning.form.title": "Video Title",
    "planning.form.category": "Category",
    "planning.form.status": "Status",
    "planning.form.viral": "Viral Potential (%)",
    "planning.form.date": "Planned Date",
    "planning.form.cancel": "Cancel",
    "planning.form.create": "Create project",
    "planning.form.save": "Save changes",
  },
"""

fr_adds = """
    "analysis.title": "Analyse de Chaîne",
    "analysis.last_sync": "Dernière synchro",
    "analysis.refresh": "Actualiser",
    "analysis.syncing": "Synchronisation...",
    "analysis.run_audit": "Lancer l'audit complet",
    "analysis.auditing": "Audit en cours...",
    "analysis.setup.title": "Configurer votre chaîne",
    "analysis.setup.desc": "Entrez l'URL ou l'ID de votre chaîne YouTube pour démarrer l'analyse en temps réel.",
    "analysis.setup.input": "Ex: https://youtube.com/@handle",
    "analysis.setup.button": "Connecter la chaîne",
    "analysis.report.title": "Rapport de Performance",
    "analysis.report.top_video": "Top Vidéo",
    "analysis.report.ai_tips": "Conseils IA (Précis)",
    "analysis.videos.title": "Vidéos Publiées",
    "analysis.videos.search": "Rechercher une vidéo...",
    "analysis.videos.empty": "Aucune vidéo synchronisée",
    "analysis.loading": "Analyse du domaine en cours...",
    
    "settings.title": "Paramètres de l'espace",
    "settings.subtitle": "Personnalisation & Identité",
    "settings.save": "Enregistrer",
    "settings.loading": "Chargement du centre de contrôle...",
    "settings.identity": "Identité de l'espace",
    "settings.name": "Nom de l'espace",
    "settings.niche": "Niche YouTube",
    "settings.niche_placeholder": "Ex: IA, Tech, Finance, Gaming...",
    "settings.persona": "Persona par défaut",
    "settings.reference": "Voix / Style de référence",
    "settings.reference_desc": "Collez le script ou la transcription d'une vidéo qui représente parfaitement votre style. L'IA l'analysera pour extraire votre ton, vocabulaire et structure.",
    "settings.reference_placeholder": "Collez votre transcription ici...",
    "settings.style_active": "Analyse de style active",
    "settings.style_desc": "Une fois enregistré, cette transcription servira de modèle 'Few-Shot' pour chaque nouvelle génération de script.",
    
    "planning.title": "Planification de Production",
    "planning.table": "Tableau",
    "planning.kanban": "Kanban",
    "planning.calendar": "Calendrier",
    "planning.generate_ai": "Générer 30j IA",
    "planning.generating": "Génération...",
    "planning.add": "Ajouter",
    "planning.all": "Tous",
    "planning.search": "Rechercher une vidéo...",
    "planning.loading": "Planification en cours...",
    "planning.new_project": "Nouveau Projet",
    "planning.edit_project": "Modifier le Projet",
    "planning.form.title": "Titre de la vidéo",
    "planning.form.category": "Catégorie",
    "planning.form.status": "Statut",
    "planning.form.viral": "Potentiel Viral (%)",
    "planning.form.date": "Date prévue",
    "planning.form.cancel": "Annuler",
    "planning.form.create": "Créer le projet",
    "planning.form.save": "Enregistrer les modifications",
  },
"""

es_adds = """
    "analysis.title": "Análisis de Canal",
    "analysis.last_sync": "Última sincronización",
    "analysis.refresh": "Actualizar",
    "analysis.syncing": "Sincronizando...",
    "analysis.run_audit": "Ejecutar auditoría completa",
    "analysis.auditing": "Auditoría en curso...",
    "analysis.setup.title": "Configura tu canal",
    "analysis.setup.desc": "Introduce la URL o el ID de tu canal de YouTube para comenzar el análisis en tiempo real.",
    "analysis.setup.input": "Ej: https://youtube.com/@handle",
    "analysis.setup.button": "Conectar canal",
    "analysis.report.title": "Informe de Rendimiento",
    "analysis.report.top_video": "Mejor Vídeo",
    "analysis.report.ai_tips": "Consejos IA (Precisos)",
    "analysis.videos.title": "Vídeos Publicados",
    "analysis.videos.search": "Buscar un vídeo...",
    "analysis.videos.empty": "No hay vídeos sincronizados",
    "analysis.loading": "Análisis de dominio en curso...",
    
    "settings.title": "Ajustes del Espacio",
    "settings.subtitle": "Personalización e Identidad",
    "settings.save": "Guardar Cambios",
    "settings.loading": "Cargando el centro de control...",
    "settings.identity": "Identidad del Espacio",
    "settings.name": "Nombre del Espacio",
    "settings.niche": "Nicho de YouTube",
    "settings.niche_placeholder": "Ej: IA, Tech, Finanzas, Gaming...",
    "settings.persona": "Persona por defecto",
    "settings.reference": "Voz / Estilo de referencia",
    "settings.reference_desc": "Pega el guion o la transcripción de un vídeo que represente perfectamente tu estilo. La IA lo analizará para extraer tu tono, vocabulario y estructura.",
    "settings.reference_placeholder": "Pega tu transcripción aquí...",
    "settings.style_active": "Análisis de estilo activo",
    "settings.style_desc": "Una vez guardada, esta transcripción servirá como modelo 'Few-Shot' para cada nueva generación de guiones.",
    
    "planning.title": "Planificación de Producción",
    "planning.table": "Tabla",
    "planning.kanban": "Kanban",
    "planning.calendar": "Calendario",
    "planning.generate_ai": "Generar 30d IA",
    "planning.generating": "Generando...",
    "planning.add": "Añadir",
    "planning.all": "Todos",
    "planning.search": "Buscar un vídeo...",
    "planning.loading": "Planificación en progreso...",
    "planning.new_project": "Nuevo Proyecto",
    "planning.edit_project": "Editar Proyecto",
    "planning.form.title": "Título del vídeo",
    "planning.form.category": "Categoría",
    "planning.form.status": "Estado",
    "planning.form.viral": "Potencial Viral (%)",
    "planning.form.date": "Fecha planificada",
    "planning.form.cancel": "Cancelar",
    "planning.form.create": "Crear proyecto",
    "planning.form.save": "Guardar cambios",
  }
"""

content = content.replace('    "common.success": "Success",\\n  },', '    "common.success": "Success",\\n' + en_adds)
content = content.replace('    "common.success": "Succès",\\n  },', '    "common.success": "Succès",\\n' + fr_adds)
content = content.replace('    "common.success": "Éxito",\\n  }', '    "common.success": "Éxito",\\n' + es_adds)

auto_detect_old = '''  useEffect(() => {
    // Check localStorage on mount
    const savedLang = localStorage.getItem("tubeai_language") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "fr" || savedLang === "es")) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);'''

auto_detect_new = '''  useEffect(() => {
    // Check localStorage on mount
    let savedLang = localStorage.getItem("tubeai_language") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "fr" || savedLang === "es")) {
      setLanguageState(savedLang);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "fr" || browserLang === "es") {
        savedLang = browserLang;
        setLanguageState(savedLang);
        localStorage.setItem("tubeai_language", savedLang);
      } else {
        setLanguageState("en");
        localStorage.setItem("tubeai_language", "en");
      }
    }
    setMounted(true);
  }, []);'''

content = content.replace(auto_detect_old, auto_detect_new)

with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
