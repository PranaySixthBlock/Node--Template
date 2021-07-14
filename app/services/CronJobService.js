var {to,TE} = require('../middlewares/utilservices');
var Tickets = require('../models/Tickets');
var Assets  = require('../models/Assets');
var moment  = require('moment');
var XLSX = require('xlsx');
var fs = require('fs');
var Company = require('../models/Company');
var randomize = require('randomatic');
var UserDropDown = require('../models/UserDropDown');
var AssetService = require('../services/AssetService');

module.exports = {

companyMaintenanceTicketsJob: async function(companyId){
    let err, data, cronActivity;

    [err, data] = await to(Company.find({"_id": companyId, "status": 1},{"status": 1}));
    if(err) {TE(err.message, true);}
    
    if((data) && (data.length > 0)){
        await this.cronJobForMaintenanceAssets(data[0]._id);
    }
},

maintenanceTicketsJob: async function(){
    let err, data, cronActivity;

    [err, data] = await to(Company.find({},{"status": 1}));
    if(err) {TE(err.message, true);}
    
    if(data){
        await data.forEach(async company =>{
            await this.cronJobForMaintenanceAssets(company._id);
        });
    }
},

cronJobForMaintenanceAssets: async function(company){
    let err, assets;
    let startDate, endDate, datesArray;
    let comparisonValues;
    let days = [], dates = [], months = [], years = [];

    startDate = moment(new Date()).format('YYYY-MM-DD');
    startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
    endDate = moment(startDate).add(6, 'days').format('YYYY-MM-DD');

    [err, datesArray] = await to(AssetService.getDateArray(startDate, endDate));

    await datesArray.forEach(date => {
        days.push(moment(date).format('dddd'));
        dates.push(parseInt(moment(date).format('D')));
        months.push(parseInt(moment(date).format('M')));
        years.push(parseInt(moment(date).format('YYYY')));
    });
    
    comparisonValues = days.map(v => v.valueOf());
    days = days.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);

    comparisonValues = dates.map(v => v.valueOf());
    dates = dates.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);

    comparisonValues = months.map(v => v.valueOf());
    months = months.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);

    comparisonValues = years.map(v => v.valueOf());
    years = years.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);

    [err, assets] = await to(Assets.aggregate([
        {
            $match:{
                "company": new mongoose.Types.ObjectId(company),
                "status" : true,
                $or: [
                    {
                        "predictive_maintenance.timePeriod": 'Day'
                    },{
                        "predictive_maintenance.day":{
                            $in: days
                        },
                        "predictive_maintenance.timePeriod": 'Week'
                    },{
                        "predictive_maintenance.date":{
                            $in: dates
                        },
                        "predictive_maintenance.day"  : null,
                        "predictive_maintenance.year" : null,
                        "predictive_maintenance.timePeriod": 'Month'
                    },{
                        $and:[
                            {
                                "predictive_maintenance.date":{
                                    $in: dates
                                },
                                "predictive_maintenance.timePeriod": 'Year'
                            },{
                                "predictive_maintenance.month":{
                                    $in: months
                                },
                                "predictive_maintenance.timePeriod": 'Year'
                            }   
                        ]
                    }
                ]
            }
        },{
            $project:{
                "_id": 1
            }
        }
    ]));
    if(err) {TE(err.message, true);}

    await assets.forEach(async asset=>{
        let assetID = [asset._id];
        await this.createTicketsJob(company, assetID, endDate);
    });
},

