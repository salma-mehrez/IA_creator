import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\lib\i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# English
content = content.replace('"landing.hero.title_p1":"More Views."', '"landing.hero.title_p1":"Your YouTube"')
content = content.replace('"landing.hero.title_p2":"Less Stress."', '"landing.hero.title_p2":"Creative Studio."')
content = content.replace('"landing.hero.subtitle":"Meet your YouTube creative studio — viral ideas, smart scheduling, and AI-written scripts, all in one place."', '"landing.hero.subtitle":"The all-in-one tool that helps you find ideas, write scripts, and grow your channel with ease."')

# French
content = content.replace('"landing.hero.title_p1":"Plus de Vues."', '"landing.hero.title_p1":"Votre YouTube"')
content = content.replace('"landing.hero.title_p2":"Moins de Stress."', '"landing.hero.title_p2":"Studio Créatif."')
content = content.replace('"landing.hero.subtitle":"Découvrez votre studio créatif YouTube — idées virales, planification intelligente et scripts par IA, tout au même endroit."', '"landing.hero.subtitle":"L\'outil tout-en-un qui vous aide à trouver des idées, rédiger des scripts et faire croître votre chaîne en toute simplicité."')

# Spanish
content = content.replace('"landing.hero.title_p1":"Más Vistas."', '"landing.hero.title_p1":"Tu YouTube"')
content = content.replace('"landing.hero.title_p2":"Menos Estrés."', '"landing.hero.title_p2":"Estudio Creativo."')
content = content.replace('"landing.hero.subtitle":"Analiza tu canal, genera temas virales y escribe guiones perfectos en minutos con nuestra IA de élite."', '"landing.hero.subtitle":"La herramienta todo-en-uno que te ayuda a encontrar ideas, escribir guiones y hacer crecer tu canal con facilidad."')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated hero copy in all languages")
