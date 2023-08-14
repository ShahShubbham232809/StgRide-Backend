const mongoose = require("mongoose");

const VehiclePriceSchema = mongoose.Schema({
  countryid:{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'countries'
  },
  cityid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'cities'
  },
  typeid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'cars'
  },
  DriverProfit: {
    type: Number,
    required: true,
  },
  MinFarePrice: {
    type: Number,
    required: true,
  },
  BasePriceDistance: {
    type: String,
    required: true,
  },
  BasePrice: {
    type: Number,
    required: true,
  },
  DistancePrice: {
    type: Number,
    required: true,
  },
  TimePrice: {
    type: Number,
    required: true,
  },
  MaxSpace: {
    type: Number,
    required: true,
  },
},  {
  timestamps: true,
});

const VehiclePrice = mongoose.model("VehiclePrice", VehiclePriceSchema);

module.exports = {VehiclePrice};