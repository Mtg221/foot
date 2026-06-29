import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = !!localStorage.getItem("adminToken");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">⚽</div>
        <span>Terrain Dakar</span>
      </Link>
      <div className="navbar-actions">
        <Link to="/" className="nav-link" style={location.pathname === "/" ? {color:"#fff"} : {}}>
          Réserver
        </Link>
        {isAdmin ? (
          <>
            <Link to="/admin" className="nav-link">Dashboard</Link>
            <button className="nav-btn" onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <Link to="/admin/login" className="nav-btn nav-btn-primary">Admin</Link>
        )}
      </div>
    </nav>
  );
}
