const { urlencoded } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const router = new express.Router();
const { CityRegister } = require("../Db/modals/citymodel");
const { VehiclePrice } = require("../Db/modals/vehicleprice");

// ─── Edit City ───────────────────────────────────────────────────────────────


router.get("/list/edit/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await CityRegister.findById(_id)
    .populate('countryid')
    if (!data) {
      res.status(404).send();
      //  
    } else {
      return res.send(data);
    }
  } catch (err) {
    res.status(404).send(err);
     
  }
});


// ─── Get City By Country ─────────────────────────────────────────────────────


router.get("/list/country/:key", async (req, res) => {
  try {
    const _country = req.params.key;
     
    const data = await CityRegister.find({ countryid: _country });
    if (!data) {
      res.status(404).send();
      //  
    } else {
      return res.send(data);
    }
  } catch (err) {
    res.status(404).send(err);
     
  }
});


// ─── Get Polygons By Country ─────────────────────────────────────────────────


router.post("/list/polygons", async (req, res) => {
  try {
    const data = await CityRegister.find({countryid:req.body.countryid})
    .populate("countryid")
    res.send(data);
  } catch (err) {
    res.status(400).send(err.message.split(":")[2]);
  }
});


// ─── Get City List ───────────────────────────────────────────────────────────


router.get("/list", async (req, res) => {
  try {
    const data = await CityRegister.find()
    .populate("countryid")
    res.send(data);
  } catch (err) {
    res.status(400).send(err.message.split(":")[2]);
  }
});


// ─── Get Cordinates Of Country ───────────────────────────────────────────────


router.get("/list/cordinates", async (req, res) => {
  try {
    const data = await CityRegister.find({cordinates:{$exists: true}},{cordinates:1,_id:0})
    res.send(data);
  } catch (err) {
    res.status(400).send(err.message.split(":")[2]);
  }
});


// ─── Update City ─────────────────────────────────────────────────────────────


router.post("/list/:id", async (req, res) => {
  try {
     
    const _id = req.params.id;

    let city = await CityRegister.findByIdAndUpdate(
      _id,
      {
        $set: {
          countryid: req.body.countryid,
          cityname: req.body.cityname,
          cordinates: req.body.cordinates,
        },
      },
      { new: true, runvalidators: true }
    );

    res.send(city);
  } catch (error) {
    res.send(error);
  }
});


// ─── Add City ────────────────────────────────────────────────────────────────


router.post("/list", async (req, res) => {
  try {
     
    let city = new CityRegister({
      countryid: req.body.countryid,
      cityname: req.body.cityname,
      cordinates: req.body.cordinates,
    });
    const data = await city.save();
    res.status(201).send(data);
  } catch (error) {
     
    res.send(error);
  }
});



// ─── Delete City ─────────────────────────────────────────────────────────────


router.delete("/list/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await CityRegister.findByIdAndDelete(_id);
    if (!data) {
      return res.status(404).send();
    }
    res.send(data);
  } catch (err) {
    res.status(404).send(err);
  }
});


// ─── Find Country By Cordinates ──────────────────────────────────────────────


router.post("/list/foundcity/cordinates", async (req, res) => {
  try {
     
    const cordinates = req.body.cordinates;
    const data = await CityRegister.find({cordinates:cordinates}).populate("countryid")
    if (!data) {
      res.status(404).send();
      //  
    } else {
      return res.send(data);
    }
  } catch (err) {
     
    res.status(404).send(err);
  }
});

module.exports = router;
