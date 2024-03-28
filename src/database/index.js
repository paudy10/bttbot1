import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("db connect");
  })
  .catch((err) => {
    console.log(err);
  });
