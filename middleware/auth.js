require('dotenv').config()
const jwt = require('jsonwebtoken')
const {UserRegister} = require('../Db/modals/models')
require('../Db/conn')

const auth = async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.secret_key)
        if (!verifyUser) {
            throw new Error("Provide valid credentials")
        }
            const user = await UserRegister.findOne({_id:verifyUser._id})
            req.user = user
            req.token = token
             
             
             
        
        next()
    }catch(err){
            res.status(401).send("Provide valid credentials");
             
    }
}

module.exports = auth;