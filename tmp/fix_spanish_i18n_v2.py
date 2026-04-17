import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\lib\i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Remove the first badge duplicate at the start of the 'es: {' block
    if i > 0 and 'es: {' in lines[i-1] and 'landing.hero.badge' in line:
        continue # skip it
        
    # Remove lines 1372 to 1426 (landing.presentation.badge to landing.footer.rights)
    if '\"landing.presentation.badge\":\"Una oportunidad' in line and i > 1300 and i < 1400:
        skip = True
        
    if skip:
        if '\"dashboard.growth.title\":\"Crecimiento' in line:
            skip = False
            new_lines.append(line)
        continue
        
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Cleaned up i18n.tsx Spanish duplicates.')
