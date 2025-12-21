import { Router } from "express";
import { listNutrients,getNutrient,createNutrient,patchNutrient,deleteNutrient } from "../controllers/nutrients.controller.mjs";
const router=Router();
router.get("/",listNutrients);
router.get("/:id",getNutrient);
router.post("/",createNutrient);
router.patch("/:id",patchNutrient);
router.delete("/:id",deleteNutrient);
export default router;