import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import joblib
import requests
import json

# -------------------- Load Embeddings --------------------
df = joblib.load("merged_embeddings.joblib")

# -------------------- Create Embedding --------------------
def create_embedding(text_list):
    r = requests.post("http://localhost:11434/api/embed", json={
        "model": "bge-m3",
        "input": text_list
    })
    return r.json()["embeddings"][0]

# -------------------- LLM Inference --------------------
def inference(prompt):
    system_prompt = """
You are an AI coding tutor.

You MUST answer only from the transcript provided.
Do not hallucinate. If unsure, say "I don't know".

Return STRICT JSON ONLY:

{
 "answer": "student-friendly explanation",
 "sources": [
   { "file": "filename.ext", "start": 0, "end": 0 }
 ]
}

Rules:
- DO NOT include transcript text in citations
- DO NOT mention timestamps in the answer text
- DO NOT include file paths, only filename
"""
    r = requests.post("http://localhost:11434/api/chat", json={
        "model": "qwen2.5",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "stream": False
    })

    raw = r.json()["message"]["content"]

    try:
        return json.loads(raw)
    except:
        return {"answer": raw.strip(), "sources": []}

# -------------------- Process Query --------------------
def process_query(incoming_query):
    q_embed = create_embedding([incoming_query])

    similarities = cosine_similarity(
        np.vstack(df["embedding"].values),
        [q_embed]
    ).flatten()

    top_k = 5
    idx = similarities.argsort()[::-1][:top_k]
    top_chunks = df.iloc[idx]

    context = "\n".join(row.text for _, row in top_chunks.iterrows())

    prompt = f"""
Relevant Transcript:
{context}

User Question: {incoming_query}
"""

    llm_output = inference(prompt)

    # Build cleaned citation list
    citations = []
    for _, row in top_chunks.iterrows():
        citations.append({
            "file": row.source_file,
            "start": int(row.start),
            "end": int(row.end)
        })

    return {
        "answer": llm_output.get("answer", "").strip(),
        "sources": citations
    }

# -------------------- CLI --------------------
if __name__ == "__main__":
    q = input("\nAsk: ")
    out = process_query(q)
    print("\nAnswer:\n", out["answer"], "\n")
    print("Sources:")
    for s in out["sources"]:
        print(f"- {s['file']} ({s['start']}s → {s['end']}s)")
