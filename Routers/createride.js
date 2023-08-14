const { urlencoded } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const router = new express.Router();
const { CreateRideRegister } = require("../Db/modals/createride");
const { UsersRegister } = require("../Db/modals/usermodal");
const img_path = path.join(__dirname, "../Public/driver");
// ─── Edit Ride ───────────────────────────────────────────────────────────────
router.get("/list/edit/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await CreateRideRegister.findById(_id)
      .populate("vehicleId")
      .populate("cityId")
      .populate("userId")
      .populate("driverID");
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

// ─── Ride Data With Pagination ───────────────────────────────────────────────
router.get("/list/:page/:limit/:sorting", async (req, res) => {
  try {
    let sort = 1;
    const page = +req.params.page;
    const limit = +req.params.limit;
    const sorting = req.params.sorting;

    if (sorting == "asc") {
      sort = 1;
    } else {
      sort = -1;
    }
    const data = await CreateRideRegister.find()
      .populate("vehicleId")
      .populate("cityId")
      .populate("userId")
      .populate("driverID")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({
        startLocation: sort,
        endLocation: sort,
        paymentOption: sort,
        estimateFare: sort,
      });
    const count = await CreateRideRegister.count();

    res.send({ data, count });
  } catch (err) {
    res.status(400).send(err.message.split(":")[2]);
  }
});

// ─── Get All Rides Data ──────────────────────────────────────────────────────
router.get("/list", async (req, res) => {
  const page = req.params.page;
  const limit = req.params.limit;
  try {
    const data = await CreateRideRegister.find();
    io.emit("editData", data);
    res.send(data);
  } catch (err) {
    res.status(400).send(err.message.split(":")[2]);
  }
});

// ─── Delete Ride ─────────────────────────────────────────────────────────────
router.delete("/list/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await CreateRideRegister.findByIdAndDelete(_id);
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

// ─── Search Ride ─────────────────────────────────────────────────────────────
router.get("/search/:key/:page/:limit/:sorting", async (req, res) => {
  try {
    let sort = -1;
    const page = +req.params.page;
    const limit = +req.params.limit;
    const sorting = req.params.sorting;

    if (sorting == "asc") {
      sort = 1;
    } else {
      sort = -1;
    }
    const escapedKey = req.params.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await UsersRegister.find({ name: escapedKey });
    const userIds = users.map((user) => user._id);
    console.log("bauub", userIds);
    const usercount = await CreateRideRegister.find({
      $and: [
        {
          $or: [
            { startLocation: { $regex: new RegExp(escapedKey, "i") } },
            { endLocation: { $regex: new RegExp(escapedKey, "i") } },
            { estimateFare: { $regex: new RegExp(escapedKey, "i") } },
            { paymentOption: { $regex: new RegExp(escapedKey, "i") } },
            { userId: { $in: userIds } },
          ],
        },
        { $or: [{ Status: 0 }, { Status: 1 },{ Status: 2 }] },
      ],
    });
    const data = await CreateRideRegister.find({
      $and: [
        {
          $or: [
            { startLocation: { $regex: new RegExp(escapedKey, "i") } },
            { endLocation: { $regex: new RegExp(escapedKey, "i") } },
            { estimateFare: { $regex: new RegExp(escapedKey, "i") } },
            { paymentOption: { $regex: new RegExp(escapedKey, "i") } },
            { userId: { $in: userIds } },
          ],
        },
        { $or: [{ Status: 0 }, { Status: 1 },{ Status: 2 }] },
      ],
    })
      .populate("userId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({
        createdAt: sort,
      });
    if (!data) {
      return res.send("No User found");
    }
    // console.log(data);
    const count = Object.keys(usercount).length;
    res.send({ data, count });
  } catch (error) {
    res.send(error);
  }
});

// ─── Search Ridehistory ──────────────────────────────────────────────────────
router.get(
  "/searchridehistory/:key/:page/:limit/:sorting",
  async (req, res) => {
    try {
      let sort = -1;
      const page = +req.params.page;
      const limit = +req.params.limit;
      const sorting = req.params.sorting;

      if (sorting == "asc") {
        sort = 1;
      } else {
        sort = -1;
      }

      const escapedKey = req.params.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const users = await UsersRegister.find({ name: escapedKey });
      const userIds = users.map((user) => user._id);
      console.log("bauub", userIds);
      const usercount = await CreateRideRegister.find({
        $and: [
          {
            $or: [
              { startLocation: { $regex: new RegExp(escapedKey, "i") } },
              { endLocation: { $regex: new RegExp(escapedKey, "i") } },
              { estimateFare: { $regex: new RegExp(escapedKey, "i") } },
              { paymentOption: { $regex: new RegExp(escapedKey, "i") } },
              { userId: { $in: userIds } },
            ],
          },
          { $or: [{ Status: 7 }, { Status: 3 }] },
        ],
      })
        .populate("vehicleId")
        .populate("cityId")
        .populate("userId")
        .populate("driverID")
        .populate({
          path: "NearestDriverList",
        });
      const data = await CreateRideRegister.find({
        $and: [
          {
            $or: [
              { startLocation: { $regex: new RegExp(escapedKey, "i") } },
              { endLocation: { $regex: new RegExp(escapedKey, "i") } },
              { estimateFare: { $regex: new RegExp(escapedKey, "i") } },
              { paymentOption: { $regex: new RegExp(escapedKey, "i") } },
              { userId: { $in: userIds } },
            ],
          },
          { $or: [{ Status: 7 }, { Status: 3 }] },
        ],
      })
        .populate("vehicleId")
        .populate("cityId")
        .populate("userId")
        .populate("driverID")
        .populate({
          path: "NearestDriverList",
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({
          createdAt: sort,
        });
      if (!data) {
        return res.send("No User found");
      }
      // console.log(data);
      const count = Object.keys(usercount).length;
      res.send({ data, count });
    } catch (error) {
      res.send(error);
    }
  }
);

// ─── Search By Filters ───────────────────────────────────────────────────────

router.post(
  "/searchridehistorybyfilter/:page/:limit/:sorting",
  async (req, res) => {
    try {
      let sort = -1;
      const page = +req.params.page;
      const limit = +req.params.limit;
      const sorting = req.params.sorting;

      const conditions = [
        req.body.date && req.body.date2
          ? { rideDate: { $gte: req.body.date, $lte: req.body.date2 } }
          : req.body.date && !req.body.date2
          ? { rideDate: { $gte: req.body.date } }
          : null,
        !req.body.date && req.body.date2
          ? { rideDate: { $lte: req.body.date2 } }
          : null,
        req.body.service ? { serviceType: req.body.service } : null,
        req.body.status && req.body.status !== "All"
          ? { Status: req.body.status }
          : null,
      ].filter((condition) => condition !== null);

      const query = {
        $and: [{ $or: [{ Status: 7 }, { Status: 3 }] }, ...conditions],
      };

      const usercount = await CreateRideRegister.find(query);

      const data = await CreateRideRegister.find(query)
        .populate("vehicleId")
        .populate("cityId")
        .populate("userId")
        .populate("driverID")
        .populate({
          path: "NearestDriverList",
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({
          createdAt: sort,
        });
      if (!data) {
        return res.send("No User found");
      }

      const count = Object.keys(usercount).length;
      res.send({ data, count });
    } catch (error) {
      res.send(error);
    }
  }
);


// ─── Search By Filters  in Confirmed───────────────────────────────────────────────────────

router.post(
  "/searchridehistorybyfilterinconfirm/:page/:limit/:sorting",
  async (req, res) => {
    try {
      let sort = -1;
      const page = +req.params.page;
      const limit = +req.params.limit;
      const sorting = req.params.sorting;

      const conditions = [
        req.body.date && req.body.date2
          ? { rideDate: { $gte: req.body.date, $lte: req.body.date2 } }
          : req.body.date && !req.body.date2
          ? { rideDate: { $gte: req.body.date } }
          : null,
        !req.body.date && req.body.date2
          ? { rideDate: { $lte: req.body.date2 } }
          : null,
        req.body.service ? { serviceType: req.body.service } : null,
        req.body.status && req.body.status !== "All"
          ? { Status: req.body.status }
          : null,
      ].filter((condition) => condition !== null);

      const query = {
        $and: [{ $or: [{ Status: 0 }, { Status: 1 },{ Status: 2 }] }, ...conditions],
      };

      const usercount = await CreateRideRegister.find(query);

      const data = await CreateRideRegister.find(query)
        .populate("vehicleId")
        .populate("cityId")
        .populate("userId")
        .populate("driverID")
        .populate({
          path: "NearestDriverList",
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({
          createdAt: sort,
        });
      if (!data) {
        return res.send("No User found");
      }

      const count = Object.keys(usercount).length;
      res.send({ data, count });
    } catch (error) {
      res.send(error);
    }
  }
);

// ─── All In One ──────────────────────────────────────────────────────────────

router.post("/search/new", async (req, res) => {
  try {
    const {
      key,
      page,
      limit,
      sorting,
      date,
      date2,
      service,
      status,
    } = req.body;

    const sort = sorting === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const conditions = [
      date && date2
        ? { rideDate: { $gte: date, $lte: date2 } }
        : date && !date2
        ? { rideDate: { $gte: date } }
        : null,
      !date && date2 ? { rideDate: { $lte: date2 } } : null,
      service ? { serviceType: service } : null,
      status && status !== "All" ? { Status: status } : null,
    ].filter((condition) => condition !== null);

    const pipeline = [
      {
        $match: {
          $or: [
            { startLocation: { $regex: new RegExp(escapedKey, "i") } },
            { endLocation: { $regex: new RegExp(escapedKey, "i") } },
            { estimateFare: { $regex: new RegExp(escapedKey, "i") } },
            { paymentOption: { $regex: new RegExp(escapedKey, "i") } },
          ],
        },
      },
      {
        $match: {
          $and: [{ $or: [{ Status: 0 }, { Status: 1 }] }, ...conditions],
        },
      },
      {
        $facet: {
          usercount: [
            {
              $count: "count",
            },
          ],
          user: [
            {
              $sort: {
                createdAt: sort,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
    ];

    const result = await CreateRideRegister.aggregate(pipeline);

    if (!result[0].user) {
      return res.send("No User found");
    }

    const count = result[0].usercount[0]?.count || 0;
    const user = result[0].user;

    res.send({ user, count });
  } catch (error) {
    res.send(error);
  }
});

// ─── Ride History Data ───────────────────────────────────────────────────────

router.get("/ridehistory/:page/:limit/:sorting", async (req, res) => {
  try {
    let sort = 1;
    const page = +req.params.page;
    const limit = +req.params.limit;
    const sorting = req.params.sorting;

    if (sorting == "asc") {
      sort = 1;
    } else {
      sort = -1;
    }
    const data = await CreateRideRegister.find({$or:[{Status:7},{Status:3}]})
      .populate("vehicleId")
      .populate("cityId")
      .populate("userId")
      .populate("driverID")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({
        createdAt:sort
      });
    const count = await CreateRideRegister.find({$or:[{Status:7},{Status:3}]}).count();

    res.send({ data, count });
  } catch (err) {
    res.status(400).send(err.message.split(":")[2]);
  }
});


module.exports = router;
