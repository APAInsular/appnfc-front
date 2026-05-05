// src/pages/api/[...path].ts
import type { APIRoute } from "astro";

export const ALL: APIRoute = async ({ request, params, cookies }) => {
  const path = params.path;
  
  // 1. Buscamos el token en la cookie "auth-token" (como lo definiste en login.ts)
  const tokenFromCookie = cookies.get("auth-token")?.value;

  // 2. Fallback: lo intentamos sacar del header (por si aún usas localStorage en algunas partes)
  const tokenFromHeader = request.headers.get("Authorization");

  // 3. Decidimos qué token usar
  let finalAuthHeader = "";
  if (tokenFromCookie) {
      finalAuthHeader = `Bearer ${tokenFromCookie}`;
  } else if (tokenFromHeader && tokenFromHeader !== "Bearer null") {
      finalAuthHeader = tokenFromHeader;
  }

  // Si no hay token en ninguno de los dos lados, rechazamos
  if (!finalAuthHeader) {
    return new Response(JSON.stringify({ message: "No autorizado. Inicia sesión." }), { status: 401 });
  }

  const backendUrl = `${import.meta.env.API_URL}/${path}`;

  try {
    const res = await fetch(backendUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": finalAuthHeader, // Mandamos el token real
      },
      body: request.method !== "GET" && request.method !== "HEAD" 
            ? await request.text() 
            : undefined,
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en Proxy:", error);
    return new Response(JSON.stringify({ message: "Error conectando con el backend" }), { status: 500 });
  }
};