createTicketsJob: async function(companyId, payload, endDate){
    let data, err, ticket, ticketsList, ticketStatusDropdown, ticketTypeDropdown;

    [err, ticketStatusDropdown] = await to(UserDropDown.find({
                                                            "company": companyId,
                                                            "type"   : "ticketstatus",
                                                            "name"   : "New"
                                                        }));
    if(err) {TE(err.message, true);}

    [err, ticketTypeDropdown] = await to(UserDropDown.find({
                                                        "company": companyId,
                                                        "type"   : "tickettype",
                                                        "name"   : "Maintenance"
                                                    }));
    if(err) {TE(err.message, true);}

    [err, ticket] = await to(Tickets.create({
        ticketId    : "TCKT0"+randomize('A0', 6),
        company     : companyId,
        assets      : payload ? payload : [],
        description : "Maintenance Ticket, created on " + moment(new Date()).format('DD-MM-YYYY'),
        ticket_type : ticketTypeDropdown[0] ? ticketTypeDropdown[0]._id : null,
        ticket_status: ticketStatusDropdown[0] ? ticketStatusDropdown[0]._id : null,
        timeline : {
            status_id  : ticketStatusDropdown[0] ? ticketStatusDropdown[0]._id : null,
            message    : "New maintenance ticket is created",
            time       : Date.now()
        },
        maintenance_duedate : endDate,
        maintenanceTicket : 1
    }));
    
    if(err) {TE(err.message, true);}
    else{
        let loc, locations_array = [];
        if(payload && payload.length > 0){
            
            [err, loc] = await to(Assets.find({ "_id": { $in: payload } },{"location": 1}));
            
            await loc.forEach(async data=>{
                if(data.location && data.location != null){
                    locations_array.push(data.location);
                }
            });
            ticket.locations = locations_array;
            ticket.save();
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
    
    return (ticketsList)?{data: ticketsList}:false;
},

getAssetsGridData: async function(payload){
    let err, assets, roleData, obj;
    let startDate, endDate, datesArray;
    let comparisonValues, timePeriod, assetAggregate;
    let days = [], dates = [], months = [], years = [];
   
    let extraData = Object.assign({}, payload);

    if(payload.hasOwnProperty('createdAt')){
        let startDate = new Date(payload.createdAt).toISOString();
        let nextDate  = new Date(payload.createdAt);
        let dateValue = nextDate.getDate() + 1;
        nextDate.setDate(dateValue);
        let endDate = nextDate.toISOString()
        extraData.createdAt = {
            "$gte": startDate ,
            "$lte": endDate
        }
    }

    const match = {}
    
    if(extraData.hasOwnProperty('company')){
        extraData.company = new mongoose.Types.ObjectId(extraData.company);
    }
    if(extraData.hasOwnProperty('asset_status')){
        extraData.asset_status = new mongoose.Types.ObjectId(extraData.asset_status);
    }
    if(extraData.hasOwnProperty('category')){
        extraData.category = new mongoose.Types.ObjectId(extraData.category);
    }
    if(extraData.hasOwnProperty('location')){
        extraData.location = new mongoose.Types.ObjectId(extraData.location);
    }
    if(extraData.hasOwnProperty('condition')){
        extraData.condition = new mongoose.Types.ObjectId(extraData.condition);
    }
    if(extraData.hasOwnProperty('deployedAt')){
        if(payload.deployedAt == "All"){
            extraData.deployedAt = {"$ne":null};
        }else{
            extraData.deployedAt = new mongoose.Types.ObjectId(extraData.deployedAt);
        }
    }

    if(extraData.hasOwnProperty('maintenanceIn')){
        if(payload.maintenanceIn == "This Week"){
            startDate = moment(new Date()).format('YYYY-MM-DD');
            endDate = moment(startDate).add(7, 'days').format('YYYY-MM-DD');
    
            [err, datesArray] = await to(this.getDateArray(startDate, endDate));
    
            await datesArray.forEach(date => {
                days.push(moment(date).format('dddd'));
                dates.push(parseInt(moment(date).format('DD')));
                months.push(parseInt(moment(date).format('M')));
                years.push(parseInt(moment(date).format('YYYY')));
            });
    
            comparisonValues = days.map(v => v.valueOf());
            days = days.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = dates.map(v => v.valueOf());
            dates = dates.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = months.map(v => v.valueOf());
            months = months.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
            
            comparisonValues = years.map(v => v.valueOf());
            years = years.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
        }else if(payload.maintenanceIn == "Next 15 Days"){
            startDate = moment(new Date()).format('YYYY-MM-DD');
            endDate = moment(startDate).add(15, 'days').format('YYYY-MM-DD');
    
            [err, datesArray] = await to(this.getDateArray(startDate, endDate));
    
            await datesArray.forEach(date => {
                days.push(moment(date).format('dddd'));
                dates.push(parseInt(moment(date).format('D')));
                months.push(parseInt(moment(date).format('M')));
                years.push(parseInt(moment(date).format('YYYY')));
            });
    
            comparisonValues = days.map(v => v.valueOf());
            days = days.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = dates.map(v => v.valueOf());
            dates = dates.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = months.map(v => v.valueOf());
            months = months.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = years.map(v => v.valueOf());
            years = years.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
        }else if(payload.maintenanceIn == "This Month"){
            startDate = moment(new Date()).format('YYYY-MM-DD');
            endDate   = moment().endOf('month').format('YYYY-MM-DD');
            
            [err, datesArray] = await to(this.getDateArray(startDate, endDate));
    
            await datesArray.forEach(date => {
                days.push(moment(date).format('dddd'));
                dates.push(parseInt(moment(date).format('D')));
                months.push(parseInt(moment(date).format('M')));
                years.push(parseInt(moment(date).format('YYYY')));
            });
    
            comparisonValues = days.map(v => v.valueOf());
            days = days.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = dates.map(v => v.valueOf());
            dates = dates.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = months.map(v => v.valueOf());
            months = months.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = years.map(v => v.valueOf());
            years = years.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
        }else if(payload.maintenanceIn == "Next Month"){
            startDate = moment().add(1, 'month').startOf('month').format('YYYY-MM-DD');
            endDate   = moment().add(1, 'month').endOf('month').format('YYYY-MM-DD');
    
            [err, datesArray] = await to(this.getDateArray(startDate, endDate));
    
            await datesArray.forEach(date => {
                days.push(moment(date).format('dddd'));
                dates.push(parseInt(moment(date).format('D')));
                months.push(parseInt(moment(date).format('M')));
                years.push(parseInt(moment(date).format('YYYY')));
            });
    
            comparisonValues = days.map(v => v.valueOf());
            days = days.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = dates.map(v => v.valueOf());
            dates = dates.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = months.map(v => v.valueOf());
            months = months.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = years.map(v => v.valueOf());
            years = years.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
        }else if(payload.maintenanceIn == "Next 6 Months"){
            startDate = moment(new Date()).format('YYYY-MM-DD');
            endDate   = moment(startDate).add(6, 'month').format('YYYY-MM-DD');
    
            [err, datesArray] = await to(this.getDateArray(startDate, endDate));
    
            await datesArray.forEach(date => {
                days.push(moment(date).format('dddd'));
                dates.push(parseInt(moment(date).format('D')));
                months.push(parseInt(moment(date).format('M')));
                years.push(parseInt(moment(date).format('YYYY')));
            });
    
            comparisonValues = days.map(v => v.valueOf());
            days = days.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = dates.map(v => v.valueOf());
            dates = dates.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = months.map(v => v.valueOf());
            months = months.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = years.map(v => v.valueOf());
            years = years.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
            
        }else if(payload.maintenanceIn == "Next 10 Days"){
            startDate = moment(new Date()).format('YYYY-MM-DD');
            endDate = moment(startDate).add(10, 'days').format('YYYY-MM-DD');
    
            [err, datesArray] = await to(this.getDateArray(startDate, endDate));
    
            await datesArray.forEach(date => {
                days.push(moment(date).format('dddd'));
                dates.push(parseInt(moment(date).format('D')));
                months.push(parseInt(moment(date).format('M')));
                years.push(parseInt(moment(date).format('YYYY')));
            });
    
            comparisonValues = days.map(v => v.valueOf());
            days = days.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = dates.map(v => v.valueOf());
            dates = dates.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = months.map(v => v.valueOf());
            months = months.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
    
            comparisonValues = years.map(v => v.valueOf());
            years = years.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
        }

        delete extraData['maintenanceIn'];
        [err, assetAggregate] = await to(Assets.aggregate([
                            {
                                $match :extraData
                            },{
                                $match:{
                                    $or: [
                                        {
                                            "predictive_maintenance.timePeriod": 'Day'
                                        },{
                                            "predictive_maintenance.day": {
                                                $in: days
                                            },
                                            "predictive_maintenance.timePeriod": 'Week'
                                        },{
                                            "predictive_maintenance.date": {
                                                $in: dates
                                            },
                                            "predictive_maintenance.day"  : null,
                                            "predictive_maintenance.year" : null,
                                            "predictive_maintenance.timePeriod": 'Month'
                                        },{
                                            $and:[
                                                {
                                                    "predictive_maintenance.date": {
                                                        $in: dates
                                                    },
                                                    "predictive_maintenance.timePeriod": 'Year'
                                                },{
                                                    "predictive_maintenance.month": {
                                                        $in: months
                                                    },
                                                    "predictive_maintenance.timePeriod": 'Year'
                                                }   
                                            ]
                                        }
                                    ]
                                }
                            },{
                                $lookup: {
                                    from: "tickets",
                                    localField: "_id",
                                    foreignField: "assets",
                                    as: "ticket_assets"
                                }
                            },{
                                $lookup:{
                                    from:"locations",
                                    localField:"location",
                                    foreignField:"_id",
                                    as:"locationData"
                                }
                            },{
                                $unwind:{'path': '$locationData', 'preserveNullAndEmptyArrays': true}
                            },{
                                $lookup:{
                                    from:"user_dropdowns",
                                    localField:"category",
                                    foreignField:"_id",
                                    as:"categoryData"
                                }
                            },{
                                $unwind:{'path': '$categoryData', 'preserveNullAndEmptyArrays': true}
                            },{
                                $lookup:{
                                        from:"admin_dropdowns",
                                        localField:"asset_status",
                                        foreignField:"_id",
                                        as:"assetStatusData"
                                }
                            },{
                                $unwind:{'path': '$assetStatusData', 'preserveNullAndEmptyArrays': true }
                            },{
                                $lookup:{
                                        from:"user_dropdowns",
                                        localField:"condition",
                                        foreignField:"_id",
                                        as:"assetCondition"
                                }
                            },{
                                $unwind:{'path': '$assetCondition', 'preserveNullAndEmptyArrays': true}
                            },{
                                $lookup:{
                                    from:"stores",
                                    localField:"deployedAt",
                                    foreignField:"_id",
                                    as:"deployedStore"
                                }
                            },{
                                $unwind:{ 'path': '$deployedStore', 'preserveNullAndEmptyArrays': true }
                            },{
                                $lookup:{
                                    from:"company_employees",
                                    localField:"assignedObj.allottedTo",
                                    foreignField:"_id",
                                    as:"assignedEmployee"
                                }
                            },{
                                $unwind:{'path': '$assignedEmployee', 'preserveNullAndEmptyArrays': true }
                            },{
                                $lookup:{
                                    from:"locations",
                                    localField:"using_location",
                                    foreignField:"_id",
                                    as:"assetUsingLocation"
                                }
                            },{
                                $sort:{"createdAt": -1}
                            },{
                                $project:{
                                    "_id":1, "Asset Name":"$asset_name","Asset Code":"$asset_code",
                                    "Location": "$locationData.name",
                                    "Asset Type" : "$categoryData.name",
                                    "Status" : "$assetStatusData.name",
                                    "Tickets": {"$size": "$ticket_assets"},
                                    "Store Name": "$deployedStore.store_name",
                                    "Assigned To": "$assignedEmployee.employee_name",
                                    "Asset Condition": "$assetCondition.name",
                                    "Purchased from":"$purchasedFrom", "Warranty Due Date":"$warrantyDue",
                                    "Life Time of Asset":"$lifeTime", "Date of Purchase":"$purchaseDate",
                                    "Price":"$asset_price"
                                }
                            }])
                        );
                            
                        return assetAggregate?assetAggregate:false;
    }else{
        [err, assetAggregate] = await to(Assets.aggregate([
            {
                $match :extraData
            },{
                $lookup: {
                    from: "tickets",
                    localField: "_id",
                    foreignField: "assets",
                    as: "ticket_assets"
                }
            },{
                $lookup:{
                    from:"locations",
                    localField:"location",
                    foreignField:"_id",
                    as:"locationData"
                }
            },{
                $unwind:{'path': '$locationData', 'preserveNullAndEmptyArrays': true}
            },{
                $lookup:{
                    from:"user_dropdowns",
                    localField:"category",
                    foreignField:"_id",
                    as:"categoryData"
                }
            },{
                $unwind:{'path': '$categoryData', 'preserveNullAndEmptyArrays': true}
            },{
                $lookup:{
                        from:"admin_dropdowns",
                        localField:"asset_status",
                        foreignField:"_id",
                        as:"assetStatusData"
                }
            },{
                $unwind:{'path': '$assetStatusData', 'preserveNullAndEmptyArrays': true }
            },{
                $lookup:{
                        from:"user_dropdowns",
                        localField:"condition",
                        foreignField:"_id",
                        as:"assetCondition"
                }
            },{
                $unwind:{'path': '$assetCondition', 'preserveNullAndEmptyArrays': true}
            },{
                $lookup:{
                    from:"stores",
                    localField:"deployedAt",
                    foreignField:"_id",
                    as:"deployedStore"
                }
            },{
                $unwind:{ 'path': '$deployedStore', 'preserveNullAndEmptyArrays': true }
            },{
                $lookup:{
                    from:"company_employees",
                    localField:"assignedObj.allottedTo",
                    foreignField:"_id",
                    as:"assignedEmployee"
                }
            },{
                $unwind:{'path': '$assignedEmployee', 'preserveNullAndEmptyArrays': true }
            },{
                $lookup:{
                    from:"locations",
                    localField:"using_location",
                    foreignField:"_id",
                    as:"assetUsingLocation"
                }
            },{
                $sort:{"createdAt": -1}
            },{
                $project:{
                    "_id":1, "Asset Name":"$asset_name","Asset Code":"$asset_code",
                    "Location": "$locationData.name",
                    "Asset Type" : "$categoryData.name",
                    "Status" : "$assetStatusData.name",
                    "Tickets": {"$size": "$ticket_assets"},
                    "Store Name": "$deployedStore.store_name",
                    "Assigned To": "$assignedEmployee.employee_name",
                    "Asset Condition": "$assetCondition.name",
                    "Purchased from":"$purchasedFrom", "Warranty Due Date":"$warrantyDue",
                     "Life Time of Asset":"$lifeTime", "Date of Purchase":"$purchaseDate", "Price":"$asset_price"
                       
                }
            }])
        );
            
        return assetAggregate?assetAggregate:false;
    }
},

exportAssetsDataToExcel: async function(payload){
    let err, groupWiseData;
    var columns=payload.columns, ExportData=[];
    delete payload["columns"];

    [err, groupWiseData] = await to(this.getAssetsGridData(payload));
    if(err) {TE(err, true);}

    groupWiseData.map(val=>{
        const data = {}
        Object.keys(val).map(key=>{
            columns.map(col=>{
                if(key==col){
                    data[col] = val[col];
                }
            })
        })
        ExportData.push(data);
    })

    if(ExportData){
        let name = "assetsData"+randomize('0', 9);
        var newWB = XLSX.utils.book_new();
        var newWS = XLSX.utils.json_to_sheet(ExportData);
        XLSX.utils.book_append_sheet(newWB, newWS,"AssetsDataValues");
        var dir = './public/exports';

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        [err,excelWB] = await to(this.writeFileQ(newWB, "./public/exports/"+name+".xlsx"));
        if(err) TE(err, true);

        return ({file:name+".xlsx"});
    }
},

exportTicketsDataToExcel: async function(payload, userId, userRole){
    let err, groupWiseData, excelWB;
    var columns=payload.columns, ExportData=[];
    delete payload["columns"];

    [err, groupWiseData] = await to(this.getUserBasedTicketsGridData(payload, userId, userRole));
    if(err) {TE(err, true);}

    if(groupWiseData!=''){
        groupWiseData.map(val=>{
            const data = {}
            Object.keys(val).map(key=>{
                columns.map(col=>{
                    if(key==col){
                        data[col] = val[col];
                    }
                })
            })
            ExportData.push(data);
        })
    }
    
    if(ExportData){
        let name = "TicketsData"+randomize('0', 5);
        var newWB = XLSX.utils.book_new();
        var newWS = XLSX.utils.json_to_sheet(ExportData);
        XLSX.utils.book_append_sheet(newWB, newWS,"TicketsDataValues");
        var dir = './public/exports';

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        [err, excelWB] = await to(this.writeFileQ(newWB, "./public/exports/"+name+".xlsx"));
        if(err) TE(err, true);

        return ({file:name+".xlsx"});
    }
},

writeFileQ: function(workbook, filename) { 
    return new Promise((resolve, reject) => {
        XLSX.writeFileAsync(filename, workbook, (error, result) => {
          (error)? reject(error) : resolve(result);
        });
    });
},

getDateArray: async function(start, end){
    let arr, dt;

    dt  = new Date(start);
    arr = new Array();
    end = new Date(end);

    while (dt <= end) {
        arr.push(moment(dt).format('YYYY-MM-DD'));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
},

getUserBasedTicketsGridData: async function(payload, userId, userRole){
    let err, tickets;

    let extraData = Object.assign({},payload);
    let filterData = payload;
    
    if(payload.hasOwnProperty('assets')){
        extraData.assets = {"$in": [new mongoose.Types.ObjectId(filterData.assets)]}
    }
    
    if(payload.hasOwnProperty("company")){
        extraData.company = new mongoose.Types.ObjectId(payload.company)
    }
    if(payload.hasOwnProperty("priority")){
        extraData.priority = new mongoose.Types.ObjectId(payload.priority)
    }
    if(payload.hasOwnProperty("locations")){
        extraData.locations = new mongoose.Types.ObjectId(payload.locations)
    }
    if(payload.hasOwnProperty("ticket_type")){
        extraData.ticket_type = new mongoose.Types.ObjectId(payload.ticket_type)
    }
    if(payload.hasOwnProperty("assignedTo")){
        extraData.assignedTo = new mongoose.Types.ObjectId(payload.assignedTo)
    }
    if(payload.hasOwnProperty("ticket_status")){
        extraData.ticket_status = new mongoose.Types.ObjectId(payload.ticket_status)
    }

    if(payload.hasOwnProperty('startAt') && payload.hasOwnProperty('endAt')){
        let startDate=new Date(filterData.startAt).toISOString();
        let nextDate=new Date(filterData.endAt)
        let dateValue = nextDate.getDate() + 1;
        nextDate.setDate(dateValue);
        let endDate =nextDate.toISOString();

        extraData.createdAt = {
            "$gte": new Date(startDate) ,
            "$lte": new Date(endDate)
        }

        delete extraData['startAt'];
        delete extraData['endAt'];

    }else if(payload.hasOwnProperty('startAt')){

        let startDate = new Date(filterData.startAt).toISOString();
        let nextDate  = new Date(filterData.startAt)
        let dateValue = nextDate.getDate() + 1;
        nextDate.setDate(dateValue);
        let endDate = nextDate.toISOString();

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
    [err, tickets] = await to(Tickets.aggregate([
        {
            $match: extraData
        },{
            $lookup: {
                localField: "assets",
                from: "assets",
                foreignField: "_id",
                as: "assets"
            },
            
        },{
            $addFields: {
                "AssetsValues": {
                  $reduce: {
                    input: "$assets.asset_name",
                    initialValue: "",
                    in: {
                      "$cond": {
                        if: {
                          "$eq": [
                            {
                              "$indexOfArray": [
                                "$assets.asset_name",
                                "$$this"
                              ]
                            },
                            0
                          ]
                        },
                        then: {
                          "$concat": [
                            "$$value",
                            "$$this"
                          ]
                        },
                        else: {
                          "$concat": [
                            "$$value",
                            ",",
                            "$$this"
                          ]
                        }
                      }
                    }
                  }
                }
              }
        },{
            $lookup: {
                localField: "ticket_status",
                from: "user_dropdowns",
                foreignField: "_id",
                as: "ticket_status"
            }
        },{
            $unwind: { 'path': "$ticket_status", 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "priority",
                from: "ticket_priorites",
                foreignField: "_id",
                as: "priority"
            }
        },{
            $unwind:  { 'path': "$priority", 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "createdBy",
                from: "company_contacts",
                foreignField: "_id",
                as: "createdBy"
            }
        },{
            $unwind: { 'path': "$createdBy", 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "ticket_type",
                from: "user_dropdowns",
                foreignField: "_id",
                as: "ticket_type"
            }
        },{
            $unwind: { 'path': "$ticket_type", 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "assignedTo",
                from: "company_contacts",
                foreignField: "_id",
                as: "assignedTo"
            }
        },{
            $unwind: { 'path': '$assignedTo', 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "solvedBy",
                from: "company_contacts",
                foreignField: "_id",
                as: "solvedBy"
            }
        },{
            $unwind: { 'path': '$solvedBy', 'preserveNullAndEmptyArrays': true }
        },{
            $project: {
                "_id": 1, "ticketId": 1, "company": 1, "Ticket Id":"$ticketId",
                "Asset":"$AssetsValues","Issue": "$description",
                "Ticket Status": {"$ifNull": ["$ticket_status.name", null]},
                "Priority": {"$ifNull": ["$priority.name", null]},
                "Created By": {"$ifNull": ["$createdBy.fullName", null]},
                "Ticket Type": {"$ifNull": ["$ticket_type.name", null]},
                "Assignee": {"$ifNull": ["$assignedTo.fullName", null]},
                "Created On": "$createdAt", "Closed On": "$closedAt",
                "Closed By": {"$ifNull": ["$solvedBy.fullName", null]}
            }
        }
    ]));
    if(err) {TE(err.message, true);}
    
    return tickets?tickets:false;
},

exportAssignedTicketsDataToExcel: async function(payload, userId, assignType){
    let err, groupWiseData, excelWB;
    var columns=payload.columns, ExportData=[];
    delete payload["columns"];

    [err, groupWiseData] = await to(this.getAssignedTypeTicketsGridData(payload, userId, assignType));
    if(err) {TE(err, true);}

    if(groupWiseData!=''){
        groupWiseData.map(val=>{
            const data = {}
            Object.keys(val).map(key=>{
                columns.map(col=>{
                    if(key==col){
                        data[col] = val[col];
                    }
                })
            })
            ExportData.push(data);
        })
    }
    
    if(ExportData){
        let name = "TicketsData"+randomize('0', 5);
        var newWB = XLSX.utils.book_new();
        var newWS = XLSX.utils.json_to_sheet(ExportData);
        XLSX.utils.book_append_sheet(newWB, newWS,"TicketsDataValues");
        var dir = './public/exports';

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        [err, excelWB] = await to(this.writeFileQ(newWB, "./public/exports/"+name+".xlsx"));
        if(err) TE(err, true);

        return ({file:name+".xlsx"});
    }
},

getAssignedTypeTicketsGridData: async function(payload, userId, assignType){
    let err, tickets;

    let extraData = Object.assign({},payload);
    let filterData = payload;
    
    if(payload.hasOwnProperty('assets')){
        extraData.assets = {"$in": [new mongoose.Types.ObjectId(filterData.assets)]}
    }
    
    if(payload.hasOwnProperty("company")){
        extraData.company = new mongoose.Types.ObjectId(payload.company)
    }
    if(payload.hasOwnProperty("priority")){
        extraData.priority = new mongoose.Types.ObjectId(payload.priority)
    }
    if(payload.hasOwnProperty("locations")){
        extraData.locations = new mongoose.Types.ObjectId(payload.locations)
    }
    if(payload.hasOwnProperty("ticket_type")){
        extraData.ticket_type = new mongoose.Types.ObjectId(payload.ticket_type)
    }
    if(payload.hasOwnProperty("assignedTo")){
        extraData.assignedTo = new mongoose.Types.ObjectId(payload.assignedTo)
    }
    if(payload.hasOwnProperty("ticket_status")){
        extraData.ticket_status = new mongoose.Types.ObjectId(payload.ticket_status)
    }

    if(payload.hasOwnProperty('startAt') && payload.hasOwnProperty('endAt')){
        let startDate=new Date(filterData.startAt).toISOString();
        let nextDate=new Date(filterData.endAt)
        let dateValue = nextDate.getDate() + 1;
        nextDate.setDate(dateValue);
        let endDate =nextDate.toISOString();

        extraData.createdAt = {
            "$gte": new Date(startDate) ,
            "$lte": new Date(endDate)
        }

        delete extraData['startAt'];
        delete extraData['endAt'];

    }else if(payload.hasOwnProperty('startAt')){

        let startDate = new Date(filterData.startAt).toISOString();
        let nextDate  = new Date(filterData.startAt)
        let dateValue = nextDate.getDate() + 1;
        nextDate.setDate(dateValue);
        let endDate = nextDate.toISOString();

        extraData.createdAt = {
            "$gte": startDate ,
            "$lte": endDate
        }
        delete extraData['startAt'];

    }

    if(assignType === "createdby"){
        extraData['createdBy'] = new mongoose.Types.ObjectId(userId);
    }else if(assignType === "assignedto"){
        extraData['assignedTo'] = new mongoose.Types.ObjectId(userId);
    }
    [err, tickets] = await to(Tickets.aggregate([
        {
            $match: extraData
        },{
            $lookup: {
                localField: "assets",
                from: "assets",
                foreignField: "_id",
                as: "assets"
            },
        },{
            $addFields: {
                "AssetsValues": {
                  $reduce: {
                    input: "$assets.asset_name",
                    initialValue: "",
                    in: {
                      "$cond": {
                        if: {
                          "$eq": [
                            {
                              "$indexOfArray": [
                                "$assets.asset_name",
                                "$$this"
                              ]
                            },
                            0
                          ]
                        },
                        then: {
                          "$concat": [
                            "$$value",
                            "$$this"
                          ]
                        },
                        else: {
                          "$concat": [
                            "$$value",
                            ",",
                            "$$this"
                          ]
                        }
                      }
                    }
                  }
                }
              }
        },{
            $lookup: {
                localField: "ticket_status",
                from: "user_dropdowns",
                foreignField: "_id",
                as: "ticket_status"
            }
        },{
            $unwind: { 'path': "$ticket_status", 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "priority",
                from: "ticket_priorites",
                foreignField: "_id",
                as: "priority"
            }
        },{
            $unwind:  { 'path': "$priority", 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "createdBy",
                from: "company_contacts",
                foreignField: "_id",
                as: "createdBy"
            }
        },{
            $unwind: { 'path': "$createdBy", 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "ticket_type",
                from: "user_dropdowns",
                foreignField: "_id",
                as: "ticket_type"
            }
        },{
            $unwind: { 'path': "$ticket_type", 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "assignedTo",
                from: "company_contacts",
                foreignField: "_id",
                as: "assignedTo"
            }
        },{
            $unwind: { 'path': '$assignedTo', 'preserveNullAndEmptyArrays': true }
        },{
            $lookup: {
                localField: "solvedBy",
                from: "company_contacts",
                foreignField: "_id",
                as: "solvedBy"
            }
        },{
            $unwind: { 'path': '$solvedBy', 'preserveNullAndEmptyArrays': true }
        },{
            $project: {
                "_id": 1, "ticketId": 1, "company": 1, "Ticket Id":"$ticketId",
                "Asset":"$AssetsValues","Issue": "$description",
                "Ticket Status": {"$ifNull": ["$ticket_status.name", null]},
                "Priority": {"$ifNull": ["$priority.name", null]},
                "Created By": {"$ifNull": ["$createdBy.fullName", null]},
                "Ticket Type": {"$ifNull": ["$ticket_type.name", null]},
                "Assignee": {"$ifNull": ["$assignedTo.fullName", null]},
                "Created On": "$createdAt", "Closed On": "$closedAt",
                "Closed By": {"$ifNull": ["$solvedBy.fullName", null]}
            }
        }
    ]));
    if(err) {TE(err.message, true);}
    
    return tickets?tickets:false;
}
}