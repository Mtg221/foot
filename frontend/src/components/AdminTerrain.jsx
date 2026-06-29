import { useState, useEffect } from "react";
import api from "../api/client";

export default function AdminTerrain() {
  const [form, setForm]       = useState(null);
  const [erreur, setErreur]   = useState("");
  const [succes, setSucces]   = useState("");
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    api.get("/terrain").then(r => setForm(r.data)).catch(() => setErreur("Impossible de charger le terrain."));
  }, []);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const ajouterPhoto = () => {
    if (!photoUrl.trim()) return;
    setForm(p => ({ ...p, photos: [...(p.photos||[]), photoUrl.trim()] }));
    setPhotoUrl("");
  };

  const supprimerPhoto = (i) => setForm(p => ({ ...p, photos: p.photos.filter((_,idx) => idx!==i) }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setErreur(""); setSucces(""); setLoading(true);
    try {
      const res = await api.put("/terrain", {
        nom: form.nom, photos: form.photos,
        prixParHeure: Number(form.prixParHeure),
        adresse: form.adresse, description: form.description,
        telephone: form.telephone, typeSurface: form.typeSurface,
        eclairage: form.eclairage, vestiaires: form.vestiaires,
        heureOuverture: Number(form.heureOuverture),
        heureFermeture: Number(form.heureFermeture),
      });
      setForm(res.data);
      setSucces("Informations enregistrées avec succès.");
      setTimeout(() => setSucces(""), 3000);
    } catch { setErreur("Erreur lors de l'enregistrement."); }
    finally { setLoading(false); }
  };

  if (!form) return <div className="empty-state">Chargement...</div>;

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:"1.3rem", fontWeight:900, color:"var(--gray-900)", margin:0 }}>Paramètres du terrain</h2>
        <p style={{ fontSize:"0.85rem", color:"var(--gray-500)", marginTop:4 }}>Ces informations sont affichées sur la page publique</p>
      </div>

      {erreur && <div className="error-msg">⚠️ {erreur}</div>}
      {succes && (
        <div style={{ background:"var(--green-light)", border:"1px solid #86efac", color:"var(--green-dark)",
          padding:"12px 16px", borderRadius:8, marginBottom:16, fontWeight:600, fontSize:"0.875rem" }}>
          ✓ {succes}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Infos générales */}
        <div style={{ background:"var(--white)", border:"1px solid var(--gray-200)", borderRadius:16, padding:24, marginBottom:20, boxShadow:"var(--shadow-sm)" }}>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:16 }}>
            Informations générales
          </h3>
          <div className="form-group">
            <label className="form-label">Nom du terrain</label>
            <input className="form-input" value={form.nom||""} onChange={e => set("nom", e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Adresse / Localisation</label>
            <input className="form-input" value={form.adresse||""} onChange={e => set("adresse", e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description||""}
              onChange={e => set("description", e.target.value)} style={{resize:"vertical"}} />
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input className="form-input" value={form.telephone||""} onChange={e => set("telephone", e.target.value)} required />
          </div>
        </div>

        {/* Tarif & horaires */}
        <div style={{ background:"var(--white)", border:"1px solid var(--gray-200)", borderRadius:16, padding:24, marginBottom:20, boxShadow:"var(--shadow-sm)" }}>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:16 }}>
            Tarif & Horaires
          </h3>
          <div className="form-group">
            <label className="form-label">Prix par heure (FCFA)</label>
            <input className="form-input" type="number" min="0" value={form.prixParHeure||0}
              onChange={e => set("prixParHeure", e.target.value)} required />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div className="form-group">
              <label className="form-label">Heure d'ouverture</label>
              <input className="form-input" type="number" min="0" max="23" value={form.heureOuverture??8}
                onChange={e => set("heureOuverture", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Heure de fermeture</label>
              <input className="form-input" type="number" min="1" max="24" value={form.heureFermeture??23}
                onChange={e => set("heureFermeture", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div style={{ background:"var(--white)", border:"1px solid var(--gray-200)", borderRadius:16, padding:24, marginBottom:20, boxShadow:"var(--shadow-sm)" }}>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:16 }}>
            Équipements & Surface
          </h3>
          <div className="form-group">
            <label className="form-label">Type de surface</label>
            <select className="form-input" value={form.typeSurface||"synthétique"} onChange={e => set("typeSurface", e.target.value)}>
              <option value="synthétique">Synthétique</option>
              <option value="gazon naturel">Gazon naturel</option>
            </select>
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            {[
              { field:"eclairage",  label:"💡 Éclairage nocturne" },
              { field:"vestiaires", label:"🚿 Vestiaires disponibles" },
            ].map(({ field, label }) => (
              <label key={field} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                background: form[field] ? "var(--green-light)" : "var(--gray-50)",
                border: `1.5px solid ${form[field] ? "var(--green)" : "var(--gray-200)"}`,
                borderRadius:10, padding:"12px 18px", transition:"all .15s", userSelect:"none" }}>
                <input type="checkbox" checked={!!form[field]} onChange={e => set(field, e.target.checked)}
                  style={{ accentColor:"var(--green)", width:16, height:16 }} />
                <span style={{ fontWeight:600, fontSize:"0.875rem", color: form[field] ? "var(--green-dark)" : "var(--gray-600)" }}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div style={{ background:"var(--white)", border:"1px solid var(--gray-200)", borderRadius:16, padding:24, marginBottom:24, boxShadow:"var(--shadow-sm)" }}>
          <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:16 }}>
            Photos du terrain
          </h3>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input className="form-input" type="text" placeholder="https://exemple.com/photo.jpg"
              value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
              style={{ flex:1 }} />
            <button type="button" className="btn btn-outline btn-sm" onClick={ajouterPhoto}>
              + Ajouter
            </button>
          </div>
          {form.photos?.length > 0 && (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:12 }}>
              {form.photos.map((url, i) => (
                <div key={i} style={{ position:"relative" }}>
                  <img src={url} alt="" style={{ width:120, height:80, objectFit:"cover", borderRadius:10, display:"block" }} />
                  <button type="button" onClick={() => supprimerPhoto(i)} style={{
                    position:"absolute", top:4, right:4,
                    background:"#dc2626", color:"#fff", border:"none",
                    borderRadius:"50%", width:22, height:22,
                    fontSize:"0.85rem", cursor:"pointer", display:"flex",
                    alignItems:"center", justifyContent:"center", lineHeight:1
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
          {form.photos?.length === 0 && (
            <div style={{ textAlign:"center", padding:"24px", background:"var(--gray-50)", borderRadius:10,
              border:"2px dashed var(--gray-200)", color:"var(--gray-400)", fontSize:"0.875rem" }}>
              Aucune photo. Ajoutez des URLs d'images.
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{maxWidth:280}}>
          {loading ? "Enregistrement..." : "💾 Sauvegarder les modifications"}
        </button>
      </form>
    </div>
  );
}
