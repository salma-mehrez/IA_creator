import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Look for line 672 (Modal: Confirm Publication)
# In my view_file it was 672. But it might have shifted.
target = "{/* Modal: Confirm Publication */}"
found = -1
for i, line in enumerate(lines):
    if target in line:
        found = i
        break

if found != -1:
    # Check current lines before it
    # We want it to be:
    # </div>
    # )}
    #
    # {/* Modal: Confirm Publication */}
    
    # Let's insert )} before the target if it's not there
    if ')}' not in lines[found-1] and ')}' not in lines[found-2]:
        lines.insert(found, '    )}\n\n')
        print(f"Inserted )}} before line {found+1}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
