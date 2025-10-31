from fastapi import FastAPI
from pydantic import BaseModel
from process_incoming import process_query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RAG Tutor API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "✅ RAG Tutor API Running. Use /ask endpoint"}

@app.post("/ask")
def ask(data: QueryRequest):
    r = process_query(data.question)
    return {
        "question": data.question,
        "answer": r["answer"],
        "sources": r["sources"]
    }
