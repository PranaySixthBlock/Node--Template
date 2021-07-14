var {to, TE} = require('../middlewares/utilservices');
var TicketPriorities = require('../models/TicketPriorities');
var UserRoles = require('../models/UserRoles');

module.exports = {
addNewTicketPriority: async function(company, userId,payload, role){
    let err, ticketPriority, allTicketPriorities;
    let roleData, obj, duplicateData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"ticketPriorities":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].ticketPriorities;
    };

    [err, duplicateData] = await to(TicketPriorities.find({"company":company, "name":payload.name}));
    if(err) {TE(err, true);}
    if(duplicateData.length<1){
        [err, ticketPriority] = await to(TicketPriorities.create({
            company     : company,
            name        : payload.name,
            status      : payload.status?payload.status:1,
            slaFrom     : payload.slaFrom,
            slaTo       : payload.slaTo,
            slaType     : payload.slaType,
            createdBy   : userId,
        }));

    ticketPriority.save();
    if(err) {TE(err.message, true);}

    [err,allTicketPriorities] = await to(TicketPriorities.find({"company":company}).sort({"createdAt":-1}));
    if(err) {TE(err.message);}

        return (allTicketPriorities)?{data: allTicketPriorities, permissions: obj}:false;
    }else{
        {TE(payload.name+" dropdown already exists");}
    }
},

TicketPrioritiesList: async function(company, role){
    let err, ticketPriorities;
    let roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"ticketPriorities":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].ticketPriorities;
    };

    // [err, ticketPriorities] = await to(TicketPriorities.find({"company": company}).sort({"createdAt":-1}));
    [err, ticketPriorities] = await to(TicketPriorities.aggregate([
        {
            $match: {
                company: new mongoose.Types.ObjectId(company)
            }
        },{
            $project: {
                createdAt: {
                    $dateToString: {
                        // format: "%d-%m-%G %H:%M:%S",
                        format: "%d-%m-%G",
                        date: "$createdAt"
                    }
                },
                "company": 1, "name": 1, "slaFrom": 1,
                "slaTo": 1, "slaType": 1, "status": 1,
                "createdBy": 1, "updatedAt": 1
            }
        },{
            $sort: { createdAt: -1}
        }]));

    if(err) {TE(err.message, true);}

    return ticketPriorities?{data: ticketPriorities, permissions: obj}:false;
},

updateTicketPriority: async function(tpId, payload, role){
    let err, ticketPriority, updatedTicketPriority, allTicketPriorities;
    let roleData, obj, duplicateData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"ticketPriorities":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].ticketPriorities;
    };

    [err,ticketPriority]= await to(TicketPriorities.findById(tpId));

    if(err) {TE(err.message, true);}

    if(ticketPriority){
        if(ticketPriority.name === payload.name){
            ticketPriority.status     = payload.status ? payload.status:ticketPriority.status;
            ticketPriority.slaFrom    = payload.slaFrom ? payload.slaFrom:ticketPriority.slaFrom;
            ticketPriority.slaTo      = payload.slaTo ? payload.slaTo:ticketPriority.slaTo;
            ticketPriority.slaType    = payload.slaType ? payload.slaType:ticketPriority.slaType;
    
            [err,updatedTicketPriority]= await to(ticketPriority.save());
            if(err) {TE(err.message, true);}
    
            [err,allTicketPriorities] = await to(TicketPriorities.find({"company":ticketPriority.company})
                                                                .sort({"createdAt":-1}));
            if(err) {TE(err.message, true);}
    
            return allTicketPriorities?{data: allTicketPriorities, permissions: obj}:false;
        }else{
            [err, duplicateData] = await to(TicketPriorities.find({"company": ticketPriority.company,
                                                                    "name": payload.name}));
            if(err) {TE(err.message, true);}

            if(duplicateData.length <=0 ){
                ticketPriority.name       = payload.name ? payload.name:ticketPriority.name;
                ticketPriority.status     = payload.status ? payload.status:ticketPriority.status;
                ticketPriority.slaFrom    = payload.slaFrom ? payload.slaFrom:ticketPriority.slaFrom;
                ticketPriority.slaTo      = payload.slaTo ? payload.slaTo:ticketPriority.slaTo;
                ticketPriority.slaType    = payload.slaType ? payload.slaType:ticketPriority.slaType;
        
                [err,updatedTicketPriority]= await to(ticketPriority.save());
                if(err) {TE(err.message, true);}
        
                [err,allTicketPriorities] = await to(TicketPriorities.find({"company":ticketPriority.company})
                                                                    .sort({"createdAt":-1}));
                if(err) {TE(err.message, true);}
        
                return allTicketPriorities?{data: allTicketPriorities, permissions: obj}:false;
            }else{
                {TE(payload.name+" Ticket Priority already exists!");}
            }
        }
    }else{
        {TE("Ticket Priority not found");}
    }
},

getTicketPriorityDetails : async function(tpId, role){
    let err, ticketPriority;
    let roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"ticketPriorities":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].ticketPriorities;
    };

    [err, ticketPriority] = await to(TicketPriorities.find({_id: tpId}));

    if(err) {TE(err.message, true);}
    return ticketPriority?{data: ticketPriority, permissions: obj}:false;
},
}