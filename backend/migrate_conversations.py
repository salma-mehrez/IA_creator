import os
import sys

# Add current directory to path so we can import models/database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models
from sqlalchemy.orm import Session

def migrate():
    db = SessionLocal()
    try:
        # 1. Get all messages without a conversation_id
        orphan_messages = db.query(models.BrainstormingMessage).filter(
            models.BrainstormingMessage.conversation_id == None
        ).all()
        
        if not orphan_messages:
            print("No messages to migrate.")
            return

        print(f"Migrating {len(orphan_messages)} messages...")

        # 2. Group by workspace
        workspace_groups = {}
        for msg in orphan_messages:
            if msg.workspace_id not in workspace_groups:
                workspace_groups[msg.workspace_id] = []
            workspace_groups[msg.workspace_id].append(msg)

        # 3. For each workspace, create a default conversation
        for workspace_id, messages in workspace_groups.items():
            print(f"Creating Legacy Chat for workspace {workspace_id}...")
            
            # Use the first message content as title preview if possible
            first_msg = messages[0].content[:30] + "..." if messages else "Legacy Chat"
            
            new_conv = models.BrainstormingConversation(
                workspace_id=workspace_id,
                title=f"Chat Historique: {first_msg}"
            )
            db.add(new_conv)
            db.commit()
            db.refresh(new_conv)

            # 4. Update messages to point to this conversation
            for msg in messages:
                msg.conversation_id = new_conv.id
            
            db.commit()
            print(f"  Done for workspace {workspace_id}.")

        print("Migration complete!")
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
