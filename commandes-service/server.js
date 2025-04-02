const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const Commande = require("./models/Commande");
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


function prixTotal(produits) {
  let total = 0;
  for (let t = 0; t < produits.length; ++t) {
    total += produits[t].prix;
  }
  console.log("prix total :" + total);
  return total;
}


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


app.post("/commande/ajouter", isAuthenticated, async (req, res) => {
  try {

    const { ids } = req.body;
    const token = req.headers["authorization"]?.split(" ")[1];

    const total = await httpRequest(ids, token);

    const newCommande = new Commande({
      produits: ids,
      email_utilisateur: req.user.email,
      prix_total: total,
    });

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
