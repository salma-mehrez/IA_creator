import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\lib\i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Split English
old_en = '"landing.hero.title":"More Views. Less Stress.",'
new_en = '"landing.hero.title_p1":"More Views.",\n  "landing.hero.title_p2":"Less Stress.",'
content = content.replace(old_en, new_en)

# Split French
old_fr = '"landing.hero.title":"Plus de Vues. Moins de Stress.",'
new_fr = '"landing.hero.title_p1":"Plus de Vues.",\n  "landing.hero.title_p2":"Moins de Stress.",'
content = content.replace(old_fr, new_fr)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully split landing titles in i18n.tsx")
