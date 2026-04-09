import sys
import os
import re

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Video interface
video_interface_pattern = r'interface Video \{([\s\S]*?)\}'
def video_interface_repl(match):
    inner = match.group(1)
    new_inner = inner
    if 'youtube_video_id' not in inner:
        new_inner += '  youtube_video_id?: string;\n'
    if 'created_at' not in inner:
        new_inner += '  created_at: string;\n'
    return f'interface Video {{{new_inner}}}'

content = re.sub(video_interface_pattern, video_interface_repl, content, count=1)

# 2. Update form state initialization (fix the lint about youtube_video_id)
# Looking for: const [form, setForm] = useState({ ... });
form_init_pattern = r'const \[form, setForm\] = useState\(\{([\s\S]*?)\}\);'
def form_init_repl(match):
    inner = match.group(1)
    if 'youtube_video_id' not in inner:
        # Add it before the closing brace
        return f'const [form, setForm] = useState({{{inner.rstrip()}, youtube_video_id: ""\n  }});'
    return match.group(0)

content = re.sub(form_init_pattern, form_init_repl, content, count=1)

# 3. Update Modal Label
old_label = '{plannedDateLabel}'
new_label = '"Date de Publication"'
if old_label in content:
    content = content.replace(old_label, new_label)

# 4. Ensure the table is correctly rendering the two dates
# (Idea Date = created_at, Pub. Date = planned_date)
# We already did part of this in the previous turn, but let's be sure.

# Final check on logic: 
# Idea Date column: {formatDate(v.created_at)}
# Pub. Date column: {formatDate(v.planned_date)}

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Planning page dates and types updated.")
