// src/components/forms/ProfileForm.tsx
import { useState } from 'preact/hooks';

interface Props {
  isAdmin?: boolean;
  patientName?: string;
}

export default function ProfileForm({ isAdmin = false, patientName = "Juan Pérez" }: Props) {
  const [bloodType, setBloodType] = useState('O+'); 
  const [allergies, setAllergies] = useState<string[]>(['']);
  const [meds, setMeds] = useState<string[]>(['']);
  const [devices, setDevices] = useState<string[]>(['']);

 
  const [contact1, setContact1] = useState({ nombre: '', relacion: '', numero: '' });
  const [contact2, setContact2] = useState({ nombre: '', relacion: '', numero: '' });

  const title = isAdmin ? `Datos Vitales Mínimos ${patientName}` : "Mis datos";


  const inputClass = "bg-[#bcbcbc] border-none rounded-2xl py-3 px-4 w-full text-gray-800 placeholder-gray-600 outline-none shadow-inner";
  const labelBox = "bg-[#eeeeee] rounded-lg py-2 px-4 text-center text-sm font-semibold mb-2 shadow-sm text-gray-700";
  const selectorBox = "bg-[#d9d9d9] w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md transition-colors";

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 font-sans">
      

      <div className="flex justify-between items-center mb-16 relative min-h-[64px]">
        <div className="flex-1 text-center">
            <h1 className="text-4xl font-medium text-gray-800 tracking-tight">
                {title}
            </h1>
        </div>
        <div className="absolute right-0">
            <img src="/img/Logo_Qvida.png" alt="Q-Vida Logo" className="h-16 w-auto" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        

        <div className="flex flex-col gap-8">
          <div className="flex gap-3 items-center">
            <div className="bg-[#ff8a8a] text-white font-bold py-3 px-6 rounded-2xl flex-grow text-center text-lg shadow-md uppercase">
              Tipo de Sangre
            </div>
            <div className="relative">
                {isAdmin && (
                  <select 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    onChange={(e) => setBloodType((e.target as HTMLSelectElement).value)}
                  >
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                  </select>
                )}
                <div className={`${selectorBox} ${isAdmin ? 'hover:bg-gray-300' : ''}`}>
                  {bloodType}
                </div>
            </div>
          </div>


          <div className="space-y-3">
            <div className={labelBox}>Contacto de Emergencia 1</div>
            <input 
                type="text" placeholder="Nombre" className={inputClass} 
                value={contact1.nombre} onInput={(e) => setContact1({...contact1, nombre: (e.target as HTMLInputElement).value})}
            />
            <div className="flex gap-3 items-center">
              <input type="text" placeholder="Relacion" className={inputClass} value={contact1.relacion} readOnly />
              <div className="relative">
                  <select 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    onChange={(e) => setContact1({...contact1, relacion: (e.target as HTMLSelectElement).value})}
                  >
                    <option value="Padre">Padre</option><option value="Madre">Madre</option>
                    <option value="Hermano/a">Hermano/a</option><option value="Otro">Otro</option>
                  </select>
                  <div className={`${selectorBox} hover:bg-gray-300`}>=</div>
              </div>
            </div>
            <input 
                type="text" placeholder="Numero" className={inputClass} 
                value={contact1.numero} onInput={(e) => setContact1({...contact1, numero: (e.target as HTMLInputElement).value})}
            />
          </div>


          <div className="space-y-3">
            <div className={labelBox}>Contacto de Emergencia 2</div>
            <input 
                type="text" placeholder="Nombre" className={inputClass} 
                value={contact2.nombre} onInput={(e) => setContact2({...contact2, nombre: (e.target as HTMLInputElement).value})}
            />
            <div className="flex gap-3 items-center">
              <input type="text" placeholder="Relacion" className={inputClass} value={contact2.relacion} readOnly />
              <div className="relative">
                  <select 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    onChange={(e) => setContact2({...contact2, relacion: (e.target as HTMLSelectElement).value})}
                  >
                    <option value="Padre">Padre</option><option value="Madre">Madre</option>
                    <option value="Hermano/a">Hermano/a</option><option value="Otro">Otro</option>
                  </select>
                  <div className={`${selectorBox} hover:bg-gray-300`}>=</div>
              </div>
            </div>
            <input 
                type="text" placeholder="Numero" className={inputClass} 
                value={contact2.numero} onInput={(e) => setContact2({...contact2, numero: (e.target as HTMLInputElement).value})}
            />
          </div>
        </div>


        {[
          { title: 'Alergias', state: allergies, setter: setAllergies },
          { title: 'Medicaciones', state: meds, setter: setMeds },
          { title: 'Dispositivos implantados', state: devices, setter: setDevices }
        ].map((list, idx) => (
          <div key={idx} className="flex flex-col">
            <div className={labelBox}>{list.title}</div>
            <div className="border-2 border-dashed border-gray-300 rounded-[2.5rem] p-6 min-h-[500px] flex flex-col items-center gap-4 bg-white/50 shadow-sm">
              {list.state.map((val, i) => (
                <div key={i} className="flex gap-2 w-full items-center">
                  <input 
                    type="text" placeholder="Nombre" className={inputClass} value={val} 
                    readOnly={!isAdmin}
                    onInput={(e) => {
                        const ns = [...list.state]; ns[i] = (e.target as HTMLInputElement).value; list.setter(ns);
                    }}
                  />
                  {isAdmin && (
                    <button onClick={() => { const ns = [...list.state]; ns.splice(i, 1); list.setter(ns); }} className="bg-[#eeeeee] w-10 h-10 rounded-xl font-bold shadow-md hover:bg-red-50 text-gray-600">-</button>
                  )}
                </div>
              ))}
              {isAdmin && (
                <button onClick={() => list.setter([...list.state, ''])} className="mt-4 bg-[#eeeeee] w-12 h-12 rounded-full font-bold text-2xl shadow-md hover:bg-gray-200 text-gray-600">+</button>
              )}
            </div>
          </div>
        ))}
      </div>


      {isAdmin && (
        <div className="flex justify-center mt-12">
            <button className="bg-[#2eb0b0] text-white text-xl font-medium py-4 px-24 rounded-2xl shadow-lg hover:bg-[#269393] transition-all">
            Confirmar
            </button>
        </div>
      )}

    </div>
  );
}