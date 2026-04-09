from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth
from services import youtube_service, audit_service, ai_service
from datetime import datetime

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.post("/{workspace_id}/generate-topics", response_model=List[schemas.GeneratedTopic])
def generate_workspace_topics(
    workspace_id: int, 
    request_data: schemas.GenerateTopicsRequest | None = None,
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")

    # Récupérer l'historique des vidéos publiées pour donner du contexte à l'IA
    last_vids = db.query(models.YouTubeVideo).filter(
        models.YouTubeVideo.workspace_id == workspace_id
    ).order_by(models.YouTubeVideo.published_at.desc()).limit(10).all()
    
    history_context = ""
    if last_vids:
        history_context = "Voici les dernières vidéos publiées sur la chaîne (avec leur succès) :\n"
        for v in last_vids:
            history_context += f"- Title: {v.title} | Views: {v.view_count}\n"
    else:
        history_context = "Aucune vidéo publiée pour le moment sur cette chaîne."

    # Appeler l'IA
    try:
        topics_data = ai_service.generate_video_topics(
            niche=workspace.niche or "YouTube",
            workspace_context=f"Nom de la chaîne: {workspace.name}. Description: {workspace.description or ''}\n\n{history_context}",
            language=request_data.language if request_data else "en"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA : {str(e)}")

    if not topics_data:
        raise HTTPException(status_code=500, detail="L'IA n'a pas pu générer d'idées")

    return [schemas.GeneratedTopic(**t) for t in topics_data]

@router.post("/{workspace_id}/topics/add", response_model=schemas.VideoOut)
def add_topic_to_planning(
    workspace_id: int,
    topic: schemas.GeneratedTopic,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")

    new_video = models.Video(
        title=topic.title,
        description=topic.description,
        workspace_id=workspace_id,
        status=models.VideoStatus.idea,
        viral_score=topic.viral_score,
        category=workspace.niche or "YouTube"
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    return new_video

@router.get("/", response_model=List[schemas.WorkspaceOut])
def get_workspaces(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Workspace).filter(models.Workspace.owner_id == current_user.id).all()

@router.patch("/{workspace_id}", response_model=schemas.WorkspaceOut)
def update_workspace_settings(workspace_id: int, workspace_data: schemas.WorkspaceUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
        
    update_data = workspace_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(workspace, key, value)
        
    db.commit()
    db.refresh(workspace)
    return workspace

@router.post("/", response_model=schemas.WorkspaceOut, status_code=201)
def create_workspace(workspace: schemas.WorkspaceCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    channel_id = workspace.channel_id
    if not channel_id and workspace.channel_url:
        channel_id = youtube_service.extract_channel_id_from_url(workspace.channel_url)
    
    stats = None
    if channel_id:
        stats = youtube_service.get_channel_stats(channel_id)
        
    new_workspace = models.Workspace(
        name=workspace.name,
        description=workspace.description,
        channel_url=workspace.channel_url,
        channel_id=channel_id if not stats else stats.get("channel_id", channel_id),
        subscriber_count=stats["subscriber_count"] if stats else 0,
        total_views=stats["view_count"] if stats else 0,
        total_videos=stats["video_count"] if stats else 0,
        channel_profile_image=stats.get("thumbnail") if stats else None,
        channel_banner_image=stats.get("banner") if stats else None,
        last_sync=datetime.now() if stats else None,
        niche=workspace.niche,
        owner_id=current_user.id
    )
    db.add(new_workspace)
    db.commit()
    db.refresh(new_workspace)
    return new_workspace

@router.get("/{workspace_id}", response_model=schemas.WorkspaceOut)
def get_workspace(workspace_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
    return workspace

@router.delete("/{workspace_id}")
def delete_workspace(workspace_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
    
    db.delete(workspace)
    db.commit()
    return {"message": "Workspace supprimé avec succès"}
@router.post("/{workspace_id}/sync", response_model=schemas.WorkspaceOut)
def sync_workspace_youtube(workspace_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
    
    # Attempt to get channel ID if missing but URL exists
    if not workspace.channel_id and workspace.channel_url:
        workspace.channel_id = youtube_service.extract_channel_id_from_url(workspace.channel_url)
    
    if not workspace.channel_id:
        raise HTTPException(status_code=400, detail="ID de chaîne YouTube manquant. Veuillez configurer l'URL ou l'ID de la chaîne.")
    
    # Fetch real stats
    stats = youtube_service.get_channel_stats(workspace.channel_id)
    if not stats:
        raise HTTPException(status_code=400, detail="Impossible de récupérer les statistiques YouTube. Vérifiez l'ID de la chaîne ou la clé API.")
    
    # Update workspace with real ID and stats
    if stats.get("channel_id"):
        workspace.channel_id = stats["channel_id"] # Permanent UC... ID
        
    workspace.subscriber_count = stats["subscriber_count"]
    workspace.total_views = stats["view_count"]
    workspace.total_videos = stats["video_count"]
    workspace.channel_profile_image = stats.get("thumbnail")
    workspace.channel_banner_image = stats.get("banner")
    workspace.last_sync = datetime.now()
    
    db.commit()
    db.refresh(workspace)
    return workspace

@router.put("/{workspace_id}/channel", response_model=schemas.WorkspaceOut)
def update_workspace_channel(workspace_id: int, channel_data: schemas.WorkspaceCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
        
    if channel_data.channel_url:
        workspace.channel_url = channel_data.channel_url
        # Auto-extract ID if possible
        extracted_id = youtube_service.extract_channel_id_from_url(channel_data.channel_url)
        if extracted_id:
            workspace.channel_id = extracted_id
            
    if channel_data.channel_id:
        workspace.channel_id = channel_data.channel_id
        
    db.commit()
    db.refresh(workspace)
    return workspace

@router.get("/{workspace_id}/videos", response_model=List[schemas.YouTubeVideoOut])
def get_workspace_videos(workspace_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
        
    return db.query(models.YouTubeVideo).filter(models.YouTubeVideo.workspace_id == workspace_id).order_by(models.YouTubeVideo.published_at.desc()).all()

@router.get("/{workspace_id}/planning-vids", response_model=List[schemas.VideoOut])
def get_planning_videos(workspace_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
        
    return db.query(models.Video).filter(models.Video.workspace_id == workspace_id).order_by(models.Video.created_at.desc()).all()

@router.post("/{workspace_id}/videos/create", response_model=schemas.VideoOut)
def create_workspace_video(workspace_id: int, video_data: schemas.VideoCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
        
    new_video = models.Video(
        title=video_data.title,
        description=video_data.description,
        status=video_data.status,
        category=video_data.category,
        planned_date=video_data.planned_date,
        viral_score=video_data.viral_score,
        workspace_id=workspace_id
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    return new_video

@router.post("/{workspace_id}/videos/sync", response_model=List[schemas.YouTubeVideoOut])
def sync_workspace_videos(workspace_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
        
    if not workspace.channel_id:
        raise HTTPException(status_code=400, detail="ID de chaîne YouTube manquant. Veuillez synchroniser la chaîne d'abord.")
        
    yt_videos = youtube_service.get_channel_videos(workspace.channel_id)
    
    if not yt_videos:
        return db.query(models.YouTubeVideo).filter(models.YouTubeVideo.workspace_id == workspace.id).all()
        
    unique_videos = {}
    for v in yt_videos:
        unique_videos[v["youtube_video_id"]] = v
        
    synced_videos = []
    for v_data in unique_videos.values():
        existing_video = db.query(models.YouTubeVideo).filter(
            models.YouTubeVideo.youtube_video_id == v_data["youtube_video_id"]
        ).first()
        
        if existing_video:
            existing_video.title = v_data["title"]
            existing_video.description = v_data["description"]
            existing_video.view_count = v_data["view_count"]
            existing_video.like_count = v_data["like_count"]
            existing_video.comment_count = v_data["comment_count"]
            existing_video.thumbnail_url = v_data["thumbnail_url"]
            existing_video.duration = v_data["duration"]
            synced_videos.append(existing_video)
        else:
            from datetime import datetime as dt
            try:
                pub_at = dt.fromisoformat(v_data["published_at"].replace("Z", "+00:00"))
            except:
                pub_at = dt.now()

            new_video = models.YouTubeVideo(
                title=v_data["title"],
                description=v_data["description"],
                youtube_video_id=v_data["youtube_video_id"],
                published_at=pub_at,
                view_count=v_data["view_count"],
                like_count=v_data["like_count"],
                comment_count=v_data["comment_count"],
                thumbnail_url=v_data["thumbnail_url"],
                duration=v_data["duration"],
                workspace_id=workspace.id
            )
            db.add(new_video)
            synced_videos.append(new_video)
            
    db.commit()
    for v in synced_videos:
        db.refresh(v)
        
    return synced_videos
@router.post("/{workspace_id}/chat-ideas", response_model=schemas.ChatResponse)
def chat_for_ideas(
    workspace_id: int,
    request_data: schemas.ChatRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")

    last_vids = db.query(models.YouTubeVideo).filter(
        models.YouTubeVideo.workspace_id == workspace_id
    ).order_by(models.YouTubeVideo.published_at.desc()).limit(5).all()

    channel_context = f"Chaîne: {workspace.name}. Description: {workspace.description or ''}.\n"
    if last_vids:
        channel_context += "Dernières vidéos:\n"
        for v in last_vids:
            channel_context += f"- {v.title} ({v.view_count} vues)\n"

    try:
        result = ai_service.chat_idea_refinement(
            messages=[{"role": m.role, "content": m.content} for m in request_data.messages],
            niche=workspace.niche or "YouTube",
            channel_context=channel_context,
            language=request_data.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")

    return schemas.ChatResponse(**result)


@router.get("/{workspace_id}/quick-suggestions", response_model=List[schemas.QuickSuggestion])
def get_quick_suggestions(
    workspace_id: int,
    language: str = "fr",
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")

    last_vids = db.query(models.YouTubeVideo).filter(
        models.YouTubeVideo.workspace_id == workspace_id
    ).order_by(models.YouTubeVideo.published_at.desc()).limit(10).all()

    channel_context = f"Chaîne: {workspace.name}. Description: {workspace.description or ''}.\n"
    if last_vids:
        channel_context += "Vidéos existantes:\n"
        for v in last_vids:
            channel_context += f"- {v.title} ({v.view_count} vues)\n"
    else:
        channel_context += "Aucune vidéo publiée pour le moment.\n"

    try:
        suggestions = ai_service.generate_quick_suggestions(
            niche=workspace.niche or "YouTube",
            channel_context=channel_context,
            language=language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")

    return [schemas.QuickSuggestion(**s) for s in suggestions]


@router.post("/{workspace_id}/audit", response_model=schemas.AuditOut)
def run_workspace_audit(workspace_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
        
    videos = db.query(models.YouTubeVideo).filter(models.YouTubeVideo.workspace_id == workspace_id).all()
    
    audit_result = audit_service.audit_service.perform_audit(workspace, videos)
    return audit_result


@router.get("/{workspace_id}/dashboard-stats", response_model=schemas.DashboardStatsOut)
def get_dashboard_stats(
    workspace_id: int, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
        
    subs = workspace.subscriber_count or 0
    views = workspace.total_views or 0
    vids_count = workspace.total_videos or 0
    
    # ─── 1. Simulation de l'historique 30j ────────────────────
    import random
    from datetime import timedelta
    
    now = datetime.now()
    def gen_trend(start_val: float, points: int = 30, volatility: float = 0.05, growth: float = 0.1):
        res = []
        curr = start_val
        for i in range(points):
            date_str = (now - timedelta(days=points-i)).strftime("%d %b")
            # Simuler une légère fluctuation
            change = (random.random() - 0.4) * volatility + (growth / points)
            curr = max(0, curr * (1 + change))
            res.append(schemas.StatPoint(date=date_str, value=round(curr, 2)))
        return res

    # ─── 2. KPI et Deltas ────────────────────────────────────
    subs_hist = gen_trend(subs * 0.95, points=30, volatility=0.01, growth=0.05)
    views_hist = gen_trend(views / 30, points=30, volatility=0.2, growth=0.1)
    retention_hist = gen_trend(55, points=30, volatility=0.08, growth=0.02)
    revenue_hist = gen_trend(subs * 0.03, points=30, volatility=0.15, growth=0.03)

    # ─── 3. Pipeline & Blocages ──────────────────────────────
    all_videos = db.query(models.Video).filter(
        models.Video.workspace_id == workspace_id
    ).order_by(models.Video.updated_at.desc()).all()
    
    pipeline_vids = []
    blocked_count = 0
    for v in all_videos:
        is_blocked = False
        # Simuler un blocage si script_plan est vide mais status est scripted
        if v.status == models.VideoStatus.scripted and not v.script:
             is_blocked = True
             blocked_count += 1
        
        pipeline_vids.append(schemas.PipelineProject(
            id=v.id,
            title=v.title,
            status=v.status,
            is_blocked=is_blocked
        ))

    # ─── 4. Vidéos Récentes & Rétention ──────────────────────
    yt_vids = db.query(models.YouTubeVideo).filter(
        models.YouTubeVideo.workspace_id == workspace_id
    ).order_by(models.YouTubeVideo.published_at.desc()).limit(4).all()
    
    recent_perf = []
    for v in yt_vids:
        # Retention fictive pour le démo (basée sur views vs count global)
        ret = random.randint(40, 75)
        recent_perf.append(schemas.RecentVideoPerf(
            youtube_video_id=v.youtube_video_id,
            title=v.title,
            published_at=v.published_at,
            view_count=v.view_count,
            retention_score=ret,
            category=workspace.niche or "Tech"
        ))

    # ─── 5. Insights Stratégiques ───────────────────────────
    insights = [
        schemas.InsightAction(
            type="success",
            label="Optimisation Watch Time",
            text="Vos tutoriels +10 min génèrent 2.4x plus de watch time que vos formats courts. Votre prochaine vidéo devrait dépasser 12 minutes.",
            cta_label="Appliquer à ma prochaine vidéo",
            cta_href=f"/dashboard/{workspace_id}/script"
        ),
        schemas.InsightAction(
            type="info",
            label="Meilleur moment de publication",
            text="Publier le mardi entre 18h et 20h améliore vos vues de 34% sur les 48 premières heures. Votre prochaine publication est prévue un jeudi.",
            cta_label="Ajuster le planning",
            cta_href=f"/dashboard/{workspace_id}/planning"
        ),
        schemas.InsightAction(
            type="warning",
            label="Alerte CTR",
            text="Votre CTR moyen est de 4.2% — la norme tech est 5.8%. Tester des miniatures avec du texte en surimpression pourrait améliorer ce chiffre.",
            cta_label="Analyser mes miniatures",
            cta_href=f"/dashboard/{workspace_id}/analysis"
        ),
        schemas.InsightAction(
            type="danger",
            label="Régularité menacée",
            text="Votre dernière vidéo sur les outils IA a été publiée il y a 3 semaines. Les chaînes comparables publient 1.5x par semaine sur ce sujet.",
            cta_label="Générer des idées sur l'IA",
            cta_href=f"/dashboard/{workspace_id}/topics"
        )
    ]

    # ─── 6. Score de Santé Composite ───────────────────────
    # Logique simple : 
    # - Abonnés (growth)
    # - Production active (vs blocked)
    # - Recent perf (if ret > 60)
    base_score = 75
    if blocked_count > 0: base_score -= blocked_count * 5
    if len(all_videos) > 0: base_score += 5
    if any(r.retention_score > 60 for r in recent_perf): base_score += 10
    
    score = min(98, max(5, base_score + random.randint(-5, 5)))
    status = "Santé de la chaîne"
    if score > 80: status = "Excellente santé"
    elif score > 60: status = "Chaîne en croissance"
    else: status = "Optimisations nécessaires"

    return {
        "health_score": score,
        "health_status": status,
        "subs_total": subs,
        "subs_delta": f"+{random.randint(100, 500)} ce mois",
        "subs_history": subs_hist,
        "views_total": views,
        "views_delta": f"+{random.randint(5, 30)}% vs mois préc.",
        "views_history": views_hist,
        "retention_avg": random.randint(50, 65),
        "retention_delta": "+6 pts — au-dessus moyenne niche",
        "retention_history": retention_hist,
        "revenue_est": subs * 0.035, # Faux CPM simple
        "revenue_delta": "-12% — CPM saisonnier",
        "revenue_history": revenue_hist,
        "insights": insights,
        "pipeline_current": len([v for v in all_videos if v.status != models.VideoStatus.published]),
        "pipeline_total": len(all_videos) + 3, # Objectif mensuel fictif
        "pipeline_blocked_count": blocked_count,
        "pipeline_projects": pipeline_vids[:10],
        "recent_videos": recent_perf,
        "ai_insight_summary": f"Bonjour, {current_user.username}"
    }



@router.get("/{workspace_id}/similar-channels")
def get_similar_channels(
    workspace_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == workspace_id,
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")

    niche = workspace.niche or workspace.name or "YouTube"
    channels = youtube_service.search_similar_channels(niche, max_results=12)
    return channels
