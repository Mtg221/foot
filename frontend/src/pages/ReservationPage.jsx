import { useState, useEffect } from "react";
import api from "../api/client";

function formatDateLocale(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function todayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export default function ReservationPage() {
  const [terrain, setTerrain] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [disponibilites, setDisponibilites] = useState([]);
  const [creneauxSelectionnes, setCreneauxSelectionnes] = useState([]);
  const [prixParHeure, setPrixParHeure] = useState(0);

  const [nomClient, setNomClient] = useState("");
  const [telephoneClient, setTelephoneClient] = useState("");

  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(null);

  // Charger les infos du terrain une fois
  useEffect(() => {
    api
      .get("/terrain")
      .then((res) => setTerrain(res.data))
      .catch(() => setErreur("Impossible de charger les informations du terrain."));
  }, []);

  // Charger les disponibilités à chaque changement de date
  useEffect(() => {
    const fetchDisponibilites = async () => {
      setErreur("");
      try {
        const res = await api.get("/terrain/disponibilites", { params: { date } });
        setDisponibilites(res.data.disponibilites);
        setPrixParHeure(res.data.prixParHeure);
        setCreneauxSelectionnes([]);
      } catch {
        setErreur("Impossible de charger les disponibilités.");
        setCreneauxSelectionnes([]);
      }
    };
    fetchDisponibilites();
  }, [date]);

  const toggleCreneau = (heure) => {
    setCreneauxSelectionnes((prev) =>
      prev.includes(heure) ? prev.filter((h) => h !== heure) : [...prev, heure].sort((a, b) => a - b)
    );
  };

  const prixTotal = creneauxSelectionnes.length * prixParHeure;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces(null);

    if (creneauxSelectionnes.length === 0) {
      setErreur("Sélectionnez au moins un créneau horaire.");
      return;
    }
    if (!nomClient.trim() || !telephoneClient.trim()) {
      setErreur("Veuillez renseigner votre nom et votre numéro de téléphone.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nomClient: nomClient.trim(),
        telephoneClient: telephoneClient.trim(),
        date,
        creneaux: creneauxSelectionnes,
      };
      const res = await api.post("/reservations", payload);
      setSucces(res.data);
      setCreneauxSelectionnes([]);
      // Rafraîchir les disponibilités
      const dispo = await api.get("/terrain/disponibilites", { params: { date } });
      setDisponibilites(dispo.data.disponibilites);
    } catch (err) {
      if (err.response?.status === 409) {
        setErreur(err.response.data.message + " Veuillez choisir un autre créneau.");
        // Rafraîchir les disponibilités car elles ont changé
        const dispo = await api.get("/terrain/disponibilites", { params: { date } });
        setDisponibilites(dispo.data.disponibilites);
        setCreneauxSelectionnes([]);
      } else {
        setErreur("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (succes) {
    return (
      <main>
        <div className="success-msg">
          <strong>Réservation enregistrée !</strong>
        </div>
        <div className="card">
          <h2>Récapitulatif</h2>
          <div className="summary-row">
            <span>Date</span>
            <span>{formatDateLocale(succes.date)}</span>
          </div>
          <div className="summary-row">
            <span>Créneaux</span>
            <span>
              {succes.creneaux.map((h) => `${String(h).padStart(2, "0")}h-${String(h + 1).padStart(2, "0")}h`).join(", ")}
            </span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{succes.prixTotal.toLocaleString("fr-FR")} FCFA</span>
          </div>
          {succes.modePaiement === "acompte" && (
            <div className="summary-row">
              <span>Acompte ({succes.methodePaiement === "wave" ? "Wave" : "Orange Money"})</span>
              <span>{succes.montantAcompte.toLocaleString("fr-FR")} FCFA</span>
            </div>
          )}
          <div className="summary-row">
            <span>Statut</span>
            <span className={`status status-${succes.statutReservation}`}>
              {succes.statutReservation === "en_attente" ? "En attente" : succes.statutReservation}
            </span>
          </div>
          <div className="summary-row">
            <span>Total à payer sur place</span>
            <span>{succes.prixTotal.toLocaleString("fr-FR")} FCFA</span>
          </div>
          <p style={{ marginTop: 12, fontSize: "0.9rem", color: "var(--rouge)", fontWeight: "600" }}>
            ⚠️ Important : Après 10 minutes de retard, votre créneau sera donné à un autre client.
          </p>
          <p style={{ marginTop: 8, fontSize: "0.9rem", color: "var(--gris)" }}>
            Le paiement se fera directement sur place avant le début de la séance.
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => setSucces(null)}>
          Faire une nouvelle réservation
        </button>
      </main>
    );
  }

  return (
    <main>
      {erreur && <div className="error-msg">{erreur}</div>}

      {terrain && (
        <div className="card">
          {terrain.photos?.length > 0 && (
            <div className="terrain-photos">
              {terrain.photos.map((url, i) => (
                <img key={i} src={url} alt={`${terrain.nom} ${i + 1}`} />
              ))}
            </div>
          )}
          <h2>{terrain.nom}</h2>
          <p style={{ color: "var(--gris)" }}>{terrain.adresse}</p>
          {terrain.description && <p>{terrain.description}</p>}
          <div className="badges">
            <span className="badge">{terrain.typeSurface === "gazon naturel" ? "Gazon naturel" : "Synthétique"}</span>
            {terrain.eclairage && <span className="badge">Éclairage</span>}
            {terrain.vestiaires && <span className="badge">Vestiaires</span>}
            <span className="badge">{terrain.prixParHeure.toLocaleString("fr-FR")} FCFA / heure</span>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--gris)" }}>📞 {terrain.telephone}</p>
        </div>
      )}

      <div className="card">
        <h3>Choisir une date</h3>
        <input
          type="date"
          className="date-picker"
          value={date}
          min={todayStr()}
          onChange={(e) => setDate(e.target.value)}
        />

        <h3>Créneaux disponibles — {formatDateLocale(date)}</h3>
        {disponibilites.length === 0 ? (
          <p className="empty-state">Chargement des créneaux...</p>
        ) : (
          <div className="slots-grid">
            {disponibilites.map((slot) => (
              <button
                key={slot.heure}
                type="button"
                className={`slot-btn ${creneauxSelectionnes.includes(slot.heure) ? "selected" : ""}`}
                disabled={!slot.disponible}
                onClick={() => toggleCreneau(slot.heure)}
              >
                {slot.libelle}
              </button>
            ))}
          </div>
        )}
      </div>

      {creneauxSelectionnes.length > 0 && (
        <form className="card" onSubmit={handleSubmit}>
          <h3>Vos informations</h3>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              value={nomClient}
              onChange={(e) => setNomClient(e.target.value)}
              placeholder="Votre nom"
              required
            />
          </div>
          <div className="form-group">
            <label>Numéro de téléphone</label>
            <input
              type="tel"
              value={telephoneClient}
              onChange={(e) => setTelephoneClient(e.target.value)}
              placeholder="77 123 45 67"
              required
            />
          </div>

          <div className="form-group">
            <label>Mode de paiement</label>
            <div className="radio-group">
              <label className="radio-option selected">
                <input
                  type="radio"
                  name="modePaiement"
                  value="sur_place"
                  checked
                  readOnly
                />
                Paiement sur place
              </label>
            </div>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--rouge)", fontWeight: "600", marginBottom: "12px" }}>
            ⚠️ Après 10 minutes de retard, votre créneau sera donné à un autre client.
          </p>

          <div className="summary-box">
            <div className="summary-row">
              <span>Créneaux sélectionnés</span>
              <span>
                {creneauxSelectionnes
                  .map((h) => `${String(h).padStart(2, "0")}h-${String(h + 1).padStart(2, "0")}h`)
                  .join(", ")}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total à payer</span>
              <span>{prixTotal.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Envoi..." : "Confirmer la réservation"}
          </button>
        </form>
      )}
    </main>
  );
}
