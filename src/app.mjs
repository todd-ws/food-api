import express from "express"; import cors from "cors"; import helmet from "helmet"; import morgan from "morgan";
import foodsRouter from "./routes/foods.routes.mjs"; import nutrientsRouter from "./routes/nutrients.routes.mjs";
const app=express();
app.use(helmet()); app.use(cors()); app.use(express.json({limit:"1mb"})); app.use(morgan("dev"));
app.get("/healthz",(req,res)=>res.json({ok:true}));
app.use("/api/foods", foodsRouter);
app.use("/api/nutrients", nutrientsRouter);
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:"Internal Server Error"});});
export default app;