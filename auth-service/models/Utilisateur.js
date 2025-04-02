const mongoose = require("mongoose");

const UtilisateurSchema = mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mot_passe: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Utilisateur = mongoose.model("utilisateur", UtilisateurSchema);
