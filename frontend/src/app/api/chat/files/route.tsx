export async function POST(request: Request) {
  const res = await fetch(`${process.env.NEXT_API_URL}/chat/files/ai5.pdf`, {
    method: "POST",
    body: JSON.stringify({ message: "what is the document content about" }),
  });
    const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
