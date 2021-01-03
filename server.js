const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cron = require("node-cron");
const services = require("./services");
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = 6000//process.env.PORT
const emailController = require("./src/controllers/email.controller");
const moment = require("moment-timezone");

// create express app
const app = express();
app.use(cors());

app.use(bodyParser.json());

mongoose
  .connect(process.env.mongoDB, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("ENV => " + process.env.mongoDB);
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

  // define a simple route
app.get("/", (req, res) => {
	res.json({
	  message: "Email APIs"
	});
  });
  services({ app });

  try {
    cron.schedule("* * * * *", function () {
      let currentDate = moment().tz("Asia/Calcutta").format("YYYY-MM-DD");
      let time = moment().tz("Asia/Calcutta");
      let currentTime = `${time.toString().split(" ")[4].split(":")[0]}:${time.toString().split(" ")[4].split(":")[1]}`
		  emailController.sendEmail(currentDate,currentTime)
    });
  } catch (error) {
    console.log("Error in sending mail " + error);
  }

  // listen for requests
app.listen(PORT, () => {
	console.log("Server is listening on port", PORT);
  });