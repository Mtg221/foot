import express from "express";
import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Terrain from "../models/Terrain.js";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /reservations - créer une réservation
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const {
      nomClient,
      telephoneClient,
      date,
      creneaux,
    } = req.body;

    if (!nomClient || !telephoneClient || !date || !Array.isArray(creneaux) || creneaux.length === 0) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    if (typeof nomClient !== "string" || nomClient.trim().length < 2 || nomClient.length > 100) {
      return res.status(400).json({ message: "Nom client invalide" });
    }
    if (typeof telephoneClient !== "string" || !/^\+?[\d\s\-()]{7,20}$/.test(telephoneClient)) {
      return res.status(400).json({ message: "Numéro de téléphone invalide" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Format de date invalide (YYYY-MM-DD)" });
    }
    if (creneaux.length > 15) {
      return res.status(400).json({ message: "Trop de créneaux demandés" });
    }
    const creneauxValides = creneaux.every((h) => Number.isInteger(h) && h >= 0 && h <= 23);
    if (!creneauxValides) {
      return res.status(400).json({ message: "Créneaux invalides" });
    }

    const terrain = await Terrain.findOne();
    if (!terrain) return res.status(404).json({ message: "Aucun terrain configuré" });

    const heuresInvalides = creneaux.some(
      (h) => h < terrain.heureOuverture || h >= terrain.heureFermeture
    );
    if (heuresInvalides) {
      return res.status(400).json({ message: "Un ou plusieurs créneaux sont hors des heures d'ouverture" });
    }

    let result;
    await session.withTransaction(async () => {
      const bloques = terrain.creneauxBloques
        .filter((c) => c.date === date)
        .map((c) => c.heure);

      const conflitBloque = creneaux.some((h) => bloques.includes(h));
      if (conflitBloque) {
        throw new Error("INDISPONIBLE: un ou plusieurs créneaux sont bloqués");
      }

      const reservationsExistantes = await Reservation.find({
        terrain: terrain._id,
        date,
        statutReservation: { $in: ["en_attente", "confirmee"] },
        creneaux: { $in: creneaux },
      }).session(session);

      if (reservationsExistantes.length > 0) {
        throw new Error("INDISPONIBLE: un ou plusieurs créneaux sont déjà réservés");
      }

      const prixTotal = creneaux.length * terrain.prixParHeure;

      const reservation = new Reservation({
        terrain: terrain._id,
        nomClient,
        telephoneClient,
        date,
        creneaux,
        prixTotal,
        modePaiement: "sur_place",
        methodePaiement: "especes",
        statutPaiement: "non_paye",
      });

      result = await reservation.save({ session });
    });

    res.status(201).json(result);
  } catch (err) {
    if (err.message.startsWith("INDISPONIBLE")) {
      return res.status(409).json({ message: err.message.replace("INDISPONIBLE: ", "") });
    }
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  } finally {
    session.endSession();
  }
});

// GET /reservations/:id - suivi d'une réservation par le client (via id reçu à la création)
router.get("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate("terrain", "nom");
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée" });
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: "ID invalide" });
  }
});

// GET /reservations - liste complète (admin)
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const { date, statut } = req.query;
    const filtre = {};
    if (date) filtre.date = date;
    if (statut) filtre.statutReservation = statut;

    const reservations = await Reservation.find(filtre).sort({ date: -1, createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// PATCH /reservations/:id/statut - accepter/refuser/annuler (admin)
router.patch("/:id/statut", verifyAdmin, async (req, res) => {
  try {
    const { statutReservation } = req.body;
    if (!["confirmee", "refusee", "annulee", "en_attente"].includes(statutReservation)) {
      return res.status(400).json({ message: "Statut invalide" });
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { statutReservation },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée" });
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
});

// PATCH /reservations/:id/paiement - mettre à jour le statut de paiement (admin)
router.patch("/:id/paiement", verifyAdmin, async (req, res) => {
  try {
    const { statutPaiement } = req.body;
    if (statutPaiement && !["non_paye", "paye"].includes(statutPaiement)) {
      return res.status(400).json({ message: "statutPaiement invalide" });
    }
    const update = {};
    if (statutPaiement) update.statutPaiement = statutPaiement;

    const reservation = await Reservation.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée" });
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: "Erreur", error: err.message });
  }
});

export default router;
