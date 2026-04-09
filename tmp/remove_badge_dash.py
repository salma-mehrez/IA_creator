import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\lib\i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace in English
content = content.replace('"landing.hero.badge":"March 2026 — Version 1.0 Studio"', '"landing.hero.badge":"March 2026 Version 1.0 Studio"')

# Replace in French
content = content.replace('"landing.hero.badge":"Mars 2026 — Version 1.0 Studio"', '"landing.hero.badge":"Mars 2026 Version 1.0 Studio"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully removed the long dash from the hero badge")
