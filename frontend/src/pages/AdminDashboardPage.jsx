import { useState } from "react";
import AdminStats from "../components/AdminStats";
import AdminReservations from "../components/AdminReservations";
import AdminTerrain from "../components/AdminTerrain";
import AdminCreneaux from "../components/AdminCreneaux";

const ONGLETS = [
  { id: "stats", label: "Statistiques" },
  { id: "reservations", label: "Réservations" },
  { id: "creneaux", label: "Créneaux" },
  { id: "terrain", label: "Terrain" },
];

export default function AdminDashboardPage() {
  const [onglet, setOnglet] = useState("stats");

  return (
    <main>
      <div className="filters" style={{ marginBottom: 16 }}>
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            className={onglet === o.id ? "btn btn-primary btn-small" : "btn btn-outline btn-small"}
            onClick={() => setOnglet(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "stats" && <AdminStats />}
      {onglet === "reservations" && <AdminReservations />}
      {onglet === "creneaux" && <AdminCreneaux />}
      {onglet === "terrain" && <AdminTerrain />}
    </main>
  );
}
