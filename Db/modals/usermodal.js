const mongoose = require("mongoose");

const UserSChema = mongoose.Schema(
  {
    profile: {
      type: String,
      // required:true
      default: "1687516238638-131334835user.png",
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
    countrycode: {
      type: String,
    },
    countryid: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "countries",
    },
    number: {
      required: true,
      type: String,
    },
    customerid: {
      // required:true,
      type: String,
      // unique:true
    },
    paymentMethodId:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const UsersRegister = new mongoose.model("userslist", UserSChema);

module.exports = { UsersRegister };
