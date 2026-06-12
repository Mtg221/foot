import { useState, useEffect } from "react";
import api from "../api/client";

export default function AdminTerrain() {
  const [form, setForm] = useState(null);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    api
      .get("/terrain")
      .then((res) => {
        setForm(res.data);
      })
      .catch(() => setErreur("Impossible de charger le terrain."));
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const ajouterPhoto = () => {
    if (!photoUrl.trim()) return;
    setForm((prev) => ({ ...prev, photos: [...(prev.photos || []), photoUrl.trim()] }));
    setPhotoUrl("");
  };

  const supprimerPhoto = (index) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setLoading(true);
    try {
      const res = await api.put("/terrain", {
        nom: form.nom,
        photos: form.photos,
        prixParHeure: Number(form.prixParHeure),
        adresse: form.adresse,
        description: form.description,
        telephone: form.telephone,
        typeSurface: form.typeSurface,
        eclairage: form.eclairage,
        vestiaires: form.vestiaires,
        heureOuverture: Number(form.heureOuverture),
        heureFermeture: Number(form.heureFermeture),
      });
      setForm(res.data);
      setSucces("Informations enregistrées.");
    } catch {
      setErreur("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <p className="empty-state">Chargement...</p>;

  return (
    <div className="card">
      <h3>Informations du terrain</h3>
      {erreur && <div className="error-msg">{erreur}</div>}
      {succes && <div className="success-msg">{succes}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom du terrain</label>
          <input value={form.nom || ""} onChange={(e) => handleChange("nom", e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Adresse / localisation</label>
          <input value={form.adresse || ""} onChange={(e) => handleChange("adresse", e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={3}
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Numéro de téléphone</label>
          <input value={form.telephone || ""} onChange={(e) => handleChange("telephone", e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Prix par heure (FCFA)</label>
          <input
            type="number"
            min="0"
            value={form.prixParHeure || 0}
            onChange={(e) => handleChange("prixParHeure", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Heure d'ouverture / fermeture</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="number"
              min="0"
              max="23"
              value={form.heureOuverture ?? 8}
              onChange={(e) => handleChange("heureOuverture", e.target.value)}
            />
            <input
              type="number"
              min="1"
              max="24"
              value={form.heureFermeture ?? 23}
              onChange={(e) => handleChange("heureFermeture", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Type de surface</label>
          <select value={form.typeSurface || "synthétique"} onChange={(e) => handleChange("typeSurface", e.target.value)}>
            <option value="synthétique">Synthétique</option>
            <option value="gazon naturel">Gazon naturel</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={!!form.eclairage}
              onChange={(e) => handleChange("eclairage", e.target.checked)}
              style={{ width: "auto", marginRight: 8 }}
            />
            Éclairage disponible
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={!!form.vestiaires}
              onChange={(e) => handleChange("vestiaires", e.target.checked)}
              style={{ width: "auto", marginRight: 8 }}
            />
            Vestiaires disponibles
          </label>
        </div>

        <div className="form-group">
          <label>Photos (URL)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            <button type="button" className="btn btn-outline btn-small" onClick={ajouterPhoto}>
              Ajouter
            </button>
          </div>
          {form.photos?.length > 0 && (
            <div className="terrain-photos" style={{ marginTop: 10 }}>
              {form.photos.map((url, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={url} alt={`Photo ${i + 1}`} />
                  <button
                    type="button"
                    onClick={() => supprimerPhoto(i)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "var(--rouge)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 22,
                      height: 22,
                      fontSize: "0.8rem",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
