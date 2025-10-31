import whisper
import json
import os

# -------------------------------------------------
# 1️⃣ Load Whisper model
# -------------------------------------------------
# You can use "small" or "base" for faster results, "large-v2" for best accuracy
model = whisper.load_model("small")

# -------------------------------------------------
# 2️⃣ Define folders
# -------------------------------------------------
audio_folder = r"C:\RAG BASED AI\audios"
output_folder = r"C:\RAG BASED AI\json_outputs"
os.makedirs(output_folder, exist_ok=True)

# -------------------------------------------------
# 3️⃣ Loop through all MP3 files
# -------------------------------------------------
for file in os.listdir(audio_folder):
    if file.endswith(".mp3"):
        print(f"\n🎧 Processing: {file}")

        # Extract metadata from filename
        if "_" in file:
            number = file.split("_")[0]
            title = os.path.splitext("_".join(file.split("_")[1:]))[0]
        else:
            number = "unknown"
            title = os.path.splitext(file)[0]

        # Input & Output paths
        audio_path = os.path.join(audio_folder, file)
        json_path = os.path.join(output_folder, f"{number}_{title}.json")

        # -------------------------------------------------
        # 4️⃣ Transcribe + Translate
        # -------------------------------------------------
        result = model.transcribe(
            audio_path,
            language="hi",   # original language (Hindi)
            task="translate" # translate to English
        )

        # -------------------------------------------------
        # 5️⃣ Extract start, end, and text
        # -------------------------------------------------
        chunks = [
            {"number": number, "title": title, "start": seg["start"], "end": seg["end"], "text": seg["text"]}
            for seg in result["segments"]
        ]

        # -------------------------------------------------
        # 6️⃣ Save output JSON
        # -------------------------------------------------
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

        print(f"✅ Saved: {json_path}")

print("\n🎉 All audio files have been processed successfully!")
