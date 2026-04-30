// src/pages/api/login.ts

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();

    const response = await fetch("https://www.limpora.xyz/apinfc/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text(); // 👈 IMPORTANTE

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Proxy error:", error);

    return new Response(JSON.stringify({ error: "Error en proxy" }), {
      status: 500,
    });
  }
}