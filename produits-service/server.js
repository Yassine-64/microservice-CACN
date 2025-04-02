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




app.post("/produit/acheter", isAuthenticated, async (req, res) => {
  try {
    const { ids } = req.body;

    
    const produits = await Product.find({ _id: { $in: ids } });

    res.status(200).json(produits);
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
