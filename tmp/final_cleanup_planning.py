import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the label quotes
content = content.replace('<label className="text-xs font-bold text-muted uppercase tracking-wide">"Date de Publication"</label>', '<label className="text-xs font-bold text-muted uppercase tracking-wide">Date de Publication</label>')

# 2. Final verification of form state
# Ensure youtube_video_id is there
if 'youtube_video_id: ""\n  });' not in content:
    content = content.replace('notes: ""\n  });', 'notes: "", youtube_video_id: ""\n  });')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Final cleanup of planning page complete.")
