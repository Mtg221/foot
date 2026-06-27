import express from "express";
import Terrain from "../models/Terrain.js";
import Reservation from "../models/Reservation.js";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /terrain - infos publiques du terrain (il n'y en a qu'un)
router.get("/", async (req, res) => {
  try {
    const terrain = await Terrain.findOne();
    if (!terrain) {
      return res.status(404).json({ message: "Aucun terrain configuré" });
    }
    res.json(terrain);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /terrain/disponibilites?date=YYYY-MM-DD - créneaux libres/occupés pour une date
router.get("/disponibilites", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Le paramètre 'date' est requis (YYYY-MM-DD)" });
    }

    const terrain = await Terrain.findOne();
    if (!terrain) {
      return res.status(404).json({ message: "Aucun terrain configuré" });
    }

    // Toutes les heures possibles
    const toutesHeures = [];
    for (let h = terrain.heureOuverture; h < terrain.heureFermeture; h++) {
      toutesHeures.push(h);
    }

    // Créneaux bloqués par le propriétaire pour cette date
    const bloques = terrain.creneauxBloques
      .filter((c) => c.date === date)
      .map((c) => c.heure);

    // Réservations actives (en_attente ou confirmee) qui occupent des créneaux
    const reservations = await Reservation.find({
      terrain: terrain._id,
      date,
      statutReservation: { $in: ["en_attente", "confirmee"] },
    });

    const occupes = new Set();
    reservations.forEach((r) => r.creneaux.forEach((h) => occupes.add(h)));
    bloques.forEach((h) => occupes.add(h));

    const heuresReservees = new Set();
    reservations.forEach((r) => r.creneaux.forEach((h) => heuresReservees.add(h)));
    const heuresBloquees = new Set(bloques);

    const disponibilites = toutesHeures.map((heure) => ({
      heure,
      libelle: `${String(heure).padStart(2, "0")}h-${String(heure + 1).padStart(2, "0")}h`,
      disponible: !occupes.has(heure),
      bloquePropriétaire: heuresBloquees.has(heure),
      reserveParClient: heuresReservees.has(heure),
    }));

    res.json({ date, prixParHeure: terrain.prixParHeure, disponibilites });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT /terrain - mise à jour des infos du terrain (admin)
router.put("/", verifyAdmin, async (req, res) => {
  try {
    // Whitelist explicite des champs modifiables — évite le mass assignment
    const {
      nom, adresse, description, telephone,
      prixParHeure, heureOuverture, heureFermeture,
      typeSurface, eclairage, vestiaires, photos,
    } = req.body;
    const updates = {
      ...(nom !== undefined && { nom }),
      ...(adresse !== undefined && { adresse }),
      ...(description !== undefined && { description }),
      ...(telephone !== undefined && { telephone }),
      ...(prixParHeure !== undefined && { prixParHeure }),
      ...(heureOuverture !== undefined && { heureOuverture }),
      ...(heureFermeture !== undefined && { heureFermeture }),
      ...(typeSurface !== undefined && { typeSurface }),
      ...(eclairage !== undefined && { eclairage }),
      ...(vestiaires !== undefined && { vestiaires }),
      ...(photos !== undefined && { photos }),
    };
    let terrain = await Terrain.findOne();
    if (!terrain) {
      terrain = new Terrain(updates);
    } else {
      Object.assign(terrain, updates);
    }
    await terrain.save();
    res.json(terrain);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour" });
  }
});

// POST /terrain/bloquer - bloquer un créneau (admin)
router.post("/bloquer", verifyAdmin, async (req, res) => {
  try {
    const { date, heure } = req.body;
    if (!date || heure === undefined) {
      return res.status(400).json({ message: "date et heure sont requis" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Format de date invalide (YYYY-MM-DD)" });
    }
    if (!Number.isInteger(heure) || heure < 0 || heure > 23) {
      return res.status(400).json({ message: "Heure invalide (entier entre 0 et 23)" });
    }
    const terrain = await Terrain.findOne();
    if (!terrain) return res.status(404).json({ message: "Aucun terrain configuré" });

    const dejaBloque = terrain.creneauxBloques.some(
      (c) => c.date === date && c.heure === heure
    );
    if (!dejaBloque) {
      terrain.creneauxBloques.push({ date, heure });
      await terrain.save();
    }
    res.json(terrain);
  } catch (err) {
    res.status(400).json({ message: "Erreur" });
  }
});

// POST /terrain/debloquer - débloquer un créneau (admin)
router.post("/debloquer", verifyAdmin, async (req, res) => {
  try {
    const { date, heure } = req.body;
    const terrain = await Terrain.findOne();
    if (!terrain) return res.status(404).json({ message: "Aucun terrain configuré" });

    terrain.creneauxBloques = terrain.creneauxBloques.filter(
      (c) => !(c.date === date && c.heure === heure)
    );
    await terrain.save();
    res.json(terrain);
  } catch (err) {
    res.status(400).json({ message: "Erreur" });
  }
});

export default router;
