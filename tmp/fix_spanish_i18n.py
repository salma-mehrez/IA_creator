import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\lib\i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Spanish title
old_es = '"landing.hero.title":"Dominio de YouTube Potenciado por IA"'
new_es = '"landing.hero.title_p1":"Más Vistas.",\n  "landing.hero.title_p2":"Menos Estrés."'

if old_es in content:
    content = content.replace(old_es, new_es)
    print("Found and replaced Spanish title.")
else:
    print("Spanish title not found exactly.")
    # Try with different quote if needed or partial
    if '"landing.hero.title":' in content:
        print("Key found, but value might differ.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
