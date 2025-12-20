# Food API (Split Collections): Food ↔ Nutrients (1—N)

**Separate collections** with relation by `foodFdcId` (Number). Includes: CRUD for both entities, nested relation endpoints, split NDJSON (foods & nutrients), chunking + mongoimport scripts, Node seeder, Jest E2E tests, Postman, and axios examples.

## Quickstart
```bash
cp .env.example .env
npm i
npm run start
curl http://localhost:${PORT:-3000}/healthz
```

## Import
```bash
export MONGO_URI="$(grep MONGO_URI .env | cut -d'=' -f2- | tr -d '"')"
bash scripts/import-food-chunks.sh
bash scripts/import-nutrient-chunks.sh
```
One-off:
```bash
mongoimport --uri "$MONGO_URI" --collection foundationfoods --type json --file data/foods.ndjson --mode insert
mongoimport --uri "$MONGO_URI" --collection nutritionfacts --type json --file data/nutrients.ndjson --mode insert
```

## API
- GET /api/foods (?q, limit, skip)
- GET /api/foods/:fdcId (?includeNutrients=true)
- POST /api/foods
- PATCH /api/foods/:fdcId
- DELETE /api/foods/:fdcId  # cascades nutrients
- GET /api/foods/:fdcId/nutrients
- POST /api/foods/:fdcId/nutrients

- GET /api/nutrients (?foodFdcId, nutrientId)
- GET /api/nutrients/:id
- POST /api/nutrients
- PATCH /api/nutrients/:id
- DELETE /api/nutrients/:id

## Tests
npm test

---
## Optional: Pre-known Nutrient IDs or Denormalized Pointers

**Baseline**: The split design does *not* require Food to know Nutrient IDs at import time. Nutrients carry the FK (`foodFdcId`) and queries join by that key.

**If you need Food → nutrientIds pre-populated:**
1) Import Foods, then import Nutrients.
2) Run a post-import backfill to denormalize IDs into each Food:
```bash
node scripts/backfill-food-nutrient-ids.mjs
```
This populates `Food.nutrientIds` and `Food.nutrientCount` using `$addToSet` semantics.

**If you need deterministic Nutrient IDs *before* import:**
1) Rewrite nutrients to include stable string `_id` values derived from the source fields:
```bash
node scripts/rewrite-nutrients-with-deterministic-ids.mjs data/nutrients.ndjson data/nutrients.deterministic.ndjson
mongoimport --uri "$MONGO_URI" --collection nutritionfacts --type json --file data/nutrients.deterministic.ndjson --mode upsert --upsertFields _id
```
2) Now you can reference those pre-known IDs anywhere (e.g., materialize into Foods or external systems) without waiting for the DB to generate ObjectIds.

node scripts/transform-split.mjs data/food-classes.ndjson data/foods.ndjson data/nutrients.ndjson

# Foods
mongoimport --uri "$MONGO_URI" \
  --collection foundationfoods \
  --type json \
  --file data/foods.ndjson \
  --mode insert

# Nutrients
mongoimport --uri "$MONGO_URI" \
  --collection nutritionfacts \
  --type json \
  --file data/nutrients.ndjson \
  --mode insert