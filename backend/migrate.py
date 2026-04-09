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
        print("✅ Migration terminée avec succès.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Erreur migration: {e}")

if __name__ == "__main__":
    migrate()
