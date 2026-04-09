import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("No database url")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

workspaces = db.execute(text("SELECT id, channel_profile_image, channel_banner_image, channel_url, channel_id FROM workspaces")).fetchall()
for row in workspaces:
    id_ = row[0]
    profile = row[1].strip() if row[1] else None
    banner = row[2].strip() if row[2] else None
    url = row[3].strip() if row[3] else None
    chan_id = row[4].strip() if row[4] else None

    db.execute(
        text("UPDATE workspaces SET channel_profile_image = :p, channel_banner_image = :b, channel_url = :u, channel_id = :c WHERE id = :id"),
        {"p": profile, "b": banner, "u": url, "c": chan_id, "id": id_}
    )

db.commit()
print("Cleaned up database URLs successfully.")
