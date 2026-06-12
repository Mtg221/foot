import express from "express";
import jwt from "jsonwebtoken";
import Reservation from "../models/Reservation.js";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /admin/login - authentification simple par mot de passe unique
router.post("/login", (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Mot de passe incorrect" });
  }
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

// GET /admin/stats - statistiques simples (admin)
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    const filtre = {};
    if (dateDebut || dateFin) {
      filtre.date = {};
      if (dateDebut) filtre.date.$gte = dateDebut;
      if (dateFin) filtre.date.$lte = dateFin;
    }

    const reservations = await Reservation.find(filtre);

    const totalReservations = reservations.length;
    const confirmees = reservations.filter((r) => r.statutReservation === "confirmee").length;
    const enAttente = reservations.filter((r) => r.statutReservation === "en_attente").length;
    const annuleesOuRefusees = reservations.filter((r) =>
      ["annulee", "refusee"].includes(r.statutReservation)
    ).length;

    const revenusConfirmes = reservations
      .filter((r) => r.statutReservation === "confirmee")
      .reduce((sum, r) => sum + r.prixTotal, 0);

    const revenusEncaisses = reservations
      .filter((r) => r.statutPaiement === "paye")
      .reduce((sum, r) => sum + r.prixTotal, 0);

    res.json({
      totalReservations,
      confirmees,
      enAttente,
      annuleesOuRefusees,
      revenusConfirmes,
      revenusEncaisses,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

export default router;
