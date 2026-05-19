// src/components/forms/ProfileForm.tsx
import { useState, useEffect } from 'preact/hooks';
import LogoutButton from '../shared/LogoutButton';

interface CatalogCondition {
  id: number;
  code: string;
  display: string;
  category: string;
  allowsText: boolean;
}

interface UserCondition {
  code: string;
  checked: boolean;
  textValues: string[];
}

export default function ProfileForm({ isAdmin = false, patientName = "" }) {
  const [hasConsented, setHasConsented] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("qvida_consent_accepted") === "true";
    }
    return false;
  });

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    surname1: '',
    surname2: '',
    language: 'ES',
    biologicalSex: 'M',
    bloodType: 'O+',
    emergencyContacts: [
      { nombre: '', vinculo: '', telefono: '' },
      { nombre: '', vinculo: '', telefono: '' }
    ]
  });

  const [catalog, setCatalog] = useState<CatalogCondition[]>([]);
  const [userConditions, setUserConditions] = useState<UserCondition[]>([]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (!hasConsented) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      try {
        const profileRes = await fetch('/api/account/profile', { headers });
        if (profileRes.ok) {
          const userData = await profileRes.json();
          const profileData = userData.data || {};

          const firstName = profileData.firstName || '';
          const fullFamily = profileData.surnames || '';
          const familyParts = fullFamily.trim().split(/\s+/);
          const s1 = familyParts[0] || '';
          const s2 = familyParts.slice(1).join(' ') || '';

          setFormData(prev => ({
            ...prev,
            firstName: firstName,
            surname1: s1,
            surname2: s2,
            language: profileData.language || 'ES',
            biologicalSex: profileData.biologicalSex || 'M',
            bloodType: profileData.bloodType || 'O+',
            emergencyContacts: profileData.emergencyContacts || prev.emergencyContacts
          }));
        }
      } catch (err) {
        console.error("⚠️ Error cargando perfil:", err);
      }

      try {
        const catalogRes = await fetch('/api/medical-conditions/catalog', { headers });
        if (catalogRes.ok) {
          const catalogData = await catalogRes.json();
          setCatalog(catalogData || []);
        }
      } catch (err) {
        console.error("⚠️ Error cargando catálogo:", err);
      }

      try {
        const userConditionsRes = await fetch('/api/medical-conditions', { headers });
        if (userConditionsRes.ok) {
          const userConditionsData = await userConditionsRes.json();
          const mappedConditions = (userConditionsData.conditions || []).map((c: any) => ({
            code: c.code,
            checked: c.checked ?? true,
            textValues: Array.isArray(c.textValues) ? c.textValues : []
          }));
          setUserConditions(mappedConditions);
        }
      } catch (err) {
        console.error("⚠️ Error cargando condiciones:", err);
      }

      setLoading(false);
    };

    fetchAllData();
  }, [hasConsented]);

  const handleAcceptInitialConsent = () => {
    localStorage.setItem("qvida_consent_accepted", "true");
    setHasConsented(true);
  };

  // --- GUARDADO DE DATOS ---
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    if (!formData.firstName || !formData.surname1) {
      alert("Por favor, rellena tu nombre y el primer apellido.");
      return;
    }

    const sanitizedContacts = formData.emergencyContacts.map(c => ({
      nombre: String(c.nombre || '').trim(),
      vinculo: String(c.vinculo || '').trim(),
      telefono: String(c.telefono || '').trim()
    })).filter(c => c.nombre !== "" || c.telefono !== "");

    const profilePayload = {
      firstName: formData.firstName.trim(),
      surnames: `${formData.surname1} ${formData.surname2}`.trim(),
      language: formData.language || "ES",
      biologicalSex: formData.biologicalSex,
      bloodType: formData.bloodType || "O+",
      emergencyContacts: sanitizedContacts
    };

    // Estructura blindada contra el error 422: nunca enviamos un string vacío "" en textValues
    const conditionsPayload = {
      conditions: userConditions
        .filter(c => c.checked)
        .map(c => {
          const safeTextValues = (c.textValues || [])
            .map(v => String(v || '').trim())
            .filter(v => v !== '');

          return {
            code: String(c.code),
            // Si el arreglo está vacío o no tiene texto introducido, enviamos "Sí" en vez de "" para superar la regla 'required'
            textValues: safeTextValues.length > 0 ? safeTextValues : ["Sí"]
          };
        })
    };

    try {
      setLoading(true);

      const resProfile = await fetch("/api/account/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify(profilePayload)
      });

      if (!resProfile.ok) throw new Error("Error al actualizar el perfil.");

      const resConditions = await fetch("/api/medical-conditions", {
        method: "PUT",
        headers,
        body: JSON.stringify(conditionsPayload)
      });

      if (!resConditions.ok) {
        const errorData = await resConditions.json().catch(() => ({}));
        console.error("Detalle del error del servidor:", errorData);
        throw new Error("El servidor rechazó el formato de las condiciones médicas.");
      }

      alert("✅ Ficha médica actualizada con éxito.");

    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(`❌ No se pudo guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSnomedCondition = (code: string, category: string, defaultTextValue: string = "") => {
    if (isAdmin) return;
    setUserConditions(prev => {
      const noneCodes = ["260413007", "442557003", "160245001"];
      const exists = prev.find(c => c.code === code);
      const isChecking = exists ? !exists.checked : true;
      let updated = [...prev];

      const initialTexts = defaultTextValue ? [defaultTextValue] : [];

      if (!exists) {
        updated.push({ code, checked: true, textValues: initialTexts });
      } else {
        updated = updated.map(c => c.code === code ? { ...c, checked: isChecking } : c);
      }

      if (isChecking && noneCodes.includes(code)) {
        const categoryCodes = catalog.filter(cat => cat.category === category && !noneCodes.includes(cat.code)).map(cat => cat.code);
        updated = updated.map(c => categoryCodes.includes(c.code) ? { ...c, checked: false, textValues: [] } : c);
      }

      if (isChecking && !noneCodes.includes(code)) {
        const noneCategoryCodes = catalog.filter(cat => cat.category === category && noneCodes.includes(cat.code)).map(cat => cat.code);
        updated = updated.map(c => noneCategoryCodes.includes(c.code) ? { ...c, checked: false, textValues: [] } : c);
      }
      return updated;
    });
  };

  const handleTextChange = (code: string, value: string, index: number = 0) => {
    setUserConditions(prev => {
      const exists = prev.find(c => c.code === code);
      if (!exists) {
        return [...prev, { code, checked: true, textValues: [value] }];
      }
      return prev.map(c => {
        if (c.code === code) {
          const newTexts = [...c.textValues];
          newTexts[index] = value;
          return { ...c, textValues: newTexts };
        }
        return c;
      });
    });
  };

  // --- RENDERS REUTILIZABLES COMPACTOS ---
  const renderCheckbox = (code: string, label: string, category: string) => {
    const condition = userConditions.find(c => c.code === code);
    const isChecked = condition ? condition.checked : false;

    return (
      <label key={`chk-${code}`} className="flex items-center space-x-2 py-1 cursor-pointer group w-full select-none">
        <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-[#2eb0b0] border-[#2eb0b0]' : 'border-gray-400 bg-white group-hover:border-[#2eb0b0]'}`}>
          {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className="text-gray-700 text-[10px] font-semibold uppercase tracking-tight">{label}</span>
        <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleSnomedCondition(code, category)} />
      </label>
    );
  };

  const renderTextAreaField = (code: string, placeholder: string) => {
    const condition = userConditions.find(c => c.code === code);
    const textValue = condition && condition.textValues ? (condition.textValues[0] || '') : '';

    return (
      <div key={`txt-${code}`} className="w-full mt-1 mb-2">
        <textarea
          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-[11px] text-gray-800 focus:border-[#2eb0b0] outline-none resize-none h-14 shadow-inner transition-all"
          placeholder={placeholder}
          value={textValue}
          onInput={e => handleTextChange(code, e.currentTarget.value)}
        />
      </div>
    );
  };

  const renderTextInputField = (code: string, placeholder: string) => {
    const condition = userConditions.find(c => c.code === code);
    const textValue = condition && condition.textValues ? (condition.textValues[0] || '') : '';

    return (
      <div key={`inp-${code}`} className="w-full mt-1 mb-2">
        <input
          type="text"
          className="w-full py-1.5 px-3 bg-gray-50 border border-gray-300 rounded-xl text-[11px] text-gray-800 focus:border-[#2eb0b0] outline-none shadow-inner transition-all"
          placeholder={placeholder}
          value={textValue}
          onInput={e => handleTextChange(code, e.currentTarget.value)}
        />
      </div>
    );
  };

  const sectionTitle = "bg-[#eeeeee] rounded-md py-1.5 px-3 text-center text-[9px] font-bold mb-3 text-gray-600 uppercase tracking-widest";
  const cardClass = "bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col w-full";
  const inputClass = "bg-[#bcbcbc]/20 border border-gray-300 rounded-xl py-1.5 px-3 w-full text-gray-800 text-xs outline-none focus:border-[#2eb0b0]";

  if (loading) return <div className="h-screen flex items-center justify-center text-[#2eb0b0] font-bold">Cargando perfil...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 font-sans pb-16">
      <div className="flex justify-between items-center mb-5 border-b pb-4">
        <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Mi Ficha Médica</h1>
        <div className="flex items-center gap-3">
          <img src="/img/Logo_Qvida.png" alt="Logo" className="h-8" />
          <LogoutButton />
        </div>
      </div>

      {/* SECCIÓN DE CHECKBOXES EN FORMATO COMPACTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* ALERGIAS DESACOPLADAS */}
        <div className={cardClass}>
          <div className={sectionTitle}>Alergias</div>
          {renderCheckbox("442557003", "No known allergies", "allergy")}
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-3 mb-1">Alergias Específicas:</div>
          {renderTextAreaField("442557003-text", "Escribe alergias alimentarias, medicamentosas o ambientales...")}
        </div>

        {/* MEDICAMENTOS */}
        <div className={cardClass}>
          <div className={sectionTitle}>Medicamentos</div>
          {/* <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1"> */}
            {renderCheckbox("260413007", "None", "medication")}
            {renderCheckbox("418427003", "Patient on anticoagulant therapy", "medication")}
            {renderCheckbox("31252001", "Insulin therapy", "medication")}
            {renderCheckbox("373264003", "Hypoglycemic agent", "medication")}
            {renderCheckbox("387207008", "Opioid", "medication")}
            {renderCheckbox("387158006", "Benzodiazepine", "medication")}
            {renderCheckbox("386452003", "Antiepileptic", "medication")}
            {renderCheckbox("387081005", "Corticosteroid", "medication")}
          {/* </div> */}
        </div>

        {/* PATOLOGÍAS */}
        <div className={cardClass}>
          <div className={sectionTitle}>Patologías</div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {renderCheckbox("160245001", "No current problems or disability", "pathology")}

            <div className="border-t pt-1 mt-1">
              {renderCheckbox("49436004", "Atrial fibrillation (Cardiopatía)", "pathology")}
              {renderTextAreaField("49436004", "Detalles cardiopatía...")}
            </div>

            {/* DIABETES CON RADIOS EN UNA SOLA LÍNEA */}
            <div className="border-t pt-1">
              {renderCheckbox("73211009", "Diabetes mellitus", "pathology")}
              <div className="flex items-center space-x-4 mt-1 ml-6">
                <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-gray-500">
                  <input type="radio" name="db_type" checked={userConditions.find(c => c.code === "73211009")?.textValues.includes("Tipo 1")} onChange={() => handleTextChange("73211009", "Tipo 1")} className="accent-[#2eb0b0]" />
                  <span>TIPO 1</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-gray-500">
                  <input type="radio" name="db_type" checked={userConditions.find(c => c.code === "73211009")?.textValues.includes("Tipo 2")} onChange={() => handleTextChange("73211009", "Tipo 2")} className="accent-[#2eb0b0]" />
                  <span>TIPO 2</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-1">{renderCheckbox("195967001", "Asthma", "pathology")}</div>
            <div>{renderCheckbox("13645005", "Chronic obstructive lung disease", "pathology")}</div>
            <div>{renderCheckbox("709044004", "Chronic kidney disease", "pathology")}</div>

            <div className="border-t pt-1">
              {renderCheckbox("64770001", "Blood coagulation disorder", "pathology")}
              {renderTextAreaField("64770001", "Trastorno de coagulación...")}
            </div>

            <div className="border-t pt-1">
              {renderCheckbox("161661002", "History of organ transplant", "pathology")}
              {renderTextAreaField("161661002", "Detalles del trasplante...")}
            </div>

            <div className="border-t pt-1">
              {renderCheckbox("370388006", "Patient immunocompromised", "pathology")}
              {renderTextAreaField("370388006", "Detalles de inmunodepresión...")}
            </div>

            <div className="border-t pt-1">
              <span className="text-[10px] text-gray-700 font-semibold uppercase">Otra Patología</span>
              {renderTextAreaField("999999999", "Especifica otra condición...")}
            </div>
          </div>
        </div>

        {/* IMPLANTES */}
        <div className={cardClass}>
          <div className={sectionTitle}>Implantes</div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {renderCheckbox("260413007", "None", "implant")}

            <div className="border-t pt-1">
              {renderCheckbox("14106009", "Permanent cardiac pacemaker", "implant")}
              {renderTextInputField("14106009", "Modelo o Marca...")}
            </div>

            <div className="border-t pt-1">{renderCheckbox("441509002", "Implantable cardioverter defibrillator", "implant")}</div>
            <div>{renderCheckbox("17137000", "Cardiac valve prosthesis", "implant")}</div>
            <div>{renderCheckbox("271295000", "Ventricular shunt", "implant")}</div>
            <div>{renderCheckbox("700448003", "Dialysis device", "implant")}</div>

            <div className="border-t pt-1">
              <span className="text-[10px] text-gray-700 font-semibold uppercase">Otros Dispositivos</span>
              {renderTextAreaField("888888888", "Detalla otros implantes...")}
            </div>
          </div>
        </div>

        {/* ESTADO NEUROLÓGICO */}
        <div className={cardClass}>
          <div className={sectionTitle}>Estado Neurológico</div>
          <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
            {renderCheckbox("40739000", "Normal conscious state", "neurological")}
            {renderCheckbox("706868007", "Chronic confused state", "neurological")}
            {renderCheckbox("128294001", "Chronic nervous system disorder", "neurological")}
            {renderCheckbox("365061000", "Independent in activities of daily living", "neurological")}
            {renderCheckbox("371153006", "Partially dependent", "neurological")}
            {renderCheckbox("129839007", "Total dependency", "neurological")}
          </div>
        </div>
      </div>

      {/* ADVERTENCIA LEGAL ORIGINAL EXTRAPOLADA */}
      <div className="bg-blue-50 border border-blue-150 rounded-xl p-3 mb-4 text-[10px] text-blue-900 text-justify leading-relaxed shadow-sm">
        <strong>Advertencia legal:</strong> La presente declaración expresa mi voluntad en el ámbito sanitario y está redactada en forma de autodeterminación personal. Soy consciente de que, conforme al artículo 11 de la Ley 41/2002, las Instrucciones Previas solo adquieren plena eficacia jurídica si se formalizan según la normativa de la Comunidad Autónoma correspondiente y se inscriben en el Registro oficial. Por tanto, este documento no constituye una directiva anticipada jurídicamente vinculante. No obstante, de conformidad con el artículo 9 del Convenio de Oviedo, los deseos previamente expresados deberán ser tenidos en cuenta.
      </div>

      {/* TARJETA 1: DATOS IDENTIFICATIVOS COMPACTA */}
      <div className="mb-4">
        <div className={cardClass}>
          <div className={sectionTitle}>Datos Identificativos</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase">Nombre</label>
              <input type="text" className={inputClass} value={formData.firstName} onInput={e => setFormData({ ...formData, firstName: e.currentTarget.value })} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase">1º Apellido</label>
              <input type="text" className={inputClass} value={formData.surname1} onInput={e => setFormData({ ...formData, surname1: e.currentTarget.value })} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase">2º Apellido</label>
              <input type="text" className={inputClass} value={formData.surname2} onInput={e => setFormData({ ...formData, surname2: e.currentTarget.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase">Idioma</label>
              <select className={inputClass} value={formData.language} onChange={e => setFormData({ ...formData, language: e.currentTarget.value })}>
                <option value="ES">ES</option><option value="EN">EN</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase">Sexo</label>
              <select className={inputClass} value={formData.biologicalSex} onChange={e => setFormData({ ...formData, biologicalSex: e.currentTarget.value })}>
                <option value="M">M</option><option value="F">F</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-150 rounded-xl p-3 mb-4 text-[10px] text-blue-900 text-justify leading-relaxed shadow-sm">
        Declaro haber informado al contacto de emergencia indicado y haber obtenido su consentimiento para ser contactado exclusivamente en caso de necesidad sanitaria. Los datos personales facilitados serán tratados únicamente con fines de emergencia y de conformidad con la normativa vigente en materia de protección de datos de conformidad con el Reglamento (UE) 2016/679 y la Ley Orgánica 3/2018.
      </div>

      {/* TARJETA 2: CONTACTOS DE EMERGENCIA ORIGINAL CON SUS CLÁUSULAS */}
      <div className={cardClass}>
        <div className={sectionTitle}>Contactos de Emergencia</div>
        <div className="space-y-3">
          {formData.emergencyContacts.map((c, i) => (
            <div key={`contact-${i}`} className="border-b border-gray-100 pb-2 last:border-none last:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input type="text" placeholder="Nombre Contacto" className={inputClass} value={c.nombre} onInput={e => {
                  const newC = [...formData.emergencyContacts]; newC[i].nombre = e.currentTarget.value; setFormData({ ...formData, emergencyContacts: newC });
                }} />
                <input type="text" placeholder="Vínculo (ej. Hermano)" className={inputClass} value={c.vinculo || ''} onInput={e => {
                  const newC = [...formData.emergencyContacts]; newC[i].vinculo = e.currentTarget.value; setFormData({ ...formData, emergencyContacts: newC });
                }} />
                <input type="text" placeholder="Teléfono" className={inputClass} value={c.telefono} onInput={e => {
                  const newC = [...formData.emergencyContacts]; newC[i].telefono = e.currentTarget.value; setFormData({ ...formData, emergencyContacts: newC });
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={handleSave} className="bg-[#2eb0b0] text-white px-12 py-3 rounded-xl font-bold hover:bg-[#269393] shadow-md transition-all active:scale-95 uppercase tracking-wider text-[11px]">
          Actualizar Ficha Médica
        </button>
      </div>
    </div>
  );
}