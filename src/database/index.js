import mongoose from "mongoose";
import { MONGODB } from "../../db";
export default function connectDB() {
  mongoose
    .connect(MONGODB)
    .then(() => {
      console.log("db connect");
    })
    .catch((err) => {
      console.log(err);
    });
}
