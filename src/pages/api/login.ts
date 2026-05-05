import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies }) => {
    const { email, password } = await request.json();
    const res = await fetch(`${import.meta.env.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const { data } = await res.json();

    cookies.set("auth-token", data.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
    });

    return new Response(JSON.stringify(data.user), { status: 200 });
};
