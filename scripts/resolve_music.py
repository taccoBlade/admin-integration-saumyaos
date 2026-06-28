import re
import os
import json
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
import subprocess

PLAYLISTS = {
    "lockin": [
        {"title": "Run Boy Run", "artist": "Woodkid"},
        {"title": "Legends Never Die", "artist": "Against The Current"},
        {"title": "Warriors", "artist": "Imagine Dragons"},
        {"title": "Hall of Fame", "artist": "The Script"},
        {"title": "Believer", "artist": "Imagine Dragons"},
        {"title": "Centuries", "artist": "Fall Out Boy"},
        {"title": "Way Down We Go", "artist": "KALEO"},
        {"title": "The Nights", "artist": "Avicii"},
        {"title": "Arjan Vailly", "artist": "Bhupinder Babbal"},
        {"title": "Kar Har Maidaan Fateh", "artist": "Sukhwinder Singh"},
        {"title": "Brothers Anthem", "artist": "Vishal-Shekhar"},
        {"title": "Zinda", "artist": "Amit Trivedi"},
    ],
    "ride": [
        {"title": "After Dark", "artist": "Mr.Kitty"},
        {"title": "Midnight City", "artist": "M83"},
        {"title": "Sweater Weather", "artist": "The Neighbourhood"},
        {"title": "Heat Waves", "artist": "Glass Animals"},
        {"title": "Husn", "artist": "Anuv Jain"},
        {"title": "Kho Gaye Hum Kahan", "artist": "Jasleen Royal & Prateek Kuhad"},
        {"title": "O Sanam", "artist": "Lucky Ali"},
        {"title": "Kasoor", "artist": "Prateek Kuhad"},
        {"title": "Sajni", "artist": "Jal"},
        {"title": "Choo Lo", "artist": "The Local Train"},
        {"title": "Paradise", "artist": "Coldplay"},
        {"title": "Nightcall", "artist": "Kavinsky"},
    ],
    "chill": [
        {"title": "Experience", "artist": "Ludovico Einaudi"},
        {"title": "Time", "artist": "Hans Zimmer"},
        {"title": "Cornfield Chase", "artist": "Hans Zimmer"},
        {"title": "Interstellar Main Theme", "artist": "Hans Zimmer"},
        {"title": "Nuvole Bianche", "artist": "Ludovico Einaudi"},
        {"title": "Sunset Lover", "artist": "Petit Biscuit"},
        {"title": "Baarishein", "artist": "Anuv Jain"},
        {"title": "Gul", "artist": "Anuv Jain"},
        {"title": "Iktara", "artist": "Amit Trivedi"},
        {"title": "Until I Found You", "artist": "Stephen Sanchez"},
    ]
}

def search_itunes(title, artist="Various Artists"):
    query_str = title if artist == "Various Artists" else f"{artist} {title}"
    url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query_str)}&media=music&limit=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get("results"):
                res = data["results"][0]
                preview_url = res.get("previewUrl", "")
                cover_url = res.get("artworkUrl100", "").replace("100x100bb", "300x300bb")
                real_artist = res.get("artistName", artist)
                return {
                    "src": preview_url,
                    "coverUrl": cover_url,
                    "artist": real_artist,
                    "title": res.get("trackName", title)
                }
    except Exception as e:
        print(f"iTunes error for {query_str}: {e}")
    return None

def download_youtube_audio(title, artist, output_path):
    # Search and download best m4a audio without conversion
    query = f"{artist} {title} audio"
    cmd = [
        "python", "-m", "yt_dlp",
        f"ytsearch1:{query}",
        "-f", "bestaudio[ext=m4a]/best",
        "-o", output_path,
        "--no-playlist",
        "--quiet",
        "--no-warnings"
    ]
    try:
        print(f"Downloading: {artist} - {title} ...")
        subprocess.run(cmd, check=True)
        print(f"Success: {output_path}")
        return True
    except Exception as e:
        print(f"Failed to download {query}: {e}")
        return False

def resolve_spotify_tracks():
    print("Resolving spotifyTracks.ts...")
    filepath = "lib/spotifyTracks.ts"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse tracks
    tracks_raw = re.findall(r'\{\s*"title":\s*"(.*?)",\s*"artist":\s*"(.*?)",\s*"src":\s*"(.*?)",\s*"glow":\s*"(.*?)",\s*"rainColor":\s*"(.*?)",\s*"flashRate":\s*(.*?),\s*"coverUrl":\s*"(.*?)"\s*\}', content, re.DOTALL)
    
    print(f"Parsed {len(tracks_raw)} tracks from file.")

    resolved_tracks = []
    
    def process_track(item):
        title, artist, src, glow, rainColor, flashRate, coverUrl = item
        # Try to resolve via iTunes to get real audio and cover
        itunes_info = search_itunes(title, artist)
        if itunes_info and itunes_info["src"]:
            print(f"Resolved [iTunes]: {title} -> {itunes_info['title']} by {itunes_info['artist']}")
            return {
                "title": title,
                "artist": itunes_info["artist"],
                "src": itunes_info["src"],
                "glow": glow,
                "rainColor": rainColor,
                "flashRate": float(flashRate),
                "coverUrl": itunes_info["coverUrl"]
            }
        else:
            return {
                "title": title,
                "artist": artist,
                "src": src,
                "glow": glow,
                "rainColor": rainColor,
                "flashRate": float(flashRate),
                "coverUrl": coverUrl
            }

    with ThreadPoolExecutor(max_workers=8) as executor:
        resolved_tracks = list(executor.map(process_track, tracks_raw))

    # Write back to spotifyTracks.ts
    out_lines = ["export const spotifyTracks = ["]
    for t in resolved_tracks:
        out_lines.append(f'  {{\n    "title": {json.dumps(t["title"])},\n    "artist": {json.dumps(t["artist"])},\n    "src": {json.dumps(t["src"])},\n    "glow": {json.dumps(t["glow"])},\n    "rainColor": {json.dumps(t["rainColor"])},\n    "flashRate": {t["flashRate"]},\n    "coverUrl": {json.dumps(t["coverUrl"])}\n  }},')
    
    # Remove last comma
    if out_lines[-1].endswith(","):
        out_lines[-1] = out_lines[-1][:-1]
    out_lines.append("];")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))
    print("spotifyTracks.ts updated successfully!")

def resolve_and_download_playlists():
    print("Processing professional playlists...")
    os.makedirs("public/audio", exist_ok=True)

    # We will resolve iTunes details for cover art, and download YouTube audio for offline playback
    for mode, tracks in PLAYLISTS.items():
        for idx, track in enumerate(tracks):
            filename = f"{mode}_{idx}.m4a"
            output_path = f"public/audio/{filename}"
            
            # 1. Download YouTube Audio (if not already downloaded)
            if not os.path.exists(output_path):
                download_youtube_audio(track["title"], track["artist"], output_path)
            else:
                print(f"Already exists: {output_path}")

            # 2. Get iTunes artwork
            info = search_itunes(track["title"], track["artist"])
            if info:
                track["artwork"] = info["coverUrl"]
            else:
                track["artwork"] = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80"
            
            # 3. Set local source path
            track["local_src"] = f"/audio/{filename}"

    # Write updated playlists back to components/projects/dashboard-widgets.tsx
    widgets_path = "components/projects/dashboard-widgets.tsx"
    with open(widgets_path, "r", encoding="utf-8") as f:
        content = f.read()

    # We want to replace the PLAYLISTS declaration in dashboard-widgets.tsx
    # Let's format the new playlists python dict to JS object
    playlists_js = "const PLAYLISTS = {\n"
    for mode, tracks in PLAYLISTS.items():
        playlists_js += f"  {mode}: [\n"
        for t in tracks:
            playlists_js += f'    {{ title: "{t["title"]}", artist: "{t["artist"]}", src: "{t["local_src"]}", artwork: "{t["artwork"]}" }},\n'
        playlists_js += "  ],\n"
    playlists_js += "};"

    # Replace PLAYLISTS in file
    pattern = r'const PLAYLISTS = \{.*?\};'
    new_content = re.sub(pattern, playlists_js, content, flags=re.DOTALL)

    # Let's also update the preloader logic inside dashboard-widgets.tsx
    # Since all tracks now have their 'src' and 'artwork' directly inside the PLAYLISTS array,
    # we don't even need to query iTunes API at runtime anymore!
    # We can just read them directly from the track object!
    # Let's inspect where trackUrls and trackArtworks are populated in dashboard-widgets.tsx.

    with open(widgets_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("dashboard-widgets.tsx updated with local paths and resolved artwork!")

if __name__ == "__main__":
    resolve_spotify_tracks()
    resolve_and_download_playlists()
