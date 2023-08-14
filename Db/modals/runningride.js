const mongoose = require("mongoose");
const RunningRideType = new mongoose.Schema(
  {
    paymentOption: {
      type: String,
    },
    rideTime: {
      type: String,
    },
    serviceType: {
      type: String,
    },
    rideDate: {
      type: String,
    },
    driverID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "driverslist",
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "cars",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "userslist",
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "cities",
    },
    rideId:{
      type: mongoose.Schema.Types.ObjectId,
    },
    startLocation: {
      type: String,
    },
    endLocation: {
      type: String,
    },
    wayPoints: {
      type: Object,
    },
    totalDistance: {
      type: String,
    },
    totalTime: {
      type: String,
    },
    estimateFare: {
      type: String,
    },
    status:{
      type:String,
    },
    available:{
      type:String
    },
    AcceptedRide:{
      type:String
    },
    NearestDriverList:[{
      driverid:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "driverslist"
      }
    }],
  },
  {
    timestamps: true,
  }
);


const RunningRideRegister = new mongoose.model("runningride", RunningRideType);
module.exports = { RunningRideRegister };
