import re

file_path = 'src/app/dashboard/[workspaceId]/planning/page.tsx'
content = open(file_path, 'r', encoding='utf-8').read()

replacements = {
    'import { fetchApi } from "@/lib/api";': 'import { fetchApi } from "@/lib/api";\nimport { useLanguage } from "@/lib/i18n";',
    'export default function PlanningPage() {\n  const { workspaceId } = useParams();': 'export default function PlanningPage() {\n  const { workspaceId } = useParams();\n  const { t } = useLanguage();',
    
    'Production <span className="text-brand">Planning</span>': '{t("planning.title").split(" ")[0]} <span className="text-brand">{t("planning.title").split(" ").slice(1).join(" ")}</span>',
    '>Table<': '>{t("planning.table")}<',
    '>Kanban<': '>{t("planning.kanban")}<',
    '>Calendar<': '>{t("planning.calendar")}<',
    
    '"Generate 30d AI"': 't("planning.generate_ai")',
    '"Generating..."': 't("planning.generating")',
    
    '+ Add': '+ {t("planning.add")}',
    '>Add<': '>{t("planning.add")}<',
    '>All<': '>{t("planning.all")}<',
    
    'placeholder="Search for a video..."': 'placeholder={t("planning.search")}',
    'Planning in progress...': '{t("planning.loading")}',
    
    '"Edit Project" : "New Project"': 'editingVideo ? t("planning.edit_project") : t("planning.new_project")',
    
    '>Video Title<': '>{t("planning.form.title")}<',
    '>Category<': '>{t("planning.form.category")}<',
    '>Status<': '>{t("planning.form.status")}<',
    '>Viral Potential (%)<': '>{t("planning.form.viral")}<',
    '>Planned Date<': '>{t("planning.form.date")}<',
    '>Cancel<': '>{t("planning.form.cancel")}<',
    
    '"Save changes" : "Create project"': 'editingVideo ? t("planning.form.save") : t("planning.form.create")',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated planning/page.tsx")
