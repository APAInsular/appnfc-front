// src/components/forms/LoginForm.tsx
import { useState } from 'preact/hooks';

interface Props {
  isAdmin?: boolean;
}

export default function LoginForm({ isAdmin = false }: Props) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
 
    console.log("Formulario enviado:", { user, password, isAdmin });

    if (user && password) {

      const targetPath = isAdmin ? "/admin/metrics" : "/client/profile";
      console.log("Redirigiendo a:", targetPath);
      window.location.href = targetPath;
    } else {
      alert("Por favor, completa ambos campos.");
    }
  };

  const inputClass = "bg-[#d0d0d1] border-none rounded-2xl py-3 px-4 w-full text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-center";

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-8 relative z-10">
      <img src="/img/Logo_Qvida.png" alt="Logo" className="w-64 mb-12" />

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input 
          type="text" 
          placeholder="Usuario" 
          className={inputClass}
          value={user}
          required
          onInput={(e) => setUser((e.currentTarget as HTMLInputElement).value)}
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

      {!isAdmin && (
        <a href="/client/register" className="mt-6 text-[#2eb0b0] hover:underline">
          ¿No tienes sesión?, Registrarse
        </a>
      )}
    </div>
  );
}