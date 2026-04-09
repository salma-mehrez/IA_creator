import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('notes: ""\n  });', 'notes: "", youtube_video_id: ""\n  });')
content = content.replace('notes: "" });', 'notes: "", youtube_video_id: "" });')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
