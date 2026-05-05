import type { APIRoute } from "astro";

export const prerender = false;

export const PUT: APIRoute = async ({ request, cookies }) => {
    const token = cookies.get("auth-token")?.value;

    if (!token) {
        return new Response(JSON.stringify({ error: "No autorizado." }), { status: 401 });
    }

    const { profileType, id, data } = await request.json();

    const response = await fetch(
        `${import.meta.env.API_URL}/proxy/medplum/${profileType}/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    return new Response(await response.text(), { status: response.status });
};