from database import SessionLocal
from models import User

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Nombre d'utilisateurs en base : {len(users)}")
        for i, user in enumerate(users):
            print(f"- Utilisateur {i+1}: Email={user.email}, Actif={user.is_active}")
        print("La connexion à la base de données et les requêtes SELECT fonctionnent parfaitement.")
    except Exception as e:
        print(f"Erreur de connexion à la base de données: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
