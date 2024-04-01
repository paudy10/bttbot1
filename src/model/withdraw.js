import * as mongoose from "mongoose";
const { Schema, model } = mongoose;
const schema = new Schema({
  userid: Number,
  username: String,
  amount: Number,
  wallet: String,
  date: Date,
});

const Withdraw = "withdraw";
export default model(Withdraw, schema);
