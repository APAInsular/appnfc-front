// src/components/practitioner/PractitionerDashboard.tsx
import { useState, useEffect } from 'preact/hooks';
import LogoutButton from '../shared/LogoutButton';

export default function PractitionerDashboard() {
  const [accessCode, setAccessCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);


  useEffect(() => {
    const fetchAccessCode = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const response = await fetch('/api/account/access-code', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error('No tienes permisos o tu sesión ha expirado.');
        }

        if (!response.ok) {
          throw new Error('Error al obtener el código de acceso del servidor.');
        }

        const data = await response.json();
        console.log("=== CÓDIGO RECIBIDO ===", data); // Para que revises la estructura exacta en consola

        // 💡 EXTRAER ÚNICAMENTE EL CÓDIGO LIMPIO:
        // Si viene como { "code": "12345" } o { "accessCode": "12345" } extrae el valor.
        // Si el backend manda el objeto completo directo sin clave, extraemos el primer string que encontremos.
        let cleanCode = '';
        
        if (data && typeof data === 'object') {
          // Intenta buscar las propiedades lógicas más comunes
          cleanCode = data.code || data.accessCode || data.data || '';
          
          // Si sigue vacío, extrae el primer valor de tipo string que tenga el objeto
          if (!cleanCode) {
            const values = Object.values(data);
            const firstString = values.find(v => typeof v === 'string');
            cleanCode = firstString ? String(firstString) : JSON.stringify(data);
          }
        } else {
          cleanCode = String(data);
        }

        setAccessCode(cleanCode);
        
      } catch (err: any) {
        console.error("❌ Error fetching access code:", err);
        setError(err.message || 'Ocurrió un error inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessCode();
  }, []);

  // --- FUNCIÓN PARA COPIAR AL PORTAPAPELES ---
  const handleCopy = () => {
    if (!accessCode) return;
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000); // Resetea el mensaje a los 3 segundos
  };

  // Clases de diseño consistentes con Qvida
  const cardClass = "bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col items-center max-w-md w-full text-center";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-[#2eb0b0] font-bold">
        Cargando código de autorización...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 font-sans pb-20">
      {/* Cabecera superior */}
      <div className="flex justify-between items-center mb-12 border-b pb-6">
        <div>
          <span className="text-[10px] font-bold text-[#2eb0b0] uppercase tracking-widest block mb-1">Panel de Profesional</span>
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Área Sanitaria</h1>
        </div>
        <div className="flex items-center gap-4">
          <img src="/img/Logo_Qvida.png" alt="Logo" className="h-10" />
          <LogoutButton />
        </div>
      </div>

      {/* Contenedor Central */}
      <div className="flex justify-center items-center mt-10">
        <div className={cardClass}>
          {/* Icono decorativo médico */}
          <div className="w-16 h-16 bg-[#2eb0b0]/10 rounded-2xl flex items-center justify-center mb-6 text-[#2eb0b0]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.016A11.955 11.955 0 003 12c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide mb-2">Código de Facultativo</h2>
          <p className="text-xs text-gray-500 mb-6 px-4">
            Utiliza este código confidencial para sincronizar y autorizar lecturas médicas con los dispositivos de tus pacientes.
          </p>

          {error ? (
            /* Estado de Error */
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 w-full">
              ⚠️ {error}
            </div>
          ) : (
            /* Bloque del Código */
            <div className="w-full space-y-4">
              <div className="bg-[#eeeeee] border border-gray-300 rounded-2xl p-5 font-mono text-2xl font-bold text-gray-700 tracking-widest select-all relative overflow-hidden">
                {accessCode || "------"}
              </div>

              <button 
                onClick={handleCopy}
                disabled={!accessCode}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
                  copied 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-[#2eb0b0] text-white hover:bg-[#269393] shadow-md'
                }`}
              >
                {copied ? "✅ ¡Copiado!" : "Copiar Código"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}