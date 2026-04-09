from database import engine
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from models import User

# Get schema info
inspector = inspect(engine)
tables = inspector.get_table_names()

print('\n=== SCHÉMA DE LA BASE DE DONNÉES ===\n')

for t in tables:
    print(f'📌 Table: {t}')
    for c in inspector.get_columns(t):
        print(f'  - {c["name"]} ({c["type"]})')
    print('')

# Get some data if any
print('=== CONTENU (Aperçu) ===\n')
with Session(engine) as session:
    users = session.query(User).limit(5).all()
    print(f"Nombre d'utilisateurs trouvés: {len(users)}")
    for u in users:
        print(f" - {u.email} (Créé le: {u.created_at})")
    
print('\n====================================\n')
