var {to, TE} = require('../middlewares/utilservices');
var Tickets = require('../models/Tickets');
var UserDropDown = require('../models/UserDropDown');
var mongoose = require("mongoose");
var _ = require("lodash");
var randomize = require('randomatic');
var Assets = require('../models/Assets');
var UserRoles = require('../models/UserRoles');
var TicketPriorities = require('../models/TicketPriorities');
var CompanyContacts = require('../models/CompanyContacts');
var TicketImages = require('../models/TicketImages');
var MailService = require('./MailService');

module.exports = {
newTicketCreation: async function(companyId, userId, payload, role){
    let data, err, ticket, ticketsList, dropdowns;
    let ticketData, roleData, obj, asset_locations;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tickets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].tickets;
    };

    [err, dropdowns] = await to(UserDropDown.find({"company":companyId, "type":"ticketstatus", "name":"New"}));
    if(err) {TE(err.message, true);}

    data = dropdowns[0];
   
    [err, ticket] = await to(Tickets.create({
        ticketId    : "TCKT0"+randomize('A0', 6),
        company     : companyId,
        createdBy   : userId,
        // locations    : payload.locations?payload.locations:[],
        assets      : payload.assets?payload.assets:[],
        status      : payload.status?payload.status:1,
        description : payload.description?payload.description:null,
        priority    : payload.priority,
        ticket_type : payload.ticket_type ? payload.ticket_type : null,
        ticket_status  : data._id,
        // serviceProvider: payload.serviceProvider,
        timeline : {
            status_id  : data._id,
            message    : "A new ticket is created",
            time       : Date.now(),
            messagedBy : userId                        
        },
        maintenance_duedate : payload.maintenance_duedate ? payload.maintenance_duedate : null,
        maintenanceTicket   : payload.maintenanceTicket ? payload.maintenanceTicket : 0
    }));
    
    if(err) {TE(err.message, true);}
    else{
        let userData, emaildata, newTicketData;
        
        [err, newTicketData] = await to(Tickets.findById(ticket._id)
                                                .populate('priority',['name'])
                                                .populate('ticket_type',['name'])
                                                .populate('ticket_status',['name']));

        [err, userData] = await to(CompanyContacts.findById(userId)
                                        .populate('company',{"companyName": 1, "email": 1})
                                        .populate('role',{'roleName': 1}));
                                        
        let metadata = {
            email: userData.email,
            // mail_cc: userData.company.email,
            // sgTemplate: "d-bbc63ae900d54fd1b9d03b4e1748cb80",
            sgTemplate: "d-c64f93326b824f809fdf74c6f9a6485b",
            emailBody:{
                subject: ticket.ticketId+" - New Ticket ("+userData.company.companyName+")",
                creationText: "We are confirming that we received the new ticket from you. Here is what you told us.",
                customer: userData.fullName+" ("+userData.role.roleName+")",
                company_name: userData.company.companyName,
                ticket_id: ticket.ticketId,
                description: ticket.description,
                priority: newTicketData.priority ? newTicketData.priority.name : "",
                ticket_type: newTicketData.ticket_type ? newTicketData.ticket_type.name : "",
                ticket_status: newTicketData.ticket_status ? newTicketData.ticket_status.name : ""
            }
        };
        
        [err, emaildata] = await to(MailService.sgSurveyMailService2(metadata));

        let loc, locations_array = [];
        if(payload.assets && payload.assets.length > 0){
            
            [err, loc] = await to(Assets.find({ "_id": { $in: payload.assets } },{"location": 1}));
            
            await loc.forEach(async data=>{
                if(data.location && data.location != null){
                    locations_array.push(data.location);
                }
            });
            ticket.locations = locations_array;
            ticket.save();
        }

        if(payload.ticket_images){
            payload.ticket_images.forEach(async data=>{
                ticket.ticket_images.push(data);
            });
        }
    }
    [err,ticketsList] = await to(Tickets.find({"company":companyId})
                                        .populate('location',['_id','name','address','zip_code'])
                                        .populate('assets')
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'category',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'condition',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'asset_status',
                                                model: 'admin_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'location',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'floor',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'block',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'vendor',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate('comments.commentedBy', ['fullName','email'])
                                        .populate('timeline.messagedBy', ['fullName','email'])
                                        .populate('timeline.status_id', ['_id','name'])
                                        .populate('priority', ['_id', 'name', 'slaTo', 'slaType'])
                                        .populate('assignedTo', ['fullName', 'email'])
                                        .populate('ticket_type', ['_id', 'name'])
                                        .populate('ticket_status', ['_id', 'name','message'])
                                        .populate('serviceProvider', ['_id', 'name', 'email', 'mobile',
                                                        'type', 'serviceCompany', 'address'])
                                        .populate('createdBy', ['fullName', 'email'])
                                        .populate('solvedBy', ['fullName', 'email'])
                                        .sort({"createdAt":-1}));
    if(err) {TE(err.message);}
    
    return (ticketsList)?{data: ticketsList, permissions: obj}:false;
},

