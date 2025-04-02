const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const Commande = require("./models/Commande");
const isAuthenticated = require("./isAuthenticated");
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

// Calcul du prix total d'une commande en passant en paramètre un tableau des produits
function prixTotal(produits) {
  let total = 0;
  for (let t = 0; t < produits.length; ++t) {
    total += produits[t].prix;
  }
  console.log("prix total :" + total);
  return total;
}

// Cette fonction envoie une requête http au service produit pour récupérer le tableau des produits qu'on désire commander (en se basant sur leurs ids)
async function httpRequest(ids, token) {
  try {
    const URL = "http://localhost:4000/produit/acheter";
    const response = await axios.post(
      URL,
      { ids: ids },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return prixTotal(response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Route pour ajouter une commande
app.post("/commande/ajouter", isAuthenticated, async (req, res) => {
  try {
    // Création d'une nouvelle commande dans la collection commande
    const { ids } = req.body;
    const token = req.headers["authorization"]?.split(" ")[1];

    // Get total price from product service
    const total = await httpRequest(ids, token);

    // Create new order using user email from token
    const newCommande = new Commande({
      produits: ids,
      email_utilisateur: req.user.email,
      prix_total: total,
    });

    // Save the order
    const savedCommande = await newCommande.save();
    res.status(201).json(savedCommande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Commande-Service at ${PORT}`);
});
