// src/pages/Timeline.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVetVisits, getVaccines, getMedications, getSymptoms, saveMedication, deleteMedication, saveSymptom, deleteSymptom, getDog } from "../db/db";
import { validateMedicationForm, validateSymptomForm } from "../utils/validate";
import FieldError from "../components/FieldError";

const DOT = { vet:"#38bdf8", vaccine:"#a78bfa", medication:"#4ade80", symptom:"#fb923c" };
const SEV = { mild:"#4ade80", moderate:"#f59e0b", severe:"#f87171" };
const SEV_LABEL = { mild:"Mild", moderate:"Moderate", severe:"Severe" };

function build(dogId) {
  const ev = [];
  getVetVisits(dogId).forEach(v   => ev.push({ id:v.id, date:v.date,      type:"vet",        icon:"🏥", title:v.reason||"Vet Visit",       sub:[v.clinic,v.vet].filter(Boolean).join(" · "), notes:v.notes }));
  getVaccines(dogId).forEach(v    => ev.push({ id:v.id, date:v.dateGiven,  type:"vaccine",    icon:"💉", title:v.name||"Vaccine",            sub:v.nextDueDate?`Next due: ${v.nextDueDate}`:"" }));
  getMedications(dogId).forEach(m => ev.push({ id:m.id, date:m.startDate,  type:"medication", icon:"💊", title:m.name||"Medication",         sub:[m.dosage,m.frequency].filter(Boolean).join(" · "), raw:m }));
  getSymptoms(dogId).forEach(s    => ev.push({ id:s.id, date:s.date,       type:"symptom",    icon:"📝", title:s.description||"Symptom",     sub:s.severity?`Severity: ${s.severity}`:"", severity:s.severity, raw:s }));
  return ev.filter(e=>e.date).sort((a,b)=>new Date(b.date)-new Date(a.date));
}

