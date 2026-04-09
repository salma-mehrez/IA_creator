import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\lib\i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Restore English title
new_en = '"landing.hero.title":"AI-Powered YouTube Mastery",'
old_en1 = '"landing.hero.title_p1":"AI-Powered",'
old_en2 = '"landing.hero.title_p2":"YouTube Mastery",'
content = content.replace(old_en1, '')
content = content.replace(old_en2, new_en)

# Restore French title
new_fr = '"landing.hero.title":"La Maîtrise de YouTube Propulsée par l\'IA",'
old_fr1 = '"landing.hero.title_p1":"La Maîtrise de YouTube",'
old_fr2 = '"landing.hero.title_p2":"Propulsée par l\'IA",'
content = content.replace(old_fr1, '')
content = content.replace(old_fr2, new_fr)

# Clean up empty lines or double commas if any
content = content.replace(',\n\n', ',\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully restored i18n.tsx")
