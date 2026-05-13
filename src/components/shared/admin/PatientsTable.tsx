// src/components/shared/admin/PatientsTable.tsx
import { useState, useEffect } from 'preact/hooks';

export default function PatientsTable() {
    // Estados principales
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Estados para el Modal de Edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    // --- CARGA DE DATOS ---
    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            // Cargamos  Patient de forma independiente
            const resPat = await fetch('/api/proxy/profiles/Patient');

            // Logs de diagnóstico en caso de error 500
            if (!resPat.ok) console.error(`Error Patient: ${resPat.status}`);

            const dataPat = await resPat.json().catch(() => []);

            // Normalización de datos: Medplum a veces devuelve el array directo o dentro de .data
            const listPat = Array.isArray(dataPat) ? dataPat : (dataPat.data || []);

            const combined = [...listPat];
            setUsers(combined);

            if (combined.length === 0) {
                setErrorMsg("No se encontraron registros en el servidor.");
            }
        } catch (err) {
            console.error("Error fatal al obtener usuarios:", err);
            setErrorMsg("Error de conexión o fallo en el servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    // --- LÓGICA DE EDICIÓN (PUT) ---
    const openEditModal = (user: any) => {
        setCurrentUser(user);
        const nameObj = user.name?.[0] || {};

        // Buscamos el email en el array telecom de Medplum
        const emailObj = user.telecom?.find((t: any) => t.system === 'email');

        setFormData({
            firstName: nameObj.given?.join(' ') || '',
            lastName: nameObj.family || '',
            email: emailObj?.value || ''
        });
        setIsModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!currentUser) return;

        try {
            // 1. CREAMOS UN PAYLOAD LIMPIO
            // Extraemos 'meta' para NO enviarlo, ya que el servidor lo genera solo
            const { meta, ...cleanUser } = currentUser;

            const payload = {
                ...cleanUser,
                id: currentUser.id, // Aseguramos el ID en la raíz
                resourceType: currentUser.resourceType,
                name: [
                    {
                        given: [formData.firstName],
                        family: formData.lastName
                    }
                ],
                telecom: [
                    {
                        system: 'email',
                        value: formData.email,
                        use: 'work'
                    }
                ]
            };

            console.log("🚀 ENVIANDO PAYLOAD LIMPIO:", payload);

            const response = await fetch(`/api/proxy/profiles/${currentUser.resourceType}/${currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert("¡Usuario actualizado!");
                setIsModalOpen(false);
                fetchAllUsers();
            } else {
                // Aquí capturamos el error exacto que te está dando el 500
                console.error("❌ Error del servidor:", result);
                alert(`Error: ${result.message || 'Error interno'}`);
            }
        } catch (error) {
            console.error("❌ Error en la conexión:", error);
        }
    };

    // --- LÓGICA DE ELIMINACIÓN (DELETE) ---
    const handleDelete = async (user: any) => {
        const pType = user.resourceType;
        const pId = user.id;

        if (!confirm(`¿Estás seguro de eliminar a este ${pType}?`)) return;

        try {
            const response = await fetch(`/api/proxy/profiles/${pType}/${pId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Eliminado con éxito");
                setUsers(prev => prev.filter(u => u.id !== pId));
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Error al eliminar: ${errorData.message || 'Consulte al administrador'}`);
            }
        } catch (error) {
            console.error("Error en la petición DELETE:", error);
        }
    };

    const inputStyle = "w-full bg-white border border-gray-300 rounded-xl py-2 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all";

    return (
        <div className="flex-1 bg-white shadow-lg flex flex-col overflow-hidden relative min-h-[400px]">
            {/* Header */}
            <div className="bg-[#f0f0f0] px-6 py-4 border-b border-gray-300">
                <h1 className="text-xl font-medium text-gray-800">Gestión de Pacientes</h1>
            </div>

            {/* Cabecera de Tabla */}
            <div className="bg-gray-100 px-4 py-3 grid grid-cols-12 gap-x-6 text-xs font-bold text-gray-600 uppercase">
                <div className="col-span-3">ID / UUID</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-4">Nombre Completo</div>
                <div className="col-span-3 text-right">Acciones</div>
            </div>

            {/* Cuerpo de Tabla */}
            <div className="flex-grow overflow-auto p-2 space-y-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 italic">Sincronizando con Medplum...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-20 text-center">
                        <p className="text-gray-400 font-medium">{errorMsg || "No hay usuarios registrados."}</p>
                    </div>
                ) : (
                    users.map((user, idx) => {
                        const nameObj = user.name?.[0] || {};
                        const fullName = `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim() || 'Sin nombre';
                        const type = user.resourceType;

                        return (
                            <div key={user.id || idx} className="bg-white border border-gray-100 grid grid-cols-12 gap-x-6 items-center py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="col-span-3 flex items-center gap-2">
                                    <span className="font-mono text-[12px] bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-600 truncate max-w-[120px]">
                                        {user.id}
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.id);
                                            alert("ID Copiado al portapapeles");
                                        }}
                                        className="text-[12px] bg-white border border-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-50 active:scale-90 transition-all"
                                        title="Copiar ID completo"
                                    >
                                        📋
                                    </button>
                                </div>
                                <div className="col-span-2">
                                    <span className={`text-[12px] font-bold uppercase px-2 py-0.5 rounded-full ${type === 'Practitioner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {type}
                                    </span>
                                </div>
                                <div className="col-span-4 text-sm text-gray-700 font-medium truncate">
                                    {fullName}
                                </div>
                                <div className="col-span-3 flex justify-end gap-2">
                                    <button onClick={() => openEditModal(user)} className="p-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">✏️</button>
                                    <button onClick={() => handleDelete(user)} className="p-2 border border-red-100 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">🗑️</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODAL DE EDICIÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 px-8 py-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Editar Perfil</h3>
                            <p className="text-xs text-gray-500 uppercase mt-1 tracking-wider">{currentUser?.resourceType} ID: {currentUser?.id?.split('-')[0]}</p>
                        </div>

                        <div className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Nombre(s)</label>
                                <input
                                    type="text"
                                    className={inputStyle}
                                    value={formData.firstName}
                                    onInput={(e) => setFormData({ ...formData, firstName: e.currentTarget.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Apellido(s)</label>
                                <input
                                    type="text"
                                    className={inputStyle}
                                    value={formData.lastName}
                                    onInput={(e) => setFormData({ ...formData, lastName: e.currentTarget.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className={inputStyle}
                                    value={formData.email}
                                    onInput={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-8 py-5 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}