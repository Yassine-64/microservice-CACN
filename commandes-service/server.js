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

// Calcule le prix total d'une commande
function prixTotal(produits, items) {
  let total = 0;
  for (let item of items) {
    const produit = produits.find((p) => p._id.toString() === item.produit_id);
    if (produit) {
      total += produit.prix * item.quantite;
    }
  }
  console.log("Prix total:", total);
  return total;
}

// Vérifie les produits et leur stock
async function verifierProduits(items, token) {
  try {
    // Récupérer tous les IDs des produits
    const ids = items.map((item) => item.produit_id);

    // Récupérer les produits depuis le service Produit
    const response = await axios.post(
      "http://127.0.0.1:4000/produit/acheter",
      { ids },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const produits = response.data;

    // Vérifier que tous les produits existent
    if (produits.length !== ids.length) {
      throw new Error("Certains produits n'existent pas");
    }

    // Vérifier le stock pour chaque produit
    for (let item of items) {
      const produit = produits.find(
        (p) => p._id.toString() === item.produit_id
      );
      if (!produit) {
        throw new Error(`Produit ${item.produit_id} introuvable`);
      }

      if (produit.stock < item.quantite) {
        throw new Error(`Stock insuffisant pour le produit ${produit.nom}`);
      }
    }

    // Calculer le prix total
    const total = prixTotal(produits, items);

    return { produits, total };
  } catch (error) {
    console.error(
      "Erreur lors de la vérification des produits:",
      error.message
    );
    throw error;
  }
}

// Mettre à jour le stock des produits
async function mettreAJourStock(items, token) {
  try {
    for (let item of items) {
      // Récupérer le produit actuel pour connaître son stock
      const produitResponse = await axios.get(
        `http://127.0.0.1:4000/produit/${item.produit_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const produit = produitResponse.data;
      const nouveauStock = produit.stock - item.quantite;

      // Mettre à jour le stock
      await axios.patch(
        `http://127.0.0.1:4000/produit/${item.produit_id}/stock`,
        { stock: nouveauStock },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du stock:", error.message);
    throw error;
  }
}

// Créer une nouvelle commande
app.post("/commande/ajouter", isAuthenticated, async (req, res) => {
  try {
    const { produits } = req.body;

    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ message: "Liste de produits invalide" });
    }

    // Vérifier que chaque élément a produit_id et quantité
    for (let item of produits) {
      if (!item.produit_id || !item.quantite || item.quantite < 1) {
        return res.status(400).json({
          message:
            "Format invalide: chaque produit doit avoir un produit_id et une quantité > 0",
        });
      }
    }

    const token = req.headers["authorization"]?.split(" ")[1];

    // Vérifier les produits et calculer le prix total
    const { total } = await verifierProduits(produits, token);

    // Créer la commande
    const newCommande = new Commande({
      produits: produits,
      client_id: req.user.email,
      prix_total: total,
      statut: "En attente",
    });

    const savedCommande = await newCommande.save();

    // Mettre à jour le stock des produits
    await mettreAJourStock(produits, token);

    res.status(201).json(savedCommande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir une commande par ID
app.get("/commande/:id", isAuthenticated, async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);

    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    res.status(200).json(commande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour le statut d'une commande
app.patch("/commande/:id/statut", isAuthenticated, async (req, res) => {
  try {
    const { statut } = req.body;

    if (!statut || !["En attente", "Confirmée", "Expédiée"].includes(statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    );

    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Si le statut est "Expédiée", créer automatiquement une livraison
    if (statut === "Expédiée") {
      try {
        const token = req.headers["authorization"]?.split(" ")[1];

        // Créer une livraison
        await axios.post(
          "http://127.0.0.1:4003/livraison/ajouter",
          {
            commande_id: commande._id,
            transporteur_id: "system", // À remplacer par un vrai transporteur
            adresse_livraison: "À récupérer du profil client", // À remplacer par l'adresse réelle
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error(
          "Erreur lors de la création de la livraison:",
          error.message
        );
        // On continue malgré l'erreur pour ne pas bloquer la mise à jour du statut
      }
    }

    res.status(200).json(commande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Commande-Service at ${PORT}`);
});
