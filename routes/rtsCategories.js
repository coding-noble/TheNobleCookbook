const express = require("express");
const router = express.Router();
const CategoriesCtrl = require("../controllers/ctrlCategories");

router.get("/", CategoriesCtrl.getAllCategories);
router.get("/:id", CategoriesCtrl.getCategory);
router.post("/", CategoriesCtrl.createCategory);
router.put("/:id", CategoriesCtrl.updateCategory);
router.delete("/:id", CategoriesCtrl.deleteCategory);

module.exports = router;