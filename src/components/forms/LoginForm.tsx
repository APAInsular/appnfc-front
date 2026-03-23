// src/components/forms/LoginForm.tsx
import { useState } from 'preact/hooks';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log("Iniciando sesión con:", username, password);
    // lógica de conexión al backend
    window.location.href = "/client/profile";
  };


  const inputClass = "w-full bg-[#d0d0d1] border-none rounded-3xl py-3.5 px-6 placeholder-gray-600 focus:ring-2 focus:ring-teal-500 outline-none text-gray-800 font-medium";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            
            {/*Usuario */}
            <input
                type="text"
                placeholder="Usuario"
                value={username}
                onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
                className={inputClass}
            />

            {/* Contraseña */}
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                className={inputClass}
            />

            {/* Botón */}
            <div class="w-full flex justify-center mt-4">
                <button type="submit" className="bg-[#2eb0b0] hover:bg-[#258f8f] text-white font-bold py-3.5 px-20 rounded-xl transition-all shadow-md">
                    Confirmar
                </button>
            </div>
        </form>

        {/* Enlace a Registro */}
        <a href="/client/register" className="text-center text-[#2eb0b0] font-medium hover:underline text-xl pt-2">
            ¿No tienes sesión?, Registrarse
        </a>
    </div>
  );
}