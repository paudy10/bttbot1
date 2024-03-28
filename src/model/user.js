import * as mongoose from "mongoose";
const { Schema, model } = mongoose;
const schema = new Schema({
  id: Number,
  name: String,
  username: String,
  balance: Number,
  referral: Number,
  parent: String,
});

const User = "user";
export default model(User, schema);
