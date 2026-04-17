import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

def migrate():
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        print("--- Migration de la base de données ---")
        
        # Ajouter les colonnes manquantes
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR;")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR;")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;")
        
        # Ajouter les colonnes manquantes pour workspaces
        cur.execute("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS channel_id VARCHAR;")
        cur.execute("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS subscriber_count INTEGER DEFAULT 0;")
        cur.execute("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0;")
        cur.execute("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS total_videos INTEGER DEFAULT 0;")
        cur.execute("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP WITH TIME ZONE;")
        cur.execute("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS channel_profile_image VARCHAR;")
        cur.execute("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS channel_banner_image VARCHAR;")
        
        # Ajouter les colonnes manquantes pour videos
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR UNIQUE;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration VARCHAR;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_imported BOOLEAN DEFAULT FALSE;")
        
        # Création de la table youtube_videos
        cur.execute("""
            CREATE TABLE IF NOT EXISTS youtube_videos (
                id SERIAL PRIMARY KEY,
                youtube_video_id VARCHAR UNIQUE NOT NULL,
                title VARCHAR NOT NULL,
                description TEXT,
                published_at TIMESTAMP WITH TIME ZONE,
                view_count INTEGER DEFAULT 0,
                like_count INTEGER DEFAULT 0,
                comment_count INTEGER DEFAULT 0,
                thumbnail_url VARCHAR,
                duration VARCHAR,
                workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Création de la table scenes
        cur.execute("""
            CREATE TABLE IF NOT EXISTS brainstorming_messages (
                id SERIAL PRIMARY KEY,
                role VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                suggested_title VARCHAR(255),
                viral_score INTEGER,
                add_to_planning BOOLEAN DEFAULT FALSE,
                workspace_id INTEGER REFERENCES workspaces(id),
                conversation_id INTEGER REFERENCES brainstorming_conversations(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Création de la table publish_projects
        cur.execute("""
            CREATE TABLE IF NOT EXISTS publish_projects (
                id SERIAL PRIMARY KEY,
                video_title VARCHAR(255) NOT NULL,
                script_summary TEXT,
                keywords TEXT,
                language VARCHAR(255) DEFAULT 'fr',
                image_model VARCHAR(255) DEFAULT 'flux',
                results_json TEXT,
                workspace_id INTEGER REFERENCES workspaces(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS scenes (
                id SERIAL PRIMARY KEY,
                "order" INTEGER NOT NULL,
                visual_description TEXT,
                audio_description TEXT,
                duration INTEGER DEFAULT 5,
                video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """)
        
        conn.commit()
        
        # Ajout des champs de planning à la table videos
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS category VARCHAR;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS planned_date TIMESTAMP WITH TIME ZONE;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS viral_score INTEGER DEFAULT 0;")
        cur.execute("ALTER TABLE videos ADD COLUMN IF NOT EXISTS notes TEXT;")
        
        conn.commit()

        # --- FIX: Vidéos manquantes (unicité par workspace) ---
        print("Mise a jour des contraintes d'unicite pour les videos...")
        # Pour youtube_videos
        cur.execute("ALTER TABLE youtube_videos DROP CONSTRAINT IF EXISTS youtube_videos_youtube_video_id_key;")
        # Note: on essaye l'unicite (video_id, workspace_id)
        try:
             cur.execute("ALTER TABLE youtube_videos ADD CONSTRAINT youtube_videos_video_workspace_uc UNIQUE (youtube_video_id, workspace_id);")
        except:
             conn.rollback()
             conn = psycopg2.connect(DB_URL)
             cur = conn.cursor()
             print("[INFO] La contrainte d'unicite existait deja ou n'a pu etre cree pour youtube_videos.")

        # Pour la table videos (idées / planning)
        cur.execute("ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_youtube_video_id_key;")
        try:
            cur.execute("ALTER TABLE videos ADD CONSTRAINT videos_video_workspace_uc UNIQUE (youtube_video_id, workspace_id);")
        except:
             conn.rollback()
             conn = psycopg2.connect(DB_URL)
             cur = conn.cursor()
             print("[INFO] La contrainte d'unicite existait deja sur la table videos.")

        # Création de la table brainstorming_conversations
        cur.execute("""
            CREATE TABLE IF NOT EXISTS brainstorming_conversations (
                id SERIAL PRIMARY KEY,
                title VARCHAR,
                workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Ajouter conversation_id à brainstorming_messages
        cur.execute("ALTER TABLE brainstorming_messages ADD COLUMN IF NOT EXISTS conversation_id INTEGER REFERENCES brainstorming_conversations(id) ON DELETE CASCADE;")

        conn.commit()
        print("[SUCCESS] Migration terminee avec succes.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Erreur migration: {e}")

if __name__ == "__main__":
    migrate()
