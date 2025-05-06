export async function POST(request: Request) {
  const body = await request.json();
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("fileName");
  const message = body.message;
  const res = await fetch(
    `${process.env.NEXT_API_URL}/chat/files/${fileName}`,
    {
      method: "POST",
      body: JSON.stringify({ message: message }),
    },
  );
  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
