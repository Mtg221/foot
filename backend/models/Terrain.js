import mongoose from "mongoose";

const terrainSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, default: "Terrain Principal" },
    photos: { type: [String], default: [] },
    prixParHeure: { type: Number, required: true, default: 15000 },
    adresse: { type: String, required: true },
    description: { type: String, default: "" },
    telephone: { type: String, required: true },
    typeSurface: {
      type: String,
      enum: ["gazon naturel", "synthétique"],
      default: "synthétique",
    },
    eclairage: { type: Boolean, default: false },
    vestiaires: { type: Boolean, default: false },
    heureOuverture: { type: Number, default: 8 }, // 8h
    heureFermeture: { type: Number, default: 23 }, // 23h
    creneauxBloques: {
      // créneaux bloqués par le propriétaire (hors réservations) : { date: "YYYY-MM-DD", heure: 8 }
      type: [
        {
          date: { type: String, required: true },
          heure: { type: Number, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Terrain", terrainSchema);
