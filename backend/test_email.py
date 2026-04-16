"""
Script de test d'envoi de mail avec les credentials SMTP.
Lancez avec : python backend/test_email.py
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
TEST_TO = os.getenv("TEST_EMAIL_TO", SMTP_USER)  # Par défaut envoie à soi-même

print(f"SMTP_USER     = {SMTP_USER!r}")
print(f"SMTP_PASSWORD = {'SET (' + str(len(SMTP_PASSWORD)) + ' chars)' if SMTP_PASSWORD else 'NOT SET ❌'}")
print(f"Sending to    = {TEST_TO!r}")
print()

if not SMTP_USER or not SMTP_PASSWORD:
    print("❌ ERREUR : SMTP_USER ou SMTP_PASSWORD est vide dans le .env !")
    print("Ajoutez ces variables dans backend/.env et réessayez.")
    exit(1)

message = MIMEMultipart()
message["Subject"] = "🧪 Test d'envoi TubeAI"
message["From"] = f"TubeAI Test <{SMTP_USER}>"
message["To"] = TEST_TO

html = f"""
<html>
  <body>
    <h2>Test réussi ! ✅</h2>
    <p>Si vous recevez cet email, la configuration SMTP fonctionne parfaitement.</p>
    <p>Envoyé depuis : {SMTP_USER}</p>
  </body>
</html>
"""
message.attach(MIMEText(html, "html"))

print("Connexion au serveur SMTP de Gmail...")
try:
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
        server.ehlo()
        print("✅ Connexion établie")
        server.starttls()
        print("✅ TLS activé")
        server.login(SMTP_USER, SMTP_PASSWORD)
        print("✅ Authentification réussie")
        server.sendmail(SMTP_USER, TEST_TO, message.as_string())
        print(f"✅ Email envoyé avec succès à {TEST_TO} !")
except smtplib.SMTPAuthenticationError as e:
    print(f"❌ ERREUR D'AUTHENTIFICATION : {e}")
    print("→ Vérifiez que SMTP_PASSWORD est bien le mot de passe d'application Google (16 lettres).")
except smtplib.SMTPException as e:
    print(f"❌ ERREUR SMTP : {e}")
except Exception as e:
    print(f"❌ ERREUR GÉNÉRALE : {e}")
