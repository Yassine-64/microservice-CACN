# Microservices CACN

TP Cloud Native par Prof. Hasna Bouiskrane : Une application simple de commerce électronique composée de 4 microservices indépendants qui communiquent entre eux.

## Architecture des Microservices

### 1. Auth Service (Port 4002)
Service d'authentification qui gère l'inscription et la connexion des utilisateurs.

**Endpoints:**
- `POST /auth/register` - Inscription d'un nouvel utilisateur
  - Paramètres: `{ "nom": "string", "email": "string", "mot_passe": "string" }`
  - Réponse: Informations de l'utilisateur créé
- `POST /auth/login` - Connexion d'un utilisateur
  - Paramètres: `{ "email": "string", "mot_passe": "string" }`
  - Réponse: `{ "token": "jwt_token" }`
- `GET /auth/profil` - Obtenir le profil de l'utilisateur connecté (authentification requise)
  - Réponse: Informations de l'utilisateur sans le mot de passe

### 2. Produits Service (Port 4000)
Service de gestion des produits permettant d'ajouter et de rechercher des produits.

**Endpoints:**
- `POST /produit/ajouter` - Ajouter un nouveau produit (authentification requise)
  - Paramètres: `{ "nom": "string", "description": "string", "prix": number, "stock": number }`
  - Réponse: Informations du produit ajouté
- `GET /produit/:id` - Récupérer un produit spécifique (authentification requise)
  - Réponse: Détails du produit
- `PATCH /produit/:id/stock` - Mettre à jour le stock d'un produit (authentification requise)
  - Paramètres: `{ "stock": number }`
  - Réponse: Produit mis à jour
- `POST /produit/acheter` - Rechercher des produits par IDs (authentification requise)
  - Paramètres: `{ "ids": ["id1", "id2", ...] }`
  - Réponse: Liste des produits correspondants

### 3. Commandes Service (Port 4001)
Service de gestion des commandes permettant de créer des commandes et de calculer le prix total.

**Endpoints:**
- `POST /commande/ajouter` - Créer une nouvelle commande (authentification requise)
  - Paramètres: `{ "produits": [{ "produit_id": "string", "quantite": number }, ...] }`
  - Réponse: Commande créée avec prix total calculé
- `GET /commande/:id` - Récupérer une commande spécifique (authentification requise)
  - Réponse: Détails de la commande
- `PATCH /commande/:id/statut` - Mettre à jour le statut d'une commande (authentification requise)
  - Paramètres: `{ "statut": "En attente" | "Confirmée" | "Expédiée" }`
  - Réponse: Commande mise à jour

### 4. Livraison Service (Port 4003)
Service de gestion des livraisons permettant de créer et de suivre les livraisons.

**Endpoints:**
- `POST /livraison/ajouter` - Créer une nouvelle livraison (authentification requise)
  - Paramètres: `{ "commande_id": "string", "transporteur_id": "string", "adresse_livraison": "string" }`
  - Réponse: Livraison créée
- `PUT /livraison/:id` - Mettre à jour le statut d'une livraison (authentification requise)
  - Paramètres: `{ "statut": "En attente" | "En cours" | "Livrée" }`
  - Réponse: Livraison mise à jour
- `GET /livraison` - Obtenir la liste de toutes les livraisons (authentification requise)
- `GET /livraison/:id` - Obtenir les détails d'une livraison (authentification requise)
- `GET /livraison/commande/:commande_id` - Obtenir les livraisons pour une commande (authentification requise)

## Modèles de données

### 1. Modèle Utilisateur (Auth Service)
```javascript
{
  nom: String, // Nom complet de l'utilisateur
  email: String, // Adresse e-mail unique
  mot_passe: String, // Mot de passe haché
  created_at: Date // Date d'inscription
}
```

### 2. Modèle Produit (Produits Service)
```javascript
{
  nom: String, // Nom du produit
  description: String, // Description du produit
  prix: Number, // Prix du produit
  stock: Number, // Quantité disponible en stock
  created_at: Date // Date d'ajout du produit
}
```

### 3. Modèle Commande (Commandes Service)
```javascript
{
  produits: [{ // Liste des produits commandés
    produit_id: String, // ID du produit
    quantite: Number // Quantité commandée
  }],
  client_id: String, // ID ou email du client
  prix_total: Number, // Prix total de la commande
  statut: String, // "En attente", "Confirmée", "Expédiée"
  created_at: Date // Date de création de la commande
}
```

### 4. Modèle Livraison (Livraison Service)
```javascript
{
  commande_id: String, // ID de la commande associée
  transporteur_id: String, // ID du transporteur assigné
  statut: String, // "En attente", "En cours", "Livrée"
  adresse_livraison: String, // Adresse du destinataire
  created_at: Date // Date de création de la livraison
}
```

## Prérequis

