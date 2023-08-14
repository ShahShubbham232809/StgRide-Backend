require('dotenv').config()
const mongoose = require('mongoose')
const validator = require('validator')
const session = require('express-session')
const jwt=require('jsonwebtoken')
const userSchema =  new mongoose.Schema({
    profile:{
        type:String,
        // required:true,
        default:"images.png"
    },
    firstname:{
        type:String,
        required:true,
        trim: true, // Trim whitespace from the beginning and end of the string
        lowercase: true, // Convert the string to lowercase
    },
    lastname:{
        type:String,
        required:true,
        trim: true, // Trim whitespace from the beginning and end of the string
        lowercase: true, // Convert the string to lowercase

    },
    email:{
        trim:true,
        required:true,
        unique:true,
        type:String,
        trim: true, // Trim whitespace from the beginning and end of the string
        lowercase: true, // Convert the string to lowercase
    },
    password:{
        type:String,
        // minlength:8,
        required:true
    },
    number:{
        trim:true,
        type:String,
        required:true,
        unique:true,
    },
    tokens:[{
        token:{
            type:String,
            required:true,
        }
    }]

},  {
    timestamps: true,
  })


userSchema.methods.generateToken= async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString() },process.env.secret_key)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

const UserRegister = new mongoose.model('User',userSchema);
// const AdminRegister = new mongoose.model('Admin',adminSchema);


module.exports = {UserRegister};