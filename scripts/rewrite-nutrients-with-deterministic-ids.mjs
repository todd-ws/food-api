// Rewrites data/nutrients.ndjson adding deterministic string _id values so you can pre-know IDs.
// _id format: "<foodFdcId>:<nutrientId>:<foodNutrientId|0>"
// Usage: node scripts/rewrite-nutrients-with-deterministic-ids.mjs data/nutrients.ndjson data/nutrients.deterministic.ndjson
import fs from "fs";

const [,, inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node scripts/rewrite-nutrients-with-deterministic-ids.mjs <in> <out>");
  process.exit(1);
}

const lines = fs.readFileSync(inPath, "utf-8").split(/\r?\n/).filter(Boolean);
const out = lines.map(l => {
  const doc = JSON.parse(l);
  const foodFdcId = doc.foodFdcId ?? "NA";
  const nutrientId = doc.nutrientId ?? "NA";
  const foodNutrientId = doc.foodNutrientId ?? 0;
  const id = `${foodFdcId}:${nutrientId}:${foodNutrientId}`;
  return JSON.stringify({ _id: id, ...doc });
}).join("\n") + "\n";

fs.writeFileSync(outPath, out, "utf-8");
console.log("Wrote", outPath);