- Node.js (v14+)
- MongoDB (installé et en cours d'exécution sur le port 27017)
- npm ou yarn

## Installation et Configuration

### Cloner le projet
```bash
git clone https://github.com/Yassine-64/microservice-CACN.git
cd microservice-CACN
```

### Configuration des variables d'environnement

Pour chaque microservice, créez un fichier `.env` dans le répertoire correspondant.

#### Pour Auth Service (./auth-service/.env)
```
PORT=4002
MONGODB_URI=mongodb://127.0.0.1:27017/auth-service
JWT_SECRET=secret
```

#### Pour Produits Service (./produits-service/.env)
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/produits-service
JWT_SECRET=secret
```

#### Pour Commandes Service (./commandes-service/.env)
```
PORT=4001
MONGODB_URI=mongodb://127.0.0.1:27017/commandes-service
JWT_SECRET=secret
```

#### Pour Livraison Service (./livraison-service/.env)
```
PORT=4003
MONGODB_URI=mongodb://127.0.0.1:27017/livraison-service
JWT_SECRET=secret
```

### Installation des dépendances

Installez les dépendances pour chaque microservice :

```bash
# Pour Auth Service
cd auth-service
npm install

# Pour Produits Service
cd ../produits-service
npm install

# Pour Commandes Service
cd ../commandes-service
npm install

# Pour Livraison Service
cd ../livraison-service
npm install
```

## Démarrage des Services

Ouvrez quatre terminaux différents et exécutez chaque service :

### Terminal 1 - Auth Service
```bash
cd auth-service
npm run dev
```

### Terminal 2 - Produits Service
```bash
cd produits-service
npm run dev
```

### Terminal 3 - Commandes Service
```bash
cd commandes-service
npm run dev
```

### Terminal 4 - Livraison Service
```bash
cd livraison-service
npm run dev
```

## Test des Microservices

Vous pouvez tester les microservices en utilisant curl ou Postman. Voici quelques exemples de requêtes pour tester l'ensemble du flux :

### 1. Inscription d'un utilisateur
```bash
curl -X POST -H "Content-Type: application/json" -d '{"nom":"Utilisateur Test","email":"utilisateur@exemple.com","mot_passe":"motdepasse123"}' http://localhost:4002/auth/register
```

### 2. Connexion et obtention d'un token JWT
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"utilisateur@exemple.com","mot_passe":"motdepasse123"}' http://localhost:4002/auth/login
```

Copiez le token JWT renvoyé pour l'utiliser dans les requêtes suivantes.

### 3. Consulter son profil
```bash
curl -H "Authorization: Bearer VOTRE_TOKEN_JWT" http://localhost:4002/auth/profil
```

### 4. Ajouter un produit
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"nom":"Ordinateur portable","description":"Un ordinateur portable haut de gamme","prix":1000,"stock":10}' http://localhost:4000/produit/ajouter
```

### 5. Ajouter un autre produit
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"nom":"Smartphone","description":"Un smartphone dernière génération","prix":800,"stock":15}' http://localhost:4000/produit/ajouter
```

### 6. Récupérer un produit spécifique
```bash
curl -H "Authorization: Bearer VOTRE_TOKEN_JWT" http://localhost:4000/produit/ID_PRODUIT
```

### 7. Créer une commande
Remplacez les IDs par les identifiants réels des produits que vous avez créés.

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"produits":[{"produit_id":"ID_PRODUIT_1","quantite":2},{"produit_id":"ID_PRODUIT_2","quantite":1}]}' http://localhost:4001/commande/ajouter
```

### 8. Consulter une commande
```bash
curl -H "Authorization: Bearer VOTRE_TOKEN_JWT" http://localhost:4001/commande/ID_COMMANDE
```

### 9. Mettre à jour le statut d'une commande
```bash
curl -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"statut":"Confirmée"}' http://localhost:4001/commande/ID_COMMANDE/statut
```

### 10. Créer une livraison
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"commande_id":"ID_COMMANDE","transporteur_id":"TRANSPORTEUR_1","adresse_livraison":"123 Rue Exemple, Ville, Pays"}' http://localhost:4003/livraison/ajouter
```

### 11. Mettre à jour le statut d'une livraison
```bash
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"statut":"En cours"}' http://localhost:4003/livraison/ID_LIVRAISON
```

## Fonctionnalités Principales

### Auth Service
- Inscription d'utilisateurs
- Authentification et génération de tokens JWT
- Récupération du profil utilisateur
- Sécurisation des routes avec JWT

### Produits Service
- Ajout de nouveaux produits
- Gestion du stock des produits
- Récupération de produits par ID
- Recherche de produits par IDs
- Routes sécurisées avec authentification JWT

### Commandes Service
- Création de commandes avec vérification du stock
- Calcul automatique du prix total
- Mise à jour du stock des produits commandés
- Gestion du statut des commandes
- Communication avec le service produits pour obtenir les informations sur les produits
- Routes sécurisées avec authentification JWT

### Livraison Service
- Création de livraisons pour les commandes
- Vérification que la commande existe avant création
- Suivi des statuts de livraison
- Consultation des livraisons par ID de commande
- Routes sécurisées avec authentification JWT

## Remarques

- Assurez-vous que MongoDB est en cours d'exécution avant de démarrer les services
- Les tokens JWT expirent après une certaine période, vous devrez peut-être vous reconnecter
- Tous les microservices doivent être en cours d'exécution pour un fonctionnement complet du système
- Veillez à ne pas pousser vos fichiers `.env` sur GitHub ou tout autre dépôt public
