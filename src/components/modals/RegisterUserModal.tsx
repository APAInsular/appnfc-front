// src/components/modals/RegisterUserModal.tsx
import { useState } from 'preact/hooks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterUserModal({ isOpen, onClose }: Props) {
  // --- ESTADOS PARA LOS CAMPOS DEL FORMULARIO ---
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [rol, setRol] = useState('');

  // Estilos basados en tu diseño
  const inputClass = "bg-[#bcbcbc] border-none rounded-2xl py-3.5 px-6 w-full text-gray-900 placeholder-gray-500 outline-none shadow-inner text-lg";
  const labelBox = "bg-[#eeeeee] rounded-lg py-2.5 px-5 text-center text-sm font-semibold mb-3 shadow-sm text-gray-700 uppercase";

  // Evita que el modal se cierre al hacer clic dentro
  const handleModalClick = (e: Event) => {
    e.stopPropagation();
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (contrasena !== confirmarContrasena) {
        alert("Las contraseñas no coinciden");
        return;
    }
    console.log("Creando usuario:", { usuario, contrasena, rol });
    // Aquí iría la lógica de creación de usuario real
    onClose(); // Cierra el modal tras el envío
  };

  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  return (
    // ✅ OVERLAY OSCURO CON POLÍGONOS GRANDES "SANGRE TOTAL"
    <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm"
        onClick={onClose} // Cierra el modal si se hace clic en el overlay
    >
        
        {/* Fondo de Polígonos SVG grandes */}
        <div className="absolute inset-0 -z-10 w-full h-full">
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full opacity-60"
            >
                <polygon points="0,0 80,0 30,100 0,100" fill="#f5f5f6" />
                <polygon points="0,15 65,0 20,100 0,85" fill="#eeeeef" />
            </svg>
        </div>

        {/* ✅ CONTENEDOR DEL MODAL */}
        <div 
            className="bg-white rounded-3xl p-12 w-full max-w-lg shadow-2xl relative z-60 flex flex-col items-center gap-6"
            onClick={handleModalClick}
        >
            
            {/* Botón de Cerrar (X) */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-2xl"
            >
                &times;
            </button>

            {/* Logo Q-Vida */}
            <img src="/img/Logo_Qvida.png" alt="Logo Q-Vida" className="w-48 mb-6" />

            {/* Título: "Registrar usuario" */}
            <h2 className="text-3xl font-medium text-gray-800 tracking-tight uppercase mb-4">
                Registrar usuario
            </h2>

            {/* ✅ FORMULARIO CON CAMPOS GRISES */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                
                {/* Usuario */}
                <div className="relative">
                    <input 
                        type="text" placeholder="Usuario" className={inputClass}
                        value={usuario} onInput={(e) => setUsuario((e.target as HTMLInputElement).value)}
                        required
                    />
                </div>

                {/* Contraseña */}
                <div className="relative">
                    <input 
                        type="password" placeholder="Contraseña" className={inputClass}
                        value={contrasena} onInput={(e) => setContrasena((e.target as HTMLInputElement).value)}
                        required
                    />
                </div>

                {/* Confirmar Contraseña */}
                <div className="relative">
                    <input 
                        type="password" placeholder="Confirmar Contraseña" className={inputClass}
                        value={confirmarContrasena} onInput={(e) => setConfirmarContrasena((e.target as HTMLInputElement).value)}
                        required
                    />
                </div>

                {/* Rol */}
                <div className="relative">
                    <input 
                        type="text" placeholder="Rol" className={inputClass}
                        value={rol} onInput={(e) => setRol((e.target as HTMLInputElement).value)}
                        required
                    />
                </div>

                {/* ✅ BOTÓN TURQUESA "CONFIRMAR" CON SOMBRA */}
                <div className="pt-6">
                    <button 
                        type="submit"
                        className="w-full bg-[#2eb0b0] text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-[#269393] transition-all text-lg"
                    >
                        Confirmar
                    </button>
                </div>

            </form>

        </div>
    </div>
  );
}