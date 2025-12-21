import mongoose from "mongoose";
const NutrientSchema = new mongoose.Schema(
  {
    foodFdcId: { type: Number, required: true, index: true },
    foodNutrientId: { type: Number, index: true },
    amount: Number,
    nutrientId: { type: Number, index: true },
    nutrientNumber: String,
    nutrientName: String,
    nutrientRank: Number,
    unitName: String,
    derivationCode: String,
    derivationDescription: String,
    sourceId: Number,
    sourceCode: String,
    sourceDescription: String,
  },
  { timestamps: true }
);
NutrientSchema.index({ foodFdcId: 1, nutrientId: 1 });
export const Nutrient = mongoose.model(
  "Nutrient",
  NutrientSchema,
  process.env.DB_NUTRITION_COLLECTION || "nutritionfacts"
);
