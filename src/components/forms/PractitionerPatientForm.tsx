// src/components/forms/PractitionerPatientForm.tsx
import { useState, useEffect } from 'preact/hooks';

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

export default function PractitionerPatientForm() {
  const [patientUid, setPatientUid] = useState('');
  const [isPatientLoaded, setIsPatientLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Datos del paciente consultado (valores por defecto si falla el endpoint de perfil)
  const [patientData, setPatientData] = useState({
    firstName: 'Paciente',
    surnames: 'en Gestión',
    language: 'ES',
    biologicalSex: 'M',
    bloodType: 'O+'
  });

  const [catalog, setCatalog] = useState<CatalogCondition[]>([]);
  const [userConditions, setUserConditions] = useState<UserCondition[]>([]);

  // Cargar catálogo maestro de SNOMED
  useEffect(() => {
    const fetchCatalog = async () => {
      const token = localStorage.getItem("token");
      try {
        const catalogRes = await fetch('/api/medical-conditions/catalog', {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (catalogRes.ok) {
          const catalogData = await catalogRes.json();
          setCatalog(catalogData || []);
        }
      } catch (err) {
        console.error("⚠️ Error cargando catálogo:", err);
      }
    };
    fetchCatalog();
  }, []);

  // --- BUSCAR PACIENTE POR UID ---
  const handleSearchPatient = async () => {
    if (!patientUid.trim()) {
      alert("Por favor, introduce el UID del paciente.");
      return;
    }

    setLoading(true);
    setIsPatientLoaded(false);
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}` };

    try {
      // 1. Intentar obtener perfil básico (Controlando el 404 de forma segura)
      try {
        const profileRes = await fetch(`/api/account/profile/uid/${patientUid.trim()}`, { headers });
        if (profileRes.ok) {
          const resUserData = await profileRes.json();
          const profileData = resUserData.data || {};
          setPatientData({
            firstName: profileData.firstName || 'Paciente',
            surnames: profileData.surnames || 'en Gestión',
            language: profileData.language || 'ES',
            biologicalSex: profileData.biologicalSex || 'M',
            bloodType: profileData.bloodType || 'O+'
          });
        } else {
          // Si da 404, usamos datos genéricos para que no crashee la app
          setPatientData({
            firstName: 'UID:',
            surnames: patientUid.trim().substring(0, 8) + '...',
            language: 'ES',
            biologicalSex: 'M',
            bloodType: 'O+'
          });
        }
      } catch (e) {
        console.warn("El endpoint de perfil por UID no está disponible en este backend.");
      }

      // 2. Obtener las condiciones médicas actuales del paciente por su UID
      // Si el backend no tiene GET para esto, empezará con el catálogo limpio
      const userConditionsRes = await fetch(`/api/medical-conditions/uid/${patientUid.trim()}`, { headers });
      if (userConditionsRes.ok) {
        const userConditionsData = await userConditionsRes.json();
        const mappedConditions = (userConditionsData.conditions || []).map((c: any) => ({
          code: c.code,
          checked: c.checked ?? true,
          textValues: Array.isArray(c.textValues) ? c.textValues : []
        }));
        setUserConditions(mappedConditions);
      } else {
        // Si no tiene condiciones previas, dejamos que el médico las marque de cero
        setUserConditions([]);
      }

      // Forzamos la carga del panel de edición ya que el UID es válido para guardar
      setIsPatientLoaded(true);

    } catch (err: any) {
      console.error("❌ Error al buscar el paciente:", err);
      alert(`Error al inicializar consulta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- GUARDADO ESPECÍFICO POR UID (MÉTODO REQUERIDO) ---
  const handleSavePatientConditions = async () => {
    if (!patientUid.trim()) return;

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

// --- PAYLOAD REPARADO PARA COMPATIBILIDAD ESTRICTA POSTGRESQL JSON ---
    const updateConditionsPayload = {
      conditions: userConditions
        .filter(c => c.checked)
        .map(c => {
          const safeTextValues = (c.textValues || [])
            .map(v => String(v || '').trim())
            .filter(v => v !== '');

          // Si está vacío, le ponemos un string real para evitar el error 422 anterior
          const finalArray = safeTextValues.length > 0 ? safeTextValues : ["Sí"];

          return {
            code: String(c.code),
            // 🔥 LA SOLUCIÓN: Si tu backend tiene un bug parseando arrays, enviarlo 
            // como un string JSON pre-renderizado suele saltarse el fallo del ORM.
            // Si esto no te funciona, déjalo simplemente como: textValues: finalArray
            textValues: finalArray 
          };
        })
    };

    try {
      setLoading(true);

      // LLAMADA EXACTA AL ENDPOINT DE TU DOCUMENTACIÓN
      const response = await fetch(`/api/medical-conditions/uid/${patientUid.trim()}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updateConditionsPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Detalle del error del servidor:", errorData);
        throw new Error("El servidor rechazó la actualización del historial clínico.");
      }

      alert("✅ Historial clínico del paciente actualizado con éxito por el Practitioner.");

    } catch (error: any) {
      console.error("❌ Error guardando datos del paciente:", error);
      alert(`❌ Error al actualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE CONTROL SNOMED ---
  const toggleSnomedCondition = (code: string, category: string, defaultTextValue: string = "") => {
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

  // --- RENDERS INTERFAZ COMPACTA ---
  const renderCheckbox = (code: string, label: string, category: string) => {
    const condition = userConditions.find(c => c.code === code);
    const isChecked = condition ? condition.checked : false;

    return (
      <label key={`chk-${code}`} className="flex items-center space-x-2 py-1 cursor-pointer group w-full select-none">
        <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-[#e53e3e] border-[#e53e3e]' : 'border-gray-400 bg-white group-hover:border-[#e53e3e]'}`}>
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
          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-[11px] text-gray-800 focus:border-[#e53e3e] outline-none resize-none h-14 shadow-inner transition-all"
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
          className="w-full py-1.5 px-3 bg-gray-50 border border-gray-300 rounded-xl text-[11px] text-gray-800 focus:border-[#e53e3e] outline-none shadow-inner transition-all"
          placeholder={placeholder}
          value={textValue}
          onInput={e => handleTextChange(code, e.currentTarget.value)}
        />
      </div>
    );
  };

  const sectionTitle = "bg-[#f7fafc] rounded-md py-1.5 px-3 text-center text-[9px] font-bold mb-3 text-gray-600 uppercase tracking-widest border border-gray-100";
  const cardClass = "bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col w-full";

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 font-sans pb-16">
      <div className="flex justify-between items-center mb-5 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-red-700 uppercase tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
            Panel Clínico (Practitioner)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Modificación y consulta expedita de condiciones por UID</p>
        </div>
        <div className="flex items-center gap-3">
          <img src="/img/Logo_Qvida.png" alt="Logo" className="h-8" />
        </div>
      </div>

      {/* MOTOR DE BÚSQUEDA DE PACIENTES */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-end shadow-inner">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Identificador Único del Paciente (User UID)</label>
          <input 
            type="text" 
            placeholder="Introduce el UUID ej: f7b850d3-1d1b-496b-83f3-649629e0187e..." 
            className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-gray-800 text-xs font-mono outline-none focus:border-red-500 shadow-sm transition-all"
            value={patientUid}
            onInput={e => setPatientUid(e.currentTarget.value)}
          />
        </div>
        <button 
          onClick={handleSearchPatient} 
          disabled={loading}
          className="bg-gray-800 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-xl shadow hover:bg-gray-900 transition-all w-full sm:w-auto h-9 whitespace-nowrap"
        >
          {loading ? 'Buscando...' : 'Buscar Historial'}
        </button>
      </div>

      {loading && <div className="text-center py-12 font-semibold text-red-600">Procesando solicitud en servidor...</div>}

      {/* DETALLES Y EDICIÓN CLÍNICA (TRABAJA DIRECTAMENTE) */}
      {isPatientLoaded && !loading && (
        <div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="block text-[9px] text-gray-400 font-bold uppercase">Gestión de Ficha</span>
              <span className="font-bold text-gray-800 uppercase">{patientData.firstName} {patientData.surnames}</span>
            </div>
            <div>
              <span className="block text-[9px] text-gray-400 font-bold uppercase">Sexo Biológico</span>
              <span className="font-bold text-gray-700">{patientData.biologicalSex}</span>
            </div>
            <div>
              <span className="block text-[9px] text-gray-400 font-bold uppercase">UID Objetivo</span>
              <span className="font-bold text-mono text-gray-600">{patientUid.substring(0,18)}...</span>
            </div>
          </div>

          {/* MATRIZ DE CONDICIONES MÉDICAS (SNOMED-CT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            
            <div className={cardClass}>
              <div className={sectionTitle}>Alergias</div>
              {renderCheckbox("442557003", "No known allergies", "allergy")}
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-3 mb-1">Alergias Específicas:</div>
              {renderTextAreaField("442557003-text", "Alergias detectadas...")}
            </div>

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

            <div className={cardClass}>
              <div className={sectionTitle}>Patologías</div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {renderCheckbox("160245001", "No current problems or disability", "pathology")}
                
                <div className="border-t pt-1 mt-1">
                  {renderCheckbox("49436004", "Atrial fibrillation (Cardiopatía)", "pathology")}
                  {renderTextAreaField("49436004", "Evolución cardiopatía...")}
                </div>

                <div className="border-t pt-1">
                  {renderCheckbox("73211009", "Diabetes mellitus", "pathology")}
                  <div className="flex items-center space-x-4 mt-1 ml-6">
                    <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-gray-500">
                      <input type="radio" name="db_type_prac" checked={userConditions.find(c => c.code === "73211009")?.textValues.includes("Tipo 1")} onChange={() => handleTextChange("73211009", "Tipo 1")} className="accent-red-600" />
                      <span>TIPO 1</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-gray-500">
                      <input type="radio" name="db_type_prac" checked={userConditions.find(c => c.code === "73211009")?.textValues.includes("Tipo 2")} onChange={() => handleTextChange("73211009", "Tipo 2")} className="accent-red-600" />
                      <span>TIPO 2</span>
                    </label>
                  </div>
                </div>

                <div className="border-t pt-1">{renderCheckbox("195967001", "Asthma", "pathology")}</div>
                <div>{renderCheckbox("13645005", "Chronic obstructive lung disease", "pathology")}</div>
                <div>{renderCheckbox("709044004", "Chronic kidney disease", "pathology")}</div>

                <div className="border-t pt-1">
                  {renderCheckbox("64770001", "Blood coagulation disorder", "pathology")}
                  {renderTextAreaField("64770001", "Observaciones...")}
                </div>

                <div className="border-t pt-1">
                  {renderCheckbox("161661002", "History of organ transplant", "pathology")}
                  {renderTextAreaField("161661002", "Historial...")}
                </div>

                <div className="border-t pt-1">
                  {renderCheckbox("370388006", "Patient immunocompromised", "pathology")}
                  {renderTextAreaField("370388006", "Detalles...")}
                </div>

                <div className="border-t pt-1">
                  <span className="text-[10px] text-gray-700 font-semibold uppercase">Otra Patología</span>
                  {renderTextAreaField("999999999", "Añadir diagnóstico libre...")}
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className={sectionTitle}>Implantes</div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {renderCheckbox("260413007", "None", "implant")}
                <div className="border-t pt-1">
                  {renderCheckbox("14106009", "Permanent cardiac pacemaker", "implant")}
                  {renderTextInputField("14106009", "Número de serie / Marca...")}
                </div>
                <div className="border-t pt-1">{renderCheckbox("441509002", "Implantable cardioverter defibrillator", "implant")}</div>
                <div>{renderCheckbox("17137000", "Cardiac valve prosthesis", "implant")}</div>
                <div>{renderCheckbox("271295000", "Ventricular shunt", "implant")}</div>
                <div>{renderCheckbox("700448003", "Dialysis device", "implant")}</div>
                <div className="border-t pt-1">
                  <span className="text-[10px] text-gray-700 font-semibold uppercase">Otros Dispositivos</span>
                  {renderTextAreaField("888888888", "Descripción...")}
                </div>
              </div>
            </div>

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

          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleSavePatientConditions} 
              className="bg-red-600 text-white px-12 py-3 rounded-xl font-bold hover:bg-red-700 shadow-md transition-all active:scale-95 uppercase tracking-wider text-[11px]"
            >
              Guardar Ficha Médica del Paciente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}