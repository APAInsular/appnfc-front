import type { APIRoute } from "astro";

export const ALL: APIRoute = async ({ request, params, cookies }) => {
  const path = params.path;
  const token = cookies.get("auth-token")?.value || request.headers.get("Authorization");

  if (!token || token === "Bearer null") {
    return new Response(JSON.stringify({ message: "No autorizado" }), { status: 401 });
  }

  const finalToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

  // DEBUG: Mira esto en tu terminal negra de VS Code
  const backendUrl = `${import.meta.env.API_URL}/${path}`;
  console.log(`🚀 PROXY FETCH: [${request.method}] -> ${backendUrl}`);

  try {
    const headers: Record<string, string> = {
      "Authorization": finalToken,
      "Accept": "application/json",
    };

    let requestBody: any = undefined;

    // SOLO leemos el cuerpo si NO es GET o HEAD
    if (request.method !== "GET" && request.method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      const text = await request.text();
      if (text) requestBody = text;
    }

    const res = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: requestBody,
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.log(`❌ ERROR DEL BACKEND EN ${path}:`);
      console.log(responseText); 
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ ERROR CRÍTICO PROXY:", error);
    return new Response(JSON.stringify({ message: "Error conectando al backend" }), { status: 500 });
  }
};