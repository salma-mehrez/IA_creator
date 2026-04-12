from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    channel_id = Column(String, nullable=True)
    subscriber_count = Column(Integer, default=0)
    total_views = Column(Integer, default=0)
    total_videos = Column(Integer, default=0)
    last_sync = Column(DateTime(timezone=True), nullable=True)
    channel_url = Column(String, nullable=True)
    channel_profile_image = Column(String, nullable=True)
    channel_banner_image = Column(String, nullable=True)
    niche = Column(String, nullable=True)
    reference_transcript = Column(Text, nullable=True)
    default_persona = Column(String, nullable=True, default="Expert")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="workspaces")
    videos = relationship("Video", back_populates="workspace", cascade="all, delete-orphan")
    youtube_videos = relationship("YouTubeVideo", back_populates="workspace", cascade="all, delete-orphan")
    chat_messages = relationship("BrainstormingMessage", back_populates="workspace", cascade="all, delete-orphan")
    suggested_ideas_json = Column(Text, nullable=True) # Cache pour les 6 suggestions rapides


class VideoStatus(str, enum.Enum):
    idea = "idea"
    scripted = "scripted"
    recorded = "recorded"
    edited = "edited"
    published = "published"


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    script = Column(Text, nullable=True)
    script_plan = Column(Text, nullable=True) # JSON outline
    status = Column(Enum(VideoStatus), default=VideoStatus.idea)
    category = Column(String, nullable=True)
    planned_date = Column(DateTime(timezone=True), nullable=True)
    viral_score = Column(Integer, default=0)
    research_facts = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # YouTube specific fields
    youtube_video_id = Column(String, unique=True, index=True, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    thumbnail_url = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    is_imported = Column(Boolean, default=False)

    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    workspace = relationship("Workspace", back_populates="videos")
    scenes = relationship("Scene", back_populates="video", cascade="all, delete-orphan")

class Scene(Base):
    __tablename__ = "scenes"

    id = Column(Integer, primary_key=True, index=True)
    order = Column(Integer, nullable=False)
    section_name = Column(String, nullable=True) # Ex: Introduction, Hook, Corps, Conclusion
    visual_description = Column(Text, nullable=True)
    audio_description = Column(Text, nullable=True)
    duration = Column(Integer, default=5) # en secondes
    
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    video = relationship("Video", back_populates="scenes")

class YouTubeVideo(Base):
    __tablename__ = "youtube_videos"

    id = Column(Integer, primary_key=True, index=True)
    youtube_video_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    transcription = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    thumbnail_url = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    workspace = relationship("Workspace", back_populates="youtube_videos")

class BrainstormingMessage(Base):
    __tablename__ = "brainstorming_messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False) # "user" or "assistant"
    content = Column(Text, nullable=False)
    suggested_title = Column(String, nullable=True)
    viral_score = Column(Integer, nullable=True)
    add_to_planning = Column(Boolean, default=False)
    
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    workspace = relationship("Workspace", back_populates="chat_messages")
