// src/components/modals/AssignBraceletModal.tsx
import { useState } from 'preact/hooks';

export default function AssignBraceletModal({ isOpen, onClose, bracelet, onAssigned }: any) {
    const [userUid, setUserUid] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAssign = async () => {
        if (!userUid.trim()) return alert("Por favor, pega el ID del usuario");

        setLoading(true);
        try {
            console.log("DATOS ENVIADOS:", {
                user_uuid: userUid.trim(),
                bracelet_uuid: bracelet.uid
            });
            const response = await fetch('/api/bracelet/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // CAMBIA ESTO PARA QUE COINCIDA CON EL ERROR 422:
                    user_uuid: userUid.trim(),
                    bracelet_uuid: bracelet.uid
                })
            });

            if (response.ok) {
                alert("✅ Pulsera vinculada con éxito");
                onAssigned();
                onClose();
            } else {
                const err = await response.json();
                // Esto te mostrará el mensaje exacto si vuelve a fallar
                alert(`❌ Error: ${err.errors?.[0]?.message || 'Error al asignar'}`);
            }
        } catch (error) {
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
                <div className="bg-[#2eb0b0] p-6 text-white text-center">
                    <span className="text-4xl mb-2 block">🔗</span>
                    <h3 className="text-xl font-bold">Vincular Dispositivo</h3>
                    <p className="text-teal-100 text-xs mt-1">Serial: {bracelet?.serialNumber}</p>
                </div>

                <div className="p-8">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                        ID del Usuario (UUID)
                    </label>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Pega el ID aquí..."
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-4 text-sm outline-none focus:border-[#2eb0b0] focus:bg-white transition-all font-mono"
                        value={userUid}
                        onInput={(e) => setUserUid(e.currentTarget.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-4 leading-relaxed italic">
                        * Ve a la pestaña de Usuarios, copia el ID del paciente y pégalo en este campo para completar la asignación.
                    </p>
                </div>

                <div className="px-8 pb-8 flex flex-col gap-2">
                    <button
                        onClick={handleAssign}
                        disabled={loading}
                        className="w-full py-3 text-sm font-bold text-white bg-[#2eb0b0] hover:bg-[#269393] rounded-2xl shadow-lg shadow-teal-100 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Procesando..." : "Vincular ahora"}
                    </button>
                    <button onClick={onClose} className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}