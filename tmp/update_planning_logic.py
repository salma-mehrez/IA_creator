import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update form state
form_old = '''  const [form, setForm] = useState({
   title:"", category:"General", status:"idea" as Status,
   viral_score: 70, planned_date:"", notes: ""
  });'''
form_new = '''  const [form, setForm] = useState({
   title:"", category:"General", status:"idea" as Status,
   viral_score: 70, planned_date:"", notes: "", youtube_video_id: ""
  });'''

# Update openAdd
add_old = 'setForm({ title:"", category:"General", status:"idea", viral_score: 70, planned_date: new Date().toISOString().split("T")[0], notes: "" });'
add_new = 'setForm({ title:"", category:"General", status:"idea", viral_score: 70, planned_date: new Date().toISOString().split("T")[0], notes: "", youtube_video_id: "" });'

# Update openEdit
edit_old = '''   setForm({
    title: v.title, category: v.category ||"General",
    status: v.status, viral_score: v.viral_score, notes: v.notes || "",
    planned_date: v.planned_date ? new Date(v.planned_date).toISOString().split("T")[0] :""
   });'''
edit_new = '''   setForm({
    title: v.title, category: v.category ||"General",
    status: v.status, viral_score: v.viral_score, notes: v.notes || "",
    planned_date: v.planned_date ? new Date(v.planned_date).toISOString().split("T")[0] :"",
    youtube_video_id: v.youtube_video_id || ""
   });'''

if form_old in content:
    content = content.replace(form_old, form_new)
    print("Updated form state.")
else:
    print("Form old not found exactly.")

if add_old in content:
    content = content.replace(add_old, add_new)
    print("Updated openAdd.")
else:
    print("Add old not found exactly.")

if edit_old in content:
    content = content.replace(edit_old, edit_new)
    print("Updated openEdit.")
else:
    print("Edit old not found exactly.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
