import re

file_path = 'src/app/dashboard/[workspaceId]/settings/page.tsx'
content = open(file_path, 'r', encoding='utf-8').read()

replacements = {
    'import { fetchApi } from "@/lib/api";': 'import { fetchApi } from "@/lib/api";\nimport { useLanguage } from "@/lib/i18n";',
    'export default function SettingsPage() {\n  const { workspaceId } = useParams();': 'export default function SettingsPage() {\n  const { workspaceId } = useParams();\n  const { t } = useLanguage();',
    
    '"Loading control center..."': 't("settings.loading")',
    
    'Workspace <span className="text-brand">Settings</span>': '{t("settings.title").split(" ")[0]} <span className="text-brand">{t("settings.title").split(" ").slice(1).join(" ")}</span>',
    'Customization & Identity': '{t("settings.subtitle")}',
    
    'Save Changes': '{t("settings.save")}',
    'Workspace Identity': '{t("settings.identity")}',
    'Workspace Name': '{t("settings.name")}',
    'YouTube Niche': '{t("settings.niche")}',
    'Ex: AI, Tech, Finance, Gaming...': '\"{t("settings.niche_placeholder")}\"',
    
    'Default Persona': '{t("settings.persona")}',
    'Reference Voice / Style': '{t("settings.reference")}',
    'Paste the script or transcript of a video that perfectly represents your style. The AI will analyze it to extract your tone, vocabulary, and structure.': '{t("settings.reference_desc")}',
    'placeholder="Paste your transcript here..."': 'placeholder={t("settings.reference_placeholder")}',
    'Style analysis active': '{t("settings.style_active")}',
    'Once saved, this transcript will serve as a "Few-Shot" model for every new script generation.': '{t("settings.style_desc")}',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated settings/page.tsx")
