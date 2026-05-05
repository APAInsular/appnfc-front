import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies, redirect }) => {
    try { await fetch(`${import.meta.env.API_URL}/auth/logout`, { method: "POST" }); } catch {}
    cookies.delete("auth-token", { path: "/" });
    return redirect("/login");
};