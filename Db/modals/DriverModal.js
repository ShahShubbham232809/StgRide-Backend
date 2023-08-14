const mongoose = require("mongoose");

const DriverSChema = mongoose.Schema({
  profile: {
    type: String,
    // required:true
    default:"1687772121748-248269597user.png"
  },
  name: {
    type: String,
    required: true,
    trim: true, // Trim whitespace from the beginning and end of the string
    lowercase: true, // Convert the string to lowercase
  },
  email: {
    unique: true,
    type: String,
    required: true,
    trim: true, // Trim whitespace from the beginning and end of the string
    lowercase: true, // Convert the string to lowercase
  },
  countrycode:{
    required:true,
    type:String
  },
  number: {
    required: true,
    type: String,
    unique:true
  },
  countryid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "countries",
  },
  cityid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "cities",
  },
  typeid: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: "cars",
  },
  Status: {
    type: String,
  },
  RideStatus: {
    type: String,
  },
},  {
  timestamps: true,
});

const DriverRegister = new mongoose.model("driverslist", DriverSChema);

module.exports = { DriverRegister };
