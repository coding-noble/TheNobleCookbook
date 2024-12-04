const express = require("express");
const router = express.Router();
const AuthCtrl = require("../controllers/ctrlAuthentication");

// Login routes
router.get('/github', AuthCtrl.githubLogin);
router.get('/google', AuthCtrl.googleLogin);

// Callback routes
router.get('/github/callback', AuthCtrl.githubCallback);
router.get('/google/callback', AuthCtrl.googleCallback);

// Logout route
router.get('/logout', AuthCtrl.logout);

module.exports = router;