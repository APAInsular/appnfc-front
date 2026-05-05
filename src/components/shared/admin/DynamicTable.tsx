// src/components/shared/admin/DynamicTable.tsx
import { useState, useEffect, useCallback } from 'preact/hooks';
import CreateBraceletModal from '../../modals/CreateBraceletModal';

interface Props {
    endpoint: string;
    pageTitle: string;
}

export default function DynamicTable({ endpoint, pageTitle }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // useCallback permite que esta función sea estable y pueda ser llamada 
    // desde el componente hijo (modal) para refrescar la tabla.
    const fetchData = useCallback(async () => {
        try {
            // Limpiamos el endpoint: si empieza por "/", le quitamos la barra
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

            const response = await fetch(`/api/${cleanEndpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar datos');

            const json = await response.json();
            // Asumimos que viene como array o dentro de un objeto .data
            setData(Array.isArray(json) ? json : (json.data || []));
        } catch (err) {
            console.error("Error en DynamicTable:", err);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const cellInputClass = "w-full bg-white border border-gray-300 rounded-md px-2 py-2 text-sm text-gray-700 outline-none";

    return (
        <div className="flex-1 bg-white shadow-lg flex flex-col overflow-hidden m-4 rounded-lg">
            
            {/* Encabezado con buscador y botón de crear */}
            <div className="bg-[#f0f0f0] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
                <h1 className="text-xl font-medium text-gray-800">{pageTitle}</h1>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Buscar por serial..." 
                        value={searchTerm}
                        onInput={(e) => setSearchTerm(e.currentTarget.value)}
                        className="bg-white border border-gray-300 rounded px-3 py-1 text-sm outline-none" 
                    />
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#2eb0b0] text-white px-4 py-2 rounded-lg hover:bg-[#269393] transition-colors font-medium text-sm"
                    >
                        + Crear Pulsera
                    </button>
                </div>
            </div>

            {/* Cabecera de la tabla */}
            <div className="bg-gray-100 px-4 py-3 grid grid-cols-12 gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="col-span-1">Nº</div>
                <div className="col-span-2">Serial</div>
                <div className="col-span-1">Estado</div>
                <div className="col-span-3">Asignado a</div>
                <div className="col-span-2">Modelo</div>
                <div className="col-span-3 text-right">Acciones</div>
            </div>

            {/* Filas */}
            <div className="flex-grow overflow-auto p-2 space-y-2">
                {data.filter(i => i.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())).map((item, index) => (
                    <div key={item.uid} className="bg-white border border-gray-100 shadow-sm grid grid-cols-12 gap-2 items-center py-2 px-4 rounded">
                        <div className="col-span-1 text-gray-500 text-sm">{index + 1}</div>
                        <div className="col-span-2">
                            <input readOnly className={cellInputClass} value={item.serialNumber} />
                        </div>
                        <div className="col-span-1">
                            <input readOnly className={cellInputClass} value={item.state} />
                        </div>
                        <div className="col-span-3">
                            <input 
                                readOnly 
                                className={cellInputClass} 
                                value={item.user ? `${item.user.first_name} ${item.user.surnames}` : "Sin asignar"} 
                            />
                        </div>
                        <div className="col-span-2">
                            <input readOnly className={cellInputClass} value={item.model} />
                        </div>
                        <div className="col-span-3 flex justify-end gap-2">
                            <button className="p-2 border rounded hover:bg-gray-50 text-gray-600">✏️</button>
                            <button className="p-2 border rounded hover:bg-gray-50 text-gray-600">📖</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de creación */}
            <CreateBraceletModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onCreated={() => {
                    fetchData(); // Refresca automáticamente la tabla al guardar
                }}
            />
        </div>
    );
}