import os
import subprocess

# Ensure output directory exists
os.makedirs("audios", exist_ok=True)

# List all files in the "videos" folder
files = os.listdir("videos")
print("🎥 Found video files:", files)

for file in files:
    if file.endswith(".mp4"):
        print(f"\nProcessing: {file}")

        # Optional: extract tutorial number safely (if your filenames have #)
        # Example filename: "Tutorial #1 [Intro].mp4"
        if "#" in file:
            try:
                tutorial_number = file.split("#")[1].split(" ")[0]
            except IndexError:
                tutorial_number = "unknown"
        else:
            tutorial_number = "unknown"

        # File name before special chars or brackets
        file_name = os.path.splitext(file)[0].replace(" ", "_")

        print("Tutorial number:", tutorial_number)
        print("File name:", file_name)

        # Input and output paths
        input_path = os.path.join("videos", file)
        output_path = os.path.join("audios", f"{tutorial_number}_{file_name}.mp3")

        # Convert video to MP3
        subprocess.run([
            "ffmpeg",
            "-i", input_path,
            "-q:a", "0",
            "-map", "a",
            output_path
        ])

print("\n✅ All videos converted to MP3 successfully!")
