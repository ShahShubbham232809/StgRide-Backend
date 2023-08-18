const mongoose = require('mongoose')
// const { env } = require("process");
require("dotenv").config()
// console.log(process.env.MONGO_URL)
const url = `mongodb://localhost:27017/finaltask`;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
     console.log("DB")
})
.catch((err)=>{
        console.log("Not", err)
})