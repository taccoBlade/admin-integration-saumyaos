import sys
import subprocess
import os

def download_link(url, output_dir="public/audio/"):
    os.makedirs(output_dir, exist_ok=True)
    # Get title first using yt-dlp
    title_cmd = [
        "python", "-m", "yt_dlp", 
        "--get-title", 
        url
    ]
    try:
        print("Fetching video information...")
        title = subprocess.check_output(title_cmd).decode("utf-8").strip()
        print(f"Title found: {title}")
        
        # Clean title for filename (remove special chars)
        clean_title = "".join([c for c in title if c.isalnum() or c in "._- "]).strip()
        clean_title = clean_title.replace(" ", "_")
        output_path = os.path.join(output_dir, f"{clean_title}.m4a")
        
        print(f"Downloading: {title} ...")
        cmd = [
            "python", "-m", "yt_dlp",
            url,
            "-f", "bestaudio[ext=m4a]/best",
            "-o", output_path,
            "--no-playlist",
            "--quiet",
            "--no-warnings"
        ]
        subprocess.run(cmd, check=True)
        print("\n" + "="*50)
        print(f"SUCCESS: Audio downloaded successfully!")
        print(f"Saved to: {output_path}")
        print(f"You can now use `/audio/{clean_title}.m4a` as the source in your playlist!")
        print("="*50 + "\n")
    except Exception as e:
        print(f"Error downloading video: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/download_youtube_link.py <YOUTUBE_URL>")
        print("Example: python scripts/download_youtube_link.py https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    else:
        download_link(sys.argv[1])
