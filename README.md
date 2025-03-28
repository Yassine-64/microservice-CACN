# Product Microservice

A simple microservice for managing products with Express.js and MongoDB.

## Features

- Create products with custom IDs
- Retrieve products by ID

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/produits-service
   ```
4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

- **POST /api/products** - Create a new product
- **GET /api/products/:productId** - Get a product by ID 