const mongoose = require("mongoose");

const CommandeSchema = mongoose.Schema({
  produits: {
    type: [
      {
        produit_id: {
          type: String,
          required: true,
        },
        quantite: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    required: true,
  },
  client_id: {
    type: String,
    required: true,
  },
  prix_total: {
    type: Number,
    required: true,
  },
  statut: {
    type: String,
    required: true,
    enum: ["En attente", "Confirmée", "Expédiée"],
    default: "En attente",
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

const Commande = mongoose.model("commande", CommandeSchema);

module.exports = Commande;