function fmtMonth(str) {
  if (!str) return "";
  const [y,m] = str.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${y}`;
}
function fmtDate(str) {
  if (!str) return "";
  const [y,m,d] = str.split("-");
  return `${d}/${m}/${y}`;
}
function exportJSON(dog, events) {
  const blob = new Blob([JSON.stringify({ exportedAt:new Date().toISOString(), dog:{name:dog.name,breed:dog.breed,age:dog.age}, records:events }, null, 2)], { type:"application/json" });
  const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`${dog.name||"dog"}-pawlog.json` });
  a.click(); URL.revokeObjectURL(a.href);
}

const FILTERS = [
  { key:"all", label:"All" }, { key:"vet", label:"🏥 Vet" },
  { key:"vaccine", label:"💉 Vacc" }, { key:"medication", label:"💊 Meds" }, { key:"symptom", label:"📝 Symp" },
];

const EMPTY_MED = { name:"", dosage:"", frequency:"", startDate:"", endDate:"" };
const EMPTY_SYM = { date:"", description:"", severity:"mild" };

export default function Timeline() {
  const { id: dogId } = useParams();
  const navigate = useNavigate();
  const dog = getDog(dogId);
  const [events, setEvents]   = useState([]);
  const [filter, setFilter]   = useState("all");
  const [query, setQuery]     = useState("");
  const [panel, setPanel]     = useState(null);
  const [medForm, setMedForm] = useState(EMPTY_MED);
  const [symForm, setSymForm] = useState(EMPTY_SYM);
  const [medId, setMedId]     = useState(null);
  const [symId, setSymId]     = useState(null);
  const [medErr, setMedErr]   = useState({});
  const [symErr, setSymErr]   = useState({});

  const today = new Date().toISOString().split("T")[0];

  function refresh() { setEvents(build(dogId)); }
  useEffect(() => { refresh(); }, [dogId]);

  function openAddMed()   { setMedForm(EMPTY_MED); setMedId(null); setMedErr({}); setPanel("med"); }
  function openEditMed(e) { setMedForm({ name:e.raw.name, dosage:e.raw.dosage, frequency:e.raw.frequency, startDate:e.raw.startDate, endDate:e.raw.endDate||"" }); setMedId(e.id); setMedErr({}); setPanel("med"); }
  function saveMed() {
    const { valid, errors:errs } = validateMedicationForm(medForm);
    if (!valid) { setMedErr(errs); return; }
    saveMedication({ ...medForm, dogId, ...(medId?{id:medId}:{}) });
    refresh(); setPanel(null);
  }
  function delMed(id) { if (!window.confirm("Delete medication?")) return; deleteMedication(id); refresh(); }

  function openAddSym()   { setSymForm(EMPTY_SYM); setSymId(null); setSymErr({}); setPanel("sym"); }
  function openEditSym(e) { setSymForm({ date:e.raw.date, description:e.raw.description, severity:e.raw.severity }); setSymId(e.id); setSymErr({}); setPanel("sym"); }
  function saveSym() {
    const { valid, errors:errs } = validateSymptomForm(symForm);
    if (!valid) { setSymErr(errs); return; }
    saveSymptom({ ...symForm, dogId, ...(symId?{id:symId}:{}) });
    refresh(); setPanel(null);
  }
  function delSym(id) { if (!window.confirm("Delete symptom?")) return; deleteSymptom(id); refresh(); }

  const filtered = events.filter(e => {
    const matchType  = filter === "all" || e.type === filter;
    const matchQuery = !query || [e.title, e.sub||"", e.notes||""].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const grouped = filtered.reduce((acc,e) => {
    const k = e.date?.slice(0,7) || "Unknown";
    (acc[k]=acc[k]||[]).push(e);
    return acc;
  }, {});

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(`/dog/${dogId}`)}>← {dog?.name || "Back"}</button>
      <header className="page__header">
        <h1 className="page__title">📊 Timeline</h1>
        {dog && <button className="tl-export-btn" onClick={() => exportJSON(dog, events)}>⬇ Export</button>}
      </header>

      {/* Quick add */}
      <div className="tl-quick-add">
        <button className="tl-quick-btn" onClick={openAddMed}>+ Medication</button>
        <button className="tl-quick-btn" onClick={openAddSym}>+ Symptom</button>
      </div>

      {/* Med form */}
      {panel === "med" && (
        <div className="card">
          <h2 className="card__title">{medId ? "Edit Medication" : "New Medication"}</h2>
          <div className="form">
            <label className="form__label">Name *</label>
            <input className={`form__input ${medErr.name?"form__input--error":""}`} value={medForm.name} maxLength={100} onChange={e=>setMedForm({...medForm,name:e.target.value})} placeholder="e.g. Amoxicillin" />
            <FieldError msg={medErr.name} />
            <label className="form__label">Dosage</label>
            <input className="form__input" value={medForm.dosage} maxLength={50} onChange={e=>setMedForm({...medForm,dosage:e.target.value})} placeholder="e.g. 250mg" />
            <label className="form__label">Frequency</label>
            <input className="form__input" value={medForm.frequency} maxLength={50} onChange={e=>setMedForm({...medForm,frequency:e.target.value})} placeholder="e.g. Twice daily" />
            <label className="form__label">Start Date *</label>
            <input className={`form__input ${medErr.startDate?"form__input--error":""}`} type="date" value={medForm.startDate} max={today} onChange={e=>setMedForm({...medForm,startDate:e.target.value})} />
            <FieldError msg={medErr.startDate} />
            <label className="form__label">End Date (optional)</label>
            <input className="form__input" type="date" value={medForm.endDate} min={medForm.startDate||today} onChange={e=>setMedForm({...medForm,endDate:e.target.value})} />
            <FieldError msg={medErr.endDate} />
            <div className="form__actions">
              <button className="btn btn--secondary" onClick={()=>setPanel(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={saveMed}>{medId?"Update":"Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Symptom form */}
      {panel === "sym" && (
        <div className="card">
          <h2 className="card__title">{symId ? "Edit Symptom" : "Log Symptom"}</h2>
          <div className="form">
            <label className="form__label">Date *</label>
            <input className={`form__input ${symErr.date?"form__input--error":""}`} type="date" value={symForm.date} max={today} onChange={e=>setSymForm({...symForm,date:e.target.value})} />
            <FieldError msg={symErr.date} />
            <label className="form__label">Description *</label>
            <textarea className={`form__textarea ${symErr.description?"form__input--error":""}`} value={symForm.description} maxLength={300} rows={3} onChange={e=>setSymForm({...symForm,description:e.target.value})} placeholder="Describe the symptom..." />
            <div className="form__char-count">{symForm.description.length}/300</div>
            <FieldError msg={symErr.description} />
            <label className="form__label">Severity</label>
            <div className="radio-group">
              {["mild","moderate","severe"].map(s => (
                <label key={s} className={`radio-option ${symForm.severity===s?"radio-option--active":""}`}>
                  <input type="radio" name="sev" value={s} checked={symForm.severity===s} onChange={()=>setSymForm({...symForm,severity:s})} />
                  {SEV_LABEL[s]}
                </label>
              ))}
            </div>
            <div className="form__actions">
              <button className="btn btn--secondary" onClick={()=>setPanel(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={saveSym}>{symId?"Update":"Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <input className="form__input" placeholder="🔍 Search records..." value={query} onChange={e=>setQuery(e.target.value)} style={{marginBottom:12}} />
      <div className="filter-chips">
        {FILTERS.map(f => (
          <button key={f.key} className={`filter-chip ${filter===f.key?"filter-chip--active":""}`} onClick={()=>setFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <p className="empty-state__text">{query ? "No records match your search." : "No records yet."}</p>
        </div>
      )}

      <div className="timeline">
        {Object.entries(grouped).map(([month, evts]) => (
          <div key={month} className="timeline__group">
            <div className="timeline__month-label">{fmtMonth(month)}</div>
            {evts.map((e, i) => (
              <div key={e.id} className="timeline__item">
                <div className="timeline__line-wrap">
                  <div className="timeline__dot" style={{background: DOT[e.type]||"#888"}} />
                  {i < evts.length-1 && <div className="timeline__line" />}
                </div>
                <div className="timeline__content">
                  <div className="timeline__header">
                    <span className="timeline__icon">{e.icon}</span>
                    <span className="timeline__title">{e.title.length>50?e.title.slice(0,50)+"…":e.title}</span>
                    <span className="timeline__date">{fmtDate(e.date)}</span>
                  </div>
                  {e.sub && <p className="timeline__sub">{e.sub}</p>}
                  {e.notes && <p className="timeline__notes">{e.notes}</p>}
                  {e.severity && (
                    <span className="badge" style={{background:SEV[e.severity]+"33", color:SEV[e.severity], marginTop:4, display:"inline-block"}}>
                      {SEV_LABEL[e.severity]}
                    </span>
                  )}
                  {(e.type==="medication"||e.type==="symptom") && (
                    <div className="list-item__actions" style={{marginTop:8}}>
                      <button className="btn btn--secondary btn--xs" onClick={()=>e.type==="medication"?openEditMed(e):openEditSym(e)}>Edit</button>
                      <button className="btn btn--danger btn--xs" onClick={()=>e.type==="medication"?delMed(e.id):delSym(e.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
