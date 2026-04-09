import os
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def get_youtube_client():
    if not YOUTUBE_API_KEY or "your" in YOUTUBE_API_KEY.lower():
        return None
    return build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

def get_channel_stats(channel_id: str):
    """
    Fetch statistics for a YouTube channel by its ID.
    Returns a dictionary with subscriberCount, viewCount, and videoCount.
    """
    youtube = get_youtube_client()
    if not youtube:
        return None
    try:
        # Detect if it's a permanent ID (UC...) or a handle (@...)
        is_uc_id = channel_id.startswith("UC") or (channel_id.startswith("@") and channel_id[1:].startswith("UC"))
        
        if is_uc_id:
            # It's an ID, remove @ if present
            clean_id = channel_id.lstrip("@")
            request = youtube.channels().list(
                part="statistics,snippet,brandingSettings",
                id=clean_id
            )
        elif channel_id.startswith("@"):
            # It's a handle
            request = youtube.channels().list(
                part="statistics,snippet,brandingSettings",
                forHandle=channel_id
            )
        else:
            # Fallback to ID
            request = youtube.channels().list(
                part="statistics,snippet,brandingSettings",
                id=channel_id
            )
        response = request.execute()

        if not response.get("items"):
            return None

        channel_data = response["items"][0]
        stats = channel_data["statistics"]
        snippet = channel_data["snippet"]
        branding = channel_data.get("brandingSettings", {})

        print(f"DEBUG YT API - Channel ID: {channel_data['id']}")
        print(f"DEBUG YT API - Thumbnails: {snippet.get('thumbnails')}")
        print(f"DEBUG YT API - Banner: {branding.get('image', {}).get('bannerExternalUrl')}")

        return {
            "channel_id": channel_data["id"],
            "title": snippet.get("title"),
            "subscriber_count": int(stats.get("subscriberCount", 0)),
            "view_count": int(stats.get("viewCount", 0)),
            "video_count": int(stats.get("videoCount", 0)),
            "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url") or snippet.get("thumbnails", {}).get("default", {}).get("url"),
            "banner": branding.get("image", {}).get("bannerExternalUrl")
        }
    except HttpError as e:
        print(f"Error fetching YouTube statistics: {e}")
        return None

def get_channel_videos(channel_id: str, max_results: int = 50):
    """
    Fetch the list of published videos for a channel.
    """
    youtube = get_youtube_client()
    if not youtube:
        return []
    try:
        # 1. Get the uploads playlist ID
        channel_request = youtube.channels().list(
            part="contentDetails",
            id=channel_id if channel_id.startswith("UC") else None,
            forHandle=channel_id if channel_id.startswith("@") else None
        )
        channel_response = channel_request.execute()
        
        if not channel_response.get("items"):
            return []
            
        uploads_playlist_id = channel_response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
        
        # 2. Get videos from the uploads playlist
        videos = []
        next_page_token = None
        
        while len(videos) < max_results:
            playlist_request = youtube.playlistItems().list(
                part="snippet,contentDetails",
                playlistId=uploads_playlist_id,
                maxResults=min(50, max_results - len(videos)),
                pageToken=next_page_token
            )
            playlist_response = playlist_request.execute()
            
            items = playlist_response.get("items", [])
            if not items:
                break
                
            video_ids = [item["contentDetails"]["videoId"] for item in items]
            
            # 3. Get detailed stats/info for these videos
            video_request = youtube.videos().list(
                part="statistics,snippet,contentDetails",
                id=",".join(video_ids)
            )
            video_response = video_request.execute()
            
            for v in video_response.get("items", []):
                snippet = v["snippet"]
                stats = v["statistics"]
                
                videos.append({
                    "youtube_video_id": v["id"],
                    "title": snippet.get("title"),
                    "description": snippet.get("description"),
                    "published_at": snippet.get("publishedAt"),
                    "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url") or snippet.get("thumbnails", {}).get("default", {}).get("url"),
                    "view_count": int(stats.get("viewCount", 0)),
                    "like_count": int(stats.get("likeCount", 0)),
                    "comment_count": int(stats.get("commentCount", 0)),
                    "duration": v["contentDetails"].get("duration")
                })
            
            next_page_token = playlist_response.get("nextPageToken")
            if not next_page_token:
                break
                
        return videos
    except HttpError as e:
        print(f"Error fetching channel videos: {e}")
        return []

def extract_channel_id_from_url(url: str):
    """
    Extracts channel ID or handle from a YouTube URL.
    Supports:
    - https://youtube.com/@handle -> returns @handle
    - https://youtube.com/channel/UC... -> returns UC...
    - https://youtube.com/id=... -> returns ID
    """
    if "/@" in url:
        # Handle format: @handle
        handle = url.split("/@")[-1].split("?")[0].split("/")[0]
        return "@" + handle if not handle.startswith("@") else handle
        
    if "channel/" in url:
        return url.split("channel/")[-1].split("?")[0].split("/")[0]
    if "c/" in url:
        return url.split("c/")[-1].split("?")[0].split("/")[0]
    if "user/" in url:
        return url.split("user/")[-1].split("?")[0].split("/")[0]
    if "id=" in url:
        return url.split("id=")[-1].split("&")[0]
    # If not a standard URL, maybe it's the ID itself
    if url.startswith("UC") or url.startswith("@"):
        return url
    return None


def search_similar_channels(niche: str, max_results: int = 10):
    """
    Search for YouTube channels similar to the given niche/keyword.
    Uses the YouTube search.list API with type=channel.
    Returns a list of channel info dicts.
    """
    youtube = get_youtube_client()
    if not youtube:
        return []
    try:
        # Search for channels matching the niche
        search_request = youtube.search().list(
            part="snippet",
            q=niche,
            type="channel",
            maxResults=max_results,
            order="relevance"
        )
        search_response = search_request.execute()

        if not search_response.get("items"):
            return []

        # Extract channel IDs from search results
        channel_ids = [
            item["snippet"]["channelId"]
            for item in search_response["items"]
            if item.get("snippet", {}).get("channelId")
        ]

        if not channel_ids:
            return []

        # Fetch detailed stats for those channels
        stats_request = youtube.channels().list(
            part="statistics,snippet,brandingSettings",
            id=",".join(channel_ids)
        )
        stats_response = stats_request.execute()

        channels = []
        for ch in stats_response.get("items", []):
            snippet = ch.get("snippet", {})
            stats = ch.get("statistics", {})
            branding = ch.get("brandingSettings", {})

            channels.append({
                "channel_id": ch["id"],
                "title": snippet.get("title", ""),
                "description": snippet.get("description", "")[:200],
                "thumbnail": (
                    snippet.get("thumbnails", {}).get("high", {}).get("url")
                    or snippet.get("thumbnails", {}).get("default", {}).get("url")
                    or ""
                ),
                "banner": branding.get("image", {}).get("bannerExternalUrl", ""),
                "subscriber_count": int(stats.get("subscriberCount", 0)),
                "view_count": int(stats.get("viewCount", 0)),
                "video_count": int(stats.get("videoCount", 0)),
                "country": snippet.get("country", ""),
                "url": f"https://www.youtube.com/channel/{ch['id']}",
            })

        return channels

    except HttpError as e:
        print(f"Error searching similar channels: {e}")
        return []

