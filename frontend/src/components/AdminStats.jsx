import { useState, useEffect } from "react";
import api from "../api/client";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => setErreur("Impossible de charger les statistiques."));
  }, []);

  if (erreur) return <div className="error-msg">{erreur}</div>;
  if (!stats) return <p className="empty-state">Chargement...</p>;

  return (
    <div className="card">
      <h3>Statistiques globales</h3>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="value">{stats.totalReservations}</div>
          <div className="label">Réservations totales</div>
        </div>
        <div className="stat-box">
          <div className="value">{stats.confirmees}</div>
          <div className="label">Confirmées</div>
        </div>
        <div className="stat-box">
          <div className="value">{stats.enAttente}</div>
          <div className="label">En attente</div>
        </div>
        <div className="stat-box">
          <div className="value">{stats.annuleesOuRefusees}</div>
          <div className="label">Annulées / refusées</div>
        </div>
        <div className="stat-box">
          <div className="value">{stats.revenusConfirmes.toLocaleString("fr-FR")}</div>
          <div className="label">Revenus confirmés (FCFA)</div>
        </div>
        <div className="stat-box">
          <div className="value">{stats.revenusEncaisses.toLocaleString("fr-FR")}</div>
          <div className="label">Revenus encaissés (FCFA)</div>
        </div>
      </div>
    </div>
  );
}
