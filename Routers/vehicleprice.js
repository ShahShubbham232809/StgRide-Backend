const { urlencoded } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const router = new express.Router();
const { VehiclePrice } = require("../Db/modals/vehicleprice");


// ─── City Service List ───────────────────────────────────────────────────────


router.post("/list/cityservicelist", async (req, res) => {
  try {
    const id = req.body.val
    const data = await VehiclePrice.find({ cityid: id })
    .populate('typeid')
     
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


// ─── Edit Vehiclepricing ─────────────────────────────────────────────────────


router.get("/list/edit/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await VehiclePrice.findById(_id)
    .populate('countryid')
    .populate('cityid')
    .populate('typeid')
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


// ─── Get Vehiclepricing with Pagination ─────────────────────────────────────


router.get("/list/:page/:limit/:sorting", async (req, res) => {
  try {
    let sort = 1;
    const sorting = req.params.sorting;
     
    if (sorting == "asc") {
      sort = 1;
    } else {
      sort = -1;
    }
    const page = +req.params.page;
    const limit = +req.params.limit;
    const aggregationPipeline = [
      {
        $facet: {
          data: [
            {
              $sort: { [sorting]: sort },
            },
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
            {
              $lookup: {
                from: "countries", 
                localField: "countryid",
                foreignField: "_id",
                as: "countryid",
              },
            },
            {
              $unwind: "$countryid",
              // preserveNullAndEmptyArrays: true
            },
            {
              $lookup: {
                from: "cities", 
                localField: "cityid",
                foreignField: "_id",
                as: "cityid",
              },
            },
            {
              $unwind: "$cityid",
              // preserveNullAndEmptyArrays: true
            },
            {
              $lookup: {
                from: "cars",
                localField: "typeid",
                foreignField: "_id",
                as: "typeid",
              },
            },
            {
              $unwind: { path: "$typeid", preserveNullAndEmptyArrays: true },
            },
          ],
          count: [
            {
              $count: "total",
            },
          ],
        },
      },
      
    ];
    const result = await VehiclePrice.aggregate(aggregationPipeline);

    const data = result[0].data;
    const count = result[0].count[0].total;
    res.send({ data, count });
  } catch (err) {
     
    res.status(400).send(err.message.split(":")[2]);
  }
});


// ─── Update Vehiclepricing ─────────────────────────────────────────────────────


router.post("/list/:id", async (req, res) => {
  try {
     
    const _id = req.params.id;
    let city = await VehiclePrice.findByIdAndUpdate(
      _id,
      {
        $set: {
          countryid: req.body.countryid,
          cityid: req.body.cityid,
          typeid: req.body.typeid,
          country: req.body.country,
          city: req.body.city,
          type: req.body.type,
          DriverProfit: req.body.DriverProfit,
          MinFarePrice: req.body.MinFarePrice,
          BasePriceDistance: req.body.BasePriceDistance,
          BasePrice: req.body.BasePrice,
          DistancePrice: req.body.DistancePrice,
          TimePrice: req.body.TimePrice,
          MaxSpace: req.body.MaxSpace,
        },
      },
      { new: true, runvalidators: true }
    );

    res.send(city);
  } catch (error) {
    res.send(error);
  }
});


// ─── Add Vehiclepricing ─────────────────────────────────────────────────────


router.post("/list", async (req, res) => {
  try {
     
    const existingDocument = await VehiclePrice.findOne({
      countryid: req.body.countryid,
      cityid: req.body.cityid,
      typeid: req.body.typeid,
    });

    if (existingDocument) {
      // A document with the same values already exists
      res.json("duplicate");
      // Handle the appropriate error or provide a message to the user
    } else {
      let city = new VehiclePrice({
        country: req.body.country,
        city: req.body.city,
        type: req.body.type,
        countryid: req.body.countryid,
        cityid: req.body.cityid,
        typeid: req.body.typeid,
        DriverProfit: req.body.DriverProfit,
        MinFarePrice: req.body.MinFarePrice,
        BasePriceDistance: req.body.BasePriceDistance,
        BasePrice: req.body.BasePrice,
        DistancePrice: req.body.DistancePrice,
        TimePrice: req.body.TimePrice,
        MaxSpace: req.body.MaxSpace,
      });
      const data = await city.save();
      res.status(201).send(data);
    }
  } catch (error) {
     
    res.send(error);
  }
});


// ─── Delete Vehiclepricing ─────────────────────────────────────────────────────


router.delete("/list/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await VehiclePrice.findByIdAndDelete(_id);
    if (!data) {
      return res.status(404).send();
    }
    res.send(data);
  } catch (err) {
    res.status(404).send(err);
  }
});


module.exports = router;
