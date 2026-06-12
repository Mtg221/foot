import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem("adminToken");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <header className="app-header">
      <h1>⚽ Terrain Foot Cite Doudou Basse</h1>
      <nav>
        <Link to="/">Réserver</Link>
        {isAdmin ? (
          <>
            <Link to="/admin">Admin</Link>
            <button onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <Link to="/admin/login">Admin</Link>
        )}
      </nav>
    </header>
  );
}
