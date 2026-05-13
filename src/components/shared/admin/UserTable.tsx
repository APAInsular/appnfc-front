// src/components/shared/admin/UserTable.tsx
import { useState, useEffect } from 'preact/hooks';


export default function UserTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // Estados para el Modal de Edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        surnames: '',
        email: '',
        role: ''
    });

    // --- CARGA DE DATOS ---
    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/account/');
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            const json = await res.json();

            if (json.transformerData && Array.isArray(json.transformerData[0])) {
                setUsers(json.transformerData[0]);
            } else {
                setUsers([]);
                setErrorMsg("No se encontraron registros.");
            }
        } catch (err) {
            setErrorMsg("Error al cargar datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllUsers(); }, []);

    // --- LÓGICA DE EDICIÓN ---
    const openEditModal = (user: any) => {
        setCurrentUser(user);
        setFormData({
            firstName: user.firstName || '',
            surnames: user.surnames || '',
            email: user.email || '',
            role: user.role || 'Patient'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!currentUser) return;
        const uuid = currentUser.uid;
        // El resourceType para el proxy suele ser Patient o Practitioner
        const type = currentUser.role === 'Practitioner' ? 'Practitioner' : 'Patient';

        try {
            const response = await fetch(`/api/proxy/profiles/${type}/${uuid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    id: uuid // Medplum suele requerir el ID en el body también
                })
            });

            if (response.ok) {
                alert("Usuario actualizado correctamente");
                setIsEditModalOpen(false);
                fetchAllUsers(); // Recarga la lista
            } else {
                alert("Error al actualizar");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // --- LÓGICA DE ELIMINACIÓN ---
    const handleDelete = async (user: any) => {
        if (!confirm(`¿Estás seguro de eliminar a ${user.firstName}?`)) return;
        
        const type = user.role === 'Practitioner' ? 'Practitioner' : 'Patient';
        try {
            const response = await fetch(`/api/proxy/profiles/${type}/${user.uid}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Eliminado con éxito");
                setUsers(prev => prev.filter(u => u.uid !== user.uid));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="flex-1 bg-white shadow-lg flex flex-col overflow-hidden min-h-[400px]">
            <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h1>
                <div className="flex gap-4">
                    <button onClick={fetchAllUsers} className="text-sm text-blue-600 hover:underline">🔄 Refrescar</button>
                </div>
            </div>

            {/* Cabecera Tabla */}
            <div className="bg-gray-100 px-6 py-3 grid grid-cols-12 gap-x-6 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b">
                <div className="col-span-4">UUID / IDENTIFICADOR</div>
                <div className="col-span-2">ROL</div>
                <div className="col-span-4">NOMBRE COMPLETO</div>
                <div className="col-span-2 text-right">ACCIONES</div>
            </div>

            <div className="flex-grow overflow-auto p-2 space-y-2 bg-gray-50/30">
                {loading ? (
                    <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                ) : (
                    users.map((user) => (
                        <div key={user.uid} className="bg-white border border-gray-100 grid grid-cols-12 gap-x-6 items-center py-3 px-6 rounded-xl hover:shadow-sm transition-all">
                            <div className="col-span-4 flex items-center gap-2">
                                <span className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded border border-gray-200 text-gray-600 truncate max-w-[180px]">
                                    {user.uid}
                                </span>
                                <button onClick={() => { navigator.clipboard.writeText(user.uid); alert("Copiado"); }} className="p-1 hover:bg-gray-100 rounded">📋</button>
                            </div>
                            <div className="col-span-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${user.role === 'Practitioner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {(user.role || 'USER').toUpperCase()}
                                </span>
                            </div>
                            <div className="col-span-4 text-sm font-medium text-gray-700">
                                {`${user.firstName || ''} ${user.surnames || ''}`}
                            </div>
                            <div className="col-span-2 flex justify-end gap-2">
                                <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">✏️</button>
                                <button onClick={() => handleDelete(user)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Edición */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 px-8 py-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Editar Perfil</h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <input type="text" placeholder="Nombre" className="w-full border rounded-xl py-2 px-4" value={formData.firstName} onInput={(e) => setFormData({ ...formData, firstName: e.currentTarget.value })} />
                            <input type="text" placeholder="Apellidos" className="w-full border rounded-xl py-2 px-4" value={formData.surnames} onInput={(e) => setFormData({ ...formData, surnames: e.currentTarget.value })} />
                            <input type="email" placeholder="Email" className="w-full border rounded-xl py-2 px-4" value={formData.email} onInput={(e) => setFormData({ ...formData, email: e.currentTarget.value })} />
                        </div>
                        <div className="bg-gray-50 px-8 py-4 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-gray-500">Cancelar</button>
                            <button onClick={handleUpdate} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}