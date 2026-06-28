import re
import json

try:
    content = open('lib/spotifyTracks.ts', 'r', encoding='utf-8').read()
    # Find all track blocks
    # We can match everything between { and } that contains "title"
    tracks_data = []
    # Let's parse it as a JSON by converting TS to JSON
    # Strip "export const spotifyTracks =" and trailing ";"
    ts_code = content.strip()
    if ts_code.startswith("export const spotifyTracks ="):
        json_like = ts_code.replace("export const spotifyTracks =", "").strip()
        if json_like.endswith(";"):
            json_like = json_like[:-1].strip()
        # Evaluate or parse
        # Simple regex match for objects:
        matches = re.findall(r'\{\s*"title":\s*"(.*?)",\s*"artist":\s*"(.*?)".*?\}', content, re.DOTALL)
        print(f"Found {len(matches)} tracks matches via regex.")
        if matches:
            print("First track sample:", matches[0])
except Exception as e:
    print("Error:", e)
