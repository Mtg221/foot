import { useState, useEffect } from "react";
import api from "../api/client";

const STATUTS_RESA = { en_attente:"En attente", confirmee:"Confirmée", refusee:"Refusée", annulee:"Annulée" };
const STATUTS_PAY  = { non_paye:"Non payé", paye:"Payé" };

function fmtHeure(h) { return `${String(h).padStart(2,"0")}h–${String(h+1).padStart(2,"0")}h`; }
function fmtDate(d)  {
  return new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short" });
}

export default function AdminReservations() {
  const [list, setList]         = useState([]);
  const [erreur, setErreur]     = useState("");
  const [statut, setStatut]     = useState("");
  const [dateF, setDateF]       = useState("");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);

  const charger = () => {
    setLoading(true);
    const params = {};
    if (statut) params.statut = statut;
    if (dateF)  params.date   = dateF;
    api.get("/reservations", { params })
      .then(r => setList(r.data))
      .catch(() => setErreur("Impossible de charger les réservations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, [statut, dateF]);

  const updateStatut = async (id, statutReservation) => {
    try { await api.patch(`/reservations/${id}/statut`, { statutReservation }); charger(); }
    catch { setErreur("Erreur lors de la mise à jour."); }
  };

  const marquerPaye = async (id) => {
    try { await api.patch(`/reservations/${id}/paiement`, { statutPaiement:"paye" }); charger(); }
    catch { setErreur("Erreur lors de la mise à jour du paiement."); }
  };

  const filtered = list.filter(r =>
    !search || r.nomClient?.toLowerCase().includes(search.toLowerCase()) ||
    r.telephoneClient?.includes(search)
  );

  const countByStatut = (s) => list.filter(r => r.statutReservation === s).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:"1.3rem", fontWeight:900, color:"var(--gray-900)", margin:0 }}>Réservations</h2>
          <p style={{ fontSize:"0.85rem", color:"var(--gray-500)", marginTop:4 }}>{list.length} réservation{list.length>1?"s":""} au total</p>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { s:"en_attente", label:"En attente", bg:"#fef3c7", color:"#92400e" },
          { s:"confirmee",  label:"Confirmées", bg:"var(--green-light)", color:"var(--green-dark)" },
          { s:"annulee",    label:"Annulées",   bg:"#fee2e2", color:"#991b1b" },
        ].map(({ s, label, bg, color }) => (
          <button key={s} onClick={() => setStatut(statut===s?"":s)} style={{
            background: statut===s ? color : bg,
            color: statut===s ? "#fff" : color,
            border: `1.5px solid ${color}33`,
            borderRadius: 100, padding:"6px 16px",
            fontSize:"0.8rem", fontWeight:700, cursor:"pointer",
            transition:"all .15s"
          }}>
            {countByStatut(s)} {label}
          </button>
        ))}
        {statut && (
          <button onClick={() => setStatut("")} style={{
            background:"var(--gray-100)", color:"var(--gray-600)", border:"none",
            borderRadius:100, padding:"6px 14px", fontSize:"0.8rem", fontWeight:600, cursor:"pointer"
          }}>✕ Tout voir</button>
        )}
      </div>

      {/* Filters */}
      <div className="filters" style={{ marginBottom:16 }}>
        <input className="filter-input" placeholder="🔍 Rechercher un client..." value={search}
          onChange={e => setSearch(e.target.value)} style={{flex:1, minWidth:160}} />
        <input type="date" className="filter-input" value={dateF} onChange={e => setDateF(e.target.value)} />
        {dateF && <button className="btn btn-ghost btn-sm" onClick={() => setDateF("")}>✕ Date</button>}
      </div>

      {erreur && <div className="error-msg">⚠️ {erreur}</div>}

      {loading ? (
        <div className="empty-state">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize:"2rem", marginBottom:12 }}>📭</div>
          Aucune réservation trouvée.
        </div>
      ) : (
        <div>
          {filtered.map(r => (
            <div key={r._id} className="reservation-item">
              <div className="res-header">
                <div>
                  <div className="res-name">{r.nomClient}</div>
                  <div className="res-meta">📞 {r.telephoneClient}</div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <span className={`status status-${r.statutReservation}`}>{STATUTS_RESA[r.statutReservation]}</span>
                  <span className={`status status-${r.statutPaiement}`}>{STATUTS_PAY[r.statutPaiement]}</span>
                </div>
              </div>

              <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:8, fontSize:"0.875rem", color:"var(--gray-600)" }}>
                <span>📅 {fmtDate(r.date)}</span>
                <span>🕐 {r.creneaux.map(fmtHeure).join(", ")}</span>
                <span style={{ fontWeight:700, color:"var(--green-dark)" }}>
                  {r.prixTotal.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              <div className="res-actions">
                {r.statutReservation === "en_attente" && (
                  <>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => updateStatut(r._id, "confirmee")}>
                      ✓ Accepter
                    </button>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => updateStatut(r._id, "refusee")}>
                      ✕ Refuser
                    </button>
                  </>
                )}
                {r.statutReservation === "confirmee" && (
                  <button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}}
                    onClick={() => updateStatut(r._id, "annulee")}>
                    Annuler
                  </button>
                )}
                {r.statutPaiement !== "paye" && !["annulee","refusee"].includes(r.statutReservation) && (
                  <button className="btn btn-outline btn-sm"
                    onClick={() => marquerPaye(r._id)}>
                    💰 Marquer payé
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
