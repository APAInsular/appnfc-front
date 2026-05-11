// src/components/shared/admin/UserTable.tsx
import { useState, useEffect } from 'preact/hooks';

export default function UserTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

   const fetchAllUsers = async () => {
    try {
        setLoading(true);
        console.log("--- INICIANDO FETCH DE DIAGNÓSTICO ---");

        const resPract = await fetch('/api/proxy/profiles/Practitioner');
        const resPat = await fetch('/api/proxy/profiles/Patient');


        const dataPract = await resPract.json().catch(() => ({}));
        const dataPat = await resPat.json().catch(() => ({}));

        console.log("RAW Practitioner:", { status: resPract.status, data: dataPract });
        console.log("RAW Patient:", { status: resPat.status, data: dataPat });

        let combined: any[] = [];
        

        if (resPract.ok) {
            const list = Array.isArray(dataPract) ? dataPract : (dataPract.data || []);
            combined = [...combined, ...list];
        }

        if (resPat.ok) {
            const list = Array.isArray(dataPat) ? dataPat : (dataPat.data || []);
            combined = [...combined, ...list];
        }

        setUsers(combined);

        if (combined.length === 0) {
            setErrorMsg(`El servidor responde pero no devuelve filas. (Pract: ${resPract.status}, Pat: ${resPat.status})`);
        }

    } catch (err) {
        console.error("Error en el fetch:", err);
        setErrorMsg("Error de conexión.");
    } finally {
        setLoading(false);
    }
};

    useEffect(() => { fetchAllUsers(); }, []);

    // FUNCIÓN PARA ACTUALIZAR (PUT)
    const handleUpdate = async (user: any) => {
        const pType = user.resourceType;
        const pId = user.id;
        const newFamilyName = prompt("Nuevo apellido (family name):", user.name?.[0]?.family || "");
        if (newFamilyName === null) return;

        try {
            const updatedUser = { ...user };
            if (!updatedUser.name) updatedUser.name = [{}];
            updatedUser.name[0].family = newFamilyName;

            const response = await fetch(`/api/proxy/profiles/${pType}/${pId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });

            if (response.ok) {
                alert("Usuario actualizado");
                fetchAllUsers();
            } else {
                alert("Error al actualizar");
            }
        } catch (error) { console.error("Error PUT:", error); }
    };

    // FUNCIÓN PARA ELIMINAR (DELETE)
    const handleDelete = async (user: any) => {
        const pType = user.resourceType;
        const pId = user.id;

        if (!confirm(`¿Estás seguro de que deseas eliminar al ${pType} con ID: ${pId}? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/proxy/profiles/${pType}/${pId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Usuario eliminado correctamente");
                // Filtramos el estado local para que desaparezca al instante mientras refrescamos
                setUsers(prev => prev.filter(u => u.id !== pId));
                fetchAllUsers();
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Error al eliminar: ${errorData.message || 'No autorizado o error de servidor'}`);
            }
        } catch (error) {
            console.error("Error DELETE:", error);
            alert("Error de conexión al intentar eliminar.");
        }
    };

    const inputStyle = "w-full bg-white border border-gray-300 rounded-xl py-2 px-4 text-sm text-gray-700 shadow-sm overflow-hidden text-ellipsis whitespace-nowrap";

    return (
        <div className="flex-1 bg-white shadow-lg flex flex-col overflow-hidden">
            <div className="bg-[#f0f0f0] px-6 py-4 border-b border-gray-300">
                <h1 className="text-xl font-medium text-gray-800">Gestión de Usuarios </h1>
            </div>

            <div className="bg-gray-100 px-4 py-3 grid grid-cols-12 gap-x-6 text-xs font-bold text-gray-600 uppercase">
                <div className="col-span-3">ID / UUID</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-4">Nombre Completo</div>
                <div className="col-span-3 text-right">Acciones</div>
            </div>

            <div className="flex-grow overflow-auto p-2 space-y-2">
                {loading ? (
                    <p className="p-10 text-center text-gray-500 italic">Consultando recursos médicos...</p>
                ) : users.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center gap-4">
                        <div className="text-gray-400 text-5xl">Empty</div>
                        <p className="text-gray-500 font-medium">{errorMsg}</p>
                        <p className="text-xs text-gray-400">El servidor respondió correctamente (404: No hay registros).</p>
                    </div>
                ) : (
                    users.map((user, idx) => {
                        const idCorta = user.id?.split('-')[0] || 'N/A';
                        const type = user.resourceType || 'Desconocido';
                        const nameObj = user.name?.[0] || {};
                        const firstName = nameObj.given?.join(' ') || '';
                        const lastName = nameObj.family || '';
                        const fullName = `${firstName} ${lastName}`.trim() || 'Sin nombre';

                        return (
                            <div key={user.id || idx} className="bg-white border border-gray-100 grid grid-cols-12 gap-x-6 items-center py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">

                                <div className="col-span-3 font-mono">
                                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200" title={user.id}>
                                        #{idCorta}...
                                    </span>
                                </div>

                                <div className="col-span-2">
                                    <span className={`text-xs font-bold ${type === 'Practitioner' ? 'text-purple-600' : 'text-blue-600'}`}>
                                        {type}
                                    </span>
                                </div>

                                <div className="col-span-4">
                                    <div className={inputStyle}>{fullName}</div>
                                </div>

                                <div className="col-span-3 flex justify-end gap-2">
                                    <button onClick={() => handleUpdate(user)} className="p-2 border rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Editar">✏️</button>
                                    <button className="p-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Vincular">🔗</button>
                                    <button onClick={() => handleDelete(user)} className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">🗑️</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}