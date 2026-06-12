import { useState, useEffect } from "react";
import api from "../api/client";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function AdminCreneaux() {
  const [date, setDate] = useState(todayStr());
  const [disponibilites, setDisponibilites] = useState([]);
  const [erreur, setErreur] = useState("");

  const charger = () => {
    api
      .get("/terrain/disponibilites", { params: { date } })
      .then((res) => setDisponibilites(res.data.disponibilites))
      .catch(() => setErreur("Impossible de charger les créneaux."));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const toggleBlocage = async (slot) => {
    setErreur("");
    if (slot.reserveParClient) {
      setErreur("Ce créneau est réservé par un client. Annulez la réservation dans l'onglet Réservations pour le libérer.");
      return;
    }
    try {
      if (slot.bloquePropriétaire) {
        await api.post("/terrain/debloquer", { date, heure: slot.heure });
      } else {
        await api.post("/terrain/bloquer", { date, heure: slot.heure });
      }
      charger();
    } catch {
      setErreur("Erreur lors de la mise à jour du créneau.");
    }
  };

  return (
    <div className="card">
      <h3>Bloquer / débloquer des créneaux</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--gris)" }}>
        Bloquez un créneau pour le rendre indisponible (entretien, événement privé...). Les créneaux déjà réservés par
        un client ne peuvent pas être débloqués ici — annulez la réservation correspondante dans l'onglet
        Réservations.
      </p>
      {erreur && <div className="error-msg">{erreur}</div>}
      <input type="date" className="date-picker" value={date} onChange={(e) => setDate(e.target.value)} />

      <div className="slots-grid">
        {disponibilites.map((slot) => (
          <button
            key={slot.heure}
            type="button"
            className={`slot-btn ${slot.bloquePropriétaire ? "selected" : ""} ${slot.reserveParClient ? "" : ""}`}
            disabled={slot.reserveParClient}
            onClick={() => toggleBlocage(slot)}
          >
            {slot.libelle} {slot.bloquePropriétaire ? "🔒" : slot.reserveParClient ? "👤" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
