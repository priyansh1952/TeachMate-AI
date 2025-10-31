export async function askAPI(question) {
  const resp = await fetch("http://127.0.0.1:8000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!resp.ok) throw new Error("API request failed");
  return await resp.json();
}
