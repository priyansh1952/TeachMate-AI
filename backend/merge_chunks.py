import os
import math
import json

n = 5  # merge every 5 chunks

input_folder = "json_outputs"
output_folder = "merged_chunks"
os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(input_folder):
    if filename.endswith(".json"):
        file_path = os.path.join(input_folder, filename)

        with open(file_path, "r", encoding="utf-8") as f:
            chunks = json.load(f)  # ✅ your files contain a LIST

        new_chunks = []
        num_chunks = len(chunks)
        num_groups = math.ceil(num_chunks / n)

        for i in range(num_groups):
            start_idx = i * n
            end_idx = min((i + 1) * n, num_chunks)
            group = chunks[start_idx:end_idx]

            merged_text = " ".join(c.get("text", "") for c in group)

            new_chunks.append({
                "number": group[0].get("number", "unknown"),
                "title": group[0].get("title", ""),
                "start": group[0].get("start", ""),
                "end": group[-1].get("end", ""),
                "text": merged_text
            })

        out_path = os.path.join(output_folder, filename)
        with open(out_path, "w", encoding="utf-8") as out:
            json.dump(new_chunks, out, indent=4, ensure_ascii=False)

print("✅ Successfully merged chunks!")
