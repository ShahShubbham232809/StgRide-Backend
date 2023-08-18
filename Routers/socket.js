const express = require("express");
const mongoose = require("mongoose");
const app = express();
const nodemailer = require("nodemailer");
const ObjectID = require("bson-objectid");
const objectId = new ObjectID();
const { DriverRegister } = require("../Db/modals/DriverModal");
const { RunningRideRegister } = require("../Db/modals/runningride");
const { CreateRideRegister } = require("../Db/modals/createride");
let driverdatamy;
const cron = require("node-cron");
const { sendmail } = require("./nodemailer");
// let page, limit, sort;
const { env } = require("process");
const { UsersRegister } = require("../Db/modals/usermodal");
const { Settings } = require("../Db/modals/setting");
const { centralEmitter } = require("../Routers/settings");
const { EventEmitter } = require("stream");
const {
  LogContextImpl,
} = require("twilio/lib/rest/serverless/v1/service/environment/log");
const { log } = require("console");
let stripe = require("stripe")(
  "sk_test_51NBaQISBFTafl90RqEZsskcpKd7hByqd1z44DGulc8BI3CRucbnjAm2AaDonSiyhsgR5v8X3xUVMiNJgBkkyE9Ae00fBmTBdoD"
);
let TIMEOUT;
// let rides = [];
let cronEvent = new EventEmitter();
centralEmitter.on("settings", async (data) => {
  if (data == true) {
    // cronEvent.emit("cron", true);
    const setting = await Settings.findOne().lean();
    // console.log("settings", setting);
    stripe = require("stripe")(setting.StripeSecreteKey);
    TIMEOUT = setting.TimeOut;
  }
});

module.exports = (io) => {
  async function sendmessage(body) {
    const accountSid = env.TWILIOACCOUNTID;
    const authToken = env.TWILIOAUTHTOKEN;
    const client = require("twilio")(accountSid, authToken);
    client.messages
      .create({
        body: body,
        from: "+16187163432",
        to: "+918160681684",
      })
      .then((message) => console.log(message.sid))
      .catch((error) => {
        // console.log(error);
      });
  }
  // ======================================================Get Running Ride Data Operations Using Cron ========================================================================
  // async function performRideOperations() {
  //   try {
  //     const rides = await CreateRideRegister.find({
  //       $or: [
  //         { Status: 0 },
  //         { Status: 1 },
  //       ]
  //     }).exec();
  //     console.log(rides);
  //     for (const ride of rides) {
  //       const driverlistcount = await DriverRegister.find({
  //         cityid: ride.cityId,
  //         typeid: ride.vehicleId,
  //         Status: "Approved",
  //         RideStatus: "Online",
  //       });
  //       const currentTime = Date.now();
  //       // console.log(ride);
  //       if (ride.Status == 1 && ride.RideStatus == "Self") {
  //         // =============================================TimeOut Direct Ride===========================================================
  //         const elapsedTime = currentTime - ride.AssigingTime.getTime();
  //         // const setting = await Settings.findOne().lean();
  //         if (ride.AssigingTime.getTime() >= TIMEOUT * 1000) {
  //           const newride = await CreateRideRegister.findByIdAndUpdate(
  //             ride._id,
  //             {
  //               $set: {
  //                 Status: 2,
  //                 AssigingTime: null,
  //                 driverID: null,
  //               },
  //             }
  //           );
  //           const ridedata = newride.save();
  //           const data = await CreateRideRegister.find({
  //             $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
  //           })
  //             .populate("vehicleId")
  //             .populate("cityId")
  //             .populate("userId")
  //             .populate("driverID")
  //             .skip((page - 1) * limit)
  //             .limit(limit)
  //             .sort({
  //               createdAt: sort,
  //             });
  //           const user = await DriverRegister.findByIdAndUpdate(ride.driverID, {
  //             $set: {
  //               RideStatus: "Online",
  //             },
  //           });
  //           const count = await CreateRideRegister.find({
  //             $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
  //           }).count();
  //           io.emit("createride-data", { data, count });
  //           const driver = await DriverRegister.find()
  //             .populate("typeid")
  //             .populate("cityid")
  //             .populate("countryid");
  //           io.emit("driver-data", driver);
  //           const running = await CreateRideRegister.find({
  //             $or: [{ Status: 4 }, { Status: 5 }, { Status: 6 }, { Status: 1 }],
  //           })
  //             .populate("vehicleId")
  //             .populate("cityId")
  //             .populate("userId")
  //             .populate("driverID")
  //             .populate({
  //               path: "NearestDriverList",
  //             });

  //           io.emit("runningride-data", running);
  //           const rides = await CreateRideRegister.find({
  //             Status: 2,
  //           }).count();
  //           const boolean = true;
  //           io.emit("push-notification", { rides, boolean });
  //           // io.emit("createride-data",creteridedata);
  //           // cronEvent.emit("cron", true);
  //         }
  //       } else if (ride.Status == 1 && ride.RideStatus == "Nearest") {
  //         // =============================================================TimeOut Nearest Drive====================================================================
  //         const elapsedTime = currentTime - ride.AssigingTime.getTime();
  //         // const setting = await Settings.findOne().lean();
  //         if (elapsedTime >= TIMEOUT * 1000) {
  //           const ridenearest = await CreateRideRegister.findByIdAndUpdate(
  //             ride._id,
  //             {
  //               $set: {
  //                 Status: 0,
  //                 AssigingTime: null,
  //                 driverID: null,
  //               },
  //             }
  //           );
  //           const user = await DriverRegister.findByIdAndUpdate(
  //             ride.driverID,
  //             {
  //               $set: {
  //                 RideStatus: "Online",
  //               },
  //             },
  //             { new: true }
  //           );
  //           const ridedata = ridenearest.save();
  //           const data = await CreateRideRegister.find({
  //             $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
  //           })
  //             .populate("vehicleId")
  //             .populate("cityId")
  //             .populate("userId")
  //             .populate("driverID")
  //             .skip((page - 1) * limit)
  //             .limit(limit)
  //             .sort({
  //               createdAt: sort,
  //             });
  //           const count = await CreateRideRegister.find({
  //             $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
  //           }).count();
  //           io.emit("createride-data", { data, count });
  //           const driver = await DriverRegister.find()
  //             .populate("typeid")
  //             .populate("cityid")
  //             .populate("countryid");
  //           io.emit("driver-data", driver);
  //           const running = await CreateRideRegister.find({
  //             $or: [{ Status: 4 }, { Status: 5 }, { Status: 6 }, { Status: 1 }],
  //           })
  //             .populate("vehicleId")
  //             .populate("cityId")
  //             .populate("userId")
  //             .populate("driverID")
  //             .populate({
  //               path: "NearestDriverList",
  //             });

  //           io.emit("runningride-data", running);
  //           // cronEvent.emit("cron", true);
  //         }
  //       } else if (
  //         ride.Status == 0 &&
  //         ride.RideStatus == "Nearest" &&
  //         ride.NearestDriverList != null
  //       ) {
  //         //============================================================ Get Free All Driver =========================================================================
  //         const driverlist = await DriverRegister.find({
  //           cityid: ride.cityId,
  //           typeid: ride.vehicleId,
  //           Status: "Approved",
  //           RideStatus: "Online",
  //         });
  //         const driverlist2 = await DriverRegister.find({
  //           cityid: ride.cityId,
  //           typeid: ride.vehicleId,
  //           Status: "Approved",
  //         });

  //         //==============================================================Get UnAdded Driver================================================================================
  //         const objectValues = Object.values(driverlist);
  //         const filteredArray = objectValues.filter(
  //           (item) => !ride.NearestDriverList.includes(item._id)
  //         );

  //         // =============================================================Get Online Driver Only==============================================================================
  //         if (filteredArray.length > 0) {
  //           const createride = await CreateRideRegister.findByIdAndUpdate(
  //             ride._id,
  //             {
  //               $set: {
  //                 AssigingTime: Date.now(),
  //                 driverID: filteredArray[0],
  //                 Status: 1,
  //               },
  //             },
  //             {
  //               new: true,
  //             }
  //           );
  //           const newridedata = await CreateRideRegister.updateOne(
  //             { _id: ride._id },
  //             { $push: { NearestDriverList: [filteredArray[0]] } }
  //           );
  //           const user2 = await DriverRegister.findByIdAndUpdate(
  //             filteredArray[0],
  //             {
  //               $set: {
  //                 RideStatus: "Hold",
  //               },
  //             }
  //           );
  //           const save = user2.save();
  //           const ridedata = createride.save();
  //           const data = await CreateRideRegister.find({
  //             $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
  //           })
  //             .populate("vehicleId")
  //             .populate("cityId")
  //             .populate("userId")
  //             .populate("driverID")
  //             .skip((page - 1) * limit)
  //             .limit(limit)
  //             .sort({
  //               createdAt: sort,
  //             });
  //           const count = await CreateRideRegister.find({
  //             $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
  //           }).count();
  //           io.emit("createride-data", { data, count });
  //           const driver = await DriverRegister.find()
  //             .populate("typeid")
  //             .populate("cityid")
  //             .populate("countryid");
  //           io.emit("driver-data", driver);
  //           const running = await CreateRideRegister.find({
  //             $or: [{ Status: 4 }, { Status: 5 }, { Status: 6 }, { Status: 1 }],
  //           })
  //             .populate("vehicleId")
  //             .populate("cityId")
  //             .populate("userId")
  //             .populate("driverID")
  //             .populate({
  //               path: "NearestDriverList",
  //             });

  //           io.emit("runningride-data", running);
  //           // cronEvent.emit("cron", true);
  //         }
  //         // ====================================================Increase Time when Driver is not Find==========================================================================
  //         else if (
  //           ride.NearestDriverList.length < driverlist2.length &&
  //           filteredArray.length == 0
  //         ) {
  //           const createride = await CreateRideRegister.findByIdAndUpdate(
  //             ride._id,
  //             {
  //               $set: {
  //                 AssigingTime: Date.now(),
  //                 Status: 0,
  //                 driverID: null,
  //               },
  //             },
  //             {
  //               new: true,
  //             }
  //           );
  //           // cronEvent.emit("cron", true);
  //           // console.log("hi");
  //         }
  //         // ======================================================Push Notification=======================================================================
  //         else if (
  //           ride.NearestDriverList.length >= driverlist2.length &&
  //           filteredArray.length == 0
  //         ) {
  //           const createride = await CreateRideRegister.findByIdAndUpdate(
  //             ride._id,
  //             {
  //               $set: {
  //                 Status: 2,
  //                 driverID: null,
  //                 NearestDriverList: null,
  //               },
  //             },
  //             {
  //               new: true,
  //             }
  //           );
  //           const user = await DriverRegister.findByIdAndUpdate(ride.driverID, {
  //             $set: {
  //               RideStatus: "Online",
  //             },
  //           });
  //           const rides = await CreateRideRegister.find({
  //             Status: 2,
  //           }).count();
  //           const boolean = true;
  //           // console.log(boolean);
  //           io.emit("push-notification", { rides, boolean });
  //           const data = await CreateRideRegister.find({
  //             $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
  //           })
  //             .populate("vehicleId")
  //             .populate("cityId")
  //             .populate("userId")
  //             .populate("driverID")
  //             .skip((page - 1) * limit)
  //             .limit(limit)
  //             .sort({
  //               createdAt: sort,
  //             });
  //           const count = await CreateRideRegister.find({
  //             $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
  //           }).count();
  //           io.emit("createride-data", { data, count });
  //           // cronEvent.emit("cron", true);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Failed to perform ride operations:", error);
  //   }
  // }

  async function performRideOperations() {
    try {
      const rides = await CreateRideRegister.find({
        $or: [{ Status: 0 }, { Status: 1 }],
      }).exec();
      // console.log(rides);
      for (const ride of rides) {
        const driverlistcount = await DriverRegister.find({
          cityid: ride.cityId,
          typeid: ride.vehicleId,
          Status: "Approved",
          RideStatus: "Online",
        });
        const currentTime = Date.now();
        // console.log(ride);
        if (ride.Status == 1 && ride.RideStatus == "Self") {
          // =============================================TimeOut Direct Ride===========================================================
          const elapsedTime = currentTime - ride.AssigingTime.getTime();
          // const setting = await Settings.findOne().lean();
          if (ride.AssigingTime.getTime() >= TIMEOUT * 1000) {
            const newride = await CreateRideRegister.findByIdAndUpdate(
              ride._id,
              {
                $set: {
                  Status: 2,
                  AssigingTime: null,
                  driverID: null,
                },
              }
            );
            const ridedata = newride.save();
            const user = await DriverRegister.findByIdAndUpdate(ride.driverID, {
              $set: {
                RideStatus: "Online",
              },
            });

            // ==================================Update A Paricular Data=======================================================
            const data = await CreateRideRegister.findById(ride._id)
              .populate("vehicleId")
              .populate("cityId")
              .populate("userId")
              .populate("driverID");

            io.emit("createride-data-updated", {
              status: "timeout",
              details: data,
            });

            // ==================================Update Driver Status=======================================================
            const driver = await DriverRegister.findById(ride.driverID)
              .populate("typeid")
              .populate("cityid")
              .populate("countryid");
            io.emit("driver-data-updated", {
              status: "timeout",
              details: driver,
            });

            const rides = await CreateRideRegister.find({
              Status: 2,
            }).count();
            const boolean = true;
            io.emit("push-notification", { rides, boolean });
            // io.emit("createride-data",creteridedata);
            // cronEvent.emit("cron", true);
          }
        } else if (ride.Status == 1 && ride.RideStatus == "Nearest") {
          // =============================================================TimeOut Nearest Drive====================================================================
          const elapsedTime = currentTime - ride.AssigingTime.getTime();
          // const setting = await Settings.findOne().lean();
          if (elapsedTime >= TIMEOUT * 1000) {
            const ridenearest = await CreateRideRegister.findByIdAndUpdate(
              ride._id,
              {
                $set: {
                  Status: 0,
                  AssigingTime: null,
                  driverID: null,
                },
              }
            );
            const user = await DriverRegister.findByIdAndUpdate(
              ride.driverID,
              {
                $set: {
                  RideStatus: "Online",
                },
              },
              { new: true }
            );
            const ridedata = ridenearest.save();
            // ==================================Update A Paricular Data=======================================================
            const data = await CreateRideRegister.findById(ride._id)
              .populate("vehicleId")
              .populate("cityId")
              .populate("userId")
              .populate("driverID");

            io.emit("createride-data-updated", {
              status: "timeout",
              details: data,
            });

            // ==================================Update Driver Status=======================================================
            const driver = await DriverRegister.findById(ride.driverID)
              .populate("typeid")
              .populate("cityid")
              .populate("countryid");
            io.emit("driver-data-updated", {
              status: "timeout",
              details: driver,
            });
            //============================================================ Get Free All Driver =========================================================================
            const driverlist2 = await DriverRegister.find({
              cityid: ride.cityId,
              typeid: ride.vehicleId,
              Status: "Approved",
            });

            const onlineDrivers = driverlist2.filter(
              (driver) => driver.RideStatus === "Online"
            );

            //==============================================================Get UnAdded Driver================================================================================
            const objectValues = Object.values(onlineDrivers);
            const filteredArray = objectValues.filter(
              (item) => !ride.NearestDriverList.includes(item._id)
            );

            // =============================================================Get Online Driver Only==============================================================================
            if (filteredArray.length > 0) {
              const createride = await CreateRideRegister.findByIdAndUpdate(
                ride._id,
                {
                  $set: {
                    AssigingTime: Date.now(),
                    driverID: filteredArray[0],
                    Status: 1,
                  },
                },
                {
                  new: true,
                }
              );
              const newridedata = await CreateRideRegister.updateOne(
                { _id: ride._id },
                { $push: { NearestDriverList: [filteredArray[0]] } }
              );
              const user2 = await DriverRegister.findByIdAndUpdate(
                filteredArray[0],
                {
                  $set: {
                    RideStatus: "Hold",
                  },
                }
              );
              const save = user2.save();
              const ridedata = createride.save();
              // ==================================Update A Paricular Data=======================================================
              const data = await CreateRideRegister.findById(ride._id)
                .populate("vehicleId")
                .populate("cityId")
                .populate("userId")
                .populate("driverID");

              io.emit("createride-data-updated", {
                status: "assign",
                details: data,
              });

              // ==================================Update Driver Status=======================================================
              const driver = await DriverRegister.findById(filteredArray[0])
                .populate("typeid")
                .populate("cityid")
                .populate("countryid");
              io.emit("driver-data-updated", {
                status: "assign",
                details: driver,
              });
              // cronEvent.emit("cron", true);
            }
            // ====================================================Increase Time when Driver is not Find==========================================================================
            else if (
              ride.NearestDriverList.length < driverlist2.length &&
              filteredArray.length == 0
            ) {
              const createride = await CreateRideRegister.findByIdAndUpdate(
                ride._id,
                {
                  $set: {
                    AssigingTime: Date.now(),
                    Status: 0,
                    driverID: null,
                  },
                },
                {
                  new: true,
                }
              );
            }
            // ======================================================Push Notification=======================================================================
            else if (
              ride.NearestDriverList.length >= driverlist2.length &&
              filteredArray.length == 0
            ) {
              const createride = await CreateRideRegister.findByIdAndUpdate(
                ride._id,
                {
                  $set: {
                    Status: 2,
                    driverID: null,
                    NearestDriverList: null,
                  },
                },
                {
                  new: true,
                }
              );
              const user = await DriverRegister.findByIdAndUpdate(
                ride.driverID,
                {
                  $set: {
                    RideStatus: "Online",
                  },
                }
              );
              const rides = await CreateRideRegister.find({
                Status: 2,
              }).count();
              const boolean = true;
              // console.log(boolean);
              io.emit("push-notification", { rides, boolean });

              // ==================================Update A Paricular Data=======================================================
              const data = await CreateRideRegister.findById(ride._id)
                .populate("vehicleId")
                .populate("cityId")
                .populate("userId")
                .populate("driverID");

              io.emit("createride-data-updated", {
                status: "timeout",
                details: data,
              });

              // cronEvent.emit("cron", true);
            }
          }
        } else if (
          ride.Status == 0 &&
          ride.RideStatus == "Nearest" &&
          ride.NearestDriverList != null
        ) {
          //============================================================ Get Free All Driver =========================================================================

          const driverlist2 = await DriverRegister.find({
            cityid: ride.cityId,
            typeid: ride.vehicleId,
            Status: "Approved",
          });
          const onlineDrivers = driverlist2.filter(
            (driver) => driver.RideStatus === "Online"
          );
          //==============================================================Get UnAdded Driver================================================================================
          const objectValues = Object.values(onlineDrivers);
          const filteredArray = objectValues.filter(
            (item) => !ride.NearestDriverList.includes(item._id)
          );

          // =============================================================Get Online Driver Only==============================================================================
          if (filteredArray.length > 0) {
            const createride = await CreateRideRegister.findByIdAndUpdate(
              ride._id,
              {
                $set: {
                  AssigingTime: Date.now(),
                  driverID: filteredArray[0],
                  Status: 1,
                },
              },
              {
                new: true,
              }
            );
            const newridedata = await CreateRideRegister.updateOne(
              { _id: ride._id },
              { $push: { NearestDriverList: [filteredArray[0]] } }
            );
            const user2 = await DriverRegister.findByIdAndUpdate(
              filteredArray[0],
              {
                $set: {
                  RideStatus: "Hold",
                },
              }
            );
            const save = user2.save();
            const ridedata = createride.save();
            // ==================================Update A Paricular Data=======================================================
            const data = await CreateRideRegister.findById(ride._id)
              .populate("vehicleId")
              .populate("cityId")
              .populate("userId")
              .populate("driverID");

            io.emit("createride-data-updated", {
              status: "assign",
              details: data,
            });

            // ==================================Update Driver Status=======================================================
            const driver = await DriverRegister.findById(filteredArray[0])
              .populate("typeid")
              .populate("cityid")
              .populate("countryid");
            io.emit("driver-data-updated", {
              status: "assign",
              details: driver,
            });
          }
          // ====================================================Increase Time when Driver is not Find==========================================================================
          else if (
            ride.NearestDriverList.length < driverlist2.length &&
            filteredArray.length == 0
          ) {
            const createride = await CreateRideRegister.findByIdAndUpdate(
              ride._id,
              {
                $set: {
                  AssigingTime: Date.now(),
                  Status: 0,
                  driverID: null,
                },
              },
              {
                new: true,
              }
            );
          }
          // ======================================================Push Notification=======================================================================
          else if (
            ride.NearestDriverList.length >= driverlist2.length &&
            filteredArray.length == 0
          ) {
            const createride = await CreateRideRegister.findByIdAndUpdate(
              ride._id,
              {
                $set: {
                  Status: 2,
                  driverID: null,
                  NearestDriverList: null,
                },
              },
              {
                new: true,
              }
            );
            const user = await DriverRegister.findByIdAndUpdate(ride.driverID, {
              $set: {
                RideStatus: "Online",
              },
            });
            const rides = await CreateRideRegister.find({
              Status: 2,
            }).count();
            const boolean = true;
            // console.log(boolean);
            io.emit("push-notification", { rides, boolean });

            // ==================================Update A Paricular Data=======================================================
            const data = await CreateRideRegister.findById(ride._id)
              .populate("vehicleId")
              .populate("cityId")
              .populate("userId")
              .populate("driverID");

            io.emit("createride-data-updated", {
              status: "timeout",
              details: data,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to perform ride operations:", error);
    }
  }
  let cronexpression = `*/30 * * * * *`;
  const cronJob = cron.schedule(cronexpression, async () => {
    // Perform ride operations
    await performRideOperations();
  });
  io.on("connection", (socket) => {
    centralEmitter.emit("settings", true);
    // cronEvent.emit("cron", true);
    console.log("A user connected");
    // ======================================================Get Driver Data ========================================================================
    socket.on("get-driver-data", async (id) => {
      try {
        // console.log(id);
        const data = await DriverRegister.find({
          cityid: id.cityId,
          typeid: id.vehicleId,
          RideStatus: "Online",
          Status: "Approved",
        })
          .populate("typeid")
          .populate("cityid")
          .populate("countryid");
        if (!data) {
          // Emit an error event if the user data is not found
          io.emit("user-data-error", "User data not found");
        } else {
          // console.log(data);
          // Emit the user data back to the client
          io.emit("driver-data", data);
        }
      } catch (err) {
        console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("user-data-error", "Error retrieving user data");
      }
    });

    // ================================================================================Status Updater=======================================================================================
    // socket.on("status-updater", async (result) => {
    //   try {
    //     // console.log(result);
    //     if (result.data.Status == 4) {
    //       let createride = await CreateRideRegister.findByIdAndUpdate(
    //         result.data._id,
    //         {
    //           $set: {
    //             Status: 5,
    //           },
    //         }
    //       );
    //       await sendmessage("Your Ride Is Arrived!!!!!!");
    //     } else if (result.data.Status == 5) {
    //       const createride = await CreateRideRegister.findByIdAndUpdate(
    //         result.data._id,
    //         {
    //           $set: {
    //             Status: 6,
    //           },
    //         }
    //       );
    //       await sendmessage("Your Ride Is Started!!!!!!");
    //     } else if (result.data.Status == 6) {
    //       const createride = await CreateRideRegister.findByIdAndUpdate(
    //         result.data._id,
    //         {
    //           $set: {
    //             Status: 7,
    //           },
    //         }
    //       );
    //       const driverupdate = await DriverRegister.findByIdAndUpdate(
    //         result.data.driverID._id,
    //         {
    //           $set: {
    //             RideStatus: "Online",
    //           },
    //         }
    //       );
    //       if (
    //         result.data.userId.customerid &&
    //         result.data.userId.paymentMethodId &&
    //         result.data.paymentOption == "Card"
    //       ) {
    //         // console.log("HIII");
    //         let fare = Number(result.data.estimateFare);
    //         const charge = await stripe.paymentIntents.create({
    //           amount: fare * 100,
    //           currency: "INR",
    //           customer: result.data.userId.customerid,
    //           payment_method: result.data.userId.paymentMethodId,
    //           confirm: true,
    //           off_session: true,
    //         });
    //         console.log("jijiiojiojioiji", charge);
    //       }
    //       await sendmessage("Your Ride Is Completed!!!!!!");
    //       await sendmail(result.data);
    //     }

    //     const driver = await DriverRegister.find()
    //       .populate("typeid")
    //       .populate("cityid")
    //       .populate("countryid");
    //     const running = await CreateRideRegister.find({
    //       $or: [{ Status: 4 }, { Status: 5 }, { Status: 6 }, { Status: 1 }],
    //     })
    //       .populate("vehicleId")
    //       .populate("cityId")
    //       .populate("userId")
    //       .populate("driverID")
    //       .populate({
    //         path: "NearestDriverList",
    //       });
    //     io.emit("runningride-data", running);
    //     io.emit("driver-data", driver);
    //   } catch (err) {
    //     // console.log(err);
    //     // Emit an error event if an error occurs during data retrieval
    //     io.emit("user-data-error", "Error retrieving user data");
    //   }
    // });
    socket.on("status-updater", async (result) => {
      try {
        switch (result.data.Status) {
          case 4:
            await updateRideAndSendMessage(
              result,
              5,
              "Your Ride Is Arrived!!!!!!"
            );
            break;
          case 5:
            await updateRideAndSendMessage(
              result,
              6,
              "Your Ride Is Started!!!!!!"
            );
            break;
          case 6:
            await updateRideStatusAndDriver(result);
            await sendCardPayment(result);
            await sendmessage("Your Ride Is Completed!!!!!!");
            await sendmail(result.data);
            break;
          default:
            break;
        }

        const [driver, running] = await Promise.all([
          DriverRegister.find()
            .populate("typeid")
            .populate("cityid")
            .populate("countryid"),
          CreateRideRegister.find({
            $or: [{ Status: 4 }, { Status: 5 }, { Status: 6 }, { Status: 1 }],
          })
            .populate("vehicleId")
            .populate("cityId")
            .populate("userId")
            .populate("driverID")
            .populate({ path: "NearestDriverList" }),
        ]);

        io.emit("runningride-data", running);
        io.emit("driver-data", driver);
      } catch (err) {
        io.emit("user-data-error", "Error retrieving user data");
      }
    });

    async function updateRideAndSendMessage(result, newStatus, message) {
      const createride = await CreateRideRegister.findByIdAndUpdate(
        result.data._id,
        {
          $set: {
            Status: newStatus,
          },
        }
      );
      // await sendmessage(message);
    }

    async function updateRideStatusAndDriver(result) {
      await CreateRideRegister.findByIdAndUpdate(result.data._id, {
        $set: {
          Status: 7,
        },
      });
      await DriverRegister.findByIdAndUpdate(result.data.driverID._id, {
        $set: {
          RideStatus: "Online",
        },
      });
    }

    async function sendCardPayment(result) {
      if (
        result.data.userId.customerid &&
        result.data.userId.paymentMethodId &&
        result.data.paymentOption == "Card"
      ) {
        let fare = Number(result.data.estimateFare);
        const charge = await stripe.paymentIntents.create({
          amount: fare * 100,
          currency: "INR",
          customer: result.data.userId.customerid,
          payment_method: result.data.userId.paymentMethodId,
          confirm: true,
          off_session: true,
        });
        console.log("jijiiojiojioiji", charge);
      }
    }

    // =================================================================================Reject Ride=======================================================================================
    socket.on("delete-ride", async (id) => {
      try {
        console.log(id);
        if (id.RideStatus == "Self") {
          let createride = await CreateRideRegister.findByIdAndUpdate(id._id, {
            $set: {
              driverID: null,
              Status: 3,
            },
          });
          let user = await DriverRegister.findByIdAndUpdate(id.driverID._id, {
            $set: {
              RideStatus: "Online",
            },
          });
          // ==================================Update A Paricular Data=======================================================
          const data = await CreateRideRegister.findById(id._id)
            .populate("vehicleId")
            .populate("cityId")
            .populate("userId")
            .populate("driverID");

          io.emit("createride-data-updated", {
            status: "timeout",
            details: data,
          });

          // ==================================Update Driver Status=======================================================
          const driver = await DriverRegister.findById(id.driverID._id)
            .populate("typeid")
            .populate("cityid")
            .populate("countryid");
          io.emit("driver-data-updated", {
            status: "timeout",
            details: driver,
          });
        } else {
          const driverlist = await DriverRegister.find({
            cityid: id.cityId._id,
            typeid: id.vehicleId._id,
            Status: "Approved",
          });
          // console.log("nearest len-======>", id.NearestDriverList.length);
          // console.log("driverlist len-======>", driverlist.length);
          if (id.NearestDriverList.length < driverlist.length) {
            const user = await DriverRegister.findByIdAndUpdate(
              id.driverID._id,
              {
                $set: {
                  RideStatus: "Online",
                },
              }
            );
            const ridenearest = await CreateRideRegister.findByIdAndUpdate(
              id._id,
              {
                $set: {
                  Status: 0,
                  AssigingTime: null,
                  driverID: null,
                },
              }
            );

            // ==================================Update A Paricular Data=======================================================
            let data = await CreateRideRegister.findById(id._id)
              .populate("vehicleId")
              .populate("cityId")
              .populate("userId")
              .populate("driverID");
            console.log("id............", data._id);
            io.emit("createride-data-updated", {
              status: "timeout",
              details: data,
            });

            // ==================================Update Driver Status=======================================================
            let driver = await DriverRegister.findById(id.driverID._id)
              .populate("typeid")
              .populate("cityid")
              .populate("countryid");
            io.emit("driver-data-updated", {
              status: "timeout",
              details: driver,
            });
          } else if (id.NearestDriverList.length == driverlist.length) {
            const ridenearest = await CreateRideRegister.findByIdAndUpdate(
              id._id,
              {
                $set: {
                  Status: 3,
                  AssigingTime: null,
                  driverID: null,
                },
              }
            );
            const user = await DriverRegister.findByIdAndUpdate(
              id.driverID._id,
              {
                $set: {
                  RideStatus: "Online",
                },
              }
            );
            const save = await user.save();
            const ridedata = await ridenearest.save();
          }
        }
      } catch (err) {
        // console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("ride-data-error", "Error retrieving user data");
      }
    });

    // ==========================================================================Get Driver Status ========================================================================
    socket.on("status-updated", async (data) => {
      try {
        let driver = await DriverRegister.findById(data.id);
        if (driver.RideStatus != "Hold" || driver.RideStatus != "Busy") {
          let user = await DriverRegister.findByIdAndUpdate(data.id, {
            $set: {
              Status: data.status,
            },
          });
          if (data.status == "Approved") {
            user.RideStatus = "Online";
          } else {
            user.RideStatus = "Offline";
          }
          await user.save();
        }
        let drivers = await DriverRegister.find();
        io.emit("status-updated", drivers);
        io.emit("driver-data", drivers);
      } catch (err) {
        // console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("user-data-error", "Error retrieving user data");
      }
    });

    // ===========================================================================Get Driver Data ========================================================================
    socket.on("service-updated", async (data) => {
      try {
        // console.log(data);
        let user = await DriverRegister.findByIdAndUpdate(data.id, {
          $set: {
            typeid: data.typeid,
          },
        });

        await user.save();

        let drivers = await DriverRegister.find()
          .populate("countryid")
          .populate("cityid")
          .populate("typeid");
        // console.log(drivers);
        io.emit("service-updated", drivers);
        io.emit("driver-data", drivers);
      } catch (err) {
        console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("user-data-error", "Error retrieving user data");
      }
    });

    // =============================================================================Add Ride==============================================================================
    socket.on("createride", async (result) => {
      try {
        let page = 1;
        let limit = 2;
        let sort = 1;
        // console.log(result);
        let createride = new CreateRideRegister({
          paymentOption: result.paymentOption,
          rideTime: result.rideTime,
          serviceType: result.serviceType,
          rideDate: result.rideDate,
          startLocation: result.startLocation,
          endLocation: result.endLocation,
          wayPoints: result.wayPoints,
          totalDistance: result.totalDistance,
          totalTime: result.totalTime,
          estimateFare: result.estimateFare,
          DriverProfit: result.DriverProfit,
          cityId: result.cityId,
          vehicleId: result.vehicleId,
          userId: result.userId,
          driverID: null,
          RideStatus: "Self",
          Status: 0,
          AssigingTime: null,
        });
        const createdata = await createride.save();
        console.log("new data", createdata);
        const data = await CreateRideRegister.find({
          $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
        })
          .populate("vehicleId")
          .populate("cityId")
          .populate("userId")
          .populate("driverID")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({
            createdAt: sort,
          });
        const count = await CreateRideRegister.find({
          $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
        }).count();

        // transporter.sendMail(info)
        if (!data) {
          // Emit an error event if the user data is not found
          io.emit("createride-data-error", "Ride data not found");
        } else {
          // console.log(data);
          // Emit the user data back to the client
          io.emit("createrided-data");
          io.emit("createride-data", { data, count });
        }
      } catch (err) {
        console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("createride-data-error", "Error retrieving user data");
      }
    });

    // ============================================================================Get Ride Data==============================================================================
    socket.on("get-creteride-data", async (result) => {
      try {
        // console.log(result);
        let sort = -1;
        let page = +result.page;
        let limit = +result.size;
        let sorting = result.sort;
        console.log(sorting);
        if (sorting == "asc") {
          sort = 1;
        } else {
          sort = -1;
        }
        const data = await CreateRideRegister.find({
          $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
        })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({
            createdAt: sort,
          })
          .populate("vehicleId")
          .populate("cityId")
          .populate("userId")
          .populate("driverID")
          .populate({
            path: "NearestDriverList",
          });
        const count = await CreateRideRegister.find({
          $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
        }).count();
        if (!data) {
          // Emit an error event if the user data is not found
          io.emit("ride-data-error", "User data not found");
        } else {
          // console.log(data);
          // Emit the user data back to the client
          io.emit("createride-data", { data, count });
        }
      } catch (err) {
        console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("ride-data-error", "Error retrieving user data");
      }
    });

    // =============================================================================Assign Ride==============================================================================
    socket.on("running-ride-data", async (details) => {
      try {
        console.log(details);
        let createride;
        if (details.status == "1") {
          createride = await CreateRideRegister.findByIdAndUpdate(
            details.data._id,
            {
              $set: {
                // driverID: details.id,
                RideStatus: "Self",
                NearestDriverList: null,
                driverID: details.id,
                Status: 1,
                AssigingTime: Date.now(),
              },
            }
          );
        } else {
          createride = await CreateRideRegister.findByIdAndUpdate(
            details.data._id,
            {
              $set: {
                NearestDriverList: null,
              },
            }
          );
          // const ridedata = await CreateRideRegister.findById(details.data._id);
          const driverlist = await DriverRegister.find({
            cityid: details.data.cityId._id,
            typeid: details.data.vehicleId._id,
            Status: "Approved",
            RideStatus: "Online",
          });

          createride = await CreateRideRegister.findByIdAndUpdate(
            details.data._id,
            {
              $set: {
                RideStatus: "Nearest",
                Status: 1,
                NearestDriverList: driverlist[0]._id,
                driverID: driverlist[0]._id,
                AssigingTime: Date.now(),
              },
            }
          );
        }

        const data2 = await createride.save();
        const driverupdate = await DriverRegister.findByIdAndUpdate(
          details.id,
          {
            $set: {
              RideStatus: "Hold",
            },
          }
        );

        io.emit("status-updated", driverupdate);
        // ==================================Update A Paricular Data=======================================================
        const data = await CreateRideRegister.findById(details.data._id)
          .populate("vehicleId")
          .populate("cityId")
          .populate("userId")
          .populate("driverID");

        io.emit("createride-data-updated", {
          status: "assign",
          details: data,
        });
        console.log(
          "***********************************************************",
          data
        );
        // // ==================================Update Driver Status=======================================================
        // const driver = await DriverRegister.findById( details.data.driverID._id)
        //   .populate("typeid")
        //   .populate("cityid")
        //   .populate("countryid");
        // io.emit("driver-data-updated", {
        //   status: "assign",
        //   details: driver,
        // });
        // cronEvent.emit("cron", true);
        // io.emit("running-ride-data", createridedata);
      } catch (err) {
        console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("user-data-error", "Error retrieving user data");
      }
    });

    // ==========================================================================Cancel Confirmed Ride==============================================================================
    socket.on("cancel-ride", async (details) => {
      try {
        let createride;
        ridedata = await CreateRideRegister.findById(details._id);
        const driver = await DriverRegister.findByIdAndUpdate(
          details.driverID._id,
          {
            $set: {
              RideStatus: "Online",
            },
          }
        );
        // }
        let drivers = await DriverRegister.find();
        createride = await CreateRideRegister.findByIdAndUpdate(details._id, {
          $set: {
            Status: 0,
            AssigingTime: null,
            NearestDriverList: null,
            driverID: null,
          },
        });
        const data2 = await createride.save();
        const data = await CreateRideRegister.find({
          $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
        })
          .populate("vehicleId")
          .populate("cityId")
          .populate("userId")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({
            createdAt: sort,
          });
        const count = await CreateRideRegister.find({
          $or: [{ Status: 0 }, { Status: 1 }, { Status: 2 }],
        }).count();
        // io.emit("status-updated", driver);
        io.emit("createride-data", { data, count });
        io.emit("driver-data", drivers);
        const running = await CreateRideRegister.find({
          $or: [{ Status: 4 }, { Status: 5 }, { Status: 6 }, { Status: 1 }],
        })
          .populate("vehicleId")
          .populate("cityId")
          .populate("userId")
          .populate("driverID")
          .populate({
            path: "NearestDriverList",
          });

        io.emit("runningride-data", running);
        // cronEvent.emit("cron", true);
      } catch (err) {
        console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("user-data-error", "Error retrieving user data");
      }
    });

    // ==============================================================================Accept Ride ========================================================================
    socket.on("status-updated-ride", async (result) => {
      try {
        let createride = await CreateRideRegister.findByIdAndUpdate(
          result.details._id,
          {
            $set: {
              Status: 4,
              AssigingTime: Date.now(),
            },
          }
        );
        const driverupdate = await DriverRegister.findByIdAndUpdate(
          result.details.driverID._id,
          {
            $set: {
              RideStatus: "Online",
            },
          }
        );
        io.emit("status-updated", driverupdate);
        // ==================================Update A Paricular Data=======================================================
        const data = await CreateRideRegister.findById(result.details._id)
          .populate("vehicleId")
          .populate("cityId")
          .populate("userId")
          .populate("driverID");

        io.emit("createride-data-updated", {
          status: "accept",
          details: data,
        });

        // ==================================Update Driver Status=======================================================
        const driver = await DriverRegister.findById(
          result.details.driverID._id
        )
          .populate("typeid")
          .populate("cityid")
          .populate("countryid");
        io.emit("driver-data-updated", {
          status: "accept",
          details: driver,
        });
        // cronEvent.emit("cron", true);
      } catch (err) {
        // console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("user-data-error", "Error retrieving user data");
      }
    });

    // ============================================================================Ride History================================================================================
    socket.on("get-ridehistory-data", async (result) => {
      try {
        // Replace this with your logic to retrieve the user data
        let sort = 1;
        const page = +result.page;
        const limit = +result.size;
        const sorting = result.sort;
        // console.log(sorting);
        if (sorting == "asc") {
          sort = 1;
        } else {
          sort = -1;
        }
        const data = await CreateRideRegister.find({
          $or: [{ Status: 7 }, { Status: 3 }],
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
        const count = await CreateRideRegister.find({
          $or: [{ Status: 7 }, { Status: 3 }],
        }).count();
        if (!data) {
          // Emit an error event if the user data is not found
          io.emit("ride-data-error", "User data not found");
        } else {
          // console.log(data);
          // Emit the user data back to the client
          io.emit("ridehistory-data", { data, count });
        }
      } catch (err) {
        console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("ride-data-error", "Error retrieving user data");
      }
    });

    // ============================================================================RunningRide ================================================================================
    socket.on("get-runningride-data", async () => {
      try {
        // Replace this with your logic to retrieve the user data

        const running = await CreateRideRegister.find({
          $or: [{ Status: 4 }, { Status: 5 }, { Status: 6 }, { Status: 1 }],
        })
          .populate("vehicleId")
          .populate("cityId")
          .populate("userId")
          .populate("driverID")
          .populate({
            path: "NearestDriverList",
          });

        if (!running) {
          // Emit an error event if the user data is not found
          io.emit("ride-data-error", "User data not found");
        } else {
          // console.log(data);
          // Emit the user data back to the client
          io.emit("runningride-data", running);
        }
      } catch (err) {
        console.log(err);
        // Emit an error event if an error occurs during data retrieval
        io.emit("ride-data-error", "Error retrieving user data");
      }
    });

    // ===========================================================================Push Notification================================================================================
    socket.on("push-notification", async (details) => {
      const rides = await CreateRideRegister.find({
        Status: 2,
      }).count();
      const boolean = false;
      io.emit("push-notification", { rides, boolean });
    });

    // const rideCronJobs = new Map();
    // function startCronJob(rideId) {
    //   // Check if a cron job for the given ride ID already exists
    //   if (rideCronJobs.has(rideId)) {
    //     // console.log(`Cron job for ride ID ${rideId} is already running.`);
    //     return;
    //   }
    //   const delayInSeconds = 10;

    //   // Calculate the cron schedule based on the current time + 20 seconds
    //   const currentTime = new Date();
    //   currentTime.setSeconds(currentTime.getSeconds() + delayInSeconds);
    //   const schedule = `${currentTime.getSeconds()} ${currentTime.getMinutes()} ${currentTime.getHours()} ${currentTime.getDate()} ${
    //     currentTime.getMonth() + 1
    //   } *`;
    //   // Store the cron job in the map

    //   const job = cron.schedule(schedule, () => {
    //     // Stop the job after the initial execution
    //     job.stop();
    //     executeCronJob(rideId);
    //     // Execute the desired operation
    //     performOperation();
    //   });
    //   rideCronJobs.set(rideId, {
    //     job,
    //     currentTime,
    //   });
    //   // console.log(`Started cron job for ride ID ${rideId}.`);
    // }

    // async function updateCronJob(rideId) {
    //   console.log("Updated Id", rideId);
    //   const oldCronJob = rideCronJobs.get(rideId);
    //   const ride = await CreateRideRegister.findById(rideId);

    //   if (
    //     ride.Status == 0 &&
    //     ride.RideStatus == "Nearest" &&
    //     ride.NearestDriverList != null
    //   ) {
    // const ride = await CreateRideRegister.findById(rideId);
    //     const driverlist = await DriverRegister.find({
    //       cityid: ride.cityId,
    //       typeid: ride.vehicleId,
    //       Status: "Approved",
    //       RideStatus: "Online",
    //     });
    //     console.log("Updated Driver LIst:::", driverlist[0]._id);
    //     const objectValues = Object.values(driverlist);
    //     const filteredArray = ride.NearestDriverList.filter(
    //       (element) => !objectValues.includes(element)
    //     );
    //     if (filteredArray.length > 0) {
    //       let user2 = await DriverRegister.findByIdAndUpdate(filteredArray[0], {
    //         $set: {
    //           RideStatus: "Hold",
    //         },
    //       });
    //       let createride = await CreateRideRegister.findByIdAndUpdate(
    //         ride._id,
    //         {
    //           $set: {
    //             // AssigingTime: Date.now(),
    //             driverID: filteredArray[0],
    //             Status: 1,
    //           },
    //         }
    //       );
    //       let newridedata = await CreateRideRegister.updateOne(
    //         { _id: ride._id },
    //         { $pull: { NearestDriverList: { $in: [filteredArray[0]] } } }
    //       );

    //       const ridedata = createride.save();
    //       const data = await CreateRideRegister.find()
    //         .populate("vehicleId")
    //         .populate("cityId")
    //         .populate("userId")
    //         .populate("driverID")
    //         .skip((page - 1) * limit)
    //         .limit(limit)
    //         .sort({
    //           startLocation: sort,
    //           endLocation: sort,
    //           paymentOption: sort,
    //           estimateFare: sort,
    //         });
    //       const count = await CreateRideRegister.count();
    //       io.emit("createride-data", { data, count });
    //       const driver = await DriverRegister.find()
    //         .populate("typeid")
    //         .populate("cityid")
    //         .populate("countryid");
    //       io.emit("driver-data", driver);
    //       if (oldCronJob) {
    //         // Stop the old cron job
    //         oldCronJob.job.stop();
    //         const delayInSeconds = 10;

    //         // Calculate the cron schedule based on the current time + 20 seconds
    //         const currentTime = new Date();
    //         currentTime.setSeconds(currentTime.getSeconds() + delayInSeconds);
    //         const schedule = `${currentTime.getSeconds()} ${currentTime.getMinutes()} ${currentTime.getHours()} ${currentTime.getDate()} ${
    //           currentTime.getMonth() + 1
    //         } *`;
    //         // Store the cron job in the map

    //         const job = cron.schedule(schedule, () => {
    //           // Stop the job after the initial execution
    //           job.stop();
    //           executeCronJob(rideId);
    //           // Execute the desired operation
    //           performOperation();
    //         });
    //         rideCronJobs.set(rideId, {
    //           job,
    //           currentTime,
    //         });

    //         // console.log(`Updated cron job for ride ID ${rideId}`);
    //       } else {
    //         // console.log(`No cron job found for ride ID ${rideId}.`);
    //       }
    //     }
    //   } else {
    //     oldCronJob.job.stop();
    //   }
    // }

    // async function executeCronJob(rideId) {
    //   const cronJob = rideCronJobs.get(rideId);
    //   const ride = await CreateRideRegister.findById(rideId);
    //   if (ride.Status == 1 && ride.RideStatus == "Self") {
    //     const newride = await CreateRideRegister.findByIdAndUpdate(ride._id, {
    //       $set: {
    //         Status: 0,
    //         AssigingTime: null,
    //         driverID: null,
    //       },
    //     });
    //     const ridedata = newride.save();
    //     const data = await CreateRideRegister.find()
    //       .populate("vehicleId")
    //       .populate("cityId")
    //       .populate("userId")
    //       .populate("driverID")
    //       .skip((page - 1) * limit)
    //       .limit(limit)
    //       .sort({
    //         startLocation: sort,
    //         endLocation: sort,
    //         paymentOption: sort,
    //         estimateFare: sort,
    //       });
    //     let user = await DriverRegister.findByIdAndUpdate(ride.driverID, {
    //       $set: {
    //         RideStatus: "Online",
    //       },
    //     });
    //     const count = await CreateRideRegister.count();
    //     io.emit("createride-data", { data, count });
    //     const driver = await DriverRegister.find()
    //       .populate("typeid")
    //       .populate("cityid")
    //       .populate("countryid");
    //     io.emit("driver-data", driver);
    //     // cronJob.cronJob.stop();
    //   } else if (
    //     ride.Status == 1 &&
    //     ride.RideStatus == "Nearest" &&
    //     ride.NearestDriverList != null
    //   ) {
    //     const ridenearest = await CreateRideRegister.findByIdAndUpdate(
    //       ride._id,
    //       {
    //         $set: {
    //           Status: 0,
    //           AssigingTime: null,
    //           driverID: null,
    //         },
    //       }
    //     );
    //     let user = await DriverRegister.findByIdAndUpdate(ride.driverID, {
    //       $set: {
    //         RideStatus: "Online",
    //       },
    //     });
    //     const ridedata = ridenearest.save();
    //     const data = await CreateRideRegister.find()
    //       .populate("vehicleId")
    //       .populate("cityId")
    //       .populate("userId")
    //       .populate("driverID")
    //       .skip((page - 1) * limit)
    //       .limit(limit)
    //       .sort({
    //         startLocation: sort,
    //         endLocation: sort,
    //         paymentOption: sort,
    //         estimateFare: sort,
    //       });
    //     const count = await CreateRideRegister.count();
    //     io.emit("createride-data", { data, count });
    //     const driver = await DriverRegister.find()
    //       .populate("typeid")
    //       .populate("cityid")
    //       .populate("countryid");
    //     io.emit("driver-data", driver);
    //     updateCronJob(rideId);
    //   }
    //   if (cronJob) {
    //     // Stop the cron job

    //     cronJob.job.stop();

    //     // Remove the cron job from the map
    //     rideCronJobs.delete(rideId);

    //     // console.log(`Stopped cron job for ride ID ${rideId}.`);
    //   } else {
    //     console.log(`No cron job found for ride ID ${rideId}.`);
    //   }
    // }

    // const cronJob = cron.schedule("* * * * * *", async () => {
    //   // Perform ride operations

    //   checkExpiredCronJobs();
    //   // console.log("Cron is Starting --------------->");
    // });
    // function checkExpiredCronJobs() {
    //   const currentTime = new Date();

    //   // Iterate over all ride cron jobs in the map
    //   for (const [rideId, jobData] of rideCronJobs.entries()) {
    //     const creationTime = jobData.creationTime;
    //     const timeDifference = currentTime - creationTime;

    //     // If the time difference exceeds 10 seconds, delete the cron job
    //     if (timeDifference >= 10000) {
    //       stopCronJob(rideId);
    //       // console.log(`Expired cron job for ride ID ${rideId} deleted.`);
    //     }
    //   }
    // }

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
