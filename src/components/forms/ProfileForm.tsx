// src/components/forms/ProfileForm.tsx
import { useState, useEffect } from 'preact/hooks';
import LogoutButton from '../shared/LogoutButton';

export default function ProfileForm({ isAdmin = false, patientName = "" }) {
  const [loading, setLoading] = useState(true);

  // --- ESTADO INICIAL (Ajustado a los Enums y Strings que pide tu servidor) ---
  const [formData, setFormData] = useState({
    firstName: '',
    surname1: '', // Apellido 1
    surname2: '', // Apellido 2
    language: 'ES',
    biologicalSex: 'M',
    bloodType: 'O+',   // "O+", "O-", etc.
    allergies: [] as string[],
    medications: [] as string[],
    pathologies: [] as string[],
    inplantDevices: [] as string[],
    neurologicalStatus: [] as string[],
    emergencyContacts: [
      { nombre: '', vinculo: '', telefono: '' },
      { nombre: '', vinculo: '', telefono: '' }
    ]
  });

  // --- CARGA DE DATOS (GET /api/v1/me) ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/me');
        if (response.ok) {
          const data = await response.json();

          const patientName = data.profile?.name?.[0] || {};
          const firstName = patientName.given?.[0] || '';

          // --- SEPARACIÓN DE APELLIDOS ---
          const fullFamily = patientName.family || ''; // "cum be"
          const familyParts = fullFamily.trim().split(/\s+/); // Divide por espacios
          const s1 = familyParts[0] || '';
          const s2 = familyParts.slice(1).join(' ') || ''; // Maneja apellidos compuestos

          const gender = data.profile?.gender === 'male' ? 'M' : 'F';
          const allCodes: string[] = (data.conditions || []).map((cond: any) =>
            cond.code?.coding?.[0]?.code
          ).filter(Boolean);

          const bloodTypeExtension = data.profile?.extension?.find(
            (ext: any) => ext.url === "http://hl7.org/fhir/StructureDefinition/patient-bloodType"
          );
          const serverBloodType = bloodTypeExtension?.valueCodeableConcept?.coding?.[0]?.code;


          setFormData(prev => ({
            ...prev,
            firstName: firstName,
            surname1: s1,
            surname2: s2,
            language: 'ES',
            biologicalSex: gender,
            // Si el backend no envía el tipo de sangre aún, lo forzamos a O+ 
            // o lo leemos si sabes dónde viene (ej: data.profile.bloodType)
            bloodType: serverBloodType || 'O+',
            allergies: allCodes,
            medications: allCodes,
            pathologies: allCodes,
            inplantDevices: allCodes,
            neurologicalStatus: allCodes,
            emergencyContacts: prev.emergencyContacts
          }));
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    // Listas de referencia según tu documentación técnica
    const validAllergies = ["442557003"];
    const validMedications = ["260413007", "418427003", "31252001", "373264003", "387207008", "387158006", "386452003", "387081005"];
    const validPathologies = ["160245001", "49436004", "73211009", "195967001", "13645005", "709044004", "64770001", "161661002", "370388006"];
    const validImplants = ["260413007", "14106009", "441509002", "17137000", "271295000", "700448003"];
    const validNeuro = ["40739000", "706868007", "128294001", "365061000", "371153006", "129839007"];

    // Creamos el objeto limpio
    const dataToSend = {
      firstName: formData.firstName,
      surnames: `${formData.surname1} ${formData.surname2}`.trim(),
      language: formData.language,
      biologicalSex: formData.biologicalSex,
      bloodType: formData.bloodType,
      // Filtramos cada array para que solo lleve lo que el servidor espera en esa sección
      allergies: formData.allergies.filter(code => validAllergies.includes(code)),
      medications: formData.medications.filter(code => validMedications.includes(code)),
      pathologies: formData.pathologies.filter(code => validPathologies.includes(code)),
      inplantDevices: formData.inplantDevices.filter(code => validImplants.includes(code)),
      neurologicalStatus: formData.neurologicalStatus.filter(code => validNeuro.includes(code)),
      emergencyContacts: formData.emergencyContacts
    };

    try {
      const response = await fetch("/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert("✅ Ficha médica actualizada con éxito");
      } else {
        const errorMsg = await response.json();
        console.error("Error detallado:", errorMsg);
        alert(`❌ Error del servidor: ${errorMsg.message}`);
      }
    } catch (error) {
      alert("❌ Error de conexión");
    }
  };



  // --- LÓGICA DE CHECKBOXES (Mantenemos la funcionalidad pero con Strings) ---
  const toggleSnomed = (category: keyof typeof formData, code: string) => {
    if (isAdmin) return;
    setFormData(prev => {
      const current = prev[category] as string[];
      const noneCodes = ["260413007", "442557003", "160245001"];

      if (noneCodes.includes(code)) return { ...prev, [category]: [code] };

      const filtered = current.filter(c => !noneCodes.includes(c));
      return {
        ...prev,
        [category]: current.includes(code) ? filtered.filter(c => c !== code) : [...filtered, code]
      };
    });
  };

  const Checkbox = ({ category, code, label }: { category: keyof typeof formData, code: string, label: string }) => {
    const isChecked = (formData[category] as string[]).includes(code);
    return (
      <label className="flex items-center space-x-3 mb-2 cursor-pointer group">
        <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${isChecked ? 'bg-[#2eb0b0] border-[#2eb0b0]' : 'border-gray-400 bg-white group-hover:border-[#2eb0b0]'}`}>
          {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className="text-gray-700 text-[11px] font-semibold uppercase">{label}</span>
        <input type="checkbox" className="hidden" onChange={() => toggleSnomed(category, code)} />
      </label>
    );
  };

  const sectionTitle = "bg-[#eeeeee] rounded-lg py-2 px-4 text-center text-[10px] font-bold mb-4 text-gray-600 uppercase tracking-widest";
  const cardClass = "bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col h-full";
  const inputClass = "bg-[#bcbcbc]/20 border border-gray-300 rounded-xl py-2 px-4 w-full text-gray-800 text-xs outline-none focus:border-[#2eb0b0]";

  if (loading) return <div className="h-screen flex items-center justify-center text-[#2eb0b0] font-bold">Cargando perfil...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 font-sans pb-20">

      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6 border-b pb-6">
        <h1 className="text-2xl font-bold text-gray-800 uppercase">Mi Ficha Médica</h1>
        <div className="flex items-center gap-4">
          <img src="/img/Logo_Qvida.png" alt="Logo" className="h-10" />
          <LogoutButton />
        </div>
      </div>

      {/* ADVERTENCIA LEGAL 1 */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 text-[11px] text-blue-900 text-justify leading-relaxed shadow-sm">
        <strong>Advertencia legal:</strong> "La presente declaración expresa mi voluntad en el ámbito sanitario y está redactada en forma de autodeterminación personal. Soy consciente de que, conforme al artículo 11 de la Ley 41/2002, las Instrucciones Previas solo adquieren plena eficacia jurídica si se formalizan según la normativa de la Comunidad Autónoma correspondiente y se inscriben en el Registro oficial. Por tanto, este documento no constituye una directiva anticipada jurídicamente vinculante. No obstante, de conformidad con el artículo 9 del Convenio de Oviedo, los deseos previamente expresados deberán ser tenidos en cuenta."
      </div>

      {/* BLOQUE 1: ALERGIAS, MEDICAMENTOS, PATOLOGÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        {/* ALERGIAS */}
        <div className={cardClass}>
          <div className={sectionTitle}>Alergias</div>
          <Checkbox category="allergies" code="442557003" label="No known allergies" />
        </div>

        {/* MEDICAMENTOS */}
        <div className={cardClass}>
          <div className={sectionTitle}>Medicamentos</div>
          <Checkbox category="medications" code="260413007" label="None" />
          <Checkbox category="medications" code="418427003" label="Patient on anticoagulant therapy" />
          <Checkbox category="medications" code="31252001" label="Insulin therapy" />
          <Checkbox category="medications" code="373264003" label="Hypoglycemic agent" />
          <Checkbox category="medications" code="387207008" label="Opioid" />
          <Checkbox category="medications" code="387158006" label="Benzodiazepine" />
          <Checkbox category="medications" code="386452003" label="Antiepileptic" />
          <Checkbox category="medications" code="387081005" label="Corticosteroid" />
        </div>

        {/* PATOLOGÍAS */}
        <div className={cardClass}>
          <div className={sectionTitle}>Patologías</div>
          <Checkbox category="pathologies" code="160245001" label="No current problems or disability" />
          <Checkbox category="pathologies" code="49436004" label="Atrial fibrillation" />
          <Checkbox category="pathologies" code="73211009" label="Diabetes mellitus" />
          <Checkbox category="pathologies" code="195967001" label="Asthma" />
          <Checkbox category="pathologies" code="13645005" label="Chronic obstructive lung disease" />
          <Checkbox category="pathologies" code="709044004" label="Chronic kidney disease" />
          <Checkbox category="pathologies" code="64770001" label="Blood coagulation disorder" />
          <Checkbox category="pathologies" code="161661002" label="History of organ transplant" />
          <Checkbox category="pathologies" code="370388006" label="Patient immunocompromised" />
        </div>

        {/* IMPLANTES */}
        <div className={cardClass}>
          <div className={sectionTitle}>Implantes</div>
          <Checkbox category="inplantDevices" code="260413007" label="None" />
          <Checkbox category="inplantDevices" code="14106009" label="Permanent cardiac pacemaker" />
          <Checkbox category="inplantDevices" code="441509002" label="Implantable cardioverter defibrillator" />
          <Checkbox category="inplantDevices" code="17137000" label="Cardiac valve prosthesis" />
          <Checkbox category="inplantDevices" code="271295000" label="Ventricular shunt" />
          <Checkbox category="inplantDevices" code="700448003" label="Dialysis device" />
        </div>

        {/* NEUROLÓGICO */}
        <div className={cardClass}>
          <div className={sectionTitle}>Estado Neurológico</div>
          <Checkbox category="neurologicalStatus" code="40739000" label="Normal conscious state" />
          <Checkbox category="neurologicalStatus" code="706868007" label="Chronic confused state" />
          <Checkbox category="neurologicalStatus" code="128294001" label="Chronic nervous system disorder" />
          <Checkbox category="neurologicalStatus" code="365061000" label="Independent in activities of daily living" />
          <Checkbox category="neurologicalStatus" code="371153006" label="Partially dependent" />
          <Checkbox category="neurologicalStatus" code="129839007" label="Total dependency" />
        </div>
      </div>

      {/* BLOQUE INFERIOR: DATOS Y CONTACTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* DATOS PERSONALES */}
        <div className={cardClass}>
          <div className={sectionTitle}>Datos Identificativos</div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre</label>
                <input type="text" className={inputClass} value={formData.firstName} onInput={e => setFormData({ ...formData, firstName: e.currentTarget.value })} />
              </div>
            </div>

            {/* APELLIDOS SEPARADOS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Primer Apellido</label>
                <input type="text" className={inputClass} value={formData.surname1} onInput={e => setFormData({ ...formData, surname1: e.currentTarget.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Segundo Apellido</label>
                <input type="text" className={inputClass} value={formData.surname2} onInput={e => setFormData({ ...formData, surname2: e.currentTarget.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Idioma</label>
                <select className={inputClass} value={formData.language} onChange={e => setFormData({ ...formData, language: e.currentTarget.value })}>
                  <option value="ES">ES</option>
                  <option value="EN">EN</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Sexo</label>
                <select className={inputClass} value={formData.biologicalSex} onChange={e => setFormData({ ...formData, biologicalSex: e.currentTarget.value })}>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              {/* <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Sangre</label>
                <select className={inputClass} value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.currentTarget.value })}>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div> */}
            </div>
          </div>
        </div>

        {/* CONTACTOS Y AVISO 2 */}
        <div className={cardClass}>
          <div className={sectionTitle}>Contactos de Emergencia</div>
          <div className="space-y-4">
            {formData.emergencyContacts.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" placeholder="Nombre" className={inputClass} value={c.nombre} onInput={e => {
                  const newC = [...formData.emergencyContacts];
                  newC[i].nombre = e.currentTarget.value;
                  setFormData({ ...formData, emergencyContacts: newC });
                }} />
                <input type="text" placeholder="Teléfono" className={inputClass} value={c.telefono} onInput={e => {
                  const newC = [...formData.emergencyContacts];
                  newC[i].telefono = e.currentTarget.value;
                  setFormData({ ...formData, emergencyContacts: newC });
                }} />
              </div>
            ))}
            <div className="bg-gray-50 p-4 rounded-xl text-[9px] text-gray-500 text-justify leading-snug border border-gray-100">
              "Declaro haber informado al contacto de emergencia indicado y haber obtenido su consentimiento para ser contactado exclusivamente en caso de necesidad sanitaria... de conformidad con el Reglamento (UE) 2016/679 y la Ley Orgánica 3/2018."
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <button onClick={handleSave} className="bg-[#2eb0b0] text-white px-20 py-4 rounded-2xl font-bold hover:bg-[#269393] shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs">
          Actualizar Mi Ficha Médica
        </button>
      </div>
    </div>
  );
}