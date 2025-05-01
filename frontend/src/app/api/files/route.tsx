export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
  }

  const forwardFormData = new FormData();
  forwardFormData.append("file", file);

  const res = await fetch("http://localhost:8000/files/", {
    method: "POST",
    body: forwardFormData,
  });

  const data = await res.json();
  console.log(res.status)
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
