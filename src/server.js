require("dotenv").config({ path: "config.env" });
const app = require("./app");
const mongoose = require("mongoose");
const db = process.env.DATABASE_LOCAL;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    // useFindAndModify: false,
  })
  .then((el) => {
    console.log("mongodb connected successfully ");
  });

// it is the rejecttion which get rejected by promise
// this error is comming from promise rejection in globally
process.on("unhandledRejection", (err) => {
  // if we pass 0 then it thinks that it gets exit by being succeed
  // if we psdd 1 then it thinks that it gets exit due to error
  console.log(err.name, err.message);
  console.log(" UNcought exceouib  shut down ... .");
  process.exit(1);
});

// rejection due to syntax error etc
// like handling the syncrous code  like y is nut defined etc

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(" UNcought exceouib  shut down ... .");
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log("port is listening in the port "));
