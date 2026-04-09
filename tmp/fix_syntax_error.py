import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the orphaned ')}' at line 718
# It looks like it was inserted as part of my previous regex replace
bad_block = '''   )}
)}

   {/* Confirm delete modal (for kanban) */}'''

# Let's be more precise
content = content.replace('   )}\n)}', '   )}')

# 2. Check the nesting of isPublishModalOpen
# It should be inside the fragments or the main div.
# Currently it starts after a closing div.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Attempted to fix syntax error in planning page.")
