const express = require("express");
const swaggerRoutes = require("./rtsSwagger");
const authenticationRoutes = require("./rtsAuthentication");
const categoryRoutes = require("./rtsCategories");
const recipeRoutes = require("./rtsRecipes");
const reviewRoutes = require("./rtsReviews");
const userRoutes = require("./rtsUsers");

const router = express.Router();

// Register routes
router.use("/api-docs", swaggerRoutes);    // Register swagger documentation routes under /api-docs
router.use("/", authenticationRoutes);     // Register authentication routes under / (GitHub, Google login)
router.use("/categories", categoryRoutes); // Register category routes under /categories
router.use("/recipes", recipeRoutes);      // Register recipe routes under /recipes
router.use("/reviews", reviewRoutes);      // Register review routes under /reviews
router.use("/users", userRoutes);          // Register user routes under /users

module.exports = router; // export all the routes
