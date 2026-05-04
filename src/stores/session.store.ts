import { atom } from "nanostores";
import type User from "../services/dtos/User";

export const $user = atom<User | null>(null);

export function login(user: User) {
    $user.set(user);
}

export function logout() {
    $user.set(null);
}