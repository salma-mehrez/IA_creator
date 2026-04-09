import re

file_path = 'c:/mes projets/plateforme - Copie/frontend/src/app/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace text content
content = content.replace('<span>Mars 2026 — Version 1.0 Studio</span>', '<span>{t("landing.hero.badge")}</span>')
content = content.replace('{ num:"3", label:"Niveaux d\'app"}', '{ num:"3", label: t("landing.stats.levels")}')
content = content.replace('{ num:"4", label:"Modules IA / chaîne"}', '{ num:"4", label: t("landing.stats.modules")}')
content = content.replace('{ num:"∞", label:"Chaînes par compte"}', '{ num:"∞", label: t("landing.stats.channels")}')
content = content.replace('Une opportunité inédite', '{t("landing.presentation.badge")}')
content = content.replace('Transformez votre workflow créatif', '{t("landing.presentation.title")}')
content = content.replace('Les créateurs font face à des défis constants : trouver des idées, rédiger des scripts, maintenir un rythme. TubeAI Creator révolutionne ce processus.', '{t("landing.presentation.subtitle")}')

# OpportunityItems (props)
content = content.replace('title="Gain de temps considérable"', 'title={t("landing.presentation.item1.title")}')
content = content.replace('desc="Générez des idées, scripts et plannings en secondes pour publier plus régulièrement."', 'desc={t("landing.presentation.item1.desc")}')
content = content.replace('title="Qualité de contenu supérieure"', 'title={t("landing.presentation.item2.title")}')
content = content.replace('desc="Scripts structurés et optimisés SEO, adaptés précisément à votre audience cible."', 'desc={t("landing.presentation.item2.desc")}')
content = content.replace('title="Scalabilité maximale"', 'title={t("landing.presentation.item3.title")}')
content = content.replace('desc="Gérez plusieurs chaînes dans différentes niches depuis une seule interface."', 'desc={t("landing.presentation.item3.desc")}')

# ModuleCards (props and text)
content = content.replace('title="Analyse de chaîne"', 'title={t("landing.modules.m1.title")}')
content = content.replace('desc="Rapport structuré avec scores SEO, Thumbnails et recommandations concrètes."', 'desc={t("landing.modules.m1.desc")}')
content = content.replace('title="Générateur d\'idées"', 'title={t("landing.modules.m2.title")}')
content = content.replace('desc="Idées ciblées avec score viral (0-100), tags thématiques et durée estimée."', 'desc={t("landing.modules.m2.desc")}')
content = content.replace('title="Générateur de scripts"', 'title={t("landing.modules.m3.title")}')
content = content.replace('desc="Scripts complets basés sur audience, narration et critères SEO."', 'desc={t("landing.modules.m3.desc")}')
content = content.replace('title="Planning de production"', 'title={t("landing.modules.m4.title")}')
content = content.replace('desc="Kanban intuitif pour suivre chaque vidéo de l\'idée à la publication."', 'desc={t("landing.modules.m4.desc")}')

# Section headers
content = content.replace('Structure Fonctionnelle', '{t("landing.modules.title")}')
content = content.replace('Votre workflow de production, réinventé par l\'IA', '{t("landing.modules.subtitle")}')

# Other cards
content = content.replace('title:"Monétisation accélérée"', 'title: t("landing.presentation.card1.title")')
content = content.replace('desc:"Atteignez les seuils de monétisation YouTube plus rapidement avec une croissance soutenue."', 'desc: t("landing.presentation.card1.desc")')
content = content.replace('title:"Analyse concurrentielle"', 'title: t("landing.presentation.card2.title")')
content = content.replace('desc:"Identifiez les opportunités de croissance spécifiques à votre niche de contenu."', 'desc: t("landing.presentation.card2.desc")')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
