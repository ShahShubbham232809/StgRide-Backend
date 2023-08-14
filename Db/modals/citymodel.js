require("dotenv").config();
const mongoose = require("mongoose");

const CityType = new mongoose.Schema(
  {
    countryid: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "countries",
    },
    cityname: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Trim whitespace from the beginning and end of the string
      lowercase: true, // Convert the string to lowercase
    },
    cordinates: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const CityRegister = new mongoose.model("cities", CityType);

module.exports = { CityRegister };
