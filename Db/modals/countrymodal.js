require('dotenv').config()
const mongoose = require('mongoose')

const CountryType = new mongoose.Schema({
    flag:{
        type:String,
        required:true
    },
    countryname:{
        unique:true,
        type:String,
        trim: true, // Trim whitespace from the beginning and end of the string
        lowercase: true, // Convert the string to lowercase
        // required:true
    },
    
    countrytimezone:{
        type:String,
        required:true,
    },
    countrycode:{
        type:String,
        required:true,
    },
    currency:{
        type:String,
        required:true,
    }
    
} ,{
    timestamps: true,
  })

const CountryRegister = new mongoose.model('countries',CountryType);

module.exports = {CountryRegister};