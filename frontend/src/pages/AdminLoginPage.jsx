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
      setErreur("Mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="card">
        <h2>Connexion propriétaire</h2>
        {erreur && <div className="error-msg">{erreur}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
