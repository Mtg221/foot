// Script à exécuter une seule fois pour créer le terrain initial.
// Usage : node seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Terrain from "./models/Terrain.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existant = await Terrain.findOne();
  if (existant) {
    console.log("Un terrain existe déjà. Aucune action effectuée.");
    await mongoose.disconnect();
    return;
  }

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
  console.log("Terrain initial créé avec succès.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Erreur lors du seed:", err);
  process.exit(1);
});
