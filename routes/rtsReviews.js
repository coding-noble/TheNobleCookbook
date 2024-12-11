const express = require("express");
const router = express.Router();
const ReviewsCtrl = require("../controllers/ctrlReviews");
const { isLoggedIn, hasAdminAccess } = require("../middleware/authentication");

router.get("/", ReviewsCtrl.getAllReviews);
router.get("/:id", ReviewsCtrl.getReview);
router.post("/", isLoggedIn, ReviewsCtrl.createReview);
router.put("/:id", hasAdminAccess, ReviewsCtrl.updateReview);
router.delete("/:id", hasAdminAccess, ReviewsCtrl.deleteReview);

module.exports = router;