import email_service
import sys
import traceback

print("🛠️ Début du test d'envoi d'email...")
print(f"Utilisateur SMTP : {email_service.SMTP_USER}")
print(f"Mot de passe (longeur) : {len(email_service.SMTP_PASSWORD) if email_service.SMTP_PASSWORD else 0}")

try:
    # Envoyer à la même adresse pour tester
    email_service.send_welcome_email("tubeai.contact@gmail.com", "Testeur TubeAI")
    print("✅ Le test d'envoi s'est bien terminé sans exception (Vérifiez la boîte de réception test !)")
except Exception as e:
    print("❌ Erreur pendant l'envoi :")
    traceback.print_exc()
    sys.exit(1)
