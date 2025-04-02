const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Utilisateur = require("./models/Utilisateur");
const app = express();

app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
  });

// la méthode register permettera de créer et d'ajouter un nouvel utilisateur à la base de données
app.post("/auth/register", async (req, res) => {
  let { nom, email, mot_passe } = req.body;

  // On vérifie si le nouvel utilisateur est déjà inscrit avec la même adresse email ou pas
  const userExists = await Utilisateur.findOne({ email });
  if (userExists) {
    return res.json({ message: "Cet utilisateur existe déjà" });
  } else {
    bcrypt.hash(mot_passe, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        mot_passe = hash;
        const newUtilisateur = new Utilisateur({
          nom,
          email,
          mot_passe,
        });

        newUtilisateur
          .save()
          .then((user) => res.status(201).json(user))
          .catch((error) => res.status(400).json({ error }));
      }
    });
  }
});

// la méthode login permettra de retourner un token après vérification de l'email et du mot de passe
app.post("/auth/login", async (req, res) => {
  const { email, mot_passe } = req.body;
  const utilisateur = await Utilisateur.findOne({ email });

  if (!utilisateur) {
    return res.json({ message: "Utilisateur introuvable" });
  } else {
    bcrypt.compare(mot_passe, utilisateur.mot_passe).then((resultat) => {
      if (!resultat) {
        return res.json({ message: "Mot de passe incorrect" });
      } else {
        const payload = {
          email,
          nom: utilisateur.nom,
        };

        jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
          if (err) console.log(err);
          else return res.json({ token: token });
        });
      }
    });
  }
});

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Auth-Service at ${PORT}`);
});
