const mongoose = require("mongoose");
// ─── Enum For Status ─────────────────────────────────────────────────────────
const Status = {
  PENDING: 0,
  ASSIGNING: 1,
  REJECTED: 2,
  CANCELLED: 3,
  ACCEPTED: 4,
  ARRIVED: 5,
  STARTED: 6,
  COMPLETED: 7,
};

const CreteRideType = new mongoose.Schema(
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
    driverID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "driverslist",
    },
    NearestDriverList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "driverslist",
      },
    ],
    Status: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    RideStatus: {
      type: String,
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
    DriverProfit:{
      type:String
    },
    AssigingTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const CreateRideRegister = new mongoose.model("createride", CreteRideType);
module.exports = { CreateRideRegister };
