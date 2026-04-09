import sys
import os
import re

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update form state
if 'youtube_video_id: ""' not in content:
    content = content.replace('notes: ""', 'notes: "", youtube_video_id: ""')
    print("Updated form and openAdd.")

# 2. Update openEdit
if 'youtube_video_id: v.youtube_video_id || ""' not in content:
    old_edit_block = 'planned_date: v.planned_date ? new Date(v.planned_date).toISOString().split("T")[0] :""'
    new_edit_block = 'planned_date: v.planned_date ? new Date(v.planned_date).toISOString().split("T")[0] :"", youtube_video_id: v.youtube_video_id || ""'
    content = content.replace(old_edit_block, new_edit_block)
    print("Updated openEdit.")

# 3. Add input field to modal
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

if 'YouTube Video ID / URL' not in content:
    content = content.replace('accent-[color:var(--brand)] mt-3"\n         />\n        </div>', 'accent-[color:var(--brand)] mt-3"\n         />\n        </div>' + youtube_field)
    print("Updated modal modal.")

# 4. Update Published column rendering
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
    # Try with single quotes or slight variations
    print("Old cell not found exactly - check spacing.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Planning page update attempt complete.")
