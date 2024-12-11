const express = require("express");
const router = express.Router();
const RecipesCtrl = require("../controllers/ctrlRecipes");
const { isLoggedIn, hasAdminAccess } = require("../middleware/authentication");

router.get("/", RecipesCtrl.getAllRecipes);
router.get("/:id", RecipesCtrl.getRecipe);
router.post("/", isLoggedIn, RecipesCtrl.createRecipe);
router.put("/:id", hasAdminAccess, RecipesCtrl.updateRecipe);
router.delete("/:id", hasAdminAccess, RecipesCtrl.deleteRecipe);

module.exports = router;