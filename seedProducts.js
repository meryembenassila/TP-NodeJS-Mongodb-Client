require('dotenv').config();
const { MongoClient } = require('mongodb');
const axios = require('axios');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

async function seedProducts() {
  const client = new MongoClient(MONGO_URI);

  try {
    //  Connexion à MongoDB
    await client.connect();
    console.log('Connecté à MongoDB pour le seed');

    const db = client.db(DB_NAME);
    const collection = db.collection('products');

    // Récupérer les produits 
    const response = await axios.get('https://dummyjson.com/products');
    const products = response.data.products;

    // Supprimer la collection 
    await collection.deleteMany({});
    console.log(' Collection products vidée');

    // Insérer les produits
    await collection.insertMany(products);
    console.log(` ${products.length} produits insérés`);

  } catch (err) {
    console.error(' Erreur lors du seed', err);
  } finally {
    // Déconnexion
    await client.close();
    console.log('Déconnecté de MongoDB');
  }
}


seedProducts();
