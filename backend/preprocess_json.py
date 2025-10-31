import os
import json
import requests
from tqdm import tqdm
import time
import pandas as pd
import joblib

# -------------------------------
# 🔹 Ollama Embedding Function
# -------------------------------
def create_embedding(text):
    try:
        r = requests.post(
            "http://localhost:11434/api/embeddings",
            json={"model": "bge-m3", "prompt": text}
        )
        r.raise_for_status()
        return r.json().get("embedding", [])
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

# -------------------------------
# ✅ CONFIG
# -------------------------------
input_folder = "merged_chunks"
output_file = "merged_chunk_embeddings.json"
checkpoint_file = "progress_checkpoint.txt"

# -------------------------------
# ✅ Load processed checkpoint
# -------------------------------
start_from = 0
if os.path.exists(checkpoint_file):
    with open(checkpoint_file, "r") as f:
        start_from = int(f.read().strip())

json_files = sorted([f for f in os.listdir(input_folder) if f.endswith(".json")])
print(f"📂 Found {len(json_files)} JSON files")
print(f"➡️ Starting from file index: {start_from}")

all_chunks = []
chunk_id = 0

# Load previous output if exists (resume mode)
if os.path.exists(output_file):
    with open(output_file, "r", encoding="utf-8") as f:
        all_chunks = json.load(f)
        chunk_id = len(all_chunks)

for file_index, json_file in enumerate(json_files):
    
    if file_index < start_from:
        continue  # skip already processed files

    file_path = os.path.join(input_folder, json_file)

    with open(file_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    print(f"\n📁 Processing File {file_index+1}/{len(json_files)} → {json_file}")
    
    for idx, chunk in enumerate(tqdm(chunks, desc=f"Chunks in {json_file}")):

        text = chunk.get("text", "").strip()
        if not text:
            continue

        print(f"➡️ Embedding chunk {chunk_id} (File {file_index}, Chunk {idx})")

        embedding = create_embedding(text)

        chunk["chunk_id"] = chunk_id
        chunk["source_file"] = json_file
        chunk["embedding"] = embedding
        all_chunks.append(chunk)
        chunk_id += 1

        time.sleep(0.1)

        # ✅ Save checkpoint every 5 chunks
        if chunk_id % 5 == 0:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(all_chunks, f, ensure_ascii=False, indent=2)

            with open(checkpoint_file, "w") as f:
                f.write(str(file_index))

    # ✅ Save progress after every file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    with open(checkpoint_file, "w") as f:
        f.write(str(file_index))

print("\n✅ Embedding completed.")
print(f"🧠 Total chunks embedded: {len(all_chunks)}")

# Save DataFrame
df = pd.DataFrame(all_chunks)
joblib.dump(df, "merged_embeddings.joblib")

print("💾 Saved DataFrame → merged_embeddings.joblib")
print("🎉 You're all set!")