companyTickets: async function(companyId, role){
    let err, tickets, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tickets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].tickets;
    };

    [err, tickets] = await to(Tickets.find({"company": companyId})
                                        .populate('location',['_id','name','address','zip_code'])
                                        .populate('assets')
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'category',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'condition',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'asset_status',
                                                model: 'admin_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'location',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'floor',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'block',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate({
                                            path : 'assets',
                                            populate: { 
                                                path:  'vendor',
                                                model: 'user_dropdowns'
                                            }
                                        })
                                        .populate('comments.commentedBy', ['fullName','email'])
                                        .populate('timeline.messagedBy', ['fullName','email'])
                                        .populate('createdBy',['fullName','email'])
                                        .populate('timeline.status_id', ['_id','name'])
                                        .populate('assignedTo',['fullName','email'])
                                        .populate('priority', ['_id', 'name', 'slaTo', 'slaType'])
                                        .populate('ticket_type', ['_id', 'name'])
                                        .populate('ticket_status', ['_id', 'name','message'])
                                        .populate('solvedBy',['fullName','email'])
                                        .populate('serviceProvider',['_id','name','email','mobile',
                                                        'type','serviceCompany','address'])
                                        .sort({"createdAt":-1}));
    if(err) {TE(err.message, true);}

    return tickets?{data: tickets, permissions: obj}:false;
},

