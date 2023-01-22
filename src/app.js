const express = require("express");
const morgan = require("morgan");
const app = express();
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

// requireing our own routes module
const users = require("./routes/userRoute");
const tours = require("./routes/tourRoute");
const review = require("./routes/reviewRoutes");

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", users);
app.use("/api/v1/tours", tours);
app.use("/api/v1/reviews", review);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `couldnot found ${req.originalUrl} on this server`,
  // });
  // we could also do this 1)
  // const err = new Error(`couldnot found ${req.originalUrl} on this server`);
  // err.status = 'failed';
  // err.statusCode = 404;

  // next(err)

  // or this 2)
  next(new AppError(`couldnot found ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
