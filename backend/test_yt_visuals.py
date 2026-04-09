import os
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def test_channel(channel_id):
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    print(f"Testing channel: {channel_id}")
    
    try:
        is_uc_id = channel_id.startswith("UC") or (channel_id.startswith("@") and channel_id[1:].startswith("UC"))
        
        if is_uc_id:
            clean_id = channel_id.lstrip("@")
            request = youtube.channels().list(
                part="statistics,snippet,brandingSettings",
                id=clean_id
            )
        elif channel_id.startswith("@"):
            request = youtube.channels().list(
                part="snippet,brandingSettings",
                forHandle=channel_id
            )
        else:
            request = youtube.channels().list(
                part="snippet,brandingSettings",
                id=channel_id
            )
        response = request.execute()
        
        if not response.get("items"):
            print("No channel found.")
            return

        item = response["items"][0]
        snippet = item.get("snippet", {})
        branding = item.get("brandingSettings", {})
        
        print(f"Title: {snippet.get('title')}")
        print(f"Profile: {snippet.get('thumbnails', {}).get('high', {}).get('url')}")
        print(f"Banner (ext): {branding.get('image', {}).get('bannerExternalUrl')}")
        print(f"Branding Image info: {branding.get('image')}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test with the ID from the user's screenshot
    test_channel("UCSTASRH85WPDUHYEBNDAF7A")
    # Test with a known handle
    test_channel("@Zoufryymedia")
