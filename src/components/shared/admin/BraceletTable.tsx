// src/components/shared/admin/BraceletTable.tsx
import { useState, useEffect, useCallback } from 'preact/hooks';
import CreateBraceletModal from '../../modals/CreateBraceletModal';
import ViewBraceletModal from '../../modals/ViewBraceletModal';
import AssignBraceletModal from '../../modals/AssignBraceletModal'; // Asegúrate de crear este archivo

export default function BraceletTable({ pageTitle }: { pageTitle: string }) {
    const [data, setData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para Modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Selección de items
    const [selectedUid, setSelectedUid] = useState<string | null>(null);
    const [selectedBracelet, setSelectedBracelet] = useState<any>(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`/api/bracelet?t=${Date.now()}`);
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
                setData(prev => prev.map(item => item.uid === uid ? { ...item, state: 'banned' } : item));
            }
        } catch (err) { console.error(err); }
    };

    const openAssignModal = (bracelet: any) => {
        setSelectedBracelet(bracelet);
        setIsAssignModalOpen(true);
    };

    const getStateStyles = (state: string) => {
        const baseClass = "w-full border rounded-xl py-2 px-2 text-[10px] font-bold text-center block shadow-sm uppercase tracking-wider";
        switch (state?.toLowerCase()) {
            case 'assigned': return `${baseClass} bg-green-50 border-green-200 text-green-700`;
            case 'banned': return `${baseClass} bg-red-50 border-red-200 text-red-700`;
            default: return `${baseClass} bg-gray-50 border-gray-200 text-gray-600`;
        }
    };

    const inputStyle = "w-full bg-white border border-gray-200 rounded-xl py-2 px-4 text-sm text-gray-700 outline-none shadow-sm read-only:bg-gray-50 cursor-default";

    return (
        <div className="flex-1 bg-white shadow-lg flex flex-col overflow-hidden  border border-gray-200">
            {/* CABECERA */}
            <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
                    <p className="text-xs text-gray-500">Gestión de dispositivos y vinculación</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar serial..." 
                            value={searchTerm} 
                            onInput={(e) => setSearchTerm(e.currentTarget.value)} 
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2eb0b0]/20 focus:border-[#2eb0b0] transition-all w-64" 
                        />
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="bg-[#2eb0b0] text-white px-5 py-2 rounded-xl hover:bg-[#269393] font-bold text-sm shadow-md shadow-teal-100 transition-all active:scale-95"
                    >
                        + Nueva Pulsera
                    </button>
                </div>
            </div>

            {/* ENCABEZADOS DE TABLA */}
            <div className="bg-gray-50/50 px-6 py-3 grid grid-cols-12 gap-x-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <div className="col-span-1">Nº</div>
                <div className="col-span-2">Serial / ID</div>
                <div className="col-span-2 text-center">Estado</div>
                <div className="col-span-3">Usuario Asignado</div>
                <div className="col-span-2">Modelo</div>
                <div className="col-span-2 text-right">Acciones</div>
            </div>

            {/* LISTADO */}
            <div className="flex-grow overflow-auto p-4 space-y-3 bg-gray-50/30">
                {data.filter(i => i.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())).map((item, index) => (
                    <div key={item.uid} className="bg-white border border-gray-100 grid grid-cols-12 gap-x-6 items-center py-4 px-6 rounded-2xl hover:shadow-md hover:border-teal-100 transition-all group">
                        <div className="col-span-1 text-gray-400 font-mono text-xs">#{index + 1}</div>
                        <div className="col-span-2 font-medium text-gray-700">{item.serialNumber}</div>
                        <div className="col-span-2 text-center">
                            <span className={getStateStyles(item.state)}>{item.state || 'UNSET'}</span>
                        </div>
                        <div className="col-span-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.user ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                <span className="text-sm text-gray-600 truncate">
                                    {item.user ? `${item.user.first_name} ${item.user.last_name || ''}` : "Disponible"}
                                </span>
                            </div>
                        </div>
                        <div className="col-span-2 text-sm text-gray-500 italic">{item.model}</div>
                        
                        <div className="col-span-2 flex justify-end gap-3">
                            {/* Banear */}
                            <button 
                                onClick={() => handleBan(item.uid)}
                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                title="Banear dispositivo"
                            >
                                🚫
                            </button>
                            {/* Asignar Usuario */}
                            <button 
                                onClick={() => openAssignModal(item)}
                                className={`p-2 rounded-lg transition-colors ${item.state === 'assigned' ? 'opacity-20 cursor-not-allowed' : 'hover:bg-teal-50 text-gray-400 hover:text-[#2eb0b0]'}`}
                                title="Asignar a usuario"
                                disabled={item.state === 'assigned'}
                            >
                                👤
                            </button>
                            {/* Ver/Editar */}
                            <button 
                                onClick={() => { setSelectedUid(item.uid); setIsViewModalOpen(true); }}
                                className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                                title="Detalles"
                            >
                                ✏️
                            </button>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="text-4xl mb-4">⌚</span>
                        <p className="font-medium">No hay pulseras registradas</p>
                    </div>
                )}
            </div>

            {/* MODALES */}
            <CreateBraceletModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreated={fetchData} 
            />
            
            <ViewBraceletModal 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)} 
                uid={selectedUid} 
            />

            <AssignBraceletModal 
                isOpen={isAssignModalOpen} 
                onClose={() => setIsAssignModalOpen(false)} 
                bracelet={selectedBracelet}
                onAssigned={fetchData}
            />
        </div>
    );
}