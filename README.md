# Microservices CACN

TP Cloud Native par Prof. Hasna Bouiskrane : Une application simple de commerce électronique composée de 3 microservices indépendants qui communiquent entre eux.

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

### 2. Produits Service (Port 4000)
Service de gestion des produits permettant d'ajouter et de rechercher des produits.

**Endpoints:**
- `POST /produit/ajouter` - Ajouter un nouveau produit (authentification requise)
  - Paramètres: `{ "nom": "string", "description": "string", "prix": number }`
  - Réponse: Informations du produit ajouté
- `POST /produit/acheter` - Rechercher des produits par IDs (authentification requise)
  - Paramètres: `{ "ids": ["id1", "id2", ...] }`
  - Réponse: Liste des produits correspondants

### 3. Commandes Service (Port 4001)
Service de gestion des commandes permettant de créer des commandes et de calculer le prix total.

**Endpoints:**
- `POST /commande/ajouter` - Créer une nouvelle commande (authentification requise)
  - Paramètres: `{ "ids": ["id1", "id2", ...] }`
  - Réponse: Commande créée avec prix total calculé

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
```

## Démarrage des Services

Ouvrez trois terminaux différents et exécutez chaque service :

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

## Test des Microservices

Vous pouvez tester les microservices en utilisant curl ou Postman. Voici quelques exemples de commandes curl :

### 1. Inscription d'un utilisateur
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"utilisateur@exemple.com","mot_passe":"motdepasse123","nom":"Utilisateur Test"}' http://localhost:4002/auth/register
```

### 2. Connexion et obtention d'un token JWT
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"utilisateur@exemple.com","mot_passe":"motdepasse123"}' http://localhost:4002/auth/login
```

Copiez le token JWT renvoyé pour l'utiliser dans les requêtes suivantes.

### 3. Ajouter un produit
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"nom":"Ordinateur portable","description":"Un ordinateur portable haut de gamme","prix":1000}' http://localhost:4000/produit/ajouter
```

### 4. Ajouter un autre produit
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"nom":"Smartphone","description":"Un smartphone dernière génération","prix":800}' http://localhost:4000/produit/ajouter
```

### 5. Créer une commande
Remplacez les IDs par les identifiants réels des produits que vous avez créés.

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer VOTRE_TOKEN_JWT" -d '{"ids":["ID_PRODUIT_1","ID_PRODUIT_2"]}' http://localhost:4001/commande/ajouter
```

## Fonctionnalités Principales

### Auth Service
- Inscription d'utilisateurs
- Authentification et génération de tokens JWT
- Sécurisation des routes avec JWT

### Produits Service
- Ajout de nouveaux produits
- Recherche de produits par IDs
- Routes sécurisées avec authentification JWT

### Commandes Service
- Création de commandes
- Calcul automatique du prix total
- Communication avec le service produits pour obtenir les informations sur les produits
- Routes sécurisées avec authentification JWT



## Remarques

- Assurez-vous que MongoDB est en cours d'exécution avant de démarrer les services
- Les tokens JWT expirent après une certaine période, vous devrez peut-être vous reconnecter
- Tous les microservices doivent être en cours d'exécution pour un fonctionnement complet du système
- Veillez à ne pas pousser vos fichiers `.env` sur GitHub ou tout autre dépôt public