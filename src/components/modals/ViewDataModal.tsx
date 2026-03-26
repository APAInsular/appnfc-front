// src/components/modals/ViewDataModal.tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
}

export default function ViewDataModal({ isOpen, onClose, patientName }: Props) {
  if (!isOpen) return null;

  const labelBox = "bg-[#eeeeee] rounded-lg py-2 px-4 text-center text-[10px] font-bold mb-2 shadow-sm text-gray-600 uppercase tracking-wider";
  const dataBox = "bg-[#d9d9d9] rounded-xl py-2 px-4 w-full text-gray-800 text-sm shadow-inner min-h-[40px] flex items-center border border-gray-300/50";

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[3rem] p-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto relative shadow-2xl" onClick={e => e.stopPropagation()}>
        
        
        <div className="flex justify-between items-center mb-8 border-b pb-6">
          <h2 className="text-3xl font-medium text-gray-800 uppercase tracking-tight">{patientName}</h2>
          <img src="/img/Logo_Qvida.png" alt="Logo" className="h-12" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div>
              <div className="bg-[#ff8a8a] text-white font-bold py-2 rounded-xl text-center mb-2 shadow-md uppercase text-[10px]">Tipo de Sangre</div>
              <div className="bg-[#d9d9d9] w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md border-2 border-white">O+</div>
            </div>
            
            <div>
              <div className={labelBox}>Contacto Emergencia 1</div>
              <div className={dataBox}>María García (Madre)</div>
              <div className={`${dataBox} mt-1 text-center justify-center font-mono font-bold text-[#2eb0b0]`}>600 000 000</div>
            </div>

            <div>
              <div className={labelBox}>Contacto Emergencia 2</div>
              <div className={dataBox}>José Pérez (Padre)</div>
              <div className={`${dataBox} mt-1 text-center justify-center font-mono font-bold text-[#2eb0b0]`}>611 222 333</div>
            </div>
          </div>

          {[
            { title: 'Alergias', items: ['Polen', 'Penicilina'] },
            { title: 'Medicaciones', items: ['Paracetamol', 'Omeprazol'] },
            { title: 'Dispositivos', items: ['Marcapasos'] }
          ].map((col, i) => (
            <div key={i}>
              <div className={labelBox}>{col.title}</div>
              <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-4 min-h-[350px] bg-gray-50/50 space-y-2">
                {col.items.map((item, idx) => (
                  <div key={idx} className={dataBox}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <button onClick={onClose} className="bg-[#2eb0b0] text-white px-16 py-3.5 rounded-2xl font-bold hover:bg-[#269393] transition-all shadow-lg uppercase text-sm tracking-widest">
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}