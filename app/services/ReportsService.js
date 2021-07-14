'use strict'
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
const {to, TE} = require('../middlewares/utilservices');
var Assets = require('../models/Assets');
var Tickets = require('../models/Tickets');
var UserRoles = require('../models/UserRoles');
var moment = require('moment');
var XLSX = require('xlsx');
var fs = require('fs');
var UserDropdowns = require('../models/UserDropDown');
var AssetImages = require('../models/AssetImages');

module.exports = {
companyAssetsPriceReport: async function(req, payload, role){
    let err, assets, roleData, obj;
    let price = 0, assetAggregate;
    
    [err, roleData] = await to(UserRoles.find({"_id": role},{"assetPriceReports": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assetPriceReports;
    };

    let extraData = Object.assign({}, payload);

    var options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };
    
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

    assetAggregate = Assets.aggregate();
    assetAggregate.match(extraData)
                    .lookup({
                        from: "locations",
                        localField: "location",
                        foreignField: "_id",
                        as: "locationData"
                    })
                    .unwind({ 'path': '$locationData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "user_dropdowns",
                        localField: "category",
                        foreignField: "_id",
                        as: "categoryData"
                    })
                    .unwind( { 'path': '$categoryData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "admin_dropdowns",
                        localField: "asset_status",
                        foreignField: "_id",
                        as: "assetStatusData"
                    })
                    .unwind( { 'path': '$assetStatusData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "user_dropdowns",
                        localField: "condition",
                        foreignField: "_id",
                        as: "assetCondition"
                    })
                    .unwind( { 'path': '$assetCondition', 'preserveNullAndEmptyArrays': true })
                    
                    .project({
                        "_id": 1, "asset_price": 1, "assetId": 1, "asset_name": 1,
                        "location": {"$ifNull": ["$locationData.name", null]},
                        "category" : {"$ifNull": ["$categoryData.name", null]},
                        "asset_status" : {"$ifNull": ["$assetStatusData.name", null]},
                        "condition": {"$ifNull": ["$assetCondition.name", null]},
                        "purchasedFrom": 1
                    });
        
    [err, assets] = await to(assetAggregate);
    
    if(assets.length > 0){
        assets.forEach(data => {
            if(data.hasOwnProperty("asset_price")){
                price += data.asset_price;
            }else{
                data["asset_price"] = 0;
            }
        });
    }
    // [err, assets] = await to(Assets.aggregatePaginate(assetAggregate,options));
    
    // assets.docs.forEach((data, i) => {
    //     data['SNo'] = i+1;
    // });

    // assets.docs.sort((a, b) => (a.SNo > b.SNo) ? 1 : -1);
    
    return assets ? {data: assets, total_price: price, permissions: obj} : false;
},

searchAssetByAssetCode: async function(payload, role, company){
    let err, data, obj, roleData, images;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

    [err, data] = await to(Assets.find({
                                $and: [{
                                        $or: [{
                                                "assetId": payload.code
                                            },{
                                                "asset_name": payload.code
                                            },{
                                                "asset_code": payload.code
                                            }]
                                    },{
                                        "company": company
                                    }]
                                })
                                .populate('customform', ['formName'])
                                .populate('category', ['_id','name'])
                                .populate('condition', ['_id','name'])
                                .populate('asset_status', ['_id','name'])
                                .populate('location', ['_id','name','address','zip_code'])
                                .populate('floor', ['_id','name'])
                                .populate('block', ['_id','name'])
                                .populate('assignedObj.allottedTo',['_id','employee_name','employee_email'])
                                .populate('deployedAt', ['_id','store_name','store_email'])
                                .populate('using_location', ['_id','name'])
                                .populate('vendor', ['_id','name','email','mobile','type','serviceCompany','address'])
                                .sort({"createdAt": -1}));
    if(err) {TE(err, true);}

    if(data && (data.length > 0)){
        [err, images] = await to(AssetImages.find({"assetId": data[0]._id, "isDocument": false}));

        return {"data": data, "images": images};
    }else{
        return false;
    }
},

exportAssetCountsReports: async function(payload, role){
    let err, assets, roleData, obj, excelWB;
    let companyName, assetAggregate;
    
    [err, roleData] = await to(UserRoles.find({"_id": role},{"reports": 1, "company": 1})
                                        .populate('company',['companyName']));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].reports;
        companyName = roleData[0].company.companyName;
    };

    let extraData = Object.assign({}, payload);

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

    assetAggregate = Assets.aggregate();
    [err, assets] = await to(assetAggregate.match(extraData)
                    .group({
                        _id: {
                            "category": "$category",
                            "location": "$location",
                            "asset_status": "$asset_status",
                            "condition": "$condition"
                        },
                        count: {$sum: 1},
                        total_price: {$sum: "$asset_price"}
                    })
                    .lookup({
                        from:"locations",
                        localField:"_id.location",
                        foreignField:"_id",
                        as:"locationData"
                    })
                    .unwind({ 'path': '$locationData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"user_dropdowns",
                        localField:"_id.category",
                        foreignField:"_id",
                        as:"categoryData"
                    })
                    .unwind( { 'path': '$categoryData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"user_dropdowns",
                        localField:"_id.condition",
                        foreignField:"_id",
                        as:"assetCondition"
                    })
                    .unwind( { 'path': '$assetCondition', 'preserveNullAndEmptyArrays': true })
                    .project({
                        "_id": 0,
                        "Asset Type" : {"$ifNull": ["$categoryData.name", null]}, "Assets Count": "$count",
                        "Location": {"$ifNull": ["$locationData.name", null]},
                        "Asset Condition": {"$ifNull": ["$assetCondition.name", null]},
                        "Total Price": "$total_price"
                    }));
    
    if(assets){
        let name = "assettype_assets_"+companyName+"_"+moment().format('DDMMYYhhmmss');
        
        var newWB = XLSX.utils.book_new();
        var newWS = XLSX.utils.json_to_sheet(assets);

        XLSX.utils.book_append_sheet(newWB, newWS, "assettype_assets");
        
        var dir = './public/reports';
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        [err, excelWB] = await to(this.writeFileQ(newWB, './public/reports/'+name+".xlsx"));
        if(err) TE(err, true);

        return ({file:name+".xlsx"});
    }else{
        return false;
    }
},

writeFileQ: function(workbook, filename) { 
    return new Promise((resolve, reject) => {
        XLSX.writeFileAsync(filename, workbook, (error, result) => {
          (error)? reject(error) : resolve(result);
        });
    });
},

getAssetTypeWiseAssetReports: async function(req, payload, role){
    let err, assets, roleData, obj, assetAggregate;
    let respData = [], assetConditions, soultion;
    let conditionsArray = [];

    [err, assetConditions] = await to(UserDropdowns.find({
                                                            "company": payload.company,
                                                            "type": "assetcondition"
                                                        },{
                                                            "name": 1, "_id": 0
                                                        }));
    
    assetConditions.forEach(data => {
        conditionsArray.push(data.name);
    });
    conditionsArray.unshift("AssetsCount", "TotalPrice");
    
    [err, roleData] = await to(UserRoles.find({"_id": role},{"assetTypeReports": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assetTypeReports;
    };

    let extraData = Object.assign({}, payload);

    var options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };
    
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

    assetAggregate = Assets.aggregate();
    assetAggregate.match(extraData)
                    .group({
                        _id: {
                            "category": "$category",
                            "location": "$location",
                            "asset_status": "$asset_status",
                            "condition": "$condition"
                        },
                        count: {$sum: 1},
                        total_price: {$sum: "$asset_price"}
                    })
                    .lookup({
                        from:"locations",
                        localField:"_id.location",
                        foreignField:"_id",
                        as:"locationData"
                    })
                    .unwind({ 'path': '$locationData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"user_dropdowns",
                        localField:"_id.category",
                        foreignField:"_id",
                        as:"categoryData"
                    })
                    .unwind( { 'path': '$categoryData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"admin_dropdowns",
                        localField:"_id.asset_status",
                        foreignField:"_id",
                        as:"assetStatusData"
                    })
                    .unwind( { 'path': '$assetStatusData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"user_dropdowns",
                        localField:"_id.condition",
                        foreignField:"_id",
                        as:"assetCondition"
                    })
                    .unwind( { 'path': '$assetCondition', 'preserveNullAndEmptyArrays': true })
                    
                    .project({
                        "_id": 1, "count": 1, "total_price": 1,
                        "location": {"$ifNull": ["$locationData", null]},
                        "category" : {"$ifNull": ["$categoryData", null]},
                        "asset_status" : {"$ifNull": ["$assetStatusData", null]},
                        "condition": {"$ifNull": ["$assetCondition", null]}
                    });
        
    [err, assets] = await to(Assets.aggregatePaginate(assetAggregate,options));

    assets = assets.docs;

    assets.forEach((data, i) => {
        
        let respObj = {};

        assetConditions.forEach(data => {
            respObj[data.name] = 0;
        });

        if(data.location == null){
            respObj["Location"] = "Not defined";
        }else if(data.hasOwnProperty('location') && data.location.hasOwnProperty('name')){
            respObj["Location"] = data.location.name;
        }else{
            respObj["Location"] = "Not defined";
        }

        if(data.total_price == null){
            respObj["TotalPrice"] = 0;
        }else{
            respObj["TotalPrice"] = data.total_price;
        }

        if(data.count == null){
            respObj["AssetsCount"] = 0;
        }else{
            respObj["AssetsCount"] = data.count;
        }

        if(data.category == null){
            respObj["AssetType"] = "Not defined";
        }else if(data.hasOwnProperty('category') && data.category.hasOwnProperty('name')){
            respObj["AssetType"] = data.category.name;
        }else{
            respObj["AssetType"] = "Not defined";
        }

        if(data.condition == null){
            respObj["AssetCondition"] = "Not defined";
        }else if(data.hasOwnProperty('condition') && data.condition.hasOwnProperty('name')){
            respObj["AssetCondition"] = data.condition.name;
        }else{
            respObj["AssetCondition"] = "Not defined";
        }

        respData.push(respObj);
    });

    respData.filter(data => {
        if(data.AssetCondition !== "Not defined"){
            if(data.hasOwnProperty(data.AssetCondition)){
                data[data.AssetCondition] = data[data.AssetCondition]+data.AssetsCount;
            }else{
                data[data.AssetCondition] = data.AssetsCount;
            }
        }

        delete data["AssetCondition"];
    });

    function getDictKey(element) {
        const { AssetType, Location } = element;
        return `${AssetType}_${Location}`;
    }
    
    const dictionary = {};

    respData.forEach((element) => {
        const key = getDictKey(element);
        
        if (dictionary[key]) {
            conditionsArray.forEach(condition => {
                dictionary[key][condition] += element[condition];
            });
        } else {
            dictionary[key] = element;
        }
    });
    
    soultion = Object.values(dictionary);

    conditionsArray.unshift("AssetType", "Location");

    if(soultion.length > 0){
        soultion.forEach(data => {
            data.TotalPrice = '₹ '+(data.TotalPrice).toLocaleString('en-IN',{
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 4
                                                                    });
        });
    }
    
    return assets ? {data: soultion, keys: conditionsArray, permissions: obj} : false;
},

displayTicketsCreatedByUser: async function(req,payload, role,createdUser,selectType){
    let err, tickets, roleData, obj;
    let rolPermissionObj = {};

    if(selectType === "createdby"){
        rolPermissionObj["ticketsCreatedByMe"] = 1;
    }else if(selectType === "assignedto"){
        rolPermissionObj["ticketsAssignedToMe"] = 1;
    }else{
        rolPermissionObj["tickets"] = 1;
    }

    [err, roleData] = await to(UserRoles.find({"_id": role}, rolPermissionObj));
    if(err) {TE(err, true);}

    if(roleData){
        if(selectType === "createdby"){
            obj = roleData[0].ticketsCreatedByMe;
        }else if(selectType === "assignedto"){
            obj = roleData[0].ticketsAssignedToMe;
        }else{
            obj = roleData[0].tickets;
        }
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
    
    if(selectType === "createdby"){
        extraData['createdBy'] = createdUser;
    }else if(selectType === "assignedto"){
        extraData['assignedTo'] = createdUser;
    }

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
}
}