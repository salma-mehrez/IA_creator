import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
import json
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("No database url")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

result = db.execute(text("SELECT id, name, channel_profile_image, channel_banner_image FROM workspaces"))
out = []
for row in result:
    out.append({"id": row[0], "name": row[1], "profile": row[2], "banner": row[3]})
print(json.dumps(out, indent=2))
