var {to} = require('../middlewares/utilservices');
var TicketService = require('../services/TicketService');

module.exports = {
createNewTicket: async function(req, res){
    let err, ticket;
    let roleId = req.user.role._id;

    [err, ticket] = await to(TicketService.newTicketCreation(req.params.companyId,req.params.userId,req.body,roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});
    
    if(ticket && ticket!==false){
        return res.status(200).json({"status": 200, "success": true, "data": ticket});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not create a ticket. Try again!"});
    }
},

companyTicketsList: async function(req, res){
    let err, tickets;
    let roleId = req.user.role._id;

    [err, tickets] = await to(TicketService.companyTickets(req.params.companyId,roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(tickets && tickets!==false){
        return res.status(200).json({"status": 200, "success": true, "data": tickets});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not display company tickets. Try again!"});
    }
},

filteredCompanyTicketsList: async function(req, res){
    let err, tickets;
    let roleId = req.user.role._id;
    let userRole = req.user.role.roleName;
    let userId = req.user._id;

    [err, tickets] = await to(TicketService.filteredCompanyTickets(req,req.body,roleId, userId,userRole));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(tickets && tickets!==false){
        return res.status(200).json({"status": 200, "success": true, "data": tickets});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not display company tickets. Try again!"});
    }
},


getTicketById: async function(req, res){
    let err, tickets;
    let roleId = req.user.role._id;

    [err, tickets] = await to(TicketService.getTicketDetails(req.params.ticketId,roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err.message});

    if(tickets && tickets!==false){
        return res.status(200).json({"status": 200, "success": true, "data": tickets});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not display company ticket data. Try again!"});
    }
},

updateTicketData: async function(req, res){
    let err, tickets;
    let roleId = req.user.role._id;

    [err, tickets] = await to(TicketService.updateTicketDetails(req.params.ticketId,req.params.userId,req.body,roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(tickets && tickets!==false){
        return res.status(200).json({"status": 200, "success": true, "data": tickets});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not display company ticket data. Try again!"});
    }
},

getTicketImages: async function(req, res){
    let err, data;

    [err, data] = await to(TicketService.displayTicketImages(req.params.companyId, req.params.ticketId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display ticket images. Try again!"});
    }
},

deleteTicketImage: async function(req, res){
    let err, data;

    [err, data] = await to(TicketService.deleteImage(req.params.ticketId, req.params.imageId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot delete ticket image. Try again!"});
    }
},

getTicketImagesById: async function(req, res){
    let err, data;

    [err, data] = await to(TicketService.getTicketImagesByTicketId(req.params.ticketId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display ticket images. Try again!"});
    }
},

removeTicketImageById: async function(req, res){
    let err, data;

    [err, data] = await to(TicketService.deleteTicketImagesById(req.params.ticketId,req.params.imageId, req.user._id));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot delete ticket images. Try again!"});
    }
},

displayTicketComments: async function(req, res){
    let err, data;

    [err, data] = await to(TicketService.getAllTicketComments(req.params.tid, req));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display ticket comments. Try again!"});
    }
}
}