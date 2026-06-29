import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { password });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin");
    } catch {
      setErreur("Mot de passe incorrect. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-icon">🔐</div>
        <h2>Espace propriétaire</h2>
        <p>Connectez-vous pour gérer les réservations et le terrain.</p>
        {erreur && <div className="error-msg">⚠️ {erreur}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{marginTop:"8px"}}>
            {loading ? "Connexion..." : "→ Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
