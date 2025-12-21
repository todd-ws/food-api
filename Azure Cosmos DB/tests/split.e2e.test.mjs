import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app.mjs";
import { connectDB } from "../src/config/db.mjs";
import { Nutrient } from "../src/models/nutrient.model.mjs";

describe("Food & Nutrient (split)", ()=>{
  let mongo;
  beforeAll(async()=>{ mongo=await MongoMemoryServer.create(); const uri=mongo.getUri(); await connectDB(uri); });
  afterAll(async()=>{ await mongoose.disconnect(); if(mongo) await mongo.stop(); });

  it("CRUD: Food + relation + cascade", async()=>{
    // create food
    let res = await request(app).post("/api/foods").send({ fdcId: 800001, description: "Food X" });
    expect(res.statusCode).toBe(201);

    // add nutrient (nested)
    res = await request(app).post("/api/foods/800001/nutrients").send({ nutrientId: 1003, nutrientName: "Protein", unitName:"g", amount: 9.1 });
    expect(res.statusCode).toBe(201);

    // list nutrients
    res = await request(app).get("/api/foods/800001/nutrients");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);

    // include nutrients on get
    res = await request(app).get("/api/foods/800001?includeNutrients=true");
    expect(res.statusCode).toBe(200);
    expect(res.body.nutrients.length).toBe(1);

    // cascade delete
    await Nutrient.create([{ foodFdcId:800001, nutrientId: 2000 }]);
    res = await request(app).delete("/api/foods/800001");
    expect(res.statusCode).toBe(200);
    const left = await Nutrient.countDocuments({ foodFdcId:800001 });
    expect(left).toBe(0);
  });

  it("CRUD: Nutrient direct", async()=>{
    // create food for FK
    await request(app).post("/api/foods").send({ fdcId: 800002, description: "Food Y" });
    // create nutrient
    let res = await request(app).post("/api/nutrients").send({ foodFdcId:800002, nutrientId:1005, nutrientName:"Carbs", unitName:"g", amount: 30 });
    expect(res.statusCode).toBe(201);
    const id = res.body._id;

    // read
    res = await request(app).get(`/api/nutrients/${id}`);
    expect(res.statusCode).toBe(200);

    // patch
    res = await request(app).patch(`/api/nutrients/${id}`).send({ amount: 31 });
    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(31);

    // list with filters
    res = await request(app).get("/api/nutrients?foodFdcId=800002&nutrientId=1005");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);

    // delete
    res = await request(app).delete(`/api/nutrients/${id}`);
    expect(res.statusCode).toBe(200);
  });
});