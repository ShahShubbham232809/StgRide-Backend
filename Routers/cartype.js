const { urlencoded } = require('express');
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs'); 
const path = require("path")
const router = new express.Router()
const {VehicleRegister} = require("../Db/modals/carmodal");
const img_path = path.join(__dirname,"../Public/car")


const storage = multer.diskStorage({
destination: function (req, res, cb) {  
    cb(null, "./Public/car");
},
filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,uniqueSuffix+file.originalname);
},
});
const upload = multer({ storage });


// ─── Edit Car ────────────────────────────────────────────────────────────────


router.get("/list/edit/:id",async(req,res)=>{
try{
    const _id = req.params.id
    const data = await VehicleRegister.findById(_id)
    if(!data){
        res.status(404).send()
        //  
    }else{
        return res.send(data)
    }}catch(err){
        res.status(404).send(err)
         
    }
    
})


// ─── Get All Cars By Pagination ──────────────────────────────────────────────


router.get("/list/:page/:limit",async(req,res)=>{
    const page = req.params.page
    const limit = req.params.limit
            try{
                const data = await VehicleRegister.find().skip(page).limit(limit)
                res.send(data)   
        
    }catch(err){
        res.status(400).send(err.message.split(':')[2])
    }
})


// ─── Get All Cars ────────────────────────────────────────────────────────────


router.get("/list",async(req,res)=>{
    const page = req.params.page
    const limit = req.params.limit
            try{
                const data = await VehicleRegister.find()
                res.send(data)   
        
    }catch(err){
        res.status(400).send(err.message.split(':')[2])
    }
})


// ─── Update Car ──────────────────────────────────────────────────────────────


    
router.post("/list/:id",upload.single('profile'),async(req, res) => {
    try{
             
            const _id = req.params.id
            
            if(req.file){
                let car = await VehicleRegister.findByIdAndUpdate(_id,{
                    $set:{
                     cartype:req.body.cartype,
                     profile:req.file.filename
                    }},
                    {new:true,runvalidators:true},
                 )
            }else{
                let car = await VehicleRegister.findByIdAndUpdate(_id,{
                    $set:{
                     cartype:req.body.cartype,
                    }},
                    {new:true,runvalidators:true},
                 )
            }
            res.send(car)
    }catch(error){
        res.send(error)
    }
})


// ─── Add Car ─────────────────────────────────────────────────────────────────



router.post("/list",upload.single("profile"),async(req,res)=>{
    try{
         
    let car = new VehicleRegister({
        cartype:req.body.cartype,
        // name:req.body.name
        })
        if(req.file){
            car.profile = req.file.filename
        }
        const data = await car.save()
        res.status(201).send(data)
    }catch(error){
         
        res.send(error)
    }
})
    


// ─── Delete Car ──────────────────────────────────────────────────────────────


router.delete("/list/:id",async(req,res)=>{
    try{
        const _id = req.params.id
        const data = await VehicleRegister.findByIdAndDelete(_id)
        if(!data){
            return res.status(404).send()
        }else{
            fs.unlinkSync(`${img_path}/${data.profile}`)
            res.status(200).send(data)
        }
    }catch(err){
         
         
         
        res.status(404).send(err)
        }
        
    })


module.exports = router; 