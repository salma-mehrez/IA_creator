import sys
from services.youtube_service import get_channel_stats, get_youtube_client

try:
    print("Client:", get_youtube_client())
    print("Stats:", get_channel_stats("UCNU_C5SxbXN1E9g_0fE3_Ng"))
except Exception as e:
    import traceback
    traceback.print_exc()
