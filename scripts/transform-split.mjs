// scripts/transform-split.mjs
// Usage: node scripts/transform-split.mjs <input.ndjson> <foods.out> <nutrients.out>
import fs from "fs";
import path from "path";
import readline from "readline";

const [, , inPath, foodsOut, nutsOut] = process.argv;
if (!inPath || !foodsOut || !nutsOut) {
  console.error(
    "Usage: node scripts/transform-split.mjs <input.ndjson> <foods.out> <nutrients.out>"
  );
  process.exit(1);
}

await fs.promises.mkdir(path.dirname(foodsOut), { recursive: true });
await fs.promises.mkdir(path.dirname(nutsOut), { recursive: true });

const rl = readline.createInterface({
  input: fs.createReadStream(inPath, { encoding: "utf-8" }),
});
const foodWriter = fs.createWriteStream(foodsOut, { encoding: "utf-8" });
const nutWriter = fs.createWriteStream(nutsOut, { encoding: "utf-8" });

function normFood(doc) {
  return {
    fdcId: doc.fdcId,
    foodClass: doc.foodClass,
    dataType: doc.dataType,
    description: doc.description,
    brandOwner: doc.brandOwner,
    brandedFoodCategory: doc.brandedFoodCategory,
    gtinUpc: doc.gtinUpc,
    marketCountry: doc.marketCountry,
    ingredients: doc.ingredients,
    servingSize: doc.servingSize,
    servingSizeUnit: doc.servingSizeUnit,
    householdServingFullText: doc.householdServingFullText,
    publicationDate: doc.publicationDate,
    availableDate: doc.availableDate,
    modifiedDate: doc.modifiedDate,
    tradeChannels: doc.tradeChannels || [],
  };
}

function emitNutrients(doc) {
  const arr = Array.isArray(doc.foodNutrients) ? doc.foodNutrients : [];
  for (const fn of arr) {
    const nutrient = fn?.nutrient || {};
    const deriv = fn?.foodNutrientDerivation || {};
    const src = deriv?.foodNutrientSource || {};
    nutWriter.write(
      JSON.stringify({
        foodFdcId: doc.fdcId,
        foodNutrientId: fn?.id,
        amount: fn?.amount,
        nutrientId: nutrient?.id,
        nutrientNumber: nutrient?.number,
        nutrientName: nutrient?.name,
        nutrientRank: nutrient?.rank,
        unitName: nutrient?.unitName,
        derivationCode: deriv?.code,
        derivationDescription: deriv?.description,
        sourceId: src?.id,
        sourceCode: src?.code,
        sourceDescription: src?.description,
      }) + "\n"
    );
  }
}

let n = 0;
rl.on("line", (line) => {
  if (!line.trim()) return;
  const doc = JSON.parse(line);
  foodWriter.write(JSON.stringify(normFood(doc)) + "\n");
  emitNutrients(doc);
  if (++n % 100000 === 0) console.log(`Processed ${n} lines…`);
});

await new Promise((res) => rl.on("close", res));
foodWriter.end();
nutWriter.end();
console.log("Done.");
