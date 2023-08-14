const { urlencoded } = require("express");
const moongose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const router = new express.Router();
const { Settings } = require("../Db/modals/setting");
const fs = require('fs');
const EventEmitter = require('events');
const centralEmitter = new EventEmitter();
router.get("/list", async (req, res) => {
  try {
    const data = await Settings.find();
    // await updateEnvFile();
    res.send(data);
  } catch (err) {
    res.status(400).send(err.message.split(":")[2]);
  }
});

router.post("/list", async (req, res) => {
  try {
    console.log("my input data", req.body);
    let user = new Settings({
      Stop: req.body.Stop,
      TimeOut: req.body.TimeOut,
      NodemailerEmail: req.body.NodemailerEmail,
      NodemailerPassword: req.body.NodemailerPassword,
      StripeSecreteKey: req.body.StripeSecreteKey,
      StripePublishableKey: req.body.StripePublishableKey,
      TwilioAccountid: req.body.TwilioAccountid,
      TwilioAuthToken: req.body.TwilioAuthToken,
    });
    const data = await user.save();
    
    res.status(201).send(data);
  } catch (error) {
    console.log(error);
  }
});

router.get("/list/edit/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await Settings.findById(_id);
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

router.post("/list/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    user = await Settings.findByIdAndUpdate(
      _id,
      {
        $set: {
          Stop: req.body.Stop,
          TimeOut: req.body.TimeOut,
          NodemailerEmail: req.body.NodemailerEmail,
          NodemailerPassword: req.body.NodemailerPassword,
          StripeSecreteKey: req.body.StripeSecreteKey,
          StripePublishableKey: req.body.StripePublishableKey,
          TwilioAccountid: req.body.TwilioAccountid,
          TwilioAuthToken: req.body.TwilioAuthToken,
        },
      },
      { new: true, runvalidators: true }
    );
    // await updateEnvFile();
    centralEmitter.emit('settings',true)
    res.send(user);

  } catch (error) {
    console.log(error);
  }
});


module.exports = {router,centralEmitter};
