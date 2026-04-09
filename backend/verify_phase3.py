import requests

API_URL = "http://localhost:8000"

def test_auth():
    # 1. Register
    reg_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    }
    print(f"--- Enregistrement de {reg_data['email']} ---")
    res = requests.post(f"{API_URL}/auth/register", json=reg_data)
    print(f"Status: {res.status_code}")
    if res.status_code == 201:
        print("✅ Succès")
    else:
        print(f"❌ Échec: {res.text}")
        if res.status_code == 400 and "déjà utilisé" in res.text:
            print("L'utilisateur existe déjà, on continue le test.")
        else:
            return

    # 2. Check if verified
    print("\n--- Vérification du statut initial ---")
    # On Login (on simule car on n'a pas encore le token sans login)
    # Mais le but est de tester /verify-email/{token}
    
    # On inspecte la DB pour avoir le token (puisque l'email n'est pas "réellement" envoyé)
    from database import engine
    from sqlalchemy.orm import Session
    from models import User
    
    with Session(engine) as session:
        user = session.query(User).filter(User.email == reg_data['email']).first()
        token = user.verification_token
        print(f"Token trouvé dans la DB: {token}")
        print(f"Statut is_verified avant: {user.is_verified}")
    
    # 3. Verify Email
    print(f"\n--- Appel à /verify-email/{token} ---")
    res = requests.get(f"{API_URL}/auth/verify-email/{token}")
    print(f"Status: {res.status_code}")
    print(f"Response: {res.json()}")
    
    with Session(engine) as session:
        user = session.query(User).filter(User.email == reg_data['email']).first()
        print(f"Statut is_verified après: {user.is_verified}")
        if user.is_verified:
            print("✅ Vérification d'email OK")
        else:
            print("❌ Échec de la vérification")

    # 4. Login
    print("\n--- Test du Login JSON ---")
    login_data = {"email": reg_data['email'], "password": reg_data['password']}
    res = requests.post(f"{API_URL}/auth/login", json=login_data)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        print("✅ Login OK")
        print(f"Token: {res.json()['access_token'][:10]}...")
    else:
        print(f"❌ Échec login: {res.text}")

if __name__ == "__main__":
    test_auth()
