import { useState, useEffect } from "react";
import api from "../api/client";

function todayStr() { return new Date().toISOString().split("T")[0]; }
function addDays(d, n) {
  const dt = new Date(d + "T00:00:00"); dt.setDate(dt.getDate()+n);
  return dt.toISOString().split("T")[0];
}
function fmtDate(d) {
  return new Date(d+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
}

export default function AdminCreneaux() {
  const [date, setDate]       = useState(todayStr());
  const [slots, setSlots]     = useState([]);
  const [erreur, setErreur]   = useState("");
  const [loading, setLoading] = useState(false);

  const charger = () => {
    setLoading(true);
    api.get("/terrain/disponibilites", { params: { date } })
      .then(r => setSlots(r.data.disponibilites))
      .catch(() => setErreur("Impossible de charger les créneaux."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, [date]);

  const toggle = async (slot) => {
    if (slot.reserveParClient) {
      setErreur("Ce créneau est réservé par un client. Annulez la réservation pour le libérer.");
      return;
    }
    try {
      await api.post(slot.bloquePropriétaire ? "/terrain/debloquer" : "/terrain/bloquer", { date, heure: slot.heure });
      charger();
    } catch { setErreur("Erreur lors de la mise à jour."); }
  };

  const libre    = slots.filter(s => s.disponible).length;
  const bloques  = slots.filter(s => s.bloquePropriétaire).length;
  const reserves = slots.filter(s => s.reserveParClient).length;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:"1.3rem", fontWeight:900, color:"var(--gray-900)", margin:0 }}>Gestion des créneaux</h2>
        <p style={{ fontSize:"0.85rem", color:"var(--gray-500)", marginTop:4 }}>
          Bloquez des créneaux pour les rendre indisponibles (entretien, événement privé…)
        </p>
      </div>

      {/* Date nav */}
      <div style={{ background:"var(--white)", border:"1px solid var(--gray-200)", borderRadius:16, padding:20, marginBottom:20, boxShadow:"var(--shadow-sm)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <button onClick={() => setDate(addDays(date,-1))} style={{
            width:36, height:36, borderRadius:8, background:"var(--gray-100)", border:"none",
            cursor:"pointer", fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center"
          }}>◀</button>
          <div style={{ flex:1, textAlign:"center", fontWeight:700, color:"var(--gray-900)" }}>
            {fmtDate(date)}
          </div>
          <button onClick={() => setDate(addDays(date,1))} style={{
            width:36, height:36, borderRadius:8, background:"var(--gray-100)", border:"none",
            cursor:"pointer", fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center"
          }}>▶</button>
        </div>
        <input type="date" className="date-input" value={date}
          onChange={e => setDate(e.target.value)} style={{marginBottom:0}} />
      </div>

      {/* Summary */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { count:libre,    label:"Libres",   bg:"var(--green-light)",  color:"var(--green-dark)" },
          { count:reserves, label:"Réservés", bg:"#dbeafe",             color:"#1d4ed8"           },
          { count:bloques,  label:"Bloqués",  bg:"#fee2e2",             color:"#dc2626"           },
        ].map(({ count, label, bg, color }) => (
          <div key={label} style={{
            background:bg, color, borderRadius:100,
            padding:"6px 16px", fontSize:"0.8rem", fontWeight:700
          }}>
            {count} {label}
          </div>
        ))}
      </div>

      {erreur && <div className="error-msg" style={{marginBottom:16}}>⚠️ {erreur}</div>}

      {/* Legend */}
      <div style={{ display:"flex", gap:16, marginBottom:14, flexWrap:"wrap" }}>
        {[
          { bg:"var(--green-light)", border:"var(--green)", label:"Libre (cliquer pour bloquer)" },
          { bg:"#fee2e2",            border:"#dc2626",      label:"Bloqué par vous"              },
          { bg:"#dbeafe",            border:"#93c5fd",      label:"Réservé par un client"        },
        ].map(({ bg, border, label }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.78rem", color:"var(--gray-500)" }}>
            <div style={{ width:12, height:12, borderRadius:3, background:bg, border:`1.5px solid ${border}` }} />
            {label}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Chargement...</div>
      ) : (
        <div className="slots-grid">
          {slots.map(slot => {
            const isBloq = slot.bloquePropriétaire;
            const isRes  = slot.reserveParClient;
            return (
              <button key={slot.heure} type="button" onClick={() => toggle(slot)}
                disabled={isRes}
                style={{
                  position:"relative", border:"1.5px solid",
                  borderColor: isRes ? "#93c5fd" : isBloq ? "#dc2626" : "var(--green)",
                  background:  isRes ? "#dbeafe" : isBloq ? "#fee2e2" : "var(--green-light)",
                  color:       isRes ? "#1d4ed8" : isBloq ? "#dc2626" : "var(--green-dark)",
                  borderRadius:"var(--radius)", padding:"12px 6px",
                  fontSize:"0.82rem", fontWeight:700, textAlign:"center",
                  cursor: isRes ? "default" : "pointer",
                  transition:"all .15s", lineHeight:1.4
                }}>
                <div style={{ fontSize:"0.9rem", fontWeight:800 }}>
                  {String(slot.heure).padStart(2,"0")}h–{String(slot.heure+1).padStart(2,"0")}h
                </div>
                <div style={{ fontSize:"0.7rem", marginTop:3, opacity:.8 }}>
                  {isRes ? "👤 Client" : isBloq ? "🔒 Bloqué" : "✓ Libre"}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