filteredCompanyTickets: async function(req,payload, role,userId, userRole){
    let err, tickets, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tickets": 1, "company": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].tickets;
    };

    var options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };

    let extraData = Object.assign({},payload);
    let filterData = payload;
    
    if(payload.hasOwnProperty('assets')){
        extraData.assets = {"$in": filterData.assets}
    }
    
    if(payload.hasOwnProperty('startAt') && payload.hasOwnProperty('endAt')){
        let startDate=new Date(filterData.startAt).toISOString();
        let nextDate=new Date(filterData.endAt)
        let dateValue = nextDate.getDate() + 1;
        nextDate.setDate(dateValue);
        let endDate = nextDate.toISOString()
        extraData.createdAt = {
            "$gte": startDate ,
            "$lte": endDate
        }
        delete extraData['startAt'];
        delete extraData['endAt'];
    }else if(payload.hasOwnProperty('startAt')){

        let startDate = new Date(filterData.startAt).toISOString();
        let nextDate  = new Date(filterData.startAt)
        let dateValue = nextDate.getDate() + 1;
        nextDate.setDate(dateValue);
        let endDate = nextDate.toISOString()
        extraData.createdAt = {
            "$gte": startDate ,
            "$lte": endDate
        }
        delete extraData['startAt'];

    }
    
    if(userRole === "SUPERUSER"){
        extraData = extraData;
    }else{
        let testObj = extraData;

        extraData = {
            $and:[{
                $or:[{
                    createdBy: new mongoose.Types.ObjectId(userId)
                  },{
                    assignedTo: new mongoose.Types.ObjectId(userId)
                  }]
            },testObj]
        }
    }
    console.log(extraData);
    if(!req.query.pagination){
     [err, tickets] = await to(Tickets.find(extraData)
                                .populate('location',['_id','name','address','zip_code'])
                                .populate('assets')
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'category',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'condition',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'asset_status',
                                        model: 'admin_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'location',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'floor',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'block',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'vendor',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate('comments.commentedBy', ['fullName','email'])
                                .populate('timeline.messagedBy', ['fullName','email'])
                                .populate('createdBy',['fullName','email'])
                                .populate('timeline.status_id', ['_id','name'])
                                .populate('assignedTo',['fullName','email'])
                                .populate('priority', ['_id', 'name', 'slaTo', 'slaType'])
                                .populate('ticket_type', ['_id', 'name'])
                                .populate('ticket_status', ['_id', 'name','message'])
                                .populate('solvedBy',['fullName','email'])
                                .populate('serviceProvider',['_id','name','email','mobile',
                                                'type','serviceCompany','address'])
                                .sort({"createdAt":-1}));
                                 if(err) {TE(err.message, true);}
    }else{
        [err, tickets] = await to(Tickets.paginate(Tickets.find(extraData)
                                .populate('location',['_id','name','address','zip_code'])
                                .populate('assets')
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'category',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'condition',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'asset_status',
                                        model: 'admin_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'location',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'floor',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'block',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate({
                                    path : 'assets',
                                    populate: { 
                                        path:  'vendor',
                                        model: 'user_dropdowns'
                                    }
                                })
                                .populate('comments.commentedBy', ['fullName','email'])
                                .populate('timeline.messagedBy', ['fullName','email'])
                                .populate('createdBy',['fullName','email'])
                                .populate('timeline.status_id', ['_id','name'])
                                .populate('assignedTo',['fullName','email'])
                                .populate('priority', ['_id', 'name', 'slaTo', 'slaType'])
                                .populate('ticket_type', ['_id', 'name'])
                                .populate('ticket_status', ['_id', 'name','message'])
                                .populate('solvedBy',['fullName','email'])
                                .populate('serviceProvider',['_id','name','email','mobile',
                                                'type','serviceCompany','address'])
                                .sort({"createdAt":-1}),options));
    if(err) {TE(err.message, true);}
    }

    return tickets?{data: tickets, permissions: obj}:false;
},

getTicketDetails: async function(ticketId, role){
    let err, ticket, roleData, obj, ticketPhotos, commentsData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tickets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].tickets;
    };

    [err, ticket] = await to(Tickets.findById(ticketId)
                                    .populate('locations',['_id','name','address','zip_code'])
                                    .populate('assets')
                                    .populate({
                                        path : 'assets',
                                        populate: { 
                                            path:  'category',
                                            model: 'user_dropdowns'
                                        }
                                    })
                                    .populate({
                                        path : 'assets',
                                        populate: { 
                                            path:  'condition',
                                            model: 'user_dropdowns'
                                        }
                                    })
                                    .populate({
                                        path : 'assets',
                                        populate: { 
                                            path:  'asset_status',
                                            model: 'admin_dropdowns'
                                        }
                                    })
                                    .populate({
                                        path : 'assets',
                                        populate: { 
                                            path:  'location',
                                            model: 'locations'
                                        }
                                    })
                                    .populate({
                                        path : 'assets',
                                        populate: { 
                                            path:  'floor',
                                            model: 'user_dropdowns'
                                        }
                                    })
                                    .populate({
                                        path : 'assets',
                                        populate: { 
                                            path:  'block',
                                            model: 'user_dropdowns'
                                        }
                                    })
                                    .populate({
                                        path : 'assets',
                                        populate: { 
                                            path:  'vendor',
                                            model: 'user_dropdowns'
                                        }
                                    })
                                    .populate({
                                        path: 'timeline.images',
                                        populate: {
                                            path:  '_id',
                                            model: 'ticket_images'
                                        }
                                    })
                                    .populate('timeline.images', ['_id','filename'])
                                    .populate('timeline.messagedBy', ['fullName','email'])
                                    .populate('createdBy',['fullName','email'])
                                    .populate('timeline.status_id', ['_id','name'])
                                    .populate('assignedTo',['fullName','email'])
                                    .populate('priority', ['_id', 'name', 'slaTo', 'slaType'])
                                    .populate('ticket_type', ['_id', 'name'])
                                    .populate('ticket_status', ['_id', 'name','message'])
                                    .populate('solvedBy',['fullName','email'])
                                    .populate('comments.commentedBy', ['fullName','email'])
                                    .populate('serviceProvider',['_id','name','email','mobile',
                                                    'type','serviceCompany','address'])
                                    .sort({"timeline._id":-1}));
    if(err) {TE(err.message, true);}

    [err, ticketPhotos] = await to(TicketImages.find({"ticketId":ticketId, "isComment": false, "status": true},{"filename":1}));
    if(err) {TE(err.message, true);}

    // return ticket?{data: ticket, images:ticketPhotos, permissions: obj}:false;
    commentsData = ticket.comments;
    if(ticket){
        commentsData = ticket.comments ? ticket.comments : [];
    }
    return ticket?{data: ticket, images:ticketPhotos, permissions: obj, comments: commentsData.reverse()}:false;
},

updateTicketDetails: async function(ticketId, userId, payload, role){
    let err, ticket, allTickets, data = {}, updatedTicket, dropdowndata,userData, previousUserData;
    let comments = {}, dropdowns, closedDropdown, priorityData, previousPriorityData;
    let roleData, obj,previousAssetsData, AssetsData;
    let ticketTypeData, previousTicketType;
    let userDetails, emaildata;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tickets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].tickets;
    };

    [err, ticket] = await to(Tickets.findById(ticketId));
    if(err) {TE(err.message, true);}

    [err, dropdowns] = await to(UserDropDown.find({"company":ticket.company,"type": "ticketstatus",
                                                    "name": "Closed-Resolved"}));
    if(err) {TE(err.message, true);}
    closedDropdown = dropdowns[0];

    let example, length;

    if(ticket.timeline){
        length  = ticket.timeline.length;
        example = ticket.timeline[length-1];
    }
    if(err) {TE(err.message, true);}

    if(ticket){
        let test1 = ticket.ticket_status;
        ticket.status       = payload.status?payload.status:ticket.status;
        ticket.description  = payload.description?payload.description:ticket.description;
        ticket.serviceProvider = payload.serviceProvider?payload.serviceProvider:ticket.serviceProvider;

        [err, userDetails] = await to(CompanyContacts.findById(userId)
                                                .populate('company',{"companyName": 1, "email": 1})
                                                .populate('role',{'roleName': 1}));

        if(payload.ticket_status){
            if(ticket.ticket_status.equals(payload.ticket_status) === false) {
                ticket.ticket_status   = payload.ticket_status?payload.ticket_status:ticket.ticket_status;

                [err, dropdowndata] = await to(UserDropDown.findById(payload.ticket_status));

                if(dropdowndata.name === "Closed-Resolved"){
                    ticket.closedAt = Date.now();
                }

                data = {
                    message    : "Ticket status is updated to "+dropdowndata.name,
                    time       : Date.now(),
                    messagedBy : userId,
                    status_id  : payload.ticket_status
                };
                ticket.timeline.push(data);

                if(ticket.assignedTo || ticket.assignedTo != null){
                    [err, userData] = await to(CompanyContacts.findById(ticket.assignedTo)
                                                                .populate('company',{"companyName": 1, "email": 1})
                                                                .populate('role',{'roleName': 1}));
                }

                let newTicketData;
                [err, newTicketData] = await to(Tickets.findById(ticketId)
                                                        .populate('priority',['name'])
                                                        .populate('ticket_type',['name'])
                                                        .populate('ticket_status',['name']));
                let metadata = {
                    email: userDetails.email,
                    mail_cc: userData ? userData.email : '', //userDetails.company.email,
                    // sgTemplate: "d-bbc63ae900d54fd1b9d03b4e1748cb80",
                    sgTemplate: "d-c64f93326b824f809fdf74c6f9a6485b",
                    emailBody:{
                        subject: ticket.ticketId+" - Ticket Status Update ("+userDetails.company.companyName+")",
                        customer: userDetails.fullName+" ("+userDetails.role.roleName+")",
                        company_name: userDetails.company.companyName,
                        ticket_id: ticket.ticketId,
                        creationText: "Ticket status has been updated. Find the updated ticket details below.",
                        description: "Ticket status is updated to "+dropdowndata.name,
                        priority: newTicketData.priority ? newTicketData.priority.name : "",
                        ticket_type: newTicketData.ticket_type ? newTicketData.ticket_type.name : "",
                        ticket_status: dropdowndata ? dropdowndata.name : ""
                    }
                };
                
                [err, emaildata] = await to(MailService.sgSurveyMailService2(metadata));

                if(closedDropdown != undefined){
                    if(payload.ticket_status == closedDropdown._id){
                        ticket.solvedBy = userId;
                    }
                }
            }
        }

        if(payload.hasOwnProperty("ticket_type") && payload.ticket_type !== ""){
            if(ticket.ticket_type){
                if(ticket.ticket_type.equals(payload.ticket_type) === false) {
                    [err, previousTicketType] = await to(UserDropDown.findById(ticket.ticket_type));

                    ticket.ticket_type   = payload.ticket_type?payload.ticket_type:ticket.ticket_type;

                    [err, ticketTypeData] = await to(UserDropDown.findById(payload.ticket_type));

                    data = {
                        message    : "Ticket Type Changed from "+ previousTicketType.name+ " to " + ticketTypeData.name,
                        time       : Date.now(),
                        messagedBy : userId,
                    };
                    ticket.timeline.push(data);
                }
            }else{
                ticket.ticket_type   = payload.ticket_type?payload.ticket_type:ticket.ticket_type;
                [err, ticketTypeData] = await to(UserDropDown.findById(payload.ticket_type));

                data = {
                    message    : "Added Ticket Type, "+ ticketTypeData.name,
                    time       : Date.now(),
                    messagedBy : userId,
                };
                ticket.timeline.push(data);
            }
        }

        if(payload.hasOwnProperty("priority")){
            if((!ticket.priority && ticket.priority == undefined) && payload.priority){
                ticket.priority   = payload.priority?payload.priority:ticket.priority;
                
                [err, priorityData] = await to(TicketPriorities.findById(payload.priority));

                data = {
                    message    : `${priorityData.name} priority is given to this ticket`,
                    time       : Date.now(),
                    messagedBy : userId,
                };
                ticket.timeline.push(data);

            }else if((ticket.priority !== undefined && ticket.priority) && 
                (ticket.priority.equals(payload.priority) === false)) {

                [err, previousPriorityData] = await to(TicketPriorities.findById( ticket.priority));

                ticket.priority   = payload.priority?payload.priority:ticket.priority;
                
                [err, priorityData] = await to(TicketPriorities.findById(payload.priority));

                data = {
                    message    : "Priority Changed from "+ previousPriorityData.name+ " to " + priorityData.name,
                    time       : Date.now(),
                    messagedBy : userId,
                };
                ticket.timeline.push(data);
            }
        }

        function customizer(objValue, othValue) {
            if (objValue === othValue) {
                return true;
            }
        }

        if(payload.hasOwnProperty("assets")){

            function messageConverter(assetArray) {
                let assetNames='';
                _.map(assetArray,(key,index) => {
                    if(index === 0){
                        return assetNames += key.asset_name
                    }else if(index === assetArray.length -1){
                        return assetNames += ", " + key.asset_name + ". "
                    }else{
                        return assetNames += ", " + key.asset_name 
                    }
                })
                return assetNames
            }

            if(_.isEqualWith(JSON.stringify(payload.assets),JSON.stringify(ticket.assets),customizer) === false) {
                
                if(payload.assets.length > ticket.assets.length){

                    [err, previousAssetsData] = await to(Assets.find( { "_id" : { "$in" :  ticket.assets}}));
                    [err, AssetsData] = await to(Assets.find( { "_id" : { "$in" :  payload.assets}}));
                
                    data = {
                        message    : "Previous Assets : " + messageConverter(previousAssetsData) + " After Adding New Assets : " + messageConverter(AssetsData),
                        time       : Date.now(),
                        messagedBy : userId,
                    };
                    ticket.timeline.push(data);

                }else if(payload.assets.length < ticket.assets.length){

                    [err, previousAssetsData] = await to(Assets.find( { "_id" : { "$in" :  ticket.assets}}));
                    [err, AssetsData] = await to(Assets.find( { "_id" : { "$in" :  payload.assets}}));

                    data = {
                        message    : "Previous Assets : " + messageConverter(previousAssetsData) + " After Removing Assets : " + messageConverter(AssetsData),
                        time       : Date.now(),
                        messagedBy : userId,
                    };
                    ticket.timeline.push(data);
                }

                ticket.assets   = payload.assets?payload.assets:ticket.assets;

                let loc, locations_array = [];

                if(payload.assets && payload.assets.length > 0){
                    
                    [err, loc] = await to(Assets.find({ "_id": { $in: payload.assets } },{"location": 1}));
                    
                    await loc.forEach(async data=>{
                        if(data.location && data.location != null){
                            locations_array.push(data.location);
                        }
                    });
                    ticket.locations = locations_array;
                }
            }
        }
        
        if(payload.hasOwnProperty("assignedTo")){
            if(typeof ticket.assignedTo === 'undefined'){
                ticket.assignedTo   = payload.assignedTo?payload.assignedTo:ticket.assignedTo;
                [err, userData] = await to(CompanyContacts.findById(payload.assignedTo)
                                                            .populate('company',{"companyName": 1, "email": 1})
                                                            .populate('role',{'roleName': 1}));
                data = {
                        message    : "Ticket Assigned to "+userData.fullName,
                        time       : Date.now(),
                        messagedBy : userId,
                    };
                ticket.timeline.push(data);

                let newTicketData;
                [err, newTicketData] = await to(Tickets.findById(ticketId)
                                                        .populate('priority',['name'])
                                                        .populate('ticket_type',['name'])
                                                        .populate('ticket_status',['name']));
                let metadata={
                    email: userData.email,
                    mail_cc: userDetails.company.email,
                    // sgTemplate: "d-bbc63ae900d54fd1b9d03b4e1748cb80",
                    sgTemplate: "d-c64f93326b824f809fdf74c6f9a6485b",
                    emailBody:{
                        subject: ticket.ticketId+" - Ticket Assignment ("+userDetails.company.companyName+")",
                        customer: userDetails.fullName+"("+userDetails.role.roleName+")",
                        company_name: userDetails.company.companyName,
                        ticket_id: ticket.ticketId,
                        creationText: "Following ticket is assigned to you. Find the ticket details below.",
                        assignment: userData.fullName+" ("+userData.role.roleName+")",
                        description: ticket.description,
                        priority: newTicketData.priority ? newTicketData.priority.name : "",
                        ticket_type: newTicketData.ticket_type ? newTicketData.ticket_type.name : "",
                        ticket_status: newTicketData.ticket_status ? newTicketData.ticket_status.name : "",
                        assignedUser: userData.fullName
                    }
                };
                
                [err, emaildata] = await to(MailService.sgSurveyMailService2(metadata));

            }else if(ticket.assignedTo.equals(payload.assignedTo) === false) {
                [err, previousUserData] = await to(CompanyContacts.findById(ticket.assignedTo)
                                                                        .populate('company',{"companyName": 1, "email": 1})
                                                                        .populate('role',{'roleName': 1}));

                ticket.assignedTo   = payload.assignedTo?payload.assignedTo:ticket.assignedTo;
                [err, userData] = await to(CompanyContacts.findById(payload.assignedTo)
                                                            .populate('company',{"companyName": 1, "email": 1})
                                                            .populate('role',{'roleName': 1}));

                data = {
                    message    : "Ticket Reassigned from "+ previousUserData.fullName  + " to " + userData.fullName,
                    time       : Date.now(),
                    messagedBy : userId,
                };
                ticket.timeline.push(data);

                let newTicketData;
                [err, newTicketData] = await to(Tickets.findById(ticketId)
                                                        .populate('priority',['name'])
                                                        .populate('ticket_type',['name'])
                                                        .populate('ticket_status',['name']));
                let metadata={
                    email: userData.email,
                    mail_cc: [previousUserData.email],
                    // sgTemplate: "d-bbc63ae900d54fd1b9d03b4e1748cb80",
                    sgTemplate: "d-c64f93326b824f809fdf74c6f9a6485b",
                    emailBody:{
                        subject: ticket.ticketId+" - Ticket Assignment ("+userDetails.company.companyName+")",
                        creationText: "Following ticket is assigned to you. Find the ticket details below.",
                        customer: userDetails.fullName+" ("+userDetails.role.roleName+")",
                        company_name: userDetails.company.companyName,
                        ticket_id: ticket.ticketId,
                        description: ticket.description,
                        // assignment: "Ticket Reassigned from "+previousUserData.fullName+" ("+previousUserData.role.roleName+") "+
                        //                 " to "+userData.fullName+" ("+userData.role.roleName+")",
                        assignment: userData.fullName+" ("+userData.role.roleName+")",
                        priority: newTicketData.priority ? newTicketData.priority.name : "",
                        ticket_type: newTicketData.ticket_type ? newTicketData.ticket_type.name : "",
                        ticket_status: newTicketData.ticket_status ? newTicketData.ticket_status.name : "",
                        assignedUser: userData.fullName
                    }
                };
                [err, emaildata] = await to(MailService.sgSurveyMailService2(metadata));
            }
        }

        if(payload.hasOwnProperty("comment")){
            if(payload.hasOwnProperty("comment_images")){
                let timelineLength = ticket.timeline.length;
                
                comments = {
                    timelineStatus: payload.ticket_status?payload.ticket_status:ticket.ticket_status,
                    comment : payload.comment,
                    commentedTime : Date.now(),
                    timelineId : ticket.timeline[timelineLength-1]._id,
                    commentedBy: userId,
                    comment_images :  payload.comment_images.map(data => data)
                
                };
                ticket.comments.push(comments);
            }else{
                let timelineLength = ticket.timeline.length;
                comments = {
                    timelineStatus: payload.ticket_status?payload.ticket_status:ticket.ticket_status,
                    comment : payload.comment,
                    commentedTime : Date.now(),
                    timelineId : ticket.timeline[timelineLength-1]._id,
                    commentedBy: userId
                };
                ticket.comments.push(comments);
            }
        }
        
        [err,updatedTicket]= await to(ticket.save());
        if(err) {TE(err.message, true);}

        [err,allTickets] = await to(Tickets.find({"company":ticket.company})
                                            .populate('location',['_id','name','address','zip_code'])
                                            .populate('assets')
                                            .populate({
                                                path : 'assets',
                                                populate: { 
                                                    path:  'category',
                                                    model: 'user_dropdowns'
                                                }
                                            })
                                            .populate({
                                                path : 'assets',
                                                populate: { 
                                                    path:  'condition',
                                                    model: 'user_dropdowns'
                                                }
                                            })
                                            .populate({
                                                path : 'assets',
                                                populate: { 
                                                    path:  'asset_status',
                                                    model: 'admin_dropdowns'
                                                }
                                            })
                                            .populate({
                                                path : 'assets',
                                                populate: { 
                                                    path:  'location',
                                                    model: 'user_dropdowns'
                                                }
                                            })
                                            .populate({
                                                path : 'assets',
                                                populate: { 
                                                    path:  'floor',
                                                    model: 'user_dropdowns'
                                                }
                                            })
                                            .populate({
                                                path : 'assets',
                                                populate: { 
                                                    path:  'block',
                                                    model: 'user_dropdowns'
                                                }
                                            })
                                            .populate({
                                                path : 'assets',
                                                populate: {
                                                    path:  'vendor',
                                                    model: 'user_dropdowns'
                                                }
                                            })
                                            .populate({
                                                path: 'timeline.images',
                                                populate: {
                                                    path:  '_id',
                                                    model: 'ticket_images'
                                                }
                                            })
                                            .populate('comments.commentedBy', ['fullName','email'])
                                            .populate('timeline.messagedBy', ['fullName','email'])
                                            .populate('timeline.status_id', ['_id','name'])
                                            .populate('createdBy',['fullName','email'])
                                            .populate('assignedTo',['fullName','email'])
                                            .populate('priority', ['_id', 'name', 'slaTo', 'slaType'])
                                            .populate('ticket_type', ['_id', 'name'])
                                            .populate('ticket_status', ['_id', 'name','message'])
                                            .populate('serviceProvider',['_id','name','email','mobile',
                                                            'type','serviceCompany','address'])
                                            .populate('solvedBy',['fullName','email'])              
                                            .sort({"createdAt":-1}));
        if(err) {TE(err.message, true);}

        return allTickets?{data: allTickets, permissions: obj}:false;
    }
},

