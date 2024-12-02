const express = require("express");
const router = express.Router();
const RecipesCtrl = require("../controllers/ctrlRecipes");

router.get("/", RecipesCtrl.getAllRecipes);
router.get("/:id", RecipesCtrl.getRecipe);
router.post("/", RecipesCtrl.createRecipe);
router.put("/:id", RecipesCtrl.updateRecipe);
router.delete("/:id", RecipesCtrl.deleteRecipe);

module.exports = router;