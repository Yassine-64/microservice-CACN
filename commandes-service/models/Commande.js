const mongoose = require("mongoose");

const CommandeSchema = mongoose.Schema({
  produits: {
    type: [String],
    required: true,
  },
  email_utilisateur: {
    type: String,
    required: true,
  },
  prix_total: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

const Commande = mongoose.model("commande", CommandeSchema);

module.exports = Commande;