displayTicketImages: async function(companyId, ticketId){
    let err, data;

    [err, data] = await to(Tickets.find({"company":companyId, "_id":ticketId},{"ticket_images":1}));
    if(err) {TE(err.message);}
    return data?data:false;
},

deleteImage: async function(ticketId, imageId){
    let err, images, imageData, allImages;

    [err, imageData] = await to(Tickets.update({"_id":ticketId}, 
                            {$pull: {"ticket_images": {"_id": imageId}}}, 
                            {multi: true}));
    if(err) TE(err.message);
    
    [err, images] = await to(Tickets.findById(ticketId));
    if(err) TE(err.message);

    allImages = images.ticket_images;
    return (images)? allImages:false;
},

getTicketImagesByTicketId: async function(ticketId){
    let data, err;

    [err, data] = await to(TicketImages.find({"ticketId":ticketId, "isComment": false, "status": true}));
    if(err) {TE(err.message);}

    return data?data:false;
},

deleteTicketImagesById: async function(ticketId, imageId, userId){
    let data, err, images;
    let timelineObj, ticket;
    // [err, data] = await to(TicketImages.find({"_id":imageId, "ticketId":ticketId}));
    [err, data] = await to(TicketImages.updateOne({"_id":imageId, "ticketId":ticketId},
                                                  {$set: {status: false}}));
    // if(data){
    //     data.status = false;
    //     data.save();
    // }
    if(err) {TE("Image deletion is unsuccessful. Try again!");}
    
    [err, ticket] = await to(Tickets.findById(ticketId));
    if(err) {TE(err, true);}

    if(ticket){
        timelineObj = {
            message    : "Following image has been deleted",
            time       : Date.now(),
            messagedBy : userId,
            images     : [imageId]
        }
        ticket.timeline.push(timelineObj);
        ticket.save();
    }

    [err, images] = await to(TicketImages.find({"ticketId":ticketId, "status": true}));
    if(err) {TE("No device images available!");}
    
    return (images)?images:false;
},

getAllTicketComments: async function(tid, req){
    let err, ticketData;

    var options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };

    [err, ticketData] = await to(Tickets.paginate(Tickets.find({"_id": tid})
                                .populate('comments.commentedBy', ['fullName','email'])
                                .sort({"comments.createdAt":-1}),options));
    if(err) {TE(err.message, true);}
    
    return (ticketData && ticketData.docs[0]) ? ticketData.docs[0].comments.reverse() : false;
}
}