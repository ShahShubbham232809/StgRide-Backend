"use strict";
const nodemailer = require("nodemailer");
const { env } = require("process");
const { Settings } = require("../Db/modals/setting");

async function sendmail(data) {
  console.log(data);
  const setting = await Settings.findOne().lean();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: setting.NodemailerEmail,
      pass: setting.NodemailerPassword,
    },
  });

  const html = `<html>

  <body style="background-color:#e2e1e0;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">

    <table style="max-width:670px;margin:50px auto 10px;background-color:#fff;padding:50px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px green;">
      <thead>
        <tr>
          
          <th style="text-align:right;font-weight:400;">
          05th Apr, 2017
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="height:35px;"></td>
        </tr>
        <tr>
          <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
            <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b style="color:green;font-weight:normal;margin:0">Success</b></p>
            <p style="font-size:14px;margin:0 0 6px 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Transaction ID</span> ${data._id}</p>
            <p style="font-size:14px;margin:0 0 0 0;"><span style="font-weight:bold;display:inline-block;min-width:146px">Order amount</span> ₹${data.estimateFare}</p>
          </td>
        </tr>
        <tr>
          <td style="height:35px;"></td>
        </tr>
        <tr>
          <td style="width:50%;padding:20px;vertical-align:top">
            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px">Name</span>${data.userId.name}</p>
            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">Email</span>${data.userId.email}</p>
            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">Phone</span> ${data.userId.number}</p>
            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span style="display:block;font-weight:bold;font-size:13px;">ID No.</span> ${data.userId._id}</p>
          </td>
         
        </tr>
        <tr>
          <td colspan="2" style="font-size:20px;padding:30px 15px 0 15px;">Details:</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:15px;">
          
                <tr>
                  <th>Ride Date</th>
                  <td>${data.rideDate}</td>
                </tr>
                <tr>
                  <th>Ride Time</th>
                  <td>${data.rideTime}</td>
                </tr>
                <tr>
                  <th>Start Location</th>
                  <td>${data.startLocation}</td>
                </tr>
                <tr>
                  <th>End Location</th>
                  <td>${data.endLocation}</td>
                </tr>
                <tr>
                  <th>Total Distance</th>
                  <td>${data.totalDistance} km</td>
                </tr>
                <tr>
                  <th>Total Time</th>
                  <td>${data.totalTime} minutes</td>
                </tr>
                <tr>
                  <th>Payment Option</th>
                  <td>${data.paymentOption}</td>
                </tr>
                <tr>
                  <th>Service Type</th>
                  <td>${data.serviceType}</td>
                </tr>
                <tr>
                <th>Provide Feedback </th>
                <a href="https://form.jotform.com/232011078425446" style="text-decoration:none ; color:green">Give Your FeedBack</a>
                </tr>
          </td>
        </tr>
      </tbody>
      <tfooter>
        <tr>
          <td colspan="2" style="font-size:14px;padding:50px 15px 0 15px;">
            <strong style="display:block;margin:0 0 10px 0;">Regards</strong>Stg Solutions<br> Gorubathan, Pin/Zip - 360007, Rajkot, India<br><br>
            <b>Phone:</b> 03552-222011<br>
            <b>Email:</b> contact@StgSolutions.in
          </td>
        </tr>
      </tfooter>
    </table>
  </body>
  
  </html>`;
  const info = await transporter.sendMail({
    from: '"StG Solutions 👻"', // sender address
    to: "damion.heathcote39@ethereal.email", // list of receivers
    subject: "Invoice", // Subject line
    text: "Hello world?", // plain text body
    html: html, // html body
  });
}
module.exports = { sendmail };
