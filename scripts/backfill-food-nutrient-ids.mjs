import "dotenv/config";
import mongoose from "mongoose";
import { Food } from "../src/models/food.model.mjs";
import { Nutrient } from "../src/models/nutrient.model.mjs";

const BATCH_SIZE = 1000;

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is required");
  await mongoose.connect(uri);

  // Iterate foods in batches
  const cursor = Food.find({}, { fdcId: 1 }).cursor();
  let processed = 0;

  for (let food = await cursor.next(); food != null; food = await cursor.next()) {
    const fdcId = food.fdcId;
    // Pull all nutrient _ids for this food
    const ids = await Nutrient.find({ foodFdcId: fdcId }, { _id: 1 }).lean();
    const idList = ids.map(x => x._id);
    await Food.updateOne(
      { _id: food._id },
      { $set: { nutrientIds: idList, nutrientCount: idList.length } }
    );
    processed++;
    if (processed % 100 === 0) {
      console.log(`Backfilled ${processed} foods...`);
    }
  }

  console.log("Backfill complete");
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
