import { useState, useEffect } from "react";
import api from "../api/client";

function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={color ? {color} : {}}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [erreur, setErreur] = useState("");
  const [range, setRange] = useState({ dateDebut: "", dateFin: "" });

  const charger = () => {
    api.get("/admin/stats", { params: range })
      .then(r => setStats(r.data))
      .catch(() => setErreur("Impossible de charger les statistiques."));
  };

  useEffect(() => { charger(); }, [range]);

  if (erreur) return <div className="error-msg">⚠️ {erreur}</div>;

  const taux = stats && stats.totalReservations > 0
    ? Math.round((stats.confirmees / stats.totalReservations) * 100)
    : 0;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:"1.3rem", fontWeight:900, color:"var(--gray-900)", margin:0 }}>Tableau de bord</h2>
          <p style={{ fontSize:"0.85rem", color:"var(--gray-500)", marginTop:4 }}>Vue d'ensemble des réservations</p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <input type="date" className="filter-input" placeholder="Début"
            value={range.dateDebut} onChange={e => setRange(p => ({...p, dateDebut: e.target.value}))} />
          <input type="date" className="filter-input" placeholder="Fin"
            value={range.dateFin} onChange={e => setRange(p => ({...p, dateFin: e.target.value}))} />
          {(range.dateDebut || range.dateFin) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => setRange({ dateDebut:"", dateFin:"" })}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {!stats ? (
        <div className="empty-state">Chargement...</div>
      ) : (
        <>
          <div className="admin-grid">
            <StatCard icon="📋" value={stats.totalReservations} label="Total réservations" />
            <StatCard icon="✅" value={stats.confirmees} label="Confirmées" color="var(--green-dark)" />
            <StatCard icon="⏳" value={stats.enAttente} label="En attente" color="#d97706" />
            <StatCard icon="❌" value={stats.annuleesOuRefusees} label="Annulées / refusées" color="#dc2626" />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginBottom:24 }}>
            <div style={{ background:"var(--white)", border:"1px solid var(--gray-200)", borderRadius:16, padding:24, boxShadow:"var(--shadow-sm)" }}>
              <div style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:12 }}>
                Revenus confirmés
              </div>
              <div style={{ fontSize:"2rem", fontWeight:900, color:"var(--green-dark)" }}>
                {stats.revenusConfirmes.toLocaleString("fr-FR")}
              </div>
              <div style={{ fontSize:"0.8rem", color:"var(--gray-400)", marginTop:4 }}>FCFA</div>
            </div>
            <div style={{ background:"var(--white)", border:"1px solid var(--gray-200)", borderRadius:16, padding:24, boxShadow:"var(--shadow-sm)" }}>
              <div style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:12 }}>
                Revenus encaissés
              </div>
              <div style={{ fontSize:"2rem", fontWeight:900, color:"var(--green-dark)" }}>
                {stats.revenusEncaisses.toLocaleString("fr-FR")}
              </div>
              <div style={{ fontSize:"0.8rem", color:"var(--gray-400)", marginTop:4 }}>FCFA</div>
            </div>
            <div style={{ background:"var(--white)", border:"1px solid var(--gray-200)", borderRadius:16, padding:24, boxShadow:"var(--shadow-sm)" }}>
              <div style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:12 }}>
                Taux de confirmation
              </div>
              <div style={{ fontSize:"2rem", fontWeight:900, color: taux >= 70 ? "var(--green-dark)" : taux >= 40 ? "#d97706" : "#dc2626" }}>
                {taux}%
              </div>
              <div style={{ fontSize:"0.8rem", color:"var(--gray-400)", marginTop:4 }}>des réservations acceptées</div>
              <div style={{ marginTop:10, background:"var(--gray-100)", borderRadius:100, height:6, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${taux}%`, background:"linear-gradient(90deg,var(--green),var(--green-dark))", borderRadius:100, transition:"width .5s" }} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
