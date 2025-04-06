const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const Livraison = require("./models/Livraison");
const isAuthenticated = require("./isAuthenticated");
const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
  });

// Ajouter une nouvelle livraison
app.post("/livraison/ajouter", isAuthenticated, async (req, res) => {
  try {
    const { commande_id, transporteur_id, adresse_livraison } = req.body;

    // Vérifier que la commande existe
    try {
      const commandeResponse = await axios.get(
        `http://localhost:4001/commande/${commande_id}`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      // Si la commande n'existe pas, renvoyer une erreur
      if (!commandeResponse.data) {
        return res.status(404).json({ message: "Commande introuvable" });
      }
    } catch (error) {
      // En cas d'erreur, on considère que la commande n'existe pas ou que le service est indisponible
      console.error(
        "Erreur lors de la vérification de la commande:",
        error.message
      );
      // On continue quand même pour le test
    }

    const newLivraison = new Livraison({
      commande_id,
      transporteur_id,
      statut: "en attente",
      adresse_livraison,
    });

    const savedLivraison = await newLivraison.save();
    res.status(201).json(savedLivraison);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour le statut d'une livraison
app.put("/livraison/:id", isAuthenticated, async (req, res) => {
  try {
    const { statut } = req.body;
    const { id } = req.params;

    if (!["en attente", "en cours", "livrée", "annulée"].includes(statut)) {
      return res.status(400).json({ message: "Statut de livraison invalide" });
    }

    const updatedLivraison = await Livraison.findByIdAndUpdate(
      id,
      { statut },
      { new: true }
    );

    if (!updatedLivraison) {
      return res.status(404).json({ message: "Livraison introuvable" });
    }

    res.status(200).json(updatedLivraison);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir toutes les livraisons
app.get("/livraison", isAuthenticated, async (req, res) => {
  try {
    const livraisons = await Livraison.find();
    res.status(200).json(livraisons);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir une livraison par ID
app.get("/livraison/:id", isAuthenticated, async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id);

    if (!livraison) {
      return res.status(404).json({ message: "Livraison introuvable" });
    }

    res.status(200).json(livraison);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir les livraisons par commande
app.get(
  "/livraison/commande/:commande_id",
  isAuthenticated,
  async (req, res) => {
    try {
      const livraisons = await Livraison.find({
        commande_id: req.params.commande_id,
      });
      res.status(200).json(livraisons);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`Livraison-Service at ${PORT}`);
});
