require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const productRoutes = require('./routes/products');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

let db;

// Connexion unique
MongoClient.connect(MONGO_URI)
  .then(client => {
    console.log(' Connexion à MongoDB réussie');
    db = client.db(DB_NAME);

  
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    app.use('/api/products', productRoutes);

    app.listen(PORT, () => {
      console.log(` Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error(' Erreur de connexion MongoDB', err);
  });

app.get('/', (req, res) => res.send('API MongoDB fonctionne'));
