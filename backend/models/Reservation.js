import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    terrain: { type: mongoose.Schema.Types.ObjectId, ref: "Terrain", required: true },
    nomClient: { type: String, required: true },
    telephoneClient: { type: String, required: true },
    date: { type: String, required: true },
    creneaux: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Au moins un créneau requis",
      },
    },
    prixTotal: { type: Number, required: true },
    modePaiement: {
      type: String,
      enum: ["sur_place"],
      required: true,
      default: "sur_place",
    },
    methodePaiement: {
      type: String,
      enum: ["especes"],
      default: "especes",
    },
    statutPaiement: {
      type: String,
      enum: ["non_paye", "paye"],
      default: "non_paye",
    },
    statutReservation: {
      type: String,
      enum: ["en_attente", "confirmee", "refusee", "annulee"],
      default: "en_attente",
    },
  },
  { timestamps: true }
);

// Index pour accélérer les vérifs de disponibilité par date
reservationSchema.index({ terrain: 1, date: 1 });

export default mongoose.model("Reservation", reservationSchema);
