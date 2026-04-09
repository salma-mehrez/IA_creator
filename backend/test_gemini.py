import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

for model_name in ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-pro']:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hi")
        print(f"✅ {model_name} works!")
        break
    except Exception as e:
        err = str(e)[:120]
        print(f"❌ {model_name}: {err}")
