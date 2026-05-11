// src/components/shared/admin/BraceletTable.tsx
import { useState, useEffect, useCallback } from 'preact/hooks';
import CreateBraceletModal from '../../modals/CreateBraceletModal';
import ViewBraceletModal from '../../modals/ViewBraceletModal';

export default function BraceletTable({ pageTitle }: { pageTitle: string }) {
    const [data, setData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUid, setSelectedUid] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`/api/bracelet?t=${Date.now()}`); // Usamos tu ruta base
            if (!response.ok) throw new Error('Error al cargar pulseras');
            const json = await response.json();
            setData(Array.isArray(json) ? json : (json.data || []));
        } catch (err) {
            console.error("Error en BraceletTable:", err);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleBan = async (uid: string) => {
        if (!confirm("¿Deseas BANEAR esta pulsera?")) return;
        try {
            const response = await fetch(`/api/bracelet/ban/${uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (response.ok) {
                // Actualización instantánea en la UI
                setData(prev => prev.map(item => item.uid === uid ? { ...item, state: 'banned' } : item));
            }
        } catch (err) { console.error(err); }
    };

    const getStateStyles = (state: string) => {
        const baseClass = "w-full border rounded-xl py-2 px-2 text-xs font-bold text-center block shadow-sm";
        switch (state?.toLowerCase()) {
            case 'assigned': return `${baseClass} bg-green-100 border-green-500 text-green-700`;
            case 'banned': return `${baseClass} bg-red-100 border-red-500 text-red-700`;
            default: return `${baseClass} bg-gray-100 border-gray-400 text-gray-600`;
        }
    };

    const inputStyle = "w-full bg-white border border-gray-300 rounded-xl py-2 px-4 text-sm text-gray-700 outline-none shadow-sm";

    return (
        <div className="flex-1 bg-white shadow-lg flex flex-col overflow-hidden">
            <div className="bg-[#f0f0f0] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
                <h1 className="text-xl font-medium text-gray-800">{pageTitle}</h1>
                <div className="flex gap-4">
                    <input type="text" placeholder="Buscar serial..." value={searchTerm} onInput={(e) => setSearchTerm(e.currentTarget.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm outline-none" />
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#2eb0b0] text-white px-4 py-2 rounded-lg hover:bg-[#269393] font-medium text-sm">+ Crear Pulsera</button>
                </div>
            </div>

            <div className="bg-gray-100 px-4 py-3 grid grid-cols-12 gap-x-6 text-xs font-bold text-gray-600 uppercase">
                <div className="col-span-1">Nº</div>
                <div className="col-span-2">Serial</div>
                <div className="col-span-2 text-center">Estado</div>
                <div className="col-span-3">Asignado a</div>
                <div className="col-span-2">Modelo</div>
                <div className="col-span-2 text-right">Acciones</div>
            </div>

            <div className="flex-grow overflow-auto p-2 space-y-2">
                {data.filter(i => i.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())).map((item, index) => (
                    <div key={item.uid} className="bg-white border border-gray-100 grid grid-cols-12 gap-x-6 items-center py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="col-span-1 text-gray-400 text-xs">{index + 1}</div>
                        <div className="col-span-2"><input readOnly className={inputStyle} value={item.serialNumber} /></div>
                        <div className="col-span-2 text-center"><span className={getStateStyles(item.state)}>{item.state?.toUpperCase()}</span></div>
                        <div className="col-span-3"><input readOnly className={inputStyle} value={item.user ? `${item.user.first_name}` : "Sin asignar"} /></div>
                        <div className="col-span-2"><input readOnly className={inputStyle} value={item.model} /></div>
                        <div className="col-span-2 flex justify-end gap-2 text-lg">
                            <button onClick={() => handleBan(item.uid)}>🚫</button>
                            <button>👤</button>
                            <button onClick={() => { setSelectedUid(item.uid); setIsViewModalOpen(true); }}>✏️</button>
                        </div>
                    </div>
                ))}
            </div>

            <CreateBraceletModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreated={fetchData} />
            <ViewBraceletModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} uid={selectedUid} />
        </div>
    );
}