import sys
import os
import re

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add new states
new_states = '''  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishingVideoId, setPublishingVideoId] = useState<number | null>(null);
  const [publishUrl, setPublishUrl] = useState("");'''

if 'isPublishModalOpen' not in content:
    content = content.replace('const [isModalOpen, setIsModalOpen] = useState(false);', new_states)

# 2. Add handleConfirmPublish function
new_function = '''  const handleConfirmPublish = async () => {
    if (!publishingVideoId || !publishUrl) return;
    const res = await fetchApi(`/videos/${publishingVideoId}`, { 
      method: "PUT", 
      body: JSON.stringify({ status: "published", youtube_video_id: publishUrl }) 
    });
    if (res.data) {
      load();
      setIsPublishModalOpen(false);
      setPublishingVideoId(null);
      setPublishUrl("");
    }
  };

  const handleDelete = async (id: number) => {'''

if 'handleConfirmPublish' not in content:
    content = content.replace('const handleDelete = async (id: number) => {', new_function)

# 3. Update table trigger
old_trigger = 'onClick={() => handleStatusChange(v.id, "published")}'
new_trigger = 'onClick={() => { setPublishingVideoId(v.id); setPublishUrl(""); setIsPublishModalOpen(true); }}'

content = content.replace(old_trigger, new_trigger)

# 4. Add the Publish Modal (at the end of content, before the last closing brace)
# Wait, I need to find the end of the existing modal.
# Let's insert it after the main modal.

publish_modal_tsx = '''
   {/* Modal: Confirm Publication */}
   {isPublishModalOpen && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
     <div className="bg-surface rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-border">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
            <h3 className="text-xl font-heading text-foreground">Publier la vidéo</h3>
            <p className="text-xs text-subtle">Entrez le lien YouTube pour finaliser</p>
        </div>
      </div>
      
      <div className="space-y-4">
       <div className="space-y-2">
        <label className="text-xs font-bold text-muted uppercase tracking-wide">Lien YouTube / ID</label>
        <input
         type="text"
         value={publishUrl}
         onChange={e => setPublishUrl(e.target.value)}
         placeholder="https://www.youtube.com/watch?v=..."
         className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground-2 placeholder-subtle focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
         autoFocus
        />
       </div>
      </div>
      
      <div className="flex gap-3 mt-8">
       <button
        onClick={handleConfirmPublish}
        disabled={!publishUrl}
        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
       >
        Confirmer la publication
       </button>
       <button
        onClick={() => setIsPublishModalOpen(false)}
        className="px-6 py-3 border border-border text-muted hover:text-foreground rounded-xl font-semibold text-sm transition-all"
       >
        Annuler
       </button>
      </div>
     </div>
    </div>
   )}
'''

# Find the location to insert (after the main modal)
if '{/* Modal: Confirm Publication */}' not in content:
    # Look for the end of the first modal (around line 625)
    content = content.replace('{/* Modal: Add / Edit */}', '{/* Modal: Add / Edit */}') # Trigger check
    content = re.sub(r'(\n.*\{\/\* Modal: Add \/ Edit \*\/\}[\s\S]*?</div>\s*</div>\s*)\)', r'\1' + publish_modal_tsx + ')', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully implemented Interactive Publication Popup.")
