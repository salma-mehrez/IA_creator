import sys
from database import SessionLocal
from models import Workspace

def check_images():
    db = SessionLocal()
    try:
        ws = db.query(Workspace).order_by(Workspace.id.desc()).first()
        if ws:
            print(f"Workspace ID: {ws.id}")
            print(f"Profile Image URL: {ws.channel_profile_image}")
            print(f"Banner Image URL: {ws.channel_banner_image}")
        else:
            print("No workspaces found.")
    finally:
        db.close()

if __name__ == "__main__":
    check_images()
