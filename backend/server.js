import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import terrainRoutes from "./routes/terrain.js";
import reservationRoutes from "./routes/reservations.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // accepte toute origine, y compris les previews Vercel
app.use(express.json());

app.use("/terrain", terrainRoutes);
app.use("/reservations", reservationRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Terrain Foot - OK" });
});

const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error("Erreur de connexion MongoDB:", err.message);
    process.exit(1);
  });
