import json
import pandas as pd
import joblib

# Load JSON
with open("chunk_embeddings.json", "r", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame(data)

# Save to joblib
joblib.dump(df, "embeddings.joblib")

print("✅ embeddings.joblib recreated successfully!")
print(f"📦 Total chunks: {len(df)}")
