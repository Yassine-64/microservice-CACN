const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");
const app = express();

app.use(express.json());

// Db connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB !");
  })

// ROUTES DIALNA
app.post("/api/products", async (req, res) => {
    const productData = {
      productId: req.body.productId, 
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    };
      
    if (!productData.productId) {
      return res.status(400).json({
        message: "id est obligatoire!",
      });
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Produit créé avec succès",
      product: savedProduct,
    });
  } 
);
app.get("/api/products/:productId", async (req, res) => {

    const productId = parseInt(req.params.productId);
    const product = await Product.findOne({ productId: productId });

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé!",
      });
    }
    res.json({
      message: "Produit trouvé!",
      product: product,
    });
  });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
