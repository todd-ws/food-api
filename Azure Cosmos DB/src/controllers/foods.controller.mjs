import { Food } from "../models/food.model.mjs";
import { Nutrient } from "../models/nutrient.model.mjs";
export async function listFoods(req, res, next) {
  try {
    const { q, limit = 20, skip = 0 } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    const docs = await Food.find(filter)
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();
    res.json({ data: docs });
  } catch (e) {
    next(e);
  }
}
export async function getFood(req, res, next) {
  try {
    const { fdcId } = req.params;
    const include =
      String(req.query.includeNutrients || "false").toLowerCase() === "true";
    const doc = await Food.findOne({ fdcId: Number(fdcId) }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (include) {
      const nutrients = await Nutrient.find({
        foodFdcId: Number(fdcId),
      }).lean();
      return res.json({ ...doc, nutrients });
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
}
export async function createFood(req, res, next) {
  try {
    const b = req.body;
    if (!b?.fdcId) return res.status(400).json({ error: "fdcId is required" });
    const created = await Food.create(b);
    res.status(201).json(created);
  } catch (e) {
    if (e?.code === 11000)
      return res.status(409).json({ error: "Duplicate fdcId" });
    next(e);
  }
}
export async function patchFood(req, res, next) {
  try {
    const { fdcId } = req.params;
    const up = await Food.findOneAndUpdate(
      { fdcId: Number(fdcId) },
      { $set: req.body },
      { new: true }
    );
    if (!up) return res.status(404).json({ error: "Not found" });
    res.json(up);
  } catch (e) {
    next(e);
  }
}
export async function deleteFood(req, res, next) {
  try {
    const { fdcId } = req.params;
    const rem = await Food.findOneAndDelete({ fdcId: Number(fdcId) });
    if (!rem) return res.status(404).json({ error: "Not found" });
    await Nutrient.deleteMany({ foodFdcId: Number(fdcId) });
    res.json({ ok: true, cascaded: true });
  } catch (e) {
    next(e);
  }
}
export async function listFoodNutrients(req, res, next) {
  try {
    const { fdcId } = req.params;
    const items = await Nutrient.find({ foodFdcId: Number(fdcId) }).lean();
    res.json({ data: items });
  } catch (e) {
    next(e);
  }
}
export async function addFoodNutrient(req, res, next) {
  try {
    const { fdcId } = req.params;
    const body = req.body || {};
    body.foodFdcId = Number(fdcId);
    const created = await Nutrient.create(body);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
}
