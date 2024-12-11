const express = require("express");
const router = express.Router();
const CategoriesCtrl = require("../controllers/ctrlCategories");
const { isLoggedIn, hasAdminAccess } = require("../middleware/authentication");

router.get("/", CategoriesCtrl.getAllCategories);
router.get("/:id", CategoriesCtrl.getCategory);
router.post("/", isLoggedIn, CategoriesCtrl.createCategory);
router.put("/:id", hasAdminAccess, CategoriesCtrl.updateCategory);
router.delete("/:id", hasAdminAccess, CategoriesCtrl.deleteCategory);

module.exports = router;