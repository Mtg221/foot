import { useState } from "react";
import AdminStats from "../components/AdminStats";
import AdminReservations from "../components/AdminReservations";
import AdminTerrain from "../components/AdminTerrain";
import AdminCreneaux from "../components/AdminCreneaux";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "stats",        icon: "📊", label: "Tableau de bord" },
  { id: "reservations", icon: "📋", label: "Réservations"    },
  { id: "creneaux",    icon: "🕐", label: "Créneaux"         },
  { id: "terrain",     icon: "⚙️", label: "Terrain"          },
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState("stats");
  const navigate = useNavigate();

  const logout = () => { localStorage.removeItem("adminToken"); navigate("/"); };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--gray-50)" }}>
      {/* Admin top bar */}
      <div style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--gray-200)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        position: "sticky",
        top: 64,
        zIndex: 50,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:"1.1rem" }}>🏟️</span>
          <span style={{ fontWeight:800, fontSize:"0.95rem", color:"var(--gray-900)", letterSpacing:"-0.3px" }}>
            Espace Admin
          </span>
          <span style={{ background:"var(--green-light)", color:"var(--green-dark)", fontSize:"0.7rem", fontWeight:700, padding:"2px 8px", borderRadius:100 }}>
            Propriétaire
          </span>
        </div>
        <button onClick={logout} style={{
          background:"none", border:"1.5px solid var(--gray-200)", borderRadius:8,
          padding:"6px 14px", fontSize:"0.82rem", fontWeight:600, color:"var(--gray-600)",
          cursor:"pointer", transition:"all .15s"
        }}>
          Déconnexion
        </button>
      </div>

      {/* Tab nav */}
      <div style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--gray-200)",
        padding: "0 24px",
        display: "flex",
        gap: 0,
        overflowX: "auto",
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "14px 20px",
            fontWeight: tab === t.id ? 700 : 500,
            fontSize: "0.875rem",
            color: tab === t.id ? "var(--green-dark)" : "var(--gray-500)",
            background: "none", border: "none", cursor: "pointer",
            borderBottom: tab === t.id ? "2px solid var(--green-dark)" : "2px solid transparent",
            transition: "all .15s", whiteSpace: "nowrap"
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 64px" }}>
        {tab === "stats"        && <AdminStats />}
        {tab === "reservations" && <AdminReservations />}
        {tab === "creneaux"    && <AdminCreneaux />}
        {tab === "terrain"     && <AdminTerrain />}
      </div>
    </div>
  );
}
