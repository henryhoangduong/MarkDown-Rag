export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
    });
  }

  const forwardFormData = new FormData();
  forwardFormData.append("file", file);

  const res = await fetch(`${process.env.NEXT_API_URL}/files`, {
    method: "POST",
    body: forwardFormData,
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request: Request) {
  try {
    const res = await fetch(`${process.env.NEXT_API_URL}/files/`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(
        JSON.stringify({ error: errorText || "Failed to fetch files" }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Unexpected error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
