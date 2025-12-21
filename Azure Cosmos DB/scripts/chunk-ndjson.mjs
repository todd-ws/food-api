// scripts/chunk-ndjson.mjs
// Usage: node scripts/chunk-ndjson.mjs <inputPath> <linesPerChunk> <outDir> <prefix>
import fs from "fs";
import readline from "readline";
import path from "path";

const [, , inPath, linesArg, outDir, prefix] = process.argv;
if (!inPath || !linesArg || !outDir || !prefix) {
  console.error(
    "Usage: node scripts/chunk-ndjson.mjs <inputPath> <linesPerChunk> <outDir> <prefix>"
  );
  process.exit(1);
}

const linesPerChunk = Number(linesArg);
if (!Number.isInteger(linesPerChunk) || linesPerChunk <= 0) {
  console.error("linesPerChunk must be a positive integer");
  process.exit(1);
}

await fs.promises.mkdir(outDir, { recursive: true });

let writer = null,
  count = 0,
  idx = 0;
function nextWriter() {
  if (writer) writer.end();
  idx++;
  const name = `${prefix}_chunk_${String(idx).padStart(4, "0")}.ndjson`;
  const outPath = path.join(outDir, name);
  writer = fs.createWriteStream(outPath, { encoding: "utf-8" });
  count = 0;
}

nextWriter();
const rl = readline.createInterface({
  input: fs.createReadStream(inPath, { encoding: "utf-8" }),
});

rl.on("line", (line) => {
  if (!line.trim()) return; // skip blank lines defensively
  writer.write(line + "\n");
  count++;
  if (count >= linesPerChunk) nextWriter();
});

await new Promise((resolve) => rl.on("close", resolve));
if (writer) writer.end();
console.log("Chunking complete →", outDir);
