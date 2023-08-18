require("dotenv").config();
const { urlencoded } = require("express");
const express = require("express");
const app = express();
const carRouters = require("./Routers/cartype");
const countryRouters = require("./Routers/country");
const CitiesRouters = require("./Routers/citytype");
const VehiclePriceRouters = require("./Routers/vehicleprice");
const  {router} = require("./Routers/settings");
const  {centralEmitter} = require("./Routers/settings");
const DriverRouters = require("./Routers/drivers");
const CreateRideRouters = require("./Routers/createride");
const UserRouters = require("./Routers/user");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const { UserRegister } = require("./Db/modals/models");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { env } = require("process");
const multer = require("multer");
const path = require("path");
app.use(cookieParser());
require("./Db/conn");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["https://stgride232809.netlify.app"],
  },
});

const socketHandler = require('./Routers/socket');
socketHandler(io);


const publicPath = path.join(__dirname, "./Public");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(publicPath));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./Public");
  },
  filename: function (req, file, cb) {
     
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/registration", upload.single("profile"), async (req, res) => {
  try {
    const Register = new UserRegister({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      number: req.body.number,
    });
    if (req.file) {
      Register.file = req.file.filename;
    }
    const token = await Register.generateToken();
    Register.tokens = Register.tokens.concat({ token });
    const registered = await Register.save();
    res.status(201).send({ token });
  } catch (err) {
    console.log(err);
    // const emailerror = err.keyPattern.email;
    // const numbererror = err.keyPattern.number;
    // if (emailerror == 1) {
    //   res .send("Email Already Exists");
    // }else if(numbererror == 1){
    //   res .send("Number Already Exists");
    // }else{
      res.send(err);
    // }
  }
});
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const usermail = await UserRegister.findOne({ email: email });
    const token = await usermail.generateToken();
     
     console.log("hello");
    const decode = await jwt.verify(token, process.env.secret_key);
    res.cookie("jwt", token, {
      httpOnly: true,
    });
    if (password == usermail.password && decode._id == usermail._id) {
      usermail.tokens = usermail.tokens.concat({ token: token });
      centralEmitter.emit('settings',true)
      await usermail.save();
      res.status(200).send({ usermail, token });
    }else {
      console.log("hii");
      res.status(400).send("Invalid Email And Password!!");
    }
  } catch (err) {
    console.log(err);
    res.status(400).send("Invalid Email And Password!!");
  }
});
app.post("/logout",upload.none(), async (req, res) => {
  try {
     
    // res.clearCookie("jwt");
    // await req.user.save()
    const usermail = await UserRegister.findOne({ _id: req.body.id });
    usermail.tokens = usermail.tokens.filter((currElement) => {
      return currElement.token !== req.body.token;
    });
    await usermail.save()
    res.send(res.user);
  } catch (err) {
    res .send(err);
  }
});

app.use("/car", carRouters);
app.use("/countries", countryRouters);
app.use("/cities", CitiesRouters);
app.use("/vehicleprice", VehiclePriceRouters);
app.use("/userslist", UserRouters);
app.use("/driverslist", DriverRouters);
app.use("/settings", router);
app.use("/createride", CreateRideRouters);
server.listen(process.env.PORT, () => {
  console.log("Server is running on port: " + process.env.PORT);
});
