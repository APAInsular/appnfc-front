// src/components/modals/CreateBraceletModal.tsx
import { useState, useEffect } from 'preact/hooks';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateBraceletModal({ isOpen, onClose, onCreated }: any) {
    const [quantity, setQuantity] = useState(1);
    const [model, setModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const inputClass = "bg-[#bcbcbc] border-none rounded-2xl py-3.5 px-6 w-full text-gray-900 placeholder-gray-500 outline-none shadow-inner text-lg appearance-none";

    // 1. Cargar los modelos cuando el modal se abra
    // Dentro de CreateBraceletModal.tsx, busca el useEffect de fetchModels:

    useEffect(() => {
        if (isOpen) {
            const fetchModels = async () => {
                try {
                    const response = await fetch('/api/bracelet/models/');
                    const data = await response.json();

                    if (response.ok) {
                        const modelsArray = Array.isArray(data) ? data : (data.models || []);
                        setAvailableModels(modelsArray);

                        if (modelsArray.length > 0) {
                            setModel(modelsArray[0]);
                        }
                    } else {
                        console.error("Error del backend:", data.message);
                    }
                } catch (err) {
                    console.error("Error de conexión:", err);
                }
            };
            fetchModels();
        }
    }, [isOpen]);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/bracelet/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity,
                    model,
                    serial_number: serialNumber
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al crear");
            }

            // Limpiamos campos antes de cerrar
            setSerialNumber('');
            onCreated();
            onClose();
        } catch (err) {
            alert(`Error: ${err}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 text-3xl">&times;</button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">CREAR PULSERAS</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Cantidad */}
                    <div className="flex gap-4 items-center">
                        <input
                            type="range" min="1" max="200" value={quantity}
                            onInput={(e) => setQuantity(Number((e.target as HTMLInputElement).value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2eb0b0]"
                        />
                        <input
                            type="number" value={quantity}
                            onInput={(e) => setQuantity(Number((e.target as HTMLInputElement).value))}
                            className="w-20 bg-[#bcbcbc] rounded-xl py-2 px-3 text-center font-bold"
                        />
                    </div>

                    {/* SELECT DE MODELOS (Cambiado de input a select) */}
                    <div className="relative">
                        <select
                            className={inputClass}
                            value={model}
                            onChange={(e) => setModel((e.target as HTMLSelectElement).value)}
                            required
                        >
                            <option value="" disabled>Selecciona un modelo</option>
                            {availableModels.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        {/* Icono de flechita para el select */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-gray-600">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Nº Serie"
                        className={inputClass}
                        value={serialNumber}
                        onInput={(e) => setSerialNumber((e.target as HTMLInputElement).value)}
                        required
                    />

                    <div className="pt-4 flex justify-center">
                        <button type="submit" className="bg-[#2eb0b0] text-white font-bold py-3 px-12 rounded-2xl shadow-md hover:bg-[#269393] transition-all">
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}