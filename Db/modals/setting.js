require('dotenv').config()
const mongoose = require('mongoose')

const SettingsType = new mongoose.Schema({
    TimeOut:{
        type:Number,
    },
    Stop:{
        type:Number,
    },
    NodemailerEmail:{
        type:String,
    },
    NodemailerPassword:{
        type:String,
    },
    StripeSecreteKey:{
        type:String,
    },
    StripePublishableKey:{
        type:String,
    },
    TwilioAccountid:{
        type:String,
    },
    TwilioAuthToken:{
        type:String,
    }
},
{
    timestamps: true,
  })

const Settings = new mongoose.model('setting',SettingsType);

module.exports = {Settings};