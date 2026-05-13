import { useState } from "preact/hooks";
import { login } from "../../stores/session.store";

const ROLE_ROUTES: Record<string, string> = {
    Admin: "/admin/metrics",
    Patient: "/client/profile",
    Practitioner: "/practitioner/dashboard",
};

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            alert("Credenciales incorrectas");
            return;
        }

        const user = await res.json();
        

        // --- LA SOLUCIÓN ESTÁ AQUÍ ---
        // 1. Guardamos el token explícitamente para que ProfileForm lo encuentre
        // if (user.token) {
        //     localStorage.setItem("token", user.token);
        //     console.log("Token guardado correctamente en LocalStorage");
        // } else {
        //     console.error("El backend no ha enviado un campo 'token' en el JSON");
        // }

        // 2. Ejecutamos tu lógica actual del store
        login(user);

        // 3. Redirigimos
        const route = ROLE_ROUTES[user.role];
        if (route) window.location.href = route;
    };

    const inputClass = "bg-[#d0d0d1] border-none rounded-2xl py-3 px-4 w-full text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-center";

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-8 relative z-10">
            <img src="/img/Logo_Qvida.png" alt="Logo" className="w-64 mb-12" />

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    className={inputClass}
                    value={email}
                    required
                    onInput={(e) => setEmail((e.currentTarget as HTMLInputElement).value)}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    className={inputClass}
                    value={password}
                    required
                    onInput={(e) => setPassword((e.currentTarget as HTMLInputElement).value)}
                />
                <button
                    type="submit"
                    className="w-full bg-[#2eb0b0] text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-[#269393] transition-all mt-4 active:scale-95"
                >
                    Confirmar
                </button>
            </form>
        </div>
    );
}