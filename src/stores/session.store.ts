import { atom } from "nanostores";
import type User from "../services/dtos/User";

// Función auxiliar para leer la cookie en el cliente
function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
}

const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user_data") : null;

export const $user = atom<User | null>(storedUser ? JSON.parse(storedUser) : null);

export function login(user: User) {
    if (typeof window !== 'undefined') {
        localStorage.setItem("user_data", JSON.stringify(user));
    }
    $user.set(user);
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem("user_data");
        // Borramos la cookie de autenticación
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    $user.set(null);
    window.location.href = "/";
}