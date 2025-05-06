export async function POST(request: Request) {
  const fileName = "ai5.pdf"
  const message ="what is the document content about" 
  const res = await fetch(`${process.env.NEXT_API_URL}/chat/files/${fileName}`, {
    method: "POST",
    body: JSON.stringify({ message: message }),
  });
  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
