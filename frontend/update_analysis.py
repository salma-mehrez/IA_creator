import re

file_path = 'src/app/dashboard/[workspaceId]/analysis/page.tsx'
content = open(file_path, 'r', encoding='utf-8').read()

replacements = {
    'import { fetchApi } from "@/lib/api";': 'import { fetchApi } from "@/lib/api";\nimport { useLanguage } from "@/lib/i18n";',
    'export default function AnalysisPage() {\n  const { workspaceId } = useParams();': 'export default function AnalysisPage() {\n  const { workspaceId } = useParams();\n  const { t } = useLanguage();',
    
    '"Domain analysis in progress..."': 't("analysis.loading")',
    
    'Channel <span className="text-brand">Analysis</span>': '{t("analysis.title").split(" ")[0]} <span className="text-brand">{t("analysis.title").split(" ").slice(1).join(" ")}</span>',
    'Last Sync:': '{t("analysis.last_sync")}:',
    
    'syncing ? "Synchronizing..." : "Refresh"': 'syncing ? t("analysis.syncing") : t("analysis.refresh")',
    'auditing ? "Audit in progress..." : "Run full audit"': 'auditing ? t("analysis.auditing") : t("analysis.run_audit")',
    
    'Configure your channel': '{t("analysis.setup.title")}',
    'Enter your YouTube channel URL or ID to start real-time analysis.': '{t("analysis.setup.desc")}',
    'placeholder="Ex: https://youtube.com/@handle"': 'placeholder={t("analysis.setup.input")}',
    'Connect channel': '{t("analysis.setup.button")}',
    
    '>Performance Report<': '>{t("analysis.report.title")}<',
    'Top Video<': '{t("analysis.report.top_video")}<',
    'AI Actionable Tips (Precise)<': '{t("analysis.report.ai_tips")}<',
    
    '>Published Videos<': '>{t("analysis.videos.title")}<',
    'History of your last {videos.length} contents': '{t("analysis.videos.desc").replace("{count}", videos.length.toString())}',
    'placeholder="Search for a video..."': 'placeholder={t("analysis.videos.search")}',
    'No synchronized videos': '{t("analysis.videos.empty")}',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated analysis/page.tsx")
