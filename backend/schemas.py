from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import VideoStatus
import json

# ─── Auth Schemas ───────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ─── Workspace Schemas ──────────────────────────────────────
class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    channel_url: Optional[str] = None
    channel_id: Optional[str] = None
    niche: Optional[str] = None
    reference_transcript: Optional[str] = None
    default_persona: Optional[str] = "Expert"

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    niche: Optional[str] = None
    reference_transcript: Optional[str] = None
    default_persona: Optional[str] = None

class WorkspaceOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    channel_url: Optional[str]
    channel_id: Optional[str]
    subscriber_count: int
    total_views: int
    total_videos: int
    last_sync: Optional[datetime]
    channel_profile_image: Optional[str] = None
    channel_banner_image: Optional[str] = None
    niche: Optional[str]
    suggested_ideas_json: Optional[str] = None
    reference_transcript: Optional[str]
    default_persona: Optional[str]
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Video Schemas ──────────────────────────────────────────
class VideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: VideoStatus = VideoStatus.idea
    category: Optional[str] = None
    planned_date: Optional[datetime] = None
    viral_score: int = 0
    notes: Optional[str] = None
    youtube_video_id: Optional[str] = None

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[VideoStatus] = None
    category: Optional[str] = None
    planned_date: Optional[datetime] = None
    viral_score: Optional[int] = None
    notes: Optional[str] = None
    youtube_video_id: Optional[str] = None

class VideoOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    script: Optional[str]
    script_plan: Optional[str] # JSON string of List[ScriptPlanItem]
    status: VideoStatus
    
    # YouTube fields
    youtube_video_id: Optional[str]
    published_at: Optional[datetime]
    view_count: int
    like_count: int
    comment_count: int
    thumbnail_url: Optional[str]
    duration: Optional[str]
    is_imported: bool
    
    category: Optional[str]
    planned_date: Optional[datetime]
    viral_score: int
    research_facts: Optional[str]
    notes: Optional[str]
    
    workspace_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    scenes: List["SceneOut"] = []

    class Config:
        from_attributes = True

class ScriptGenerationRequest(BaseModel):
    brief: Optional[str] = None
    duration_minutes: Optional[int] = 5
    persona: Optional[str] = None
    research_facts: Optional[str] = None
    language: Optional[str] = "en"

class GenerateTopicsRequest(BaseModel):
    language: Optional[str] = "en"

class GeneratedTopic(BaseModel):
    title: str
    description: str
    viral_score: int

class ScriptPlanItem(BaseModel):
    order: int
    title: str
    goal: str
    estimated_duration: int # seconds

class ScriptPlanOut(BaseModel):
    plan: List[ScriptPlanItem]

class ScriptGenerateFromPlanRequest(BaseModel):
    plan: List[ScriptPlanItem]
    brief: Optional[str] = None
    duration_minutes: Optional[int] = 5
    language: Optional[str] = "en"

# ─── Scene Schemas ──────────────────────────────────────────
class SceneBase(BaseModel):
    order: int
    section_name: Optional[str] = None
    visual_description: Optional[str] = None
    audio_description: Optional[str] = None
    duration: int = 5

class SceneCreate(SceneBase):
    video_id: int

class SceneUpdate(BaseModel):
    visual_description: Optional[str] = None
    audio_description: Optional[str] = None
    duration: Optional[int] = None
    order: Optional[int] = None

class SceneOut(SceneBase):
    id: int
    video_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Update VideoOut to handle the forward reference
VideoOut.update_forward_refs()

# ─── YouTube Video Schemas (Imported) ──────────────────────
class YouTubeVideoBase(BaseModel):
    youtube_video_id: str
    title: str
    description: Optional[str] = None
    published_at: Optional[datetime] = None
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    thumbnail_url: Optional[str] = None
    duration: Optional[str] = None

class YouTubeVideoCreate(YouTubeVideoBase):
    workspace_id: int

class YouTubeVideoOut(YouTubeVideoBase):
    id: int
    created_at: datetime
    workspace_id: int

    class Config:
        from_attributes = True
# ─── Audit Schemas ──────────────────────────────────────────
class Finding(BaseModel):
    type: str
    label: str
    text: str

class TopVideo(BaseModel):
    youtube_video_id: str
    title: str
    view_count: int
    like_count: int
    thumbnail_url: str

# ─── Chat & Suggestions Schemas ────────────────────────────
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    language: Optional[str] = "en"

class ChatResponse(BaseModel):
    message: str
    suggested_title: Optional[str] = None
    viral_score: Optional[int] = None
    add_to_planning: bool = False

class QuickSuggestion(BaseModel):
    title: str
    why: str
    viral_score: int
    format: str

class BrainstormingMessageOut(BaseModel):
    id: int
    role: str
    content: str
    suggested_title: Optional[str] = None
    viral_score: Optional[int] = None
    add_to_planning: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class AuditOut(BaseModel):
    score: int
    status: str
    findings: List[Finding]
    recommendations: List[str]
    audit_date: datetime
    top_video: Optional[TopVideo] = None
    engagement_rate: float

    class Config:
        from_attributes = True

class StatPoint(BaseModel):
    date: str
    value: float

class InsightAction(BaseModel):
    type: str # success, warning, danger, info
    label: str
    text: str
    cta_label: str
    cta_href: str

class PipelineProject(BaseModel):
    id: int
    title: str
    status: VideoStatus
    is_blocked: bool = False

class RecentVideoPerf(BaseModel):
    youtube_video_id: str
    title: str
    published_at: datetime
    view_count: int
    retention_score: int # 0-100
    category: str

class DashboardStatsOut(BaseModel):
    health_score: int
    health_status: str # "Santé de la chaîne"
    
    # KPI with 30-day trends
    subs_total: int
    subs_delta: str # "+412 ce mois"
    subs_history: List[StatPoint]
    
    views_total: int
    views_delta: str # "+23% vs mois préc."
    views_history: List[StatPoint]
    
    retention_avg: int
    retention_delta: str # "+6 pts — au-dessus moyenne niche" 
    retention_history: List[StatPoint]
    
    revenue_est: float
    revenue_delta: str # "-12% — CPM saisonnier"
    revenue_history: List[StatPoint]
    
    insights: List[InsightAction]
    
    pipeline_current: int # 5
    pipeline_total: int # 8
    pipeline_blocked_count: int # 2
    pipeline_projects: List[PipelineProject]
    
    recent_videos: List[RecentVideoPerf]
    
    ai_insight_summary: str # "Bonjour, Sophie..."
