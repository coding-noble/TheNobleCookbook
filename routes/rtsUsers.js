const express = require("express");
const router = express.Router();
const UsersCtrl = require("../controllers/ctrlUsers");
const { isLoggedIn, hasAdminAccess } = require("../middleware/authentication");

router.get("/", UsersCtrl.getAllUsers);
router.get("/:id", UsersCtrl.getUser);
router.post("/", isLoggedIn, UsersCtrl.createUser);
router.put("/:id", hasAdminAccess, UsersCtrl.updateUser);
router.delete("/:id", hasAdminAccess, UsersCtrl.deleteUser);

module.exports = router;