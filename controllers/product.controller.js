const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;



// Phase 2:Fonction pour récupérer les produits avec filtre/tri/pagination
async function getProducts(req, res) {
  try {
    const db = req.db; 
    const collection = db.collection('products');

    let { page = 1, limit = 10, category, search, sort } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Filtrage par Catégorie 
    const filter = {};
    if (category) filter.category = category;

    // Recherche par Titre/Description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Tri 
    let sortOption = {};
    if (sort) {
      if (sort.startsWith('-')) sortOption[sort.slice(1)] = -1;
      else sortOption[sort] = 1;
    }

    // Implémentation de la Pagination 
    const skip = (page - 1) * limit;


    const products = await collection
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    console.error('Erreur getProducts', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Phase 3:Fonction pour récupérer les statistiques
async function getStats(req, res) {
  try {
    const db = req.db;
    const collection = db.collection('products');


    // Exercice 6.1 :Calcul des Statistiques Globales par Catégorie

    const statsByCategory = await collection.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: "$price" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" }
        }
      },
      { $sort: { averagePrice: -1 } },
      { $project: { categoryName: "$_id", totalProducts: 1, averagePrice: 1, maxPrice: 1, minPrice: 1, _id: 0 } }
    ]).toArray();


    // Exercice 6.2 : Recherche des Meilleurs/Pires Produits par Notation

    const topRatedExpensive = await collection.aggregate([
      { $match: { price: { $gt: 500 } } },
      { $sort: { rating: -1 } },
      { $limit: 5 },
      { $project: { title: 1, price: 1, rating: 1, _id: 0 } }
    ]).toArray();

    // Exercice 6.3 :Décomposition par Marque et Prix Total
     
    const statsByBrand = await collection.aggregate([
      {
        $group: {
          _id: "$brand",
          totalStock: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } }
        }
      },
      { $project: { brand: "$_id", totalStock: 1, totalValue: 1, _id: 0 } }
    ]).toArray();

    res.json({
      statsByCategory,
      topRatedExpensive,
      statsByBrand
    });

  } catch (err) {
    console.error(" Erreur getStats", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}


module.exports = { getProducts, getStats };
