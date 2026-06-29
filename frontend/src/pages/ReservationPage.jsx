import { useState, useEffect } from "react";
import api from "../api/client";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function formatDateLong(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function formatDateShort(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "short"
  });
}

function fmtHeure(h) {
  return `${String(h).padStart(2,"0")}h–${String(h+1).padStart(2,"0")}h`;
}

export default function ReservationPage() {
  const [terrain, setTerrain] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [disponibilites, setDisponibilites] = useState([]);
  const [prixParHeure, setPrixParHeure] = useState(0);
  const [creneaux, setCreneaux] = useState([]);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(null);

  useEffect(() => {
    api.get("/terrain")
      .then(r => setTerrain(r.data))
      .catch(() => setErreur("Impossible de charger les informations du terrain."));
  }, []);

  useEffect(() => {
    setLoadingSlots(true);
    setErreur("");
    api.get("/terrain/disponibilites", { params: { date } })
      .then(r => {
        setDisponibilites(r.data.disponibilites);
        setPrixParHeure(r.data.prixParHeure);
        setCreneaux([]);
      })
      .catch(() => {
        setErreur("Impossible de charger les disponibilités.");
        setDisponibilites([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [date]);

  const toggleCreneau = (h) =>
    setCreneaux(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h].sort((a,b) => a-b));

  const prixTotal = creneaux.length * prixParHeure;
  const dispoCount = disponibilites.filter(s => s.disponible).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!creneaux.length) return setErreur("Sélectionnez au moins un créneau.");
    if (!nom.trim() || !telephone.trim()) return setErreur("Renseignez votre nom et téléphone.");
    setLoading(true);
    setErreur("");
    try {
      const res = await api.post("/reservations", { nomClient: nom.trim(), telephoneClient: telephone.trim(), date, creneaux });
      setSucces(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setErreur(err.response.data.message + " Choisissez un autre créneau.");
        const dispo = await api.get("/terrain/disponibilites", { params: { date } });
        setDisponibilites(dispo.data.disponibilites);
        setCreneaux([]);
      } else {
        setErreur("Une erreur est survenue. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (succes) {
    return (
      <>
        <div className="success-banner">
          <div className="check-circle">✓</div>
          <h2>Réservation confirmée !</h2>
          <p>Vous recevrez une confirmation. Paiement sur place avant la séance.</p>
        </div>
        <div className="page-wrapper" style={{maxWidth:520}}>
          <div className="recap-card">
            <div className="recap-header">Récapitulatif de réservation</div>
            <div className="recap-row">
              <span className="r-label">Date</span>
              <span className="r-value">{formatDateLong(succes.date)}</span>
            </div>
            <div className="recap-row">
              <span className="r-label">Créneaux</span>
              <span className="r-value">{succes.creneaux.map(fmtHeure).join(", ")}</span>
            </div>
            <div className="recap-row">
              <span className="r-label">Client</span>
              <span className="r-value">{succes.nomClient}</span>
            </div>
            <div className="recap-row">
              <span className="r-label">Téléphone</span>
              <span className="r-value">{succes.telephoneClient}</span>
            </div>
            <div className="recap-row">
              <span className="r-label">Statut</span>
              <span className={`status status-${succes.statutReservation}`}>
                {succes.statutReservation === "en_attente" ? "En attente" : succes.statutReservation}
              </span>
            </div>
            <div className="recap-row total">
              <span className="r-label">Total à payer sur place</span>
              <span className="r-value">{succes.prixTotal.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
          <div className="warning-box" style={{maxWidth:520,margin:"0 auto 20px"}}>
            ⚠️ Après <strong>10 minutes de retard</strong>, votre créneau sera donné à un autre client.
          </div>
          <button className="btn btn-outline" onClick={() => setSucces(null)}>
            Faire une nouvelle réservation
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* HERO */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">⚡ Réservation en ligne instantanée</div>
          <h1>{terrain?.nom || "Terrain Foot Dakar"}</h1>
          <p>{terrain?.description || "Terrain synthétique de qualité professionnelle au cœur de Dakar."}</p>
          <div className="hero-meta">
            <span className="hero-meta-item">📍 {terrain?.adresse || "Dakar, Sénégal"}</span>
            <span className="hero-meta-item">📞 {terrain?.telephone || "+221 77 000 00 00"}</span>
            <span className="hero-meta-item">🕐 {terrain ? `${terrain.heureOuverture}h–${terrain.heureFermeture}h` : "8h–23h"}</span>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="number">{terrain?.prixParHeure ? terrain.prixParHeure.toLocaleString("fr-FR") : "–"}</div>
              <div className="label">FCFA / heure</div>
            </div>
            <div className="hero-stat">
              <div className="number">{dispoCount}</div>
              <div className="label">Créneaux dispo</div>
            </div>
            <div className="hero-stat">
              <div className="number">5⭐</div>
              <div className="label">Qualité terrain</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES STRIP */}
      <div className="features-strip">
        <div className="features-inner">
          {terrain?.typeSurface && (
            <div className="feature-item"><span className="feature-icon">🌱</span> Pelouse {terrain.typeSurface}</div>
          )}
          {terrain?.eclairage && <div className="feature-item"><span className="feature-icon">💡</span> Éclairage nocturne</div>}
          {terrain?.vestiaires && <div className="feature-item"><span className="feature-icon">🚿</span> Vestiaires disponibles</div>}
          <div className="feature-item"><span className="feature-icon">💳</span> Paiement sur place</div>
        </div>
      </div>

      {erreur && (
        <div className="page-wrapper" style={{paddingBottom:0}}>
          <div className="error-msg">⚠️ {erreur}</div>
        </div>
      )}

      <div className="page-wrapper">
        <div className="booking-layout">
          {/* LEFT: date + slots */}
          <div>
            <div className="card">
              <div className="card-header">
                <h2>Choisir une date</h2>
              </div>
              <div className="card-body">
                <div className="date-nav">
                  <button
                    className="date-nav-btn"
                    disabled={date <= todayStr()}
                    onClick={() => setDate(addDays(date, -1))}
                  >◀</button>
                  <div className="date-display">
                    <div className="day-full">{formatDateShort(date)}</div>
                  </div>
                  <button className="date-nav-btn" onClick={() => setDate(addDays(date, 1))}>▶</button>
                </div>
                <input
                  type="date"
                  className="date-input"
                  value={date}
                  min={todayStr()}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Créneaux — {formatDateLong(date)}</h2>
                <p>{dispoCount} créneau{dispoCount > 1 ? "x" : ""} disponible{dispoCount > 1 ? "s" : ""}</p>
              </div>
              <div className="card-body">
                <div className="slots-legend">
                  <div className="slots-legend-item"><div className="legend-dot free"></div>Disponible</div>
                  <div className="slots-legend-item"><div className="legend-dot selected"></div>Sélectionné</div>
                  <div className="slots-legend-item"><div className="legend-dot taken"></div>Occupé</div>
                </div>
                {loadingSlots ? (
                  <div className="empty-state">Chargement des créneaux...</div>
                ) : (
                  <div className="slots-grid">
                    {disponibilites.map(slot => (
                      <button
                        key={slot.heure}
                        type="button"
                        className={`slot-btn ${creneaux.includes(slot.heure) ? "selected" : ""}`}
                        disabled={!slot.disponible}
                        onClick={() => toggleCreneau(slot.heure)}
                      >
                        <span className="slot-time">{fmtHeure(slot.heure)}</span>
                        {slot.disponible && (
                          <span className="slot-price">{prixParHeure.toLocaleString("fr-FR")} F</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form sur mobile (sous les créneaux) */}
            {creneaux.length > 0 && (
              <div className="card" style={{display:"block"}} id="mobile-form">
                <div className="card-header"><h2>Vos informations</h2></div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Nom complet</label>
                      <input type="text" className="form-input" value={nom}
                        onChange={e => setNom(e.target.value)} placeholder="Votre nom complet" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Téléphone</label>
                      <input type="tel" className="form-input" value={telephone}
                        onChange={e => setTelephone(e.target.value)} placeholder="77 000 00 00" required />
                    </div>
                    <div className="warning-box">
                      ⚠️ Après <strong>10 min de retard</strong>, votre créneau sera libéré.
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Envoi en cours..." : `Réserver — ${prixTotal.toLocaleString("fr-FR")} FCFA`}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: sidebar */}
          <div className="booking-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-header">
                <h3>Votre réservation</h3>
                <p>{creneaux.length ? `${creneaux.length} créneau${creneaux.length > 1 ? "x" : ""} sélectionné${creneaux.length > 1 ? "s" : ""}` : "Sélectionnez des créneaux"}</p>
              </div>
              <div className="sidebar-body">
                {creneaux.length === 0 ? (
                  <div className="sidebar-empty">
                    <div className="empty-icon">📅</div>
                    <p>Cliquez sur un créneau disponible pour commencer votre réservation.</p>
                  </div>
                ) : (
                  <>
                    {creneaux.map(h => (
                      <div key={h} className="summary-line">
                        <span className="label">{fmtHeure(h)}</span>
                        <span className="value">{prixParHeure.toLocaleString("fr-FR")} F</span>
                      </div>
                    ))}
                    <div className="summary-total">
                      <span className="label">Total</span>
                      <span className="value">{prixTotal.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <form onSubmit={handleSubmit} style={{marginTop:"16px"}}>
                      <div className="form-group">
                        <label className="form-label">Nom complet</label>
                        <input type="text" className="form-input" value={nom}
                          onChange={e => setNom(e.target.value)} placeholder="Votre nom" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Téléphone</label>
                        <input type="tel" className="form-input" value={telephone}
                          onChange={e => setTelephone(e.target.value)} placeholder="77 000 00 00" required />
                      </div>
                      <div className="warning-box">
                        ⚠️ <span>Retard &gt; 10 min = créneau libéré</span>
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Envoi..." : "Confirmer la réservation"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p><strong>Terrain Foot Dakar</strong> — {terrain?.adresse}</p>
        <p style={{marginTop:"6px"}}>📞 {terrain?.telephone} &nbsp;·&nbsp; Paiement sur place uniquement</p>
      </footer>
    </>
  );
}
