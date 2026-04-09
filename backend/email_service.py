import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587  # TLS au lieu de SSL pour éviter les blocages Windows/Antivirus
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def send_welcome_email(to_email: str, username: str):
    """Envoie un email de bienvenue à l'utilisateur."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️ Variables d'environnement SMTP non configurées. Email non envoyé.")
        return

    message = MIMEMultipart()
    message["Subject"] = "🚀 Bienvenue sur TubeAI Creator !"
    message["From"] = f"L'Équipe TubeAI <{SMTP_USER}>"
    message["To"] = to_email

    # Contenu HTML de l'email
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-w-md mx-auto p-4 border rounded-lg shadow-sm">
            <h2 style="color: #2563eb;">Bienvenue, {username} ! 🎉</h2>
            <p>Nous sommes ravis de vous compter parmi les créateurs de <strong>TubeAI Creator</strong>.</p>
            <p>Grâce à notre plateforme, vous allez pouvoir :</p>
            <ul>
                <li>Générer des scripts YouTube viraux avec l'IA.</li>
                <li>Trouver des titres et des miniatures accrocheurs.</li>
                <li>Créer des voix-off pro et éditer vos vidéos.</li>
            </ul>
            <p>Connectez-vous à votre tableau de bord dès maintenant pour créer votre premier projet !</p>
            <br>
            <p>À très vite,<br><strong>L'équipe TubeAI</strong></p>
        </div>
      </body>
    </html>
    """
    
    # Attacher la version HTML
    message.attach(MIMEText(html, "html"))

    try:
        # Connexion avec TLS (Port 587)
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Sécuriser la connexion
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, message.as_string())
        print(f"📧 Email de bienvenue envoyé avec succès à {to_email}")
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de l'email à {to_email}: {e}")

def send_verification_email(to_email: str, username: str, token: str):
    """Envoie un email de vérification de compte."""
    if not SMTP_USER or not SMTP_PASSWORD:
        return

    verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
    
    message = MIMEMultipart()
    message["Subject"] = "🔐 Activez votre compte TubeAI Creator"
    message["From"] = f"TubeAI <{SMTP_USER}>"
    message["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Bonjour {username} !</h2>
        <p>Merci de vous être inscrit sur TubeAI Creator. Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
        <a href="{verification_url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Activer mon compte
        </a>
        <p>Si le bouton ne fonctionne pas, copiez ce lien : <br> {verification_url}</p>
      </body>
    </html>
    """
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, message.as_string())
    except Exception as e:
        print(f"❌ Erreur email verification: {e}")

def send_password_reset_email(to_email: str, token: str):
    """Envoie un email pour réinitialiser le mot de passe."""
    if not SMTP_USER or not SMTP_PASSWORD:
        return

    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    
    message = MIMEMultipart()
    message["Subject"] = "🔄 Réinitialisation de votre mot de passe"
    message["From"] = f"TubeAI <{SMTP_USER}>"
    message["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <a href="{reset_url}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Changer mon mot de passe
        </a>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      </body>
    </html>
    """
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, message.as_string())
    except Exception as e:
        print(f"❌ Erreur email reset: {e}")
