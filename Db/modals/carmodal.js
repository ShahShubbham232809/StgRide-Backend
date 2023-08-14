require('dotenv').config()
const mongoose = require('mongoose')

const VehicleType = new mongoose.Schema({
    profile:{
        type:String,
        // required:true
    },
    
    cartype:{
        unique:true,
        type:String,
        required:true,
        trim: true, // Trim whitespace from the beginning and end of the string
        lowercase: true, // Convert the string to lowercase
    }
    
},  {
    timestamps: true,
  })

const VehicleRegister = new mongoose.model('cars',VehicleType);

module.exports = {VehicleRegister};