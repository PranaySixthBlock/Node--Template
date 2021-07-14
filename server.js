global.__basepath = process.cwd();
global.app = new require("express")();
const http = require('http');
global.express = require("express");
const bodyParser = require("body-parser");
global.mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const adminApiRouter = require("./app/routes/api");
const userApiRouter = require("./app/routes/user_api");
const passport = require("passport");
require("./bin/kernal");
var moment  = require('moment');
var {to, TE} = require("./app/middlewares/utilservices");
var CronJobService = require('./app/services/CronJobService');
var CronActvityLog = require('./app/models/CronActivityLog');
global.CronJob = require('cron').CronJob;

var job = new CronJob("10 17 * * *", async function() {  //Every Sunday, 11.00 PM "0 23 * * 0"
  let cronData, cronActivity, err;
  
  [err, cronActivity] = await to(CronJobService.maintenanceTicketsJob());

  if(err){
    [err, cronData] = await to(CronActvityLog.create({
        module  : "Maintenance Tickets-CRON",
        activity: "CRON Job failed on, "+moment().format('DD-MM-YYYY'),
        status  : false
    }));
    cronData.save();
  }else{
    [err, cronData] = await to(CronActvityLog.create({
        module  : "Maintenance Tickets-CRON",
        activity: "Maintenance Tickets created on, "+moment().format('DD-MM-YYYY'),
    }));
    cronData.save();
  }
});
job.start();

dotenv.config();
app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", adminApiRouter);
app.use("/user/api", userApiRouter);
app.set("port", process.env.PORT || 8080);
app.use(express.static(path.join(__basepath, "public")));
app.use(express.static(path.join(__basepath, "/public/uploads")));
app.use(express.static(path.join(__basepath, "/public/uploads")));
app.use(express.static(path.join(__basepath, "/public/uploads/tickets")));
app.use(express.static(path.join(__basepath, "/public/uploads/company")));


// Setup Connection to DB
exports.db = mongoose
    .connect(process.env.db_url,{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => console.log("Mongo Connection Successfull"))
    .catch(err => console.error(err,"> error occurred from the database"));

app.listen(process.env.PORT, () => {
  console.log("App is running at http://localhost: %s in %s mode",process.env.PORT,process.env.NODE_ENV);
  console.log("  Press CTRL-C to stop\n");
});


module.exports = app;