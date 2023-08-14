const { urlencoded } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const app = express();
const router = new express.Router();
const server = require("http").createServer(app);
const io = new Server(server);
const { DriverRegister } = require("../Db/modals/DriverModal");
const img_path = path.join(__dirname, "../Public/driver");
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./Public/driver");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + file.originalname);
  },
});
const imageFilter = function (req, file, cb) {
  // Accept only specific image file types
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/svg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and JPG files are allowed."));
  }
};

const upload = multer({ storage, fileFilter: imageFilter });
upload;

// ─── Edit Driver ─────────────────────────────────────────────────────────────
router.get("/list/edit/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await DriverRegister.findById(_id)
      .populate("countryid")
      .populate("cityid")
      .populate("typeid");
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

// ─── Get Driver Data ─────────────────────────────────────────────────────────
router.get("/list/:page/:limit/:sorting", async (req, res) => {
  try {
    console.log(req.params);
    let sort = 1;
    let page = Number(req.params.page);
    if(isNaN(req.params.page)){
      page = 1;
    }
    let limit = Number(req.params.limit);

    let sorting = req.params.sorting;
    if (sorting == "asc") {
      sort = 1;
      sorting = "createdAt";
    } else if (sorting == "dasc") {
      sort = -1;
      sorting = "createdAt";
    }
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
    const result = await DriverRegister.aggregate(aggregationPipeline);

    const data = result[0].data;
    const count = result[0].count[0].total;

    res.send({ data, count });
  } catch (err) {
    console.log(err);
    res.send(err.message.split(":")[2]);
  }
});

// ─── Get Driver Data By Id ───────────────────────────────────────────────────
router.post("/list/:id", upload.single("profile"), async (req, res) => {
  try {
    console.log(req.body);
    const _id = req.params.id;
    const driver = await DriverRegister.find({
      $and: [
        { countrycode: req.body.countrycode },
        { number: req.body.number },
      ],
    }).count();

    if (driver == 1) {
      if (req.file) {
        let user = await DriverRegister.findByIdAndUpdate(
          _id,
          {
            $set: {
              profile: req.file.filename,
              name: req.body.name,
              email: req.body.email,
              countrycode: req.body.countrycode,
              number: req.body.number,
              countryid: req.body.countryid,
              cityid: req.body.cityid,
            },
          },
          { new: true, runvalidators: true }
        );
        res.send(user);
      } else {
        let user = await DriverRegister.findByIdAndUpdate(
          _id,
          {
            $set: {
              name: req.body.name,
              email: req.body.email,
              countrycode: req.body.countrycode,
              number: req.body.number,
              countryid: req.body.countryid,
              cityid: req.body.cityid,
            },
          },
          { new: true, runvalidators: true }
        );
        res.send(user);
      }
    } else {
      res .send("Number is Already Exists");
    }
  } catch (error) {
    const emailerror = error.keyPattern.email;
    if (emailerror == 1) {
      res .send("Email Already Exists");
    }
  }
});

// ─── Add Driver ──────────────────────────────────────────────────────────────
router.post("/list", upload.single("profile"), async (req, res) => {
  try {
    const driver = await DriverRegister.find({
      $and: [
        { countrycode: req.body.countrycode },
        { number: req.body.number },
      ],
    }).count();

    if (driver == 0) {
      let user = new DriverRegister({
        name: req.body.name,
        email: req.body.email,
        countrycode: req.body.countrycode,
        number: req.body.number,
        countryid: req.body.countryid,
        cityid: req.body.cityid,
        Status: "Approved",
        RideStatus: "Online",
        typeid: null,
      });
      if (req.file) {
        user.profile = req.file.filename;
      }
      const data = await user.save();
      res.status(201).send(data);
    } else {
      res.send("Number is Already Exists");
    }
  } catch (error) {
    console.log(error);
    // const errormsg = new Error(error);
    const emailerror = error.keyPattern?.email;
    // const numbererror = error.keyPattern.number;
    if (emailerror == 1) {
      res .send("Email Already Exists");
    } else {
      console.log(error);
      res .send(error);
    }
  }
});

// ─── Delete Driver ───────────────────────────────────────────────────────────
router.delete("/list/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    const data = await DriverRegister.findByIdAndDelete(_id);

    if (!data) {
      return res.status(404).send();
    } else {
      fs.unlinkSync(`${img_path}/${data.profile}`);
      res.status(200).send(data);
    }
  } catch (err) {
    res.status(404).send(err);
  }
});

// ─── Search Driver ─────────────────────────────────────────────────────────
router.get("/search/:key/:page/:limit/:sorting", async (req, res) => {
  try {
    const escapedKey = req.params.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let matchStage = {
      $or: [
        { name: { $regex: new RegExp(escapedKey, "i") } },
        { email: { $regex: new RegExp(escapedKey, "i") } },
        { countrycode: { $regex: new RegExp(escapedKey, "i") } },
        { number: { $regex: new RegExp(escapedKey, "i") } },
        { country: { $regex: new RegExp(escapedKey, "i") } },
        { city: { $regex: new RegExp(escapedKey, "i") } },
      ],
    };
    let sort = 1;
    const page = Number(req.params.page);
    let limit = Number(req.params.limit);

    let sorting = req.params.sorting;
    if (sorting == "asc") {
      sort = 1;
      sorting = "createdAt";
    } else if (sorting == "dasc") {
      sort = -1;
      sorting = "createdAt";
    }
    const aggregationPipeline = [
      {
        $facet: {
          data: [
            {
              $match: matchStage,
            },
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
              $match: matchStage,
            },
            {
              $count: "total",
            },
          ],
        },
      },
    ];
    const result = await DriverRegister.aggregate(aggregationPipeline);

    let count;
    const user = result[0].data;
    if (result[0].count == "") {
      console.log("hi");
      count = 0;
    } else {
      count = result[0].count[0].total;
    }
    // res.send({ data, count });
    if (!user) {

      return res.send("No User found");
    }

    // const count = Object.keys(usercount).length;
    res.send({ user, count });
  } catch (error) {
    console.log(error);
    res .send(error);
  }
});

module.exports = router;
