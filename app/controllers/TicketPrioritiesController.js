'use strict'
const {to} = require('../middlewares/utilservices');
var TicketPrioritiesService = require('../services/TicketPrioritiesService');

module.exports={
createTicketPriority: async function(req,res){
    let err, ticketPriority;
    let roleId = req.user.role._id;

    [err,ticketPriority]= await to(TicketPrioritiesService.addNewTicketPriority(req.params.companyId,req.params.userId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(ticketPriority && ticketPriority!==false){
        return res.status(200).json({"status": 200,"success": true,"data": ticketPriority});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot add dropdown to company. Try again!"});
    }
},

getAllTicketPriorities: async function(req,res){
    let err, ticketPriorities;
    let roleId = req.user.role._id;

    [err, ticketPriorities] = await to(TicketPrioritiesService.TicketPrioritiesList(req.params.companyId,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(ticketPriorities && ticketPriorities!==false){
        return res.status(200).json({"status": 200,"success": true,"data": ticketPriorities});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdowns. Try again!"});
    }
},

updateTicketPriority: async function(req,res){
    let err, ticketPriority;
    let roleId = req.user.role._id;

    [err, ticketPriority] = await to(TicketPrioritiesService.updateTicketPriority(req.params.tpId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(ticketPriority && ticketPriority!==false){
        return res.status(200).json({"status": 200,"success": true,"data": ticketPriority});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company dropdown. Try again!"});
    }
},

getTicketPriorityData: async function(req,res){
    let err, ticketPriority;
    let roleId = req.user.role._id;

    [err, ticketPriority] = await to(TicketPrioritiesService.getTicketPriorityDetails(req.params.tpId,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(ticketPriority && ticketPriority!==false){
        return res.status(200).json({"status": 200,"success": true,"data": ticketPriority});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdown data. Try again!"});
    }
},

}