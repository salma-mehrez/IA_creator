from typing import List, Dict, Any
from datetime import datetime

class AuditService:
    @staticmethod
    def perform_audit(workspace: Any, videos: List[Any]) -> Dict[str, Any]:
        """
        Performs a V1 audit based on workspace stats and video history.
        Designed to be concise and actionable.
        """
        if not videos:
            return {
                "score": 0,
                "status": "Incomplet",
                "findings": [
                    {"type": "warning", "label": "Contenu", "text": "Aucune vidéo trouvée pour l'analyse."}
                ],
                "recommendations": ["Publiez votre première vidéo pour débloquer l'audit."]
            }

        # 1. Calculation - Engagement Rate
        total_views = sum(v.view_count for v in videos) or workspace.total_views
        total_eng = sum(v.like_count + v.comment_count for v in videos)
        
        engagement_rate = (total_eng / total_views * 100) if total_views > 0 else 0
        
        # 2. Find Top Video (By View Count)
        top_video_obj = max(videos, key=lambda x: x.view_count) if videos else None
        top_video_data = None
        if top_video_obj:
            top_video_data = {
                "youtube_video_id": top_video_obj.youtube_video_id,
                "title": top_video_obj.title,
                "view_count": top_video_obj.view_count,
                "like_count": top_video_obj.like_count,
                "thumbnail_url": top_video_obj.thumbnail_url
            }

        # 3. Calculation - SEO Score (Basic)
        seo_scores = []
        for v in videos:
            s = 100
            if len(v.title) < 20 or len(v.title) > 70: s -= 20
            if not v.description or len(v.description) < 200: s -= 30
            seo_scores.append(s)
        
        avg_seo = sum(seo_scores) / len(seo_scores) if seo_scores else 0
        
        # 4. Overall Score - More Strict
        # Base on engagement (40%), SEO (30%), Volume (30%)
        eng_score = min(engagement_rate * 15, 100) # 6.6% engagement = 100 points
        vol_score = min(len(videos) * 10, 100) # 10 videos = 100 points
        
        overall_score = int((eng_score * 0.4) + (avg_seo * 0.3) + (vol_score * 0.3))
        overall_score = min(max(overall_score, 10), 99)
        
        # 5. Findings (Concise)
        findings = []
        
        if engagement_rate > 4:
            findings.append({"type": "success", "label": "Engagement", "text": "Audience très active."})
        elif engagement_rate > 1.5:
            findings.append({"type": "info", "label": "Engagement", "text": "Interaction stable."})
        else:
            findings.append({"type": "warning", "label": "Engagement", "text": "Manque d'interaction."})
            
        if avg_seo > 75:
            findings.append({"type": "success", "label": "SEO", "text": "Bons titres/descriptions."})
        else:
            findings.append({"type": "warning", "label": "SEO", "text": "Métadonnées à booster."})

        # 6. Actionable Recommendations (Concrete)
        recommendations = []
        if top_video_obj and top_video_obj.view_count > 0:
            recommendations.append(f"Votre vidéo '{top_video_obj.title[:30]}...' est votre meilleur atout. Analysez son sujet pour vos prochaines vidéos.")
        
        if engagement_rate < 3:
            recommendations.append("Ajoutez un commentaire épinglé avec une question pour booster les réponses.")
        
        if avg_seo < 80:
            recommendations.append("Allongez vos descriptions avec des chapitres pour améliorer le référencement.")

        return {
            "score": overall_score,
            "status": "Elite" if overall_score > 85 else "Optimisé" if overall_score > 65 else "En Croissance",
            "findings": findings,
            "recommendations": recommendations[:3],
            "top_video": top_video_data,
            "engagement_rate": round(engagement_rate, 2),
            "audit_date": datetime.now()
        }

audit_service = AuditService()
