import { useState } from 'preact/hooks';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        nombre: '', apellidos: '', genero: '', direccion: '',
        telefono: '', correo: '', confirmCorreo: '',
        password: '', confirmPassword: '', consentimiento: false
    });

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        console.log("Datos enviados:", formData);
        // Lógica de conexión al backend
        window.location.href = "/client/profile";
    };

    const inputClass = "w-full bg-[#d0d0d1] border-none rounded-3xl py-3 px-6 placeholder-gray-600 focus:ring-2 focus:ring-teal-500 outline-none text-gray-800 font-medium";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">

            <h2 className="text-3xl font-light text-gray-800 text-center mb-4 uppercase tracking-wide">Registrarse</h2>

            <div className="grid grid-cols-1 gap-3">
                <input type="text" placeholder="Nombre" className={inputClass}
                    onInput={(e) => setFormData({ ...formData, nombre: (e.target as HTMLInputElement).value })} />

                <input type="text" placeholder="Apellidos" className={inputClass}
                    onInput={(e) => setFormData({ ...formData, apellidos: (e.target as HTMLInputElement).value })} />

                <input type="text" placeholder="Sexo/Genero" className={inputClass} />

                <input type="text" placeholder="Direccion" className={inputClass} />

                
                <div className="grid grid-cols-1 gap-3 pt-3">
                    <input type="tel" placeholder="Teléfono" className={inputClass} />
                    <input type="email" placeholder="Correo" className={inputClass} />
                    <input type="email" placeholder="Confirmar Correo" className={inputClass} />
                </div>

                
                <div className="grid grid-cols-1 gap-3 pt-3">
                    <input type="password" placeholder="Contraseña" className={inputClass} />
                    <input type="password" placeholder="Confirmar Contraseña" className={inputClass} />
                </div>
            </div>

            
            <div className="flex items-center gap-4 mt-3">
                <div class="relative flex items-center">
                    <input type="checkbox" id="consent" className="w-8 h-8 rounded-xl bg-[#d0d0d1] border-none text-teal-600 focus:ring-teal-500 cursor-pointer appearance-none checked:bg-teal-500" />
                    <svg class="w-6 h-6 absolute left-1 pointer-events-none text-white opacity-0 checked-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <label htmlFor="consent" className="text-gray-900 font-medium cursor-pointer">Consentimiento</label>
            </div>

            
            <div class="w-full flex justify-center mt-5">
                <button type="submit" className="bg-[#2eb0b0] hover:bg-[#258f8f] text-white font-bold py-3 px-16 rounded-xl transition-all shadow-md">
                    Confirmar
                </button>
            </div>

        </form>
    );
}