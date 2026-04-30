export const prerender = false;

export async function PUT({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const token = request.headers.get("authorization");

    // ✅ Validación: Si no hay token, rechazamos la petición directamente desde Astro
    if (!token) {
      return new Response(JSON.stringify({ error: "No autorizado. Token faltante." }), { status: 401 });
    }

    const { profileType, id, data } = body;

    const response = await fetch(
      `https://www.limpora.xyz/apinfc/api/v1/proxy/medplum/${profileType}/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token, // ✅ Se pasa el token tal cual ("Bearer ...")
        },
        body: JSON.stringify(data),
      }
    );

    const text = await response.text();

    return new Response(text, {
      status: response.status,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return new Response(
      JSON.stringify({ error: "Error interno del servidor al actualizar el perfil" }),
      { status: 500 }
    );
  }
}