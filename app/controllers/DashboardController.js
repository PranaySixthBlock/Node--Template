'use strict'
const {to} = require('../middlewares/utilservices');
var DashBoardService = require('../services/DashboardService');

module.exports = {
    TicketsCountController : async function(req,res){
        let err, ticketsCount;
        let roleId = req.user.role._id;
        let userId = req.user._id;
        let userRole = req.user.role.roleName;
    
        [err, ticketsCount] = await to(DashBoardService.getCompanyTicketsCount(req.params.companyId,req.params.days,roleId,userId,userRole));
    
        if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
        if(ticketsCount && ticketsCount!==false){
            return res.status(200).json({"status": 200,"success": true,"data": ticketsCount});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company Tickets data. Try again!"});
        }
    },

    AllDashboardCountController : async function(req,res){
        let err, ticketsCount;
        let roleId = req.user.role._id;
        let userId = req.user._id;
        let userRole = req.user.role.roleName;

        [err, ticketsCount] = await to(DashBoardService.TotalDashboardCounts(req.params.companyId, roleId, userId,userRole));
    
        if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
        if(ticketsCount && ticketsCount!==false){
            return res.status(200).json({"status": 200,"success": true,"data": ticketsCount});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company Tickets data. Try again!"});
        }
    },

    adminDashboardCounts: async function(req, res){
        let err, counts;

        [err, counts] = await to(DashBoardService.adminDashboardData());

        if(err) return res.status(500).json({"status": 500, "success": false, "message": err});
        if(counts && counts!==false){
            return res.status(200).json({"status": 200,"success": true,"data": counts});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Cannot display Dashboard data. Try again!"});
        }
    },

    displayCronActivity: async function(req, res){
        let err, data;

        [err, data] = await to(DashBoardService.displayCronJobLog());

        if(err) return res.status(500).json({"status": 500, "success": false, "message": err});
        if(data && data!==false){
            return res.status(200).json({"status": 200,"success": true,"data": data});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Cannot display Cron Log data. Try again!"});
        }
    }
}