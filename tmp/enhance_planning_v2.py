import sys
import os
import re

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update form state
# Use regex to handle potential whitespace variations
form_pattern = r'const \[form, setForm\] = useState\(\{([\s\S]*?)\}\);'
def form_repl(match):
    inner = match.group(1)
    if 'youtube_video_id' not in inner:
        # Add the field before the closing brace
        return f'const [form, setForm] = useState({{{inner.rstrip()}, youtube_video_id: ""\n  }});'
    return match.group(0)

content = re.sub(form_pattern, form_repl, content, count=1)

# 2. Update openEdit
# Look for the setForm inside openEdit
edit_pattern = r'const openEdit = \(v: Video\) => \{([\s\S]*?)\}'
def edit_repl(match):
    inner = match.group(1)
    if 'youtube_video_id' not in inner:
        # Replace the setForm call inside
        inner = re.sub(
            r'setForm\(\{([\s\S]*?)\}\);',
            r'setForm({\1, youtube_video_id: v.youtube_video_id || ""\n   });',
            inner
        )
        return f'const openEdit = (v: Video) => {{{inner}}}'
    return match.group(0)

content = re.sub(edit_pattern, edit_repl, content, count=1)

# 3. Add input field to modal
# Find the planned_date/viral_score row and add the YouTube field after it
modal_field_pattern = r'(<div className="grid grid-cols-2 gap-4">[\s\S]*?planned_date[\s\S]*?</div>[\s\S]*?</div>)'
youtube_field = '''
       <div className="space-y-2">
        <label className="text-xs font-bold text-muted uppercase tracking-wide">YouTube Video ID / URL</label>
        <input
         type="text"
         value={form.youtube_video_id}
         onChange={e => setForm({ ...form, youtube_video_id: e.target.value })}
         placeholder="e.g. dQw4w9WgXcQ or full link"
         className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
        />
       </div>'''

if 'youtube_video_id' not in content and 'YouTube Video ID' not in content:
    content = content.replace('viral_scoreLabel} <span className="normal-case font-black text-brand">{form.viral_score}%</span>', 'viral_scoreLabel} <span className="normal-case font-black text-brand">{form.viral_score}%</span>', 1)
    # Actually let's just find the end of that grid
    content = re.sub(modal_field_pattern, r'\1' + youtube_field, content, count=1)

# 4. Update Published column rendering
# Change stagingIndex(4) cell
published_cell_pattern = r'<td className=\{cn\("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor\(4\)\)\} onClick=\{([^}]*)\}>\{getStageIcon\(4\)\}</td>'

def cell_repl(match):
    onclick = match.group(1)
    return f'''<td className={{cn("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor(4))}}>
                    {{v.youtube_video_id ? (
                      <a 
                        href={`https://www.youtube.com/watch?v=${{v.youtube_video_id.split('v=')[-1].split('/')[-1]}}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:scale-125 transition-transform inline-block"
                        title="Voir sur YouTube"
                      >
                         <CheckCircle2 className="h-5 w-5" />
                      </a>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" onClick={{{onclick}}}>
                        {{getStageIcon(4)}}
                      </div>
                    )}}
                  </td>'''

# Use a simpler replace for the cell to avoid regex issues with many braces
old_cell = '<td className={cn("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor(4))} onClick={() => handleStatusChange(v.id, "published")}>{getStageIcon(4)}</td>'
new_cell = '''<td className={cn("text-center border-r border-border-subtle cursor-pointer transition-all hover:brightness-125", stageColor(4))}>
                    {v.youtube_video_id ? (
                      <a 
                        href={v.youtube_video_id.startsWith('http') ? v.youtube_video_id : `https://www.youtube.com/watch?v=${v.youtube_video_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:scale-125 transition-transform inline-block"
                        title="Voir sur YouTube"
                        onClick={(e) => e.stopPropagation()}
                      >
                         <CheckCircle2 className="h-5 w-5" />
                      </a>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2" onClick={() => handleStatusChange(v.id, "published")}>
                        {getStageIcon(4)}
                      </div>
                    )}
                  </td>'''

if old_cell in content:
    content = content.replace(old_cell, new_cell)
    print("Updated published cell.")
else:
    print("Old cell not found exactly.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied planning page updates.")
