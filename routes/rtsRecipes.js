const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Recipes route");
});

module.exports = router;