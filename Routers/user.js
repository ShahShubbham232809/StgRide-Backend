const { urlencoded } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = new express.Router();
const { UsersRegister } = require("../Db/modals/usermodal");
const { Settings } = require("../Db/modals/setting");
const { centralEmitter } = require("../Routers/settings");
const img_path = path.join(__dirname, "../Public/user");
const { env } = require("process");
let stripe = require("stripe")('sk_test_51NBaQISBFTafl90RqEZsskcpKd7hByqd1z44DGulc8BI3CRucbnjAm2AaDonSiyhsgR5v8X3xUVMiNJgBkkyE9Ae00fBmTBdoD')
centralEmitter.on("settings", async (data) => {
  if(data == true){
    const setting = await Settings.findOne().lean();
    stripe = require("stripe")(setting.StripeSecreteKey);
  }
})

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./Public/user");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + file.originalname);
  },
});
const fileUpload = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code == "LIMIT_FILE_SIZE") {
        console.log(err, "error muter instance");
        res.send({ success: false, message: "file size upto 2 mb alloweded!" });
      } else {
        console.log(err, "error muter instance");
        res.send({ success: false, message: err.message });
      }
    } else if (err) {
      console.log(err);
      console.log(req.body.profile);
      res.send({ success: false, message: err.message });
    } else {
      next();
    }
  });
};
const imageFilter = function (req, file, cb) {
  // Accept only specific image file types
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and JPG files are allowed."), false);
  }
};
const fileSize = 2 * 1024 * 1024;
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize },
}).single("profile");

// ─── Get Country Code ────────────────────────────────────────────────────────
router.get("/list/:countrycode/:number/", async (req, res) => {
  try {
    const countrycode = req.params.countrycode;
    const number = req.params.number;
    const user = await UsersRegister.find({
      countrycode: countrycode,
      number: number,
    });
    console.log(user);
    // const data = await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// ─── Get User Data ───────────────────────────────────────────────────────────
router.get("/list/", async (req, res) => {
  try {
    const data = await UsersRegister.find();
    if (!data) {
      res.status(404).send();
      // console.log(data);
    } else {
      return res.send(data);
    }
  } catch (err) {
    res.status(404).send(err);
    console.log(err);
  }
});

// ─── Edit User Data ──────────────────────────────────────────────────────────
router.get("/list/edit/user/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await UsersRegister.findById(_id).populate("countryid");
    console.log(data);
    if (!data) {
      res.status(404).send();
      // console.log(data);
    } else {
      return res.send(data);
    }
  } catch (err) {
    res.status(404).send(err);
    console.log(err);
  }
});

// ─── Get Pagination Data ─────────────────────────────────────────────────────
router.post("/list/paginate", async (req, res) => {
  try {
    const setting = await Settings.findOne().lean();
    console.log(setting);
    let sort = 1;
    const page = Number(req.body.page);
    let limit = Number(req.body.limit);
    let sorting = req.body.sort;
    if (sorting == "asc") {
      sort = 1;
    } else if (sorting == "dasc") {
      sort = -1;
    }

    const query = UsersRegister.find({})
      .sort({ [sorting]: sort, createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("countryid")
      .lean();

    const [data, count] = await Promise.all([
      query,
      UsersRegister.countDocuments(),
    ]);

    res.send({ data, count });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message.split(":")[2]);
  }
});

// ─── Get Data By User Id ─────────────────────────────────────────────────────
router.post("/list/:id", fileUpload, async (req, res) => {
  try {
    console.log("my data : ", req.body);
    const _id = req.params.id;
    let user;
    const user2 = await UsersRegister.find({
      $and: [
        { countrycode: req.body.countrycode },
        { number: req.body.number },
      ],
    }).count();
    console.log(user2);
    if (user2 == 1) {
      if (req.file) {
        user = await UsersRegister.findByIdAndUpdate(
          _id,
          {
            $set: {
              profile: req.file.filename,
              name: req.body.name,
              email: req.body.email,
              number: req.body.number,
            },
          },
          { new: true, runvalidators: true }
        );
      } else {
        user = await UsersRegister.findByIdAndUpdate(
          _id,
          {
            $set: {
              name: req.body.name,
              email: req.body.email,
              countrycode: req.body.countrycode,
              countryid: req.body.countryid,
              number: req.body.number,
            },
          },
          { new: true, runvalidators: true }
        );
      }
      res.send(user);
    } else {
      res.send("Number Already Exists");
    }
  } catch (error) {
    console.log(error);
    const emailerror = error.keyPattern.email;
    if (emailerror == 1) {
      res.send("Email Already Exists");
    }
    res.send(error);
  }
});

// ─── Add User ────────────────────────────────────────────────────────────────
router.post("/list", fileUpload, async (req, res) => {
  try {
    const user = await UsersRegister.find({
      $and: [
        { countrycode: req.body.countrycode },
        { number: req.body.number },
      ],
    });
    console.log(user);
    if (user == 0) {
      console.log("my input data", req.body);
      let user = new UsersRegister({
        name: req.body.name,
        email: req.body.email,
        number: req.body.number,
        countryid: req.body.countryid,
        countrycode: req.body.countrycode,
        customerid: null,
      });
      if (req.file) {
        user.profile = req.file.filename;
      }
      const data = await user.save();
      res.status(201).send(data);
    } else {
      res.send("Number Already Exists");
    }
    // const customer = await stripe.customers.create();
  } catch (error) {
    console.log(error);
    const emailerror = error.keyPattern.email;
    if (emailerror == 1) {
      res.send("Email Already Exists");
    } else {
      res.send(error);
    }
  }
});

// ─── Delete User ─────────────────────────────────────────────────────────────
router.delete("/list/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    console.log(_id);
    const deletedata = await UsersRegister.findById(_id);
    console.log(deletedata);
    const data = await UsersRegister.findByIdAndDelete(_id);
    if (deletedata.customerid) {
      const deleted = await stripe.customers.del(deletedata.customerid);
    }
    console.log(data);
    if (!data) {
      return res.status(404).send();
    } else {
      fs.unlinkSync(`${img_path}/${data.profile}`);
      res.status(200).send(data);
    }
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

// ─── Search User ─────────────────────────────────────────────────────────────
router.get("/search/:key/:page/:limit/:sorting", async (req, res) => {
  console.log(req.params.key + " this is key");
  try {
    const escapedKey = req.params.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let matchStage = {
      $or: [
        { name: { $regex: new RegExp(escapedKey, "i") } },
        { email: { $regex: new RegExp(escapedKey, "i") } },
        { countrycode: { $regex: new RegExp(escapedKey, "i") } },
        { number: { $regex: new RegExp(escapedKey, "i") } },
      ],
    };
    let sort = 1;
    const page = Number(req.params.page);
    let limit = Number(req.params.limit);
    console.log(limit);
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
                as: "country",
              },
            },
            {
              $unwind: "$country",
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
    const result = await UsersRegister.aggregate(aggregationPipeline);
    console.log(result[0].count);
    let count;
    const user = result[0].data;
    if (result[0].count == "") {
      console.log("hi");
      count = 0;
    } else {
      count = result[0].count[0].total;
    }

    if (!user) {
      console.log("USER NOT FIND", user);
      return res.send("No User found");
    }
    // console.log(user);
    res.send({ user, count });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

// ─── Create Stripe Customer ──────────────────────────────────────────────────
router.post("/create-intent/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await UsersRegister.findById(_id);

    let customer;
    let customerid;
    if (!data.customerid) {
      customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
      });
      customerid = customer.id;
      let user = await UsersRegister.findByIdAndUpdate(_id, {
        customerid: customer.id,
      });
      await user.save();
    } else {
      customerid = data.customerid;
    }
    const intent = await stripe.setupIntents.create({
      customer: customerid,
      automatic_payment_methods: { enabled: true },
    });
    console.log(intent);
    const paymentMethods = await stripe.paymentMethods.list({
      customer: data.customerid,
      type: "card",
    });
    if(paymentMethods.data.length == 0) {
      makefirst(data);
    }
    res.json({ client_secret: intent.client_secret });
  } catch (error) {
    console.log(error);
  }
});

// ─── Get Card ────────────────────────────────────────────────────────────────

router.get("/get-card/:id", async (req, res) => {
  try {
    const Id = req.params.id;
    const data = await UsersRegister.findById(Id);
    const paymentMethods = await stripe.paymentMethods.list({
      customer: data.customerid,
      type: "card",
    });
    let defaultcardid;
    const customer = await stripe.customers.retrieve(data.customerid);
    if (customer.invoice_settings.default_payment_method != null) {
      defaultcardid = customer.invoice_settings.default_payment_method;
    } else if (paymentMethods.data.length == 1) {
      console.log(paymentMethods.data);
      await stripe.customers.update(data.customerid, {
        invoice_settings: {
          default_payment_method: paymentMethods.data[0].id,
        },
      });
      defaultcardid = paymentMethods.data[0].id;
    }
    res.send({ data: paymentMethods.data, default: defaultcardid });
  } catch (error) {
    // Handle any errors
    console.error("Error retrieving cards:", error);
    throw error;
  }
});

// ─── Get Customer ──────────────────────────────────────────────────────────
router.get("/get-customer/:id", async (req, res) => {
  try {
    let defaultcardid;
    const Id = req.params.id;
    const data = await UsersRegister.findById(Id);
    const customer = await stripe.customers.retrieve(data.customerid);
    res.send(customer);
  } catch (error) {
    // Handle any errors
    console.error("Error retrieving cards:", error);
    throw error;
  }
});

// ─── Delete Card ─────────────────────────────────────────────────────────

router.get("/delete-card/:id", async (req, res) => {
  try {
    const cardId = req.params.id;
    const detached = await stripe.paymentMethods.detach(cardId);

    res.send(detached);
  } catch (error) {
    // Handle any errors
    console.error("Error deleting card:", error);
    throw error;
  }
});

// ─── Update Default Card ─────────────────────────────────────────────────
router.patch("/default-card/:customerId/", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log(customerId);
    const cardId = req.body.cardid;
    console.log(cardId);
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId =
      customer.invoice_settings.default_payment_method;
    console.log(defaultPaymentMethodId);
    if (defaultPaymentMethodId == null) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: cardId,
        },
      });
      const user = await UsersRegister.findByIdAndUpdate(data._id, {
        paymentMethodId: cardId,
      })
    } else {
      // Retrieve the details of the default payment method
      const paymentMethod = await stripe.paymentMethods.retrieve(
        defaultPaymentMethodId
      );

      try {
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: cardId,
          },
        });
        const user = await UsersRegister.findByIdAndUpdate(data._id, {
          paymentMethodId: cardId,
        })
        res.status(200).json({ message: "Default card updated successfully." });
      } catch (error) {
        console.error("Error updating default card:", error);
        res.json({
          error: "An error occurred while updating the default card.",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});
 function makefirst(data) {
  setTimeout  (async() => {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: data.customerid,
      type: "card",
    });
    console.log("My Cardsiojlj",paymentMethods.data);
    if(paymentMethods.data.length > 0){

      await stripe.customers.update(data.customerid, {
        invoice_settings: {
          default_payment_method: paymentMethods.data[0].id,
        },
      });
      const user = await UsersRegister.findByIdAndUpdate(data._id, {
        paymentMethodId: paymentMethods.data[0].id,
      })
    }
  },2000)
}

module.exports = router;
