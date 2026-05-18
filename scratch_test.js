import mongoose from "mongoose";
import "dotenv/config";
import warrantyCollection from "./src/models/warranty.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  const warranties = await warrantyCollection.find({});
  console.log("ALL WARRANTIES IN DB:");
  console.log(JSON.stringify(warranties, null, 2));
  await mongoose.disconnect();
}

run().catch(console.error);
