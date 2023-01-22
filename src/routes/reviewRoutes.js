const router = require("express").Router({ mergeParams: true });
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require("../controllers/reviewController");
const { protect, restrict } = require("../controllers/authController");

router.use(protect);

router.route("/").get(getAllReviews).post(protect, restrict("user"), setTourUserIds, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(restrict("user", "admin"), updateReview)
  .delete(restrict("user", "admin"), deleteReview);

module.exports = router;
