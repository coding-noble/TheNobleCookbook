const express = require("express");
const router = express.Router();
const UsersCtrl = require("../controllers/ctrlUsers");

router.get("/", UsersCtrl.getAllUsers);
router.get("/:id", UsersCtrl.getUser);
router.post("/", UsersCtrl.createUser);
router.put("/:id", UsersCtrl.updateUser);
router.delete("/:id", UsersCtrl.deleteUser);

module.exports = router;