from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth
from services import ai_service

router = APIRouter(prefix="/videos", tags=["Videos"])

@router.post("/{video_id}/generate-script", response_model=List[schemas.SceneOut])
def generate_video_script(
    video_id: int, 
    request_data: Optional[schemas.ScriptGenerationRequest] = None,
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Vidéo non trouvée")
    
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == video.workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=403, detail="Accès refusé")

    # Récupérer l'historique pour le style
    last_vids = db.query(models.YouTubeVideo).filter(
        models.YouTubeVideo.workspace_id == video.workspace_id
    ).order_by(models.YouTubeVideo.published_at.desc()).limit(5).all()
    
    style_context = ""
    if last_vids:
        style_context = "TRANSCRIPTIONS / STRUCTURE DES ANCIENNES VIDÉOS :\n"
        for v in last_vids:
            style_context += f"TITRE: {v.title}\n" + (f"TRANSCRIPTION: {v.transcription[:2000]}..." if v.transcription else f"DESCRIPTION: {v.description or 'N/A'}") + "\n---\n"
    
    full_brief = f"SUJET PRINCIPAL : {video.description or video.title}\n"
    if request_data and request_data.brief:
        full_brief += f"INSTRUCTIONS SPÉCIFIQUES : {request_data.brief}\n"

    try:
        # Si on a déjà un plan enregistré et qu'on veut générer à partir de lui
        if video.script_plan:
            import json
            plan_data = json.loads(video.script_plan)
            # On utilise generate_script_from_plan pour plus de détails
            scenes_data = ai_service.generate_script_from_plan(
                title=video.title,
                plan=plan_data,
                niche=workspace.niche or "YouTube",
                reference_transcript=workspace.reference_transcript or "",
                persona=request_data.persona or workspace.default_persona or "Expert",
                duration_minutes=request_data.duration_minutes if request_data else 5,
                user_brief=request_data.brief if request_data else "",
                research_facts=request_data.research_facts or video.research_facts or "",
                language=request_data.language if request_data else "en"
            )
        else:
            # Fallback sur l'ancienne méthode intégrée
            scenes_data = ai_service.generate_script_scenes(
                title=video.title,
                description=full_brief,
                niche=workspace.niche or "YouTube",
                style_context=workspace.reference_transcript or "",
                duration_minutes=request_data.duration_minutes if request_data else 5,
                language=request_data.language if request_data else "en"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA : {str(e)}")

    if not scenes_data:
        raise HTTPException(status_code=500, detail="L'IA n'a pas pu générer de scènes")

    db.query(models.Scene).filter(models.Scene.video_id == video_id).delete()
    db_scenes = []
    for s in scenes_data:
        new_scene = models.Scene(
            order=s["order"],
            section_name=s.get("section_name"),
            visual_description=s["visual_description"],
            audio_description=s["audio_description"],
            duration=s["duration"],
            video_id=video_id
        )
        db.add(new_scene)
        db_scenes.append(new_scene)
    
    video.status = models.VideoStatus.scripted
    db.commit()
    for s in db_scenes:
        db.refresh(s)
    return db_scenes

@router.post("/{video_id}/plan", response_model=schemas.ScriptPlanOut)
def generate_video_plan(
    video_id: int, 
    request_data: Optional[schemas.ScriptGenerationRequest] = None,
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Vidéo non trouvée")
    
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == video.workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=403, detail="Accès refusé")

    full_brief = f"SUJET PRINCIPAL : {video.description or video.title}\n"
    if request_data and request_data.brief:
        full_brief += f"INSTRUCTIONS : {request_data.brief}\n"

    try:
        plan_data = ai_service.generate_script_plan(
            title=video.title,
            description=full_brief,
            niche=workspace.niche or "YouTube",
            reference_transcript=workspace.reference_transcript or "",
            persona=request_data.persona or workspace.default_persona or "Expert",
            duration_minutes=request_data.duration_minutes if request_data else 5,
            research_facts=request_data.research_facts or video.research_facts or "",
            language=request_data.language if request_data else "en"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur IA Plan : {str(e)}")

    if not plan_data:
        raise HTTPException(status_code=500, detail="Impossible de générer le plan")

    import json
    video.script_plan = json.dumps(plan_data)
    db.commit()
    
    return {"plan": [schemas.ScriptPlanItem(**p) for p in plan_data]}

@router.post("/{video_id}/scenes", response_model=List[schemas.SceneOut])
def save_video_scenes(
    video_id: int, 
    scenes: List[schemas.SceneBase], 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    # 1. Vérifer la vidéo et l'accès
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Vidéo non trouvée")
    
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == video.workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=403, detail="Accès refusé")

    # 2. Supprimer les anciennes scènes pour cette vidéo
    db.query(models.Scene).filter(models.Scene.video_id == video_id).delete()
    
    # 3. Ajouter les nouvelles scènes
    db_scenes = []
    for s_data in scenes:
        new_scene = models.Scene(
            order=s_data.order,
            section_name=s_data.section_name,
            visual_description=s_data.visual_description,
            audio_description=s_data.audio_description,
            duration=s_data.duration,
            video_id=video_id
        )
        db.add(new_scene)
        db_scenes.append(new_scene)
    
    db.commit()
    for s in db_scenes:
        db.refresh(s)
        
    return db_scenes

@router.get("/{video_id}/scenes", response_model=List[schemas.SceneOut])
def get_video_scenes(
    video_id: int, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Vidéo non trouvée")
    
    workspace = db.query(models.Workspace).filter(
        models.Workspace.id == video.workspace_id, 
        models.Workspace.owner_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    return db.query(models.Scene).filter(models.Scene.video_id == video_id).order_by(models.Scene.order).all()

@router.put("/{video_id}", response_model=schemas.VideoOut)
def update_video(video_id: int, video_data: schemas.VideoUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Vidéo non trouvée")
    
    workspace = db.query(models.Workspace).filter(models.Workspace.id == video.workspace_id, models.Workspace.owner_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=403, detail="Accès refusé")

    update_data = video_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(video, key, value)
    
    db.commit()
    db.refresh(video)
    return video

@router.delete("/{video_id}")
def delete_video(video_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Vidéo non trouvée")
    
    workspace = db.query(models.Workspace).filter(models.Workspace.id == video.workspace_id, models.Workspace.owner_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=403, detail="Accès refusé")

    db.delete(video)
    db.commit()
    return {"message": "Vidéo supprimée avec succès"}

@router.post("/generate-ideas", response_model=List[schemas.VideoOut])
def generate_ai_ideas(workspace_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Mock AI generation for 30 days
    workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id, models.Workspace.owner_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace non trouvé")
    
    from datetime import datetime, timedelta
    import random
    
    niche = workspace.niche or "YouTube"
    ideas = [
        f"Comment réussir sur {niche} en 2025",
        f"Les 5 erreurs fatales que font les débutants en {niche}",
        f"Ma routine quotidienne pour exploser sur {niche}",
        f"Pourquoi {niche} est le meilleur business actuel",
        "Analyse profonde : Ce qui va changer prochainement..."
    ]
    
    new_vids = []
    for i, title in enumerate(ideas):
        v = models.Video(
            title=title,
            workspace_id=workspace_id,
            status=models.VideoStatus.idea,
            category=niche,
            planned_date=datetime.now() + timedelta(days=i+1),
            viral_score=random.randint(70, 95)
        )
        db.add(v)
        new_vids.append(v)
    
    db.commit()
    for v in new_vids:
        db.refresh(v)
    return new_vids
