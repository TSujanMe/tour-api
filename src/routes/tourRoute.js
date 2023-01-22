const express = require("express");
const { createReview } = require("../controllers/reviewController");
const reviewRouter = require("./reviewRoutes");
const router = express.Router();
const {
  getTourStats,
  getMonthlyPlan,
  getAllTours,
  getTour,
  deleteTour,
  updateTour,
  createTour,
} = require("../controllers/tourController");
const { protect, restrict } = require("../controllers/authController");

router.use("/:tourId/reviews", reviewRouter);

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(protect, restrict("admin", "lead-guide", "guide"), getMonthlyPlan);

router.route("/").get(getAllTours).post(protect, restrict("admin", "lead-guide"), createTour);

router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrict("admin", "lead-guide"), updateTour)
  .delete(protect, restrict("admin", "lead-guide"), deleteTour);

// router.route('/:tourId/reviews').post(protect, restrict('user'), createReview);

module.exports = router;
