const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Reviews route");
});

module.exports = router;