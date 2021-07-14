const {to} =  require('../middlewares/utilservices');
var CronJobService = require('../services/CronJobService');
var CronActvityLog = require('../models/CronActivityLog');
var moment  = require('moment');

module.exports = { 
cronJobFunction: async (req, res) => {
  let cronData, cronActivity;
    
  [err, cronActivity] = await to(CronJobService.companyMaintenanceTicketsJob(req.params.company));

  if(err){
    [err, cronData] = await to(CronActvityLog.create({
      module  : "Maintenance Tickets",
      activity: "CRON Job failed on, "+moment().format('DD-MM-YYYY'),
      status  : false
    }));
    cronData.save();

    return res.status(500).json({
                                "message": "CRON Job failed on, "+moment().format('DD-MM-YYYY'),
                                "success": false,
                                "status" : 500
                              });
  }else{
    [err, cronData] = await to(CronActvityLog.create({
        module  : "Maintenance Tickets",
        activity: "Maintenance Tickets created on, "+moment().format('DD-MM-YYYY'),
    }));
    cronData.save();

    res.status(200).json({
                        "status" : 200,
                        "message": "Maintenance Tickets created on, "+moment().format('DD-MM-YYYY'),
                        "success": true
                      });
  }
},

getAssetsDataReport: async function(req,res){
  let err, data;

  [err, data] = await to(CronJobService.exportAssetsDataToExcel(req.body));
  if(err) return res.json({"status": 500,"success": false,"message": err});
  
  if(data && data!==false){
      return res.json({"status": 200,"success": true,"data": data});
  }else{
      return res.json({"status": 401,"success": false,"message": "Can't export Assets data. Try Again!"});
  }
},

getTicketsDataReport: async function(req,res){
  let err, data;
  let userId = req.user._id;
  let userRole = req.user.role.roleName;

  [err, data] = await to(CronJobService.exportTicketsDataToExcel(req.body, userId, userRole));
  if(err) return res.json({"status": 500,"success": false,"message": err});

  if(data && data!==false){
      return res.json({"status": 200,"success": true,"data": data});
  }else{
      return res.json({"status": 401,"success": false,"message": "Can't export Tickets data. Try Again!"});
  }
},

getAssignedTicketsDataReport: async function(req,res){
  let err, data;
  let userId = req.user._id;

  [err, data] = await to(CronJobService.exportAssignedTicketsDataToExcel(req.body, userId, req.params.assignType));
  if(err) return res.json({"status": 500,"success": false,"message": err});

  if(data && data!==false){
    return res.json({"status": 200,"success": true,"data": data});
  }else{
    return res.json({"status": 401,"success": false,"message": "Can't export Tickets data. Try Again!"});
  }
}
}