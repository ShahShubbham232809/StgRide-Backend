const { urlencoded } = require("express");
const moongose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const router = new express.Router();
const { CountryRegister } = require("../Db/modals/countrymodal");

// ─── See Country ─────────────────────────────────────────────────────────────


router.get("/list", async (req, res) => {
  try {
    const data = await CountryRegister.find();
    res.send(data);
  } catch (err) {
    res.status(400).send(err.message.split(":")[2]);
  }
});


// ─── Update Country ──────────────────────────────────────────────────────────


router.post("/list/:id", async (req, res) => {
  try {
     
    const _id = req.params.id;
    let country = await CountryRegister.findByIdAndUpdate(
      _id,
      {
        $set: {
          flag: req.body.flagpath,
          countryname: req.body.countryname,
          countrytimezone: req.body.countrytimezone,
          countrycode: req.body.countrycode,
          currency: req.body.currency,
        },
      },
      { new: true, runvalidators: true }
    );

    res.send(country);
  } catch (error) {
    res.send(error);
  }
});


// ─── Find Country By Id ──────────────────────────────────────────────────────


router.get("/list/idfind/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await CountryRegister.findOne({ country: _id });
    if (!data) {
      res.status(404).send();
       
    } else {
      return res.send(data);
    }
  } catch (err) {
    res.status(404).send(err);
     
  }
});


// ─── Add Country ─────────────────────────────────────────────────────────────


router.post("/list", async (req, res) => {
  try {
     
    let country = new CountryRegister({
      flag: req.body.flagpath,
      countryname: req.body.countryname,
      countrytimezone: req.body.countrytimezone,
      countrycode: req.body.countrycode,
      currency: req.body.currency,
    });
    const data = await country.save();
    res.status(201).send(data);
  } catch (error) {
     
    res.send(error);
  }
});


// ─── Delete Country ──────────────────────────────────────────────────────────


router.delete("/list/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await CountryRegister.findByIdAndDelete(_id);
    if (!data) {
      return res.status(404).send();
    } else {
      // fs.unlinkSync(`${img_path}/${data.file}`)
      res.status(200).send(data);
    }
  } catch (err) {
    res.status(404).send(err);
  }
});


// ─── Search Country ──────────────────────────────────────────────────────────


router.get("/search/:key", async function (req, res) {
   
  const value = req.params.key;
  //  
  try {
    const escapedKey = req.params.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const country = await CountryRegister.find({
      $or: [
        {
          countryname: { $regex: new RegExp(escapedKey, "i") },
        },
        { countrycode: { $regex: new RegExp(escapedKey, "i") } },
        { countrytimezone: { $regex: new RegExp(escapedKey, "i") } },
        { currency: { $regex: new RegExp(escapedKey, "i") } },
      ],
    });
    if (!country) {
       
      return res.send("No Country found");
    }
     
    res.send(country);
  } catch (error) {
    //
     
     
     
    res .send(error);
  }
});


module.exports = router;
