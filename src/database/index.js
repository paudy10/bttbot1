import mongoose from "mongoose";
export default function connectDB() {
  mongoose
    .connect(process.env.MONGODB)
    .then(() => {
      console.log("db connect");
    })
    .catch((err) => {
      console.log(err);
    });
}
