// src/components/modals/RegisterUserModal.tsx
import { useState } from 'preact/hooks';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function RegisterUserModal({ isOpen, onClose, onSuccess }: Props) {
    // Estados para el formulario (según validación del backend)
    const [firstName, setFirstName] = useState('');
    const [surnames, setSurnames] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('Patient'); // Ahora como String

    // Estados de UI
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const inputClass = "bg-[#bcbcbc] border-none rounded-2xl py-3.5 px-6 w-full text-gray-900 placeholder-gray-500 outline-none shadow-inner text-lg transition-all focus:ring-2 focus:ring-[#2eb0b0]";

    const handleModalClick = (e: Event) => e.stopPropagation();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (password.length < 8) {
            alert("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== passwordConfirmation) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        // Dentro de handleSubmit en RegisterUserModal.tsx
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, surnames, email, role, password, passwordConfirmation }),
            });

            // 1. Verificamos si la respuesta es exitosa ANTES de intentar leer el JSON
            if (response.ok || response.status === 201 || response.status === 200) {
                // Intentamos leer el JSON, si falla (porque viene vacío), usamos un objeto vacío
                const data = await response.json().catch(() => ({}));
                console.log("Respuesta del servidor:", data);

                alert("¡Usuario creado con éxito!");
                if (onSuccess) onSuccess();
                onClose();
                return; // Salimos para que no ejecute el código de abajo
            }

            // 2. Si no es exitosa, intentamos ver el error
            const errorData = await response.json().catch(() => ({}));
            const msg = errorData.errors?.[0]?.message || errorData.message || "Error desconocido";
            alert(`Error: ${msg}`);

        } catch (err) {
            // Solo entrará aquí si hay un error de RED real o un error de sintaxis en el código
            console.error("Error capturado:", err);
            alert("El servidor procesó la solicitud pero la respuesta no fue legible.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl p-8 md:p-12 w-full max-w-lg shadow-2xl relative z-60 flex flex-col items-center overflow-y-auto max-h-[95vh]"
                onClick={handleModalClick}
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>

                <img src="/img/Logo_Qvida.png" alt="Logo Q-Vida" className="w-32 mb-4" />

                <h2 className="text-2xl font-medium text-gray-800 tracking-tight uppercase mb-6 text-center">
                    Registrar nuevo perfil
                </h2>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="Nombre" className={inputClass}
                            value={firstName} onInput={(e) => setFirstName((e.target as HTMLInputElement).value)}
                            required
                        />
                        <input
                            type="text" placeholder="Apellidos" className={inputClass}
                            value={surnames} onInput={(e) => setSurnames((e.target as HTMLInputElement).value)}
                            required
                        />
                    </div>

                    <input
                        type="email" placeholder="Correo electrónico" className={inputClass}
                        value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                        required
                    />

                    {/* Campo Contraseña con opción de ver */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña (mín. 8 caracteres)"
                            className={inputClass}
                            value={password} onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirmar Contraseña"
                        className={inputClass}
                        value={passwordConfirmation} onInput={(e) => setPasswordConfirmation((e.target as HTMLInputElement).value)}
                        required
                    />

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 ml-4 uppercase">Seleccionar Rol</label>
                        <select
                            className={`${inputClass} appearance-none cursor-pointer`}
                            value={role}
                            onChange={(e) => setRole((e.target as HTMLSelectElement).value)}
                        >
                            <option value="Patient">Paciente</option>
                            <option value="Practitioner">Profesional (Practitioner)</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#2eb0b0] text-white font-bold py-4 rounded-2xl shadow-md transition-all text-lg flex justify-center items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#269393] hover:shadow-lg active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin text-xl">⏳</span>
                                    Registrando...
                                </>
                            ) : 'Confirmar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}