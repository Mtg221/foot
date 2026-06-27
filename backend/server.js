import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import terrainRoutes from "./routes/terrain.js";
import reservationRoutes from "./routes/reservations.js";
import adminRoutes from "./routes/admin.js";
import Terrain from "./models/Terrain.js";

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS non autorisé"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.use("/terrain", terrainRoutes);
app.use("/reservations", reservationRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Terrain Foot - OK" });
});

const PORT = process.env.PORT || 5001;

async function initTerrain() {
  try {
    const existant = await Terrain.findOne();
    if (!existant) {
      const terrain = new Terrain({
        nom: "Terrain Foot Dakar",
        photos: [],
        prixParHeure: 15000,
        adresse: "Mermoz, Dakar, Sénégal",
        description: "Terrain de football synthétique au cœur de Dakar.",
        telephone: "+221 77 000 00 00",
        typeSurface: "synthétique",
        eclairage: true,
        vestiaires: true,
        heureOuverture: 8,
        heureFermeture: 23,
        creneauxBloques: [],
      });
      await terrain.save();
      console.log("✓ Terrain initial créé automatiquement");
    }
  } catch (err) {
    console.error("Erreur init terrain:", err.message);
  }
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connecté");
    await initTerrain();
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error("Erreur de connexion MongoDB:", err.message);
    process.exit(1);
  });