import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\lib\i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace English title
old_en = '"landing.hero.title":"AI-Powered YouTube Mastery",'
new_en = '"landing.hero.title_p1":"AI-Powered",\n  "landing.hero.title_p2":"YouTube Mastery",'
content = content.replace(old_en, new_en)

# Replace French title
old_fr = '"landing.hero.title":"La Maîtrise de YouTube Propulsée par l\'IA",'
new_fr = '"landing.hero.title_p1":"La Maîtrise de YouTube",\n  "landing.hero.title_p2":"Propulsée par l\'IA",'
content = content.replace(old_fr, new_fr)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated i18n.tsx")
