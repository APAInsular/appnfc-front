import { useState } from 'preact/hooks';

export default function ProfileForm() {
  const [allergies, setAllergies] = useState(['']);
  const [meds, setMeds] = useState(['']);
  const [devices, setDevices] = useState(['']);

  const [bloodType, setBloodType] = useState('');
  const [contact1Relation, setContact1Relation] = useState('');
  const [contact2Relation, setContact2Relation] = useState('');

  const addField = (list: string[], setList: any) => setList([...list, '']);
  const removeField = (list: string[], setList: any, index: number) => {
    if (list.length > 1) setList(list.filter((_, i) => i !== index));
  };


  const inputClass = "bg-[#d0d0d1] border-none rounded-2xl py-3 px-4 w-full text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all";
  const labelBox = "bg-gray-100 rounded-xl py-3 px-6 text-center text-sm font-bold mb-2 shadow-sm border border-gray-200 text-gray-700 uppercase tracking-wide";
  const listContainer = "border-2 border-dashed border-gray-200 rounded-3xl p-4 min-h-[450px] flex flex-col items-center gap-4";

  // formato de selección sangre y relaciones
  const selectorBtnClass = "relative bg-[#d0d0d1] hover:bg-gray-400 rounded-2xl flex items-center justify-center shadow-sm transition-colors cursor-pointer group";

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const relations = ["Padre", "Madre", "Hermano/a", "Hijo/a", "Pareja", "Otro"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
      
      {/* COLUMNA 1 */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex gap-2 items-center mb-6">
            <div className="bg-[#ff8a8a] text-white px-4 py-3 rounded-2xl font-bold shadow-md flex-1 text-center text-sm uppercase">
                Tipo de Sangre
            </div>
            
            <div className={`${selectorBtnClass} w-24 h-12`}>
                <div className="flex items-center gap-1 font-bold text-gray-700">
                    <span>{bloodType || '--'}</span>
                    <svg class="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <select 
                    value={bloodType}
                    onChange={(e) => setBloodType((e.target as HTMLSelectElement).value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                    <option value="" disabled>--</option>
                    {bloodTypes.map(type => <option value={type}>{type}</option>)}
                </select>
            </div>
          </div>

          {/* Contacto de Emergencia 1 */}
          <div className="space-y-3 mb-8">
            <div className={labelBox}>Emergencia 1</div>
            <input type="text" placeholder="Nombre" className={inputClass} />
            
            <div className="flex gap-2">
              <input type="text" placeholder="Relación" value={contact1Relation} className={inputClass} readOnly />
              
              <div className={`${selectorBtnClass} w-14 h-12 text-1xl`}>
                <span className="font-bold text-gray-600 group-hover:scale-110 transition-transform">=</span >
                <select 
                    value="" 
                    onChange={(e) => setContact1Relation((e.target as HTMLSelectElement).value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                    <option value="" disabled selected></option>
                    {relations.map(rel => <option value={rel}>{rel}</option>)}
                </select>
              </div>
            </div>
            <input type="tel" placeholder="Número" className={inputClass} />
          </div>

          {/* Contacto de Emergencia 2 */}
          <div className="space-y-3">
            <div className={labelBox}>Emergencia 2</div>
            <input type="text" placeholder="Nombre" className={inputClass} />
            
            <div className="flex gap-2">
              <input type="text" placeholder="Relación" value={contact2Relation} className={inputClass} readOnly />
              
              <div className={`${selectorBtnClass} w-14 h-12 text-1xl`}>
                <span className="font-bold text-gray-600 group-hover:scale-110 transition-transform">=</span >
                <select 
                    value="" 
                    onChange={(e) => setContact2Relation((e.target as HTMLSelectElement).value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                    <option value="" disabled selected></option>
                    {relations.map(rel => <option value={rel}>{rel}</option>)}
                </select>
              </div>
            </div>
            <input type="tel" placeholder="Número" className={inputClass} />
          </div>
        </div>
      </div>

      {/* COLUMNAS DE LISTAS DINÁMICAS */}
      {[
        { title: 'Alergias', state: allergies, setter: setAllergies },
        { title: 'Medicaciones', state: meds, setter: setMeds },
        { title: 'Dispositivos', state: devices, setter: setDevices }
      ].map((list) => (
        <div className="flex flex-col">
          <div className={labelBox}>{list.title}</div>
          <div className={listContainer}>
            {list.state.map((val, i) => (
              <div key={i} className="flex gap-2 w-full animate-in fade-in zoom-in duration-200">
                <input 
                  type="text" 
                  placeholder="Nombre" 
                  className={inputClass} 
                  value={val} 
                  onInput={(e) => {
                    const newArr = [...list.state];
                    newArr[i] = (e.target as HTMLInputElement).value;
                    list.setter(newArr);
                  }} 
                />
                <button 
                  onClick={() => removeField(list.state, list.setter, i)} 
                  className="bg-[#d0d0d1] hover:bg-red-300 px-4 rounded-xl shadow-sm font-bold text-xl transition-colors"
                >-</button>
              </div>
            ))}
            <button 
              onClick={() => addField(list.state, list.setter)} 
              className="bg-white shadow-xl w-14 h-14 rounded-2xl flex items-center justify-center text-4xl font-light text-gray-400 mt-4 hover:scale-110 active:scale-95 transition-all border border-gray-100"
            >+</button>
          </div>
        </div>
      ))}

    </div>
  );
}