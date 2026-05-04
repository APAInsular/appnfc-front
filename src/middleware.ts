import { defineMiddleware } from "astro:middleware";

const PROTECTED_ROUTES = ["/profile", "/admin"];

export const onRequest = defineMiddleware((context, next) => {
    const { url, cookies, redirect } = context;

    const isProtected = PROTECTED_ROUTES.some((route) =>
        url.pathname.startsWith(route)
    );

    if (!isProtected) return next();

    const token = cookies.get("auth-token")?.value;

    if (!token) return redirect("/login");

    return next();
});