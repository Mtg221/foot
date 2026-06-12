import { useState, useEffect } from "react";
import api from "../api/client";

const STATUTS_RESA = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  refusee: "Refusée",
  annulee: "Annulée",
};

const STATUTS_PAIEMENT = {
  non_paye: "Non payé",
  paye: "Payé",
};

function libelleCreneaux(creneaux) {
  return creneaux.map((h) => `${String(h).padStart(2, "0")}h-${String(h + 1).padStart(2, "0")}h`).join(", ");
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [erreur, setErreur] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreDate, setFiltreDate] = useState("");

  const charger = () => {
    const params = {};
    if (filtreStatut) params.statut = filtreStatut;
    if (filtreDate) params.date = filtreDate;
    api
      .get("/reservations", { params })
      .then((res) => setReservations(res.data))
      .catch(() => setErreur("Impossible de charger les réservations."));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreStatut, filtreDate]);

  const changerStatutReservation = async (id, statutReservation) => {
    try {
      await api.patch(`/reservations/${id}/statut`, { statutReservation });
      charger();
    } catch {
      setErreur("Erreur lors de la mise à jour du statut.");
    }
  };

  const changerStatutPaiement = async (id) => {
    try {
      await api.patch(`/reservations/${id}/paiement`, { statutPaiement: "paye" });
      charger();
    } catch {
      setErreur("Erreur lors de la mise à jour du paiement.");
    }
  };

  return (
    <div className="card">
      <h3>Réservations</h3>
      {erreur && <div className="error-msg">{erreur}</div>}

      <div className="filters">
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS_RESA).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <input type="date" value={filtreDate} onChange={(e) => setFiltreDate(e.target.value)} />
        {filtreDate && (
          <button className="btn btn-outline btn-small" onClick={() => setFiltreDate("")}>
            Effacer date
          </button>
        )}
      </div>

      {reservations.length === 0 ? (
        <p className="empty-state">Aucune réservation trouvée.</p>
      ) : (
        reservations.map((r) => (
          <div key={r._id} className="reservation-item">
            <div className="row">
              <strong>{r.nomClient}</strong>
              <span className={`status status-${r.statutReservation}`}>{STATUTS_RESA[r.statutReservation]}</span>
            </div>
            <div className="row">
              <span>{r.date}</span>
              <span>{libelleCreneaux(r.creneaux)}</span>
            </div>
            <div className="row">
              <span>📞 {r.telephoneClient}</span>
              <span>{r.prixTotal.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="row">
              <span>Paiement sur place</span>
              <span className={`status status-${r.statutPaiement}`}>{STATUTS_PAIEMENT[r.statutPaiement]}</span>
            </div>

            <div className="reservation-actions">
              {r.statutReservation === "en_attente" && (
                <>
                  <button className="btn btn-primary btn-small" onClick={() => changerStatutReservation(r._id, "confirmee")}>
                    Accepter
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => changerStatutReservation(r._id, "refusee")}>
                    Refuser
                  </button>
                </>
              )}
              {r.statutReservation === "confirmee" && (
                <button className="btn btn-danger btn-small" onClick={() => changerStatutReservation(r._id, "annulee")}>
                  Annuler
                </button>
              )}
              {r.statutPaiement !== "paye" && r.statutReservation !== "annulee" && r.statutReservation !== "refusee" && (
                <button className="btn btn-outline btn-small" onClick={() => changerStatutPaiement(r._id)}>
                  Marquer payé
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
