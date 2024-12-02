const express = require("express");
const router = express.Router();
const ReviewsCtrl = require("../controllers/ctrlReviews");

router.get("/", ReviewsCtrl.getAllReviews);
router.get("/:id", ReviewsCtrl.getReview);
router.post("/", ReviewsCtrl.createReview);
router.put("/:id", ReviewsCtrl.updateReview);
router.delete("/:id", ReviewsCtrl.deleteReview);

module.exports = router;