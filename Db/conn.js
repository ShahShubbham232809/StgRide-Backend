const mongoose = require('mongoose')
// const { env } = require("process");
require("dotenv").config()
// console.log(process.env.MONGO_URL)
const url = `mongodb+srv://Stg:8160681684@cluster0.nxrvqte.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
     console.log("DB")
})
.catch((err)=>{
        console.log("Not", err)
})