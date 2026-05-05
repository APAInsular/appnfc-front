// src/components/modals/CreateBraceletModal.tsx
import { useState } from 'preact/hooks';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateBraceletModal({ isOpen, onClose, onCreated }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [model, setModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');

    const inputClass = "bg-[#bcbcbc] border-none rounded-2xl py-3.5 px-6 w-full text-gray-900 placeholder-gray-500 outline-none shadow-inner text-lg";

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/bracelet/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quantity,
                    model,
                    serial_number: serialNumber // 👈 PRUEBA CAMBIAR ESTO
                })
            });

            // 🔥 AQUÍ ESTÁ EL TRUCO: leemos el JSON de error
            const data = await response.json();

            if (!response.ok) {
                console.error("Detalle del error del servidor:", data);
                throw new Error(`Error: ${JSON.stringify(data.errors || data.message)}`);
            }

            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
            alert(`Error al guardar: ${err}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 text-3xl">&times;</button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">CREAR PULSERAS</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* SLIDER Y INPUT CON onInput PARA TIEMPO REAL */}
                    <div className="flex gap-4 items-center">
                        <input
                            type="range" min="1" max="200" value={quantity}
                            // Usamos onInput para que el cambio sea instantáneo
                            onInput={(e) => setQuantity(Number((e.target as HTMLInputElement).value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2eb0b0]"
                        />
                        <input
                            type="number" value={quantity}
                            // Usamos onInput aquí también para que se sincronicen
                            onInput={(e) => setQuantity(Number((e.target as HTMLInputElement).value))}
                            className="w-20 bg-[#bcbcbc] rounded-xl py-2 px-3 text-center font-bold"
                        />
                    </div>

                    <input type="text" placeholder="Modelo" className={inputClass} value={model} onInput={(e) => setModel((e.target as HTMLInputElement).value)} required />
                    <input type="text" placeholder="Nº Serie" className={inputClass} value={serialNumber} onInput={(e) => setSerialNumber((e.target as HTMLInputElement).value)} required />

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