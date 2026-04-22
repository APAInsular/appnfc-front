// src/components/forms/ProfileForm.tsx
import { useState } from 'preact/hooks';

interface Props {
  isAdmin?: boolean;
  patientName?: string;
}

export default function ProfileForm({ isAdmin = false, patientName = "Juan Pérez" }: Props) {
  // --- ESTADOS: Datos Personales ---
  const [personalData, setPersonalData] = useState({
    nombre: 'Juan', apellido1: 'Pérez', apellido2: 'Gómez', idioma: 'Español', sexo: 'Masculino', sangre: 'O+'
  });

  // --- ESTADOS: Contactos ---
  const [contacts, setContacts] = useState([
    { nombre: '', vinculo: '', telefono: '' },
    { nombre: '', vinculo: '', telefono: '' }
  ]);

  // --- ESTADOS: Checkboxes Médicos ---
  const [alergias, setAlergias] = useState({ ninguna: false, especificas: '' });
  
  const [medicamentos, setMedicamentos] = useState({
    ninguna: false, anticoagulantes: false, insulina: false, opioides: false, 
    hipoglucemiantes: false, benzodiazepina: false, antiepilepticos: false, cortisonicos: false, otros: ''
  });

  const [patologias, setPatologias] = useState({
    cardiopatia: false, diabetes: false, diabetesTipo1: false, diabetesTipo2: false, 
    asma: false, epoc: false, insuficienciaRenal: false, trastornosCoagulacion: false, 
    trasplantes: false, inmunodepresion: false, otro: ''
  });

  const [dispositivos, setDispositivos] = useState({
    marcapasos: false, dai: false, protesisValvular: false, derivacionVentricular: false, 
    dialisis: false, otro: ''
  });

  const [estadoNeuro, setEstadoNeuro] = useState({
    brillante: false, confusion: false, deficits: false, autonomo: false, 
    parcialmenteDependiente: false, noAutonomo: false
  });

  const title = isAdmin ? `Datos del Paciente: ${patientName}` : "Mis Datos Médicos";

  // --- CLASES CSS REUTILIZABLES ---
  const inputClass = "bg-[#bcbcbc]/20 border border-gray-300 rounded-xl py-2.5 px-4 w-full text-gray-800 placeholder-gray-500 outline-none focus:border-[#2eb0b0] transition-colors disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed";
  const sectionTitle = "bg-[#eeeeee] rounded-lg py-2 px-4 text-center text-xs font-bold mb-4 shadow-sm text-gray-600 uppercase tracking-widest";
  const cardClass = "bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col h-full";

  // Componente interno para renderizar checkboxes
  const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <label className={`flex items-center space-x-3 ${isAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer group'}`}>
      <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${checked ? 'bg-[#2eb0b0] border-[#2eb0b0]' : 'border-gray-400 bg-white group-hover:border-[#2eb0b0]'}`}>
        {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className="text-gray-700 text-xs font-semibold uppercase">{label}</span>
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => !isAdmin && onChange(e.currentTarget.checked)} disabled={isAdmin} />
    </label>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 font-sans pb-20">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-10 border-b pb-6">
        <div>
          <p className="text-[#2eb0b0] font-bold text-sm uppercase tracking-widest mb-1">{isAdmin ? "Modo Lectura" : "Formulario de Autodeterminación"}</p>
          <h1 className="text-3xl font-medium text-gray-800 uppercase">{title}</h1>
        </div>
        <img src="/img/Logo_Qvida.png" alt="Logo Q-Vida" className="h-12" />
      </div>

      {/* 0. AVISO LEGAL [cite: 60-64] */}
      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 text-xs text-blue-800 text-justify leading-relaxed">
          <strong>Advertencia legal:</strong> La presente declaración expresa mi voluntad en el ámbito sanitario y está redactada en forma de autodeterminación personal. Soy consciente de que, conforme al artículo 11 de la Ley 41/2002, las Instrucciones Previas solo adquieren plena eficacia jurídica si se formalizan según la normativa y se inscriben en el Registro oficial. Por tanto, este documento no constituye una directiva anticipada jurídicamente vinculante. No obstante, de conformidad con el artículo 9 del Convenio de Oviedo, los deseos previamente expresados deberán ser tenidos en cuenta.
        </div>
      )}

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1 */}
        <div className="space-y-6 flex flex-col">
          {/* 1. ALERGIAS [cite: 1] */}
          <div className={cardClass}>
            <div className={sectionTitle}>Alergias</div>
            <div className="space-y-4">
              <Checkbox label="Ninguna" checked={alergias.ninguna} onChange={v => setAlergias({...alergias, ninguna: v})} />
              {!alergias.ninguna && (
                <textarea placeholder="Especifique sus alergias aquí..." rows={3} className={`${inputClass} resize-none`} value={alergias.especificas} onChange={e => setAlergias({...alergias, especificas: e.currentTarget.value})} disabled={isAdmin}></textarea>
              )}
            </div>
          </div>

          {/* 4. DISPOSITIVOS DE IMPLANTE [cite: 38-47] */}
          <div className={cardClass}>
            <div className={sectionTitle}>Dispositivos de Implante</div>
            <div className="space-y-4">
              <Checkbox label="Ninguno" checked={dispositivos.marcapasos === false && dispositivos.dai === false && dispositivos.protesisValvular === false && dispositivos.derivacionVentricular === false && dispositivos.dialisis === false && dispositivos.otro === ''} onChange={() => setDispositivos({marcapasos: false, dai: false, protesisValvular: false, derivacionVentricular: false, dialisis: false, otro: ''})} />
              <Checkbox label="Marcapasos" checked={dispositivos.marcapasos} onChange={v => setDispositivos({...dispositivos, marcapasos: v})} />
              <Checkbox label="DAI" checked={dispositivos.dai} onChange={v => setDispositivos({...dispositivos, dai: v})} />
              <Checkbox label="Prótesis Valvular" checked={dispositivos.protesisValvular} onChange={v => setDispositivos({...dispositivos, protesisValvular: v})} />
              <Checkbox label="Derivación Ventricular" checked={dispositivos.derivacionVentricular} onChange={v => setDispositivos({...dispositivos, derivacionVentricular: v})} />
              <Checkbox label="Diálisis" checked={dispositivos.dialisis} onChange={v => setDispositivos({...dispositivos, dialisis: v})} />
              <input type="text" placeholder="Otro dispositivo..." className={inputClass} value={dispositivos.otro} onChange={e => setDispositivos({...dispositivos, otro: e.currentTarget.value})} disabled={isAdmin} />
            </div>
          </div>
        </div>

        {/* COLUMNA 2 */}
        <div className="space-y-6 flex flex-col">
          {/* 2. MEDICAMENTOS EN PROGRESO [cite: 2-16] */}
          <div className={cardClass}>
            <div className={sectionTitle}>Medicamentos en Progreso</div>
            <div className="space-y-4">
              <Checkbox label="Ninguno" checked={medicamentos.ninguna} onChange={v => setMedicamentos({...medicamentos, ninguna: v})} />
              {!medicamentos.ninguna && (
                <>
                  <Checkbox label="Anticoagulantes" checked={medicamentos.anticoagulantes} onChange={v => setMedicamentos({...medicamentos, anticoagulantes: v})} />
                  <Checkbox label="Insulina" checked={medicamentos.insulina} onChange={v => setMedicamentos({...medicamentos, insulina: v})} />
                  <Checkbox label="Opioides" checked={medicamentos.opioides} onChange={v => setMedicamentos({...medicamentos, opioides: v})} />
                  <Checkbox label="Hipoglucemiantes Orales" checked={medicamentos.hipoglucemiantes} onChange={v => setMedicamentos({...medicamentos, hipoglucemiantes: v})} />
                  <Checkbox label="Benzodiazepina" checked={medicamentos.benzodiazepina} onChange={v => setMedicamentos({...medicamentos, benzodiazepina: v})} />
                  <Checkbox label="Antiepilépticos" checked={medicamentos.antiepilepticos} onChange={v => setMedicamentos({...medicamentos, antiepilepticos: v})} />
                  <Checkbox label="Cortisónicos" checked={medicamentos.cortisonicos} onChange={v => setMedicamentos({...medicamentos, cortisonicos: v})} />
                  <input type="text" placeholder="Otros medicamentos..." className={inputClass} value={medicamentos.otros} onChange={e => setMedicamentos({...medicamentos, otros: e.currentTarget.value})} disabled={isAdmin} />
                </>
              )}
            </div>
          </div>

          {/* 5. ESTADO NEUROLÓGICO [cite: 48-59] */}
          <div className={cardClass}>
            <div className={sectionTitle}>Estado Neurológico</div>
            <div className="space-y-4">
              <Checkbox label="Brillante Normal" checked={estadoNeuro.brillante} onChange={v => setEstadoNeuro({...estadoNeuro, brillante: v})} />
              <Checkbox label="Confusión Crónica" checked={estadoNeuro.confusion} onChange={v => setEstadoNeuro({...estadoNeuro, confusion: v})} />
              <Checkbox label="Déficits Preexistentes" checked={estadoNeuro.deficits} onChange={v => setEstadoNeuro({...estadoNeuro, deficits: v})} />
              <div className="h-px bg-gray-200 w-full my-2"></div>
              <Checkbox label="Autónomo" checked={estadoNeuro.autonomo} onChange={v => setEstadoNeuro({...estadoNeuro, autonomo: v})} />
              <Checkbox label="Parcialmente Dependiente" checked={estadoNeuro.parcialmenteDependiente} onChange={v => setEstadoNeuro({...estadoNeuro, parcialmenteDependiente: v})} />
              <Checkbox label="No Autónomo / Asistido" checked={estadoNeuro.noAutonomo} onChange={v => setEstadoNeuro({...estadoNeuro, noAutonomo: v})} />
            </div>
          </div>
        </div>

        {/* COLUMNA 3 */}
        <div className="space-y-6 flex flex-col">
          {/* 3. PATOLOGÍAS [cite: 17-37] */}
          <div className={cardClass}>
            <div className={sectionTitle}>Patologías</div>
            <div className="space-y-4">
              <Checkbox label="Ninguna" checked={patologias.cardiopatia === false && patologias.diabetes === false && patologias.asma === false && patologias.epoc === false && patologias.insuficienciaRenal === false && patologias.trastornosCoagulacion === false && patologias.trasplantes === false && patologias.inmunodepresion === false && patologias.otro === ''} onChange={() => setPatologias({cardiopatia: false, diabetes: false, diabetesTipo1: false, diabetesTipo2: false, asma: false, epoc: false, insuficienciaRenal: false, trastornosCoagulacion: false, trasplantes: false, inmunodepresion: false, otro: ''})} />
              <Checkbox label="Cardiopatía" checked={patologias.cardiopatia} onChange={v => setPatologias({...patologias, cardiopatia: v})} />
              
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Checkbox label="Diabetes" checked={patologias.diabetes} onChange={v => setPatologias({...patologias, diabetes: v})} />
                {patologias.diabetes && (
                  <div className="ml-8 mt-3 flex gap-4">
                    <Checkbox label="Tipo 1" checked={patologias.diabetesTipo1} onChange={v => setPatologias({...patologias, diabetesTipo1: v})} />
                    <Checkbox label="Tipo 2" checked={patologias.diabetesTipo2} onChange={v => setPatologias({...patologias, diabetesTipo2: v})} />
                  </div>
                )}
              </div>

              <Checkbox label="Asma" checked={patologias.asma} onChange={v => setPatologias({...patologias, asma: v})} />
              <Checkbox label="EPOC" checked={patologias.epoc} onChange={v => setPatologias({...patologias, epoc: v})} />
              <Checkbox label="Insuficiencia Renal" checked={patologias.insuficienciaRenal} onChange={v => setPatologias({...patologias, insuficienciaRenal: v})} />
              <Checkbox label="Trastornos Coagulación" checked={patologias.trastornosCoagulacion} onChange={v => setPatologias({...patologias, trastornosCoagulacion: v})} />
              <Checkbox label="Trasplantes" checked={patologias.trasplantes} onChange={v => setPatologias({...patologias, trasplantes: v})} />
              <Checkbox label="Inmunodepresión" checked={patologias.inmunodepresion} onChange={v => setPatologias({...patologias, inmunodepresion: v})} />
              <input type="text" placeholder="Otra patología..." className={inputClass} value={patologias.otro} onChange={e => setPatologias({...patologias, otro: e.currentTarget.value})} disabled={isAdmin} />
            </div>
          </div>
        </div>

      </div> {/* FIN DEL GRID DE 3 COLUMNAS */}

      {/* BLOQUE INFERIOR: Voluntades y Contactos ocupan todo el ancho */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 6. DOCUMENTO DE VOLUNTADES [cite: 65-71] */}
          <div className={cardClass}>
            <div className={sectionTitle}>Documentos de Voluntades Anticipadas</div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre</label>
                    <input type="text" className={inputClass} value={personalData.nombre} onChange={e => setPersonalData({...personalData, nombre: e.currentTarget.value})} disabled={isAdmin} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Primer Apellido</label>
                    <input type="text" className={inputClass} value={personalData.apellido1} onChange={e => setPersonalData({...personalData, apellido1: e.currentTarget.value})} disabled={isAdmin} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Segundo Apellido</label>
                    <input type="text" className={inputClass} value={personalData.apellido2} onChange={e => setPersonalData({...personalData, apellido2: e.currentTarget.value})} disabled={isAdmin} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Idioma</label>
                    <input type="text" className={inputClass} value={personalData.idioma} onChange={e => setPersonalData({...personalData, idioma: e.currentTarget.value})} disabled={isAdmin} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Sexo Biológico</label>
                    <div className="flex gap-4 mt-2">
                        <Checkbox label="Masculino" checked={personalData.sexo === 'Masculino'} onChange={() => setPersonalData({...personalData, sexo: 'Masculino'})} />
                        <Checkbox label="Femenino" checked={personalData.sexo === 'Femenino'} onChange={() => setPersonalData({...personalData, sexo: 'Femenino'})} />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Sangre</label>
                    <select className={inputClass} value={personalData.sangre} onChange={e => setPersonalData({...personalData, sangre: e.currentTarget.value})} disabled={isAdmin}>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                </div>
            </div>
            
            {/* Aviso de Contactos [cite: 72-74] */}
            {!isAdmin && (
                <div className="mt-2 text-[10px] text-gray-500 italic">
                    Declaro haber informado al contacto de emergencia indicado y haber obtenido su consentimiento para ser contactado exclusivamente en caso de necesidad sanitaria.
                </div>
            )}
          </div>

          {/* 7. CONTACTOS DE EMERGENCIA [cite: 75] */}
          <div className={cardClass}>
            <div className={sectionTitle}>Contactos de Emergencia</div>
            {contacts.map((c, i) => (
              <div key={i} className={`space-y-3 ${i > 0 ? 'mt-6 pt-4 border-t border-gray-100' : ''}`}>
                <p className="text-[10px] text-[#2eb0b0] font-bold uppercase tracking-wider">Contacto {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre y Apellido</label>
                        <input type="text" className={inputClass} value={c.nombre} onChange={e => { const nc = [...contacts]; nc[i].nombre = e.currentTarget.value; setContacts(nc); }} disabled={isAdmin} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Vínculo</label>
                        <input type="text" className={inputClass} value={c.vinculo} onChange={e => { const nc = [...contacts]; nc[i].vinculo = e.currentTarget.value; setContacts(nc); }} disabled={isAdmin} />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Teléfono</label>
                    <input type="text" className={inputClass} value={c.telefono} onChange={e => { const nc = [...contacts]; nc[i].telefono = e.currentTarget.value; setContacts(nc); }} disabled={isAdmin} />
                </div>
              </div>
            ))}
          </div>

      </div>

      {/* BOTÓN DE GUARDADO (Solo para el Cliente) */}
      {!isAdmin && (
        <div className="mt-12 flex justify-center">
          <button onClick={() => alert("Datos guardados correctamente")} className="bg-[#2eb0b0] text-white px-16 py-4 rounded-2xl font-bold hover:bg-[#269393] transition-all shadow-lg uppercase tracking-widest text-sm">
            Guardar Mi Ficha Médica
          </button>
        </div>
      )}
      
    </div>
  );
}