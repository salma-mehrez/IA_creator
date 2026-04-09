import urllib.request
import urllib.error

urls = [
    "https://yt3.ggpht.com/ixjMW3e_SpI2kpyZYQaAGEpWu23IKOGif-FBNalahdVoCdvDazburYv3C5nxhTywPrsHrnAv-rs=s800-c-k-c0x00ffffff-no-rj",
    "https://yt3.googleusercontent.com/DlhhWzXDPd4b4lBtiwTOYYI6j9hN43OVoT4og7yKKaAB6ihDshXgXKbvKsh5Fdf9xQ2Lk1lOiQ",
    "https://yt3.googleusercontent.com/DlhhWzXDPd4b4lBtiwTOYYI6j9hN43OVoT4og7yKKaAB6ihDshXgXKbvKsh5Fdf9xQ2Lk1lOiQ=w1920"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        print(f"URL: {url}")
        print(f"Status: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"URL: {url}")
        print(f"HTTP Error: {e.code}")
    except urllib.error.URLError as e:
        print(f"URL: {url}")
        print(f"URL Error: {e.reason}")
    print("-" * 20)
