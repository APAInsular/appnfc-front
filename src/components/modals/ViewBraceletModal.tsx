// src/components/modals/ViewBraceletModal.tsx
import { useState, useEffect } from 'preact/hooks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  uid: string | null;
}

export default function ViewBraceletModal({ isOpen, onClose, uid }: Props) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && uid) {
      setLoading(true);
      fetch(`/api/bracelet/${uid}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, uid]);

  if (!isOpen) return null;

  const labelClass = "text-xs font-bold text-gray-500 uppercase mb-1 ml-2";
  const valueClass = "bg-[#eeeeee] rounded-2xl py-3 px-6 w-full text-gray-800 font-medium mb-4 shadow-sm";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center uppercase tracking-tight">Detalles de Pulsera</h2>

        {loading ? <p className="text-center">Cargando...</p> : details && (
          <div className="flex flex-col">
            <label className={labelClass}>UID Identificador</label>
            <div className={valueClass}>{details.uid}</div>

            <label className={labelClass}>Número de Serie</label>
            <div className={valueClass}>{details.serialNumber}</div>

            <label className={labelClass}>Estado Actual</label>
            <div className={`${valueClass} ${details.state === 'banned' ? 'text-red-600' : 'text-green-600'}`}>
                {details.state?.toUpperCase()}
            </div>

            <label className={labelClass}>Modelo de Chip</label>
            <div className={valueClass}>{details.model}</div>

            <label className={labelClass}>Fecha de Asignación</label>
            <div className={valueClass}>{details.assignDate || 'No asignada'}</div>
          </div>
        )}
      </div>
    </div>
  );
}