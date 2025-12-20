import axios from "axios";
const api = axios.create({ baseURL: process.env.BASE_URL || "http://localhost:3000" });
(async function run(){
  const { data: food } = await api.post("/api/foods", { fdcId: 7654321, description: "Axios Split Food" });
  await api.post(`/api/foods/${food.fdcId}/nutrients`, { nutrientId: 1003, nutrientName: "Protein", unitName: "g", amount: 9.99 });
  const list = await api.get(`/api/foods/${food.fdcId}/nutrients`); console.log("Nutrients:", list.data.data.length);
  const joined = await api.get(`/api/foods/${food.fdcId}?includeNutrients=true`); console.log("Joined:", joined.data.nutrients.length);
  const { data: n } = await api.post("/api/nutrients", { foodFdcId: food.fdcId, nutrientId: 1005, nutrientName: "Carbs", unitName: "g", amount: 22 });
  await api.patch(`/api/nutrients/${n._id}`, { amount: 23 });
  await api.delete(`/api/nutrients/${n._id}`);
  await api.delete(`/api/foods/${food.fdcId}`);
})();