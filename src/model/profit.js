import * as mongoose from "mongoose";
const { Schema, model } = mongoose;
const schema = new Schema({
  userid: Number,
  username: String,
  amount: Number,
  daily: Number,
  date: Date,
});

const Profit = "profit";
export default model(Profit, schema);
