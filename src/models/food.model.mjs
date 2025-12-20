import mongoose from "mongoose";
const FoodSchema = new mongoose.Schema({
  fdcId:{type:Number,required:true,unique:true},
  foodClass:String,dataType:String,description:{type:String,index:true},
  brandOwner:{type:String,index:true},brandedFoodCategory:{type:String,index:true},
  gtinUpc:String,marketCountry:String,ingredients:String,servingSize:Number,
  servingSizeUnit:String,householdServingFullText:String,publicationDate:String,
  availableDate:String,modifiedDate:String,tradeChannels:[String],
  nutrientIds:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Nutrient' }],
  nutrientCount:{ type:Number, default:0 }
},{timestamps:true});
FoodSchema.index({description:"text",brandOwner:"text",brandedFoodCategory:"text"});
export const Food = mongoose.model("Food", FoodSchema, process.env.DB_FOODS_COLLECTION || "foundationfoods");