import re
import os
import json
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
import subprocess

PLAYLISTS = {
    "lockin": [
        {"title": "Run Boy Run", "artist": "Woodkid"},
        {"title": "Legends Never Die", "artist": "Against The Current"},
        {"title": "Believer", "artist": "Imagine Dragons"},
        {"title": "Centuries", "artist": "Fall Out Boy"},
        {"title": "Metamorphosis", "artist": "INTERWORLD"},
        {"title": "Kar Har Maidaan Fateh", "artist": "Sukhwinder Singh"},
    ],
    "ride": [
        {"title": "Memory Reboot", "artist": "VØJ & Narvent"},
        {"title": "After Dark", "artist": "Mr.Kitty"},
        {"title": "Little Dark Age", "artist": "MGMT"},
        {"title": "Nightcall", "artist": "Kavinsky"},
        {"title": "Sweater Weather", "artist": "The Neighbourhood"},
        {"title": "Midnight City", "artist": "M83"},
        {"title": "The Nights", "artist": "Avicii"},
        {"title": "Way Down We Go", "artist": "KALEO"},
    ],
    "chill": [
        {"title": "Past Lives", "artist": "sapientdream & Slushii"},
        {"title": "Experience", "artist": "Ludovico Einaudi"},
        {"title": "Time", "artist": "Hans Zimmer"},
        {"title": "Cornfield Chase", "artist": "Hans Zimmer"},
        {"title": "Husn", "artist": "Anuv Jain"},
    ]
}

def search_itunes(title, artist="Various Artists"):
    query_str = title if artist == "Various Artists" else f"{artist} {title}"
    url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query_str)}&media=music&limit=1"
    
    # 1 second delay to respect iTunes API rate limits
    time.sleep(1.0)
    
    for attempt in range(4):
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
                return None
        except urllib.error.HTTPError as e:
            if e.code == 429:
                sleep_time = (attempt + 1) * 3
                print(f"Rate limited (429) for {query_str}. Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
            else:
                print(f"HTTP error {e.code} for {query_str}: {e}")
                break
        except Exception as e:
            print(f"iTunes error for {query_str}: {e}")
            break
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
    if not os.path.exists(filepath):
        print("lib/spotifyTracks.ts not found. Skipping.")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse tracks
    tracks_raw = re.findall(r'\{\s*"title":\s*"(.*?)",\s*"artist":\s*"(.*?)",\s*"src":\s*"(.*?)",\s*"glow":\s*"(.*?)",\s*"rainColor":\s*"(.*?)",\s*"flashRate":\s*(.*?),\s*"coverUrl":\s*"(.*?)"\s*\}', content, re.DOTALL)
    
    print(f"Parsed {len(tracks_raw)} tracks from file. Resolving sequentially to prevent rate limits.")

    resolved_tracks = []
    
    for item in tracks_raw:
        title, artist, src, glow, rainColor, flashRate, coverUrl = item
        itunes_info = search_itunes(title, artist)
        if itunes_info and itunes_info["src"]:
            print(f"Resolved [iTunes]: {title} -> {itunes_info['title']} by {itunes_info['artist']}")
            resolved_tracks.append({
                "title": title,
                "artist": itunes_info["artist"],
                "src": itunes_info["src"],
                "glow": glow,
                "rainColor": rainColor,
                "flashRate": float(flashRate),
                "coverUrl": itunes_info["coverUrl"]
            })
        else:
            resolved_tracks.append({
                "title": title,
                "artist": artist,
                "src": src,
                "glow": glow,
                "rainColor": rainColor,
                "flashRate": float(flashRate),
                "coverUrl": coverUrl
            })

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
                print(f"Resolved Artwork: {track['title']} -> {info['coverUrl']}")
            else:
                track["artwork"] = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80"
            
            # 3. Set local source path
            track["local_src"] = f"/audio/{filename}"

    # Write updated playlists back to lib/playlists.ts
    playlists_path = "lib/playlists.ts"
    playlists_js = """export interface Track {
  title: string;
  artist: string;
  src: string;
  artwork: string;
}

export const PLAYLISTS: Record<string, Track[]> = {
"""
    for mode, tracks in PLAYLISTS.items():
        playlists_js += f"  {mode}: [\n"
        for t in tracks:
            title_esc = t["title"].replace('"', '\\"')
            artist_esc = t["artist"].replace('"', '\\"')
            playlists_js += f'    {{ title: "{title_esc}", artist: "{artist_esc}", src: "{t["local_src"]}", artwork: "{t["artwork"]}" }},\n'
        playlists_js += "  ],\n"
    playlists_js += "};\n"

    with open(playlists_path, "w", encoding="utf-8") as f:
        f.write(playlists_js)
    print("lib/playlists.ts updated with local paths and resolved artwork!")

if __name__ == "__main__":
    # We only run the playlist resolver as it is the target task
    resolve_and_download_playlists()
