// src/components/forms/LoginForm.tsx
import { useState } from 'preact/hooks';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Por favor, completa ambos campos.");
      return;
    }

    try {
      const response = await fetch("https://www.limpora.xyz/apinfc/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const response_json = await response.json();
      console.log("Respuesta backend:", response_json);

      // 🔐 Token
      const token = response_json?.data.token;
      localStorage.setItem("token", token);

      // 👤 Usuario
      console.log(response_json);
      
      const user = response_json?.data.user;

      if (!user) {
        throw new Error("El backend no devolvió el usuario");
      }

      const role = user.role;

      // 🚀 Redirección por rol
      switch (role) {
        case "Admin":
          window.location.href = "/admin/metrics";
          break;

        case "Patient":
          window.location.href = "/client/profile";
          break;

        case "Practitioner":
          window.location.href = "/practitioner/dashboard";
          break;

        // default:
        //   console.warn("Rol desconocido:", role);
        //   window.location.href = "/";
      }

    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    }
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