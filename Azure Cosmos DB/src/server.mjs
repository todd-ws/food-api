import "dotenv/config"; import app from "./app.mjs"; import { connectDB } from "./config/db.mjs";
const port=Number(process.env.PORT||3000);
(async()=>{await connectDB(process.env.MONGO_URI); app.listen(port,()=>console.log(`Food API (split) on http://localhost:${port}`));})().catch(e=>{console.error("Failed to start:",e);process.exit(1);});