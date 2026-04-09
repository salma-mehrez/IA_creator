import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\lib\i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update English
old_en_title = '"landing.hero.title":"AI-Powered YouTube Mastery",'
new_en_title = '"landing.hero.title":"More Views. Less Stress.",'
old_en_sub = '"landing.hero.subtitle":"Analyze your channel, generate viral topics, and write perfect scripts in minutes with our elite AI.",'
new_en_sub = '"landing.hero.subtitle":"Meet your YouTube creative studio — viral ideas, smart scheduling, and AI-written scripts, all in one place.",'

content = content.replace(old_en_title, new_en_title)
content = content.replace(old_en_sub, new_en_sub)

# Update French (Translating the user's new text)
old_fr_title = '"landing.hero.title":"La Maîtrise de YouTube Propulsée par l\'IA",'
new_fr_title = '"landing.hero.title":"Plus de Vues. Moins de Stress.",'
old_fr_sub = '"landing.hero.subtitle":"Analysez votre chaîne, générez des sujets viraux et rédigez des scripts parfaits en quelques minutes avec notre IA d\'élite.",'
new_fr_sub = '"landing.hero.subtitle":"Découvrez votre studio créatif YouTube — idées virales, planification intelligente et scripts par IA, tout au même endroit.",'

content = content.replace(old_fr_title, new_fr_title)
content = content.replace(old_fr_sub, new_fr_sub)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated landing page text")
