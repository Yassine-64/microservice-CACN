const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");
const isAuthenticated = require("./isAuthenticated");
const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB !");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Récupérer un produit spécifique
app.get("/produit/:id", isAuthenticated, async (req, res) => {
  try {
    const produit = await Product.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.status(200).json(produit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cette route sera renommée à terme, mais on la garde pour compatibilité
app.post("/produit/acheter", isAuthenticated, async (req, res) => {
  try {
    const { ids } = req.body;

    const produits = await Product.find({ _id: { $in: ids } });

    res.status(200).json(produits);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour le stock d'un produit
app.patch("/produit/:id/stock", isAuthenticated, async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Stock invalide" });
    }

    const produit = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );

    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.status(200).json(produit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/produit/ajouter", isAuthenticated, async (req, res) => {
  try {
    const productData = {
      nom: req.body.nom,
      description: req.body.description,
      prix: req.body.prix,
      stock: req.body.stock || 0,
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Produit ajouté avec succès",
      product: savedProduct,
    });
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de l'ajout du produit",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Product-Service at ${PORT}`);
});
