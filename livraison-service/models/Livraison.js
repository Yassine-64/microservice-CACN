const mongoose = require("mongoose");

const LivraisonSchema = mongoose.Schema({
  commande_id: {
    type: String,
    required: true,
  },
  transporteur_id: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    required: true,
    enum: ["En attente", "En cours", "Livrée"],
    default: "En attente",
  },
  adresse_livraison: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

const Livraison = mongoose.model("livraison", LivraisonSchema);

module.exports = Livraison;
