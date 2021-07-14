var {to,TE} = require('../middlewares/utilservices');
var Assets  = require('../models/Assets');
var moment  = require('moment');
var randomize = require('randomatic');
var UserRoles = require('../models/UserRoles');
var Locations = require('../models/Locations');
const CompanyContacts = require('../models/CompanyContacts');
var AssetImages = require('../models/AssetImages');
var Company = require('../models/Company');
var AssetAllotmentActivityLog = require('../controllers/AdminActivityLogController');
var StoreRooms = require('../models/StoreRooms');
var Tickets = require('../models/Tickets');
var CompanyEmployees = require('../models/CompanyEmployees');
var AssetAllotmentActivityLogModel = require('../models/AssetAllotmentActivityLog');
var AssetActivityLogModel = require('../models/AssetActivityLog');
var MailService = require('./MailService');
var AuditReports = require('../models/AuditReports');

module.exports = {
createNewAsset: async function(companyId, payload, role, userId){
    let err, asset, allAssets, data;
    let assetDuplicate, roleData, obj;
    let assetsCount, companyAssetsLimit, companyData;
    let paymentStatus, subscription;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].assets;
    };

    [err, companyData] = await to(Company.findById(companyId).populate("subscription"));
    if(err) {TE(err.message, true);}

    [err, assetsCount] = await to(Assets.find({"company": companyId}).countDocuments());
    if(err) {TE(err.message, true);}

    paymentStatus = companyData.paymentState;
    subscription = companyData.subscription;
    companyAssetsLimit = subscription.total_assets;

    if((paymentStatus=="FreeTrial"||paymentStatus=="Purchased")&&subscription){
        if(companyAssetsLimit){
            if(assetsCount < companyAssetsLimit){
                [err, data] = await to(Assets.find({"company": companyId,"asset_name": payload.asset_name}));
                if(err) {TE(err.message, true);}
                if(data.length>0){
                    // return "Asset with asset name '"+payload.asset_name+"' is already exists!";
                    {TE("Asset already exists with given asset name!")};
                }
                if(payload.asset_code){
                    [err, assetDuplicate] = await to(Assets.find({"company": companyId,"asset_code": payload.asset_code}));
                    if(err) {TE(err.message, true);}
                    if(assetDuplicate.length>0){
                        // return "Asset with asset code '"+payload.asset_code+"' is already exists!";
                        {TE("Asset already exists with given asset code!")};
                    }
                }
                [err, asset] = await to(Assets.create({
                    company     : companyId,
                    assetId     : randomize('0', 9),
                    asset_name  : payload.asset_name,
                    asset_code  : payload.asset_code?payload.asset_code:null,
                    category    : payload.category,
                    customform  : payload.customform,
                    condition   : payload.hasOwnProperty("condition")?payload.condition:null,
                    status      : payload.status?payload.status:1,
                    brandName   : payload.brandName?payload.brandName:null,
                    serialNo    : payload.serialNo?payload.serialNo:null,
                    model       : payload.model?payload.model:null,
                    color       : payload.color?payload.color:null,
                    installedAt : payload.installedAt?payload.installedAt:[],
                    customFields: payload.customFields?payload.customFields:{},
                    description : payload.description?payload.description:null
                }));
                asset.save();
                if(err) {TE(err.message, true);}
                else{
                    if(payload.asset_images){
                        payload.asset_images.forEach(async data=>{
                            asset.asset_images.push(data);
                        });
                    }

                    if(payload.dynamicFormFileds){
                        payload.dynamicFormFileds.forEach(async data=>{
                            asset.dynamicFormFileds.push(data);
                        });
                    }

                    if(payload.hasOwnProperty("newValidationData")){
                        await payload.newValidationData.forEach(async data=>{
                           await asset.newValidationData.push(data);
                        });
                    }
                    
                    if(payload.customFormAnswers){
                        payload.customFormAnswers.forEach(async data=>{
                            asset.customFormAnswers.push(data);
                        });
                    }

                    let activityDone = "Asset Created with name, "+ asset.asset_name;
                    await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(companyId, asset._id, userId, "Asset Creation", activityDone);
                    await AssetAllotmentActivityLog.createAssetActivityLog(companyId, asset._id, userId, "Asset Created", activityDone);
                }
                [err,allAssets] = await to(Assets.find({"company": companyId, "_id": asset._id})
                                                .populate('customform',['formName'])
                                                .populate('category',['_id','name'])
                                                .populate('condition',['_id','name'])
                                                .populate('asset_status',['_id','name'])
                                                .populate('location',['_id','name','address','zip_code'])
                                                .populate('floor',['_id','name'])
                                                .populate('block',['_id','name'])
                                                .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                                .populate('using_location',['name'])
                                                .populate('deployedAt',['store_name','store_email'])
                                                .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                                .sort({"createdAt":-1}));
                if(err) {TE(err.message);}
            
                return (allAssets)?{data: allAssets, permissions: obj}:false;
            }else{
                {TE("Can't add assets as you've reached the limit of assets");}
            }
        }else{
            [err, data] = await to(Assets.find({"company": companyId,"asset_name": payload.asset_name}));
            if(err) {TE(err.message, true);}
            if(data.length>0){
                {TE("Asset already exists with given asset name!")};
            }
            if(payload.asset_code){
                [err, assetDuplicate] = await to(Assets.find({"company": companyId,"asset_code": payload.asset_code}));
                if(err) {TE(err.message, true);}
                if(assetDuplicate.length>0){
                    {TE("Asset already exists with given asset code!")};
                }
            }
            [err, asset] = await to(Assets.create({
                company     : companyId,
                // assetId     : "AST0"+randomize('A0', 6),
                assetId     : randomize('0', 9),
                asset_name  : payload.asset_name,
                asset_code  : payload.asset_code?payload.asset_code:null,
                category    : payload.category,
                customform  : payload.customform,
                condition   : payload.hasOwnProperty("condition")?payload.condition:null,
                status      : payload.status?payload.status:1,
                brandName   : payload.brandName?payload.brandName:null,
                serialNo    : payload.serialNo?payload.serialNo:null,
                model       : payload.model?payload.model:null,
                color       : payload.color?payload.color:null,
                installedAt : payload.installedAt?payload.installedAt:[],
                customFields: payload.customFields?payload.customFields:{},
                description : payload.description?payload.description:null
            }));
            asset.save();
            if(err) {TE(err.message, true);}
            else{
                if(payload.asset_images){
                    payload.asset_images.forEach(async data=>{
                        asset.asset_images.push(data);
                    });
                }
                
                if(payload.dynamicFormFileds){
                    payload.dynamicFormFileds.forEach(async data=>{
                        asset.dynamicFormFileds.push(data);
                    });
                }

                if(payload.hasOwnProperty("newValidationData")){
                    await payload.newValidationData.forEach(async data=>{
                        asset.newValidationData.push(data);
                    });
                }

                if(payload.customFormAnswers){
                    payload.customFormAnswers.forEach(async data=>{
                        asset.customFormAnswers.push(data);
                    });
                }

                let activityDone = "Asset Created with name, "+ asset.asset_name;
                await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(companyId, asset._id, userId, "Asset Creation", activityDone);
                await AssetAllotmentActivityLog.createAssetActivityLog(companyId, asset._id, userId, "Asset Created", activityDone);
            }
            [err,allAssets] = await to(Assets.find({"company": companyId, "_id": asset._id})
                                            .populate('customform',['formName'])
                                            .populate('category',['_id','name'])
                                            .populate('condition',['_id','name'])
                                            .populate('asset_status',['_id','name'])
                                            .populate('location',['_id','name','address','zip_code'])
                                            .populate('floor',['_id','name'])
                                            .populate('block',['_id','name'])
                                            .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                            .populate('using_location',['name'])
                                            .populate('deployedAt',['store_name','store_email'])
                                            .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                            .sort({"createdAt":-1}));
            if(err) {TE(err.message);}

            return (allAssets)?{data: allAssets, permissions: obj}:false;
        }
    }else{
        {TE("You can't create assets as you don't have any active subscription!");}
    }

},

companyAssetsList: async function(req,companyId, role){
    let err, assets, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].assets;
    };

    var options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };
    [err, assets] = await to(Assets.paginate(Assets.find({"company": companyId})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('using_location',['name'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}),options));
    if(err) {TE(err.message);}

    return assets?{data: assets, permissions: obj}:false;
},

filteredCompanyAssetsList: async function(req, payload, role){
    let err, assets, roleData, obj;
    let startDate, endDate, datesArray;
    let comparisonValues, timePeriod, assetAggregate;
    let days = [], dates = [], months = [], years = [];
    
    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

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
        assetAggregate = Assets.aggregate();
        assetAggregate.match(extraData)
                        .match({
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
                        })
                        .lookup({
                            from: "tickets",
                            localField: "_id",
                            foreignField: "assets",
                            as: "ticket_assets"
                        })
                        .lookup({
                            from:"locations",
                            localField:"location",
                            foreignField:"_id",
                            as:"locationData"
                        })
                        .unwind({ 'path': '$locationData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"user_dropdowns",
                            localField:"category",
                            foreignField:"_id",
                            as:"categoryData"
                        })
                        .unwind( { 'path': '$categoryData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"admin_dropdowns",
                            localField:"asset_status",
                            foreignField:"_id",
                            as:"assetStatusData"
                        })
                        .unwind( { 'path': '$assetStatusData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"user_dropdowns",
                            localField:"condition",
                            foreignField:"_id",
                            as:"assetCondition"
                        })
                        .unwind( { 'path': '$assetCondition', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"stores",
                            localField:"deployedAt",
                            foreignField:"_id",
                            as:"deployedStore"
                        })
                        .unwind({ 'path': '$deployedStore', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"company_employees",
                            localField:"assignedObj.allottedTo",
                            foreignField:"_id",
                            as:"assignedEmployee"
                        })
                        .unwind({ 'path': '$assignedEmployee', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"locations",
                            localField:"using_location",
                            foreignField:"_id",
                            as:"assetUsingLocation"
                        })
                        .sort({"createdAt":-1})
                        .project({
                            "_id":1, "asset_name":1,"asset_code":1, 
                            "status" : 1,"createdAt" : 1,"assetId": 1,
                            "location": {"$ifNull": ["$locationData", null]},
                            "category" : {"$ifNull": ["$categoryData", null]},
                            "asset_status" : {"$ifNull": ["$assetStatusData", null]},
                            "ticketCount": {"$size": "$ticket_assets"},
                            "deployedAt": {"$ifNull": ["$deployedStore", null]},
                            "assignedTo": {"$ifNull": ["$assignedEmployee", null]},
                            "condition": {"$ifNull": ["$assetCondition", null]},
                            "using_location": {"$ifNull": ["$assetUsingLocation", null]},
                            "predictive_maintenance": 1, "maintenanceValidationData": 1,
                            "allocationValidationData": 1, "purchasedFrom":1,
                            "warrantyDue":1, "lifeTime":1, "purchaseDate":1, "asset_price":1
                        });
            
        [err, assets] = await to(Assets.aggregatePaginate(assetAggregate,options));

        return assets?{data: assets, permissions: obj}:false;
    }else{
        assetAggregate = Assets.aggregate();
        assetAggregate.match(extraData)
                        .lookup({
                            from: "tickets",
                            localField: "_id",
                            foreignField: "assets",
                            as: "ticket_assets"
                        })
                        .lookup({
                            from:"locations",
                            localField:"location",
                            foreignField:"_id",
                            as:"locationData"
                        })
                        .unwind({ 'path': '$locationData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"user_dropdowns",
                            localField:"category",
                            foreignField:"_id",
                            as:"categoryData"
                        })
                        .unwind( { 'path': '$categoryData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"admin_dropdowns",
                            localField:"asset_status",
                            foreignField:"_id",
                            as:"assetStatusData"
                        })
                        .unwind( { 'path': '$assetStatusData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"user_dropdowns",
                            localField:"condition",
                            foreignField:"_id",
                            as:"assetCondition"
                        })
                        .unwind( { 'path': '$assetCondition', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"stores",
                            localField:"deployedAt",
                            foreignField:"_id",
                            as:"deployedStore"
                        })
                        .unwind( { 'path': '$deployedStore', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"company_employees",
                            localField:"assignedObj.allottedTo",
                            foreignField:"_id",
                            as:"assignedEmployee"
                        })
                        .unwind( { 'path': '$assignedEmployee', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"locations",
                            localField:"using_location",
                            foreignField:"_id",
                            as:"assetUsingLocation"
                        })
                        .sort({"createdAt":-1})
                        .project({
                            "_id":1, "asset_name":1,"asset_code":1,
                            "status" : 1,"createdAt" : 1,"assetId": 1,
                            "location": {"$ifNull": ["$locationData", null]},
                            "category" : {"$ifNull": ["$categoryData", null]},
                            "asset_status" : {"$ifNull": ["$assetStatusData", null]},
                            "ticketCount": {"$size": "$ticket_assets"},
                            "deployedAt": {"$ifNull": ["$deployedStore", null]},
                            "assignedTo": {"$ifNull": ["$assignedEmployee", null]},
                            "condition": {"$ifNull": ["$assetCondition", null]},
                            "using_location": {"$ifNull": ["$assetUsingLocation", null]},
                            "predictive_maintenance": 1,"maintenanceValidationData": 1,
                            "allocationValidationData": 1,"purchasedFrom":1,
                            "warrantyDue":1, "lifeTime":1, "purchaseDate":1, "asset_price":1
                        });
            
        [err, assets] = await to(Assets.aggregatePaginate(assetAggregate,options));

        return assets?{data: assets, permissions: obj}:false;
    }
},

quickSearchAssetsList: async function(company, payload, role){
    let err, assets, roleData, obj, assetAggregate;
    
    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

    assetAggregate = Assets.aggregate();
        assetAggregate.match({
                                company : new mongoose.Types.ObjectId(company),
                            })
                        .lookup({
                            from: "tickets",
                            localField: "_id",
                            foreignField: "assets",
                            as: "ticket_assets"
                        })
                        .lookup({
                            from:"locations",
                            localField:"location",
                            foreignField:"_id",
                            as:"locationData"
                        })
                        .unwind({ 'path': '$locationData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"user_dropdowns",
                            localField:"category",
                            foreignField:"_id",
                            as:"categoryData"
                        })
                        .unwind( { 'path': '$categoryData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"admin_dropdowns",
                            localField:"asset_status",
                            foreignField:"_id",
                            as:"assetStatusData"
                        })
                        .unwind( { 'path': '$assetStatusData', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"user_dropdowns",
                            localField:"condition",
                            foreignField:"_id",
                            as:"assetCondition"
                        })
                        .unwind( { 'path': '$assetCondition', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"stores",
                            localField:"deployedAt",
                            foreignField:"_id",
                            as:"deployedStore"
                        })
                        .unwind( { 'path': '$deployedStore', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"company_employees",
                            localField:"assignedObj.allottedTo",
                            foreignField:"_id",
                            as:"assignedEmployee"
                        })
                        .unwind( { 'path': '$assignedEmployee', 'preserveNullAndEmptyArrays': true })
                        .lookup({
                            from:"locations",
                            localField:"using_location",
                            foreignField:"_id",
                            as:"assetUsingLocation"
                        })
                        .sort({"createdAt":-1})
                        .project({
                            "_id":1, "asset_name":1,"asset_code":1,
                            "status" : 1,"createdAt" : 1,"assetId": 1,
                            "location": {"$ifNull": ["$locationData", null]},
                            "category" : {"$ifNull": ["$categoryData", null]},
                            "asset_status" : {"$ifNull": ["$assetStatusData", null]},
                            "ticketCount": {"$size": "$ticket_assets"},
                            "deployedAt": {"$ifNull": ["$deployedStore", null]},
                            "assignedTo": {"$ifNull": ["$assignedEmployee", null]},
                            "condition": {"$ifNull": ["$assetCondition", null]},
                            "using_location": {"$ifNull": ["$assetUsingLocation", null]},
                            "predictive_maintenance": 1, "maintenanceValidationData": 1,
                            "allocationValidationData": 1, "purchasedFrom":1,
                            "warrantyDue":1, "lifeTime":1, "purchaseDate":1, "asset_price":1
                        })
                        .match({
                            "$or": [
                                { asset_name: { '$regex': payload.value, '$options': 'i' } },
                                { asset_code: { '$regex': payload.value, '$options': 'i' } },
                                { "location.name": { '$regex': payload.value, '$options': 'i' } },
                                { "asset_status.name": { '$regex': payload.value, '$options': 'i' } },
                                { "deployedAt.store_name": { '$regex': payload.value, '$options': 'i' } },
                                { "condition.name": { '$regex': payload.value, '$options': 'i' } },
                                { "assignedTo.employee_name": { '$regex': payload.value, '$options': 'i' } },
                            ]
                        });
            
        [err, assets] = await to(Assets.aggregatePaginate(assetAggregate));

        return assets?{data: assets, permissions: obj}:false;
},


getAssetImagesByAssetId: async function(assetId){
    let data, err;

    [err, data] = await to(AssetImages.find({"assetId":assetId, "isDocument": false}));
    if(err) {TE(err.message);}

    return data?data:false;
},

deleteAssetImagesById: async function(assetId, imageId){
    let data, err, images;

    [err, data] = await to(AssetImages.deleteOne({"_id":imageId, "assetId":assetId, "isDocument": false}));
    if(err) {TE("Image deletion is unsuccessful. Try again!");}
    [err, images] = await to(AssetImages.find({"assetId":assetId,"isDocument": false}));
    if(err) {TE("No asset images available!");}
    return (images)?images:false;
},

updateAssetDetails: async function(id, payload, role, userId){

    let err, asset, allAssets, updatedAssets, duplicateAsset;
    let assetData, roleData, obj,activityData =[],activityString ; 

    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].assets;
    };

    [err, asset] = await to(Assets.findById(id));
    if(err) {TE(err.message, true);}

    if(asset){
        if(payload.hasOwnProperty('asset_name')){
            if(payload.asset_name != asset.asset_name){
                [err, duplicateData] = await to(Assets.find({"company": asset.company, "asset_name": payload.asset_name}));
                
                if(duplicateData.length > 0){
                    {TE("Asset already exists with given asset name!");}
                }
            }
        }
        
        if(payload.hasOwnProperty('asset_code')){
            if(payload.asset_code != asset.asset_code){
                [err, duplicateData] = await to(Assets.find({"company": asset.company, "asset_code": payload.asset_code}));

                if(duplicateData.length > 0){
                    {TE("Asset already exists with given asset code!");}
                }
            }
        }
        
        if(payload.asset_name !== asset.asset_name){
            activityData.push("Asset Name");
        } 
        if(payload.asset_code !== asset.asset_code){
            activityData.push("Asset Code");
        } 
        if(asset.category && !asset.category.equals(payload.category)){
            activityData.push("Asset Type");
        }
        if(asset.condition && !asset.condition.equals(payload.condition)){
            activityData.push("Asset Condition");
        }
        if(payload.serialNo !== asset.serialNo){
            activityData.push("Serial Number");
        }
        if(payload.model !== asset.model){
            activityData.push("Model");
        }
        if(payload.color !== asset.color){
            activityData.push("Color");
        }
        let payloadStatus = (payload.status === "true") ? true : false;
        if(payloadStatus !== asset.status){
            activityData.push("Status");
        }
        if(payload.brandName !== asset.brandName){
            activityData.push("Brand Name");
        }
        if(payload.description !== asset.description){
            activityData.push("Description");
        }

        if(activityData.length > 0){
            if(activityData.length === 1){
                activityString = activityData[0] + " has been Changed";
            }else if(activityData.length > 1){
                activityString = ""
                activityData.forEach((key,index)=>{
                    if (index === activityData.length - 1) {
                        activityString += " " + key;
                    } else if (index <= activityData.length) {
                        activityString += " " + key + ",";
                    }
                })
                activityString += " has been changed"
            }
        }
        asset.asset_name   = payload.asset_name?payload.asset_name:asset.asset_name;
        asset.asset_code   = payload.asset_code?payload.asset_code:asset.asset_code;
        asset.category     = payload.category?payload.category:asset.category;
        asset.condition    = payload.condition?payload.condition:asset.condition;
        asset.customform   = payload.customform ?payload.customform:asset.customform,
        asset.installedAt  = payload.installedAt?payload.installedAt:asset.installedAt;
        asset.serialNo     = payload.serialNo?payload.serialNo:asset.serialNo;
        asset.model        = payload.model?payload.model:asset.model;
        asset.color        = payload.color?payload.color:asset.color;
        asset.status       = payload.status?payload.status:asset.status;
        asset.brandName    = payload.brandName?payload.brandName:asset.brandName;
        asset.description  = payload.description?payload.description:asset.description;

        if(payload.hasOwnProperty("asset_images")){
            asset.asset_images = payload.asset_images?payload.asset_images:asset.asset_images;
        }
        
        if(payload.hasOwnProperty("customFields")){
            asset.customFields = payload.customFields?payload.customFields:asset.customFields;
        }else{
            asset.customFields = asset.customFields;
        }
        
        if(payload.hasOwnProperty("dynamicFormFileds")){
            [err, assetData] = await to(Assets.update({_id: id}, {$pull: {"dynamicFormFileds": {$exists: true}}}));
            
            payload.dynamicFormFileds.forEach(async data=>{
                asset.dynamicFormFileds.push(data);
            });
        }

        if(payload.hasOwnProperty("newValidationData")){
            [err, assetData] = await to(Assets.update({_id: id}, {$pull: {"newValidationData": {$exists: true}}}));
            
            payload.newValidationData.forEach(async data=>{
                asset.newValidationData.push(data);
            });
        }

        if(payload.hasOwnProperty("customFormAnswers")){
            [err, assetData] = await to(Assets.update({_id: id}, {$pull: {"customFormAnswers": {$exists: true}}}));
            payload.customFormAnswers.forEach(async data=>{
                asset.customFormAnswers.push(data);
            });
        }

        [err,updatedAssets] = await to(asset.save());
        if(err) {TE(err.message, true);}

        if(activityData.length > 0){
        await AssetAllotmentActivityLog.createAssetActivityLog(asset.company, asset._id, userId, "Asset Updated", activityString);
        }

        [err,allAssets] = await to(Assets.find({"company": asset.company})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt',['store_name','store_email'])
                                    .populate('using_location',['name'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}));
        if(err) {TE(err.message, true);}

        return allAssets?{data: allAssets, permissions: obj}:false;
    }
},

locationWiseAssetsList: async function(locationId, role){
    let err, assets, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].assets;
    };

    [err, assets] = await to(Assets.find({"location": locationId})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt',['store_name','store_email'])
                                    .populate('using_location',['name'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}));
    if(err) {TE(err.message);}

    return assets?{data: assets, permissions: obj}:false;
},

companyAssetData: async function(assetId, role){
    let asset, err, roleData, obj;
    let assetDocs, assetPhotos;
    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].assets;
    };

    [err, asset] = await to(Assets.find({"_id": assetId})
                                    .populate('customform', ['formName'])
                                    .populate('category', ['_id','name'])
                                    .populate('condition', ['_id','name'])
                                    .populate('asset_status', ['_id','name'])
                                    .populate('location', ['_id','name','address','zip_code'])
                                    .populate('floor', ['_id','name'])
                                    .populate('block', ['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt', ['store_name','store_email'])
                                    .populate('using_location', ['name'])
                                    .populate('vendor', ['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt": -1}));
    if(err) {TE(err.message);}

    [err, assetPhotos] = await to(AssetImages.find({"assetId": assetId, "isDocument": false},{"filename":1}));
    if(err) {TE(err.message, true);}

    [err, assetDocs] = await to(AssetImages.find({"assetId": assetId, "isDocument": true},{"filename":1}));
    if(err) {TE(err.message, true);}

    return asset?{data: asset, images: assetPhotos, documents: assetDocs ,permissions: obj}:false;
},

displayAssetImages: async function(companyId, assetId){
    let err, data;

    [err, data] = await to(Assets.find({"company":companyId, "_id":assetId},{"asset_images":1}));
    if(err) {TE(err.message);}
    return data?data:false;
},

deleteImage: async function(assetId, imageId){
    let err, images, imageData, allImages;

    [err, imageData] = await to(Assets.update({"_id":assetId}, 
                            {$pull: {"asset_images": {"_id": imageId}}}, 
                            {multi: true}));
    if(err) TE(err.message);
    
    [err, images] = await to(Assets.findById(assetId));
    if(err) TE(err.message);

    allImages = images.asset_images;
    return (images)? allImages:false;
},

searchAssets : async function(companyId, role, searchString, req){ 
    let err, assets, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets":1}));
    if(err) {TE(err, true);}
    var records =[];

    key = [searchString];        
    key.forEach(function(opt){
        records.push(new RegExp(opt, "i"));                
    }); 
    if(roleData){
        obj=roleData[0].assets;
    };
    let options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };

    [err, assets] = await to(Assets.paginate(Assets.find({"company": companyId,"status": true, $or:[{"asset_code":{$in:records}},
                                    {"asset_name": {$in:records}}]})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt',['store_name','store_email'])
                                    .populate('using_location',['name'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}), options));
    if(err) {TE(err.message);}

    return assets?{data: assets, permissions: obj}:false;
},

autoCompleteSearch : async function(companyId, searchString, req){ 
    let err, assets, roleData, obj;

    var autoRecords =[];
    key = [searchString];        
    key.forEach(function(opt){
        autoRecords.push(new RegExp(opt,"i"));                
    }); 

   
    [err, assets] = await to( Assets.aggregate([
        {"$match" : {"company" : new mongoose.Types.ObjectId(companyId)}},
        { "$match": { "installedAt": { "$regex": searchString , "$options": "i" }} },
        { "$unwind": "$installedAt" },
        { "$match": { "installedAt": { "$regex": searchString, "$options": "i" }}},
        { "$group": {
          _id: null,
          data: { "$addToSet": "$installedAt" }
        }}
      ]));
    if(err) {TE(err.message);}

    return assets?{data: assets}:false;
},

filterAssetNamesAndCodes : async function(companyId, role, searchType, searchString, req){ 
    let err, result;

    var records =[];

    key = [searchString];        
    key.forEach(function(opt){
        records.push(new RegExp(opt,"i"));                
    }); 
    
    if(searchType === "assetName" || searchType === "assetCode"){

    [err, result] = await to(Assets.find({"company": companyId,$or:[ {"asset_code": {$in:records} }, {"asset_name": {$in:records} }]},
                                    {"_id":1, "asset_name" : 1, "asset_code" : 1})
                                    .sort({"createdAt":-1}));
    if(err) {TE(err.message);}

    }else if(searchType === "location"){

     [err, result] = await to(Locations.find({"company": companyId,$or:[ {"name": {$in:records} }, {"city": {$in:records} }], "status": true},
                                            {"_id":1,"name": 1, "city":1,"state":1,"country":1})
                                            .sort({"createdAt":-1}));
        if(err) {TE(err.message);}

    }else if(searchType === "userNames"){
        [err, result] = await to(CompanyContacts.find({"company": companyId,$or:[ {"fullName": {$in:records} }, {"email": {$in:records} }]},
        {"_id":1, "fullName" : 1, "email" : 1})
        .sort({"createdAt":-1}));

        if(err) {TE(err.message);}
    }else if(searchType === "storeRooms"){
        [err, result] = await to(StoreRooms.find({"company": companyId,"store_name": {$in:records}, "status": true},
                                                {"_id": 1,"store_name": 1})
                                            .populate('location', ['name'])
                                            .sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    }else if(searchType === "employees"){
        [err, result] = await to(CompanyEmployees.find({"company": companyId,"employee_name": {$in:records}, "status": true},
                                                {"_id": 1,"employee_name": 1})
                                            .populate('location', ['name'])
                                            .sort({"createdAt":-1}));
    }

    return result?{data: result}:false;
},

getAllotmentActivityOfAnAsset: async function(req, assetId){
    let err, activityLog;

    let options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };

    [err, activityLog] = await to(AssetAllotmentActivityLogModel.paginate(
                                        AssetAllotmentActivityLogModel.find({"assetId": assetId})
                                        .populate('assetId', ['isReturnable'])
                                        .populate('userId', ['fullName', 'email'])
                                        .sort({"createdAt":-1}),options));
    if(err) {TE(err.message, true);}
    return activityLog ? activityLog : false;
},

getActivityOfAnAsset: async function(req, assetId){
    let err, activityLog;

    [err, activityLog] = await to(AssetActivityLogModel.find({"assetId": assetId})
                                  .populate('userId', ['fullName', 'email'])
                                  .sort({"createdAt":-1}));
    if(err) {TE(err.message, true);}
    return activityLog ? activityLog : false;
},

assetAllocation: async function(assetId, roleId, payload, userId){
    let err, asset, updatedAssets;
    let roleData, obj, allAssets;
    let oldAssignedUser, oldDeployedAt;
    let oldIsDeployedAndUsing, oldUsingLocation ,activityData;
    let oldIsDiscarded, assigningData;

    [err, assigningData] = await to(CompanyContacts.findById(userId)
                                                    .populate('company',{"companyName": 1, "email": 1})
                                                    .populate('role',{'roleName': 1}));

    [err, roleData] = await to(UserRoles.find({"_id": roleId},{"assets": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

    [err, asset] = await to(Assets.findById(assetId));
    if(err) {TE(err, true);}
    
    oldAssignedUser = asset.assignedObj.allottedTo ? asset.assignedObj.allottedTo : null;
    oldDeployedAt   = asset.deployedAt;
    oldUsingLocation= asset.using_location;
    oldIsDeployedAndUsing = asset.isDeployedAndUsing;
    oldIsDiscarded = asset.isDiscarded;

    if(asset){

        if(asset.asset_status && !asset.asset_status.equals(payload.asset_status)){
            activityData = "Asset Status has been changed";
        }

        if(payload.hasOwnProperty("allocationValidationData")){
            [err, assetData] = await to(Assets.update({_id: assetId},
                                    {$pull: {"allocationValidationData": {$exists: true}}}));
            
            payload.allocationValidationData.forEach(async data=>{
                asset.allocationValidationData.push(data);
            });
        }

        asset.asset_status        = payload.asset_status?payload.asset_status:asset.asset_status;
        asset.discarded_date      = payload.discarded_date?payload.discarded_date:asset.discarded_date,
        asset.isDeployedAndUsing  = payload.isDeployedAndUsing?payload.isDeployedAndUsing:asset.isDeployedAndUsing,
        asset.isAssignedAndUsing  = payload.isAssignedAndUsing?payload.isAssignedAndUsing:asset.isAssignedAndUsing,
        asset.statusCondition     = payload.statusCondition?payload.statusCondition:asset.statusCondition;

        if(payload.hasOwnProperty("assignedObj")){ //Allocating an asset to an employee (IN USE)
            if(payload.assignedObj.allottedTo == 0){
                asset.assignedObj.allottedTo   = null;
                asset.assignedObj.allottedDate = null;
                asset.assignedObj.returnDate   = null;
                asset.assignedObj.returnable   = false;
                asset.isReturnable = false;
                // asset.location = null;
            }else if(payload.assignedObj.allottedTo != 0){
                asset.assignedObj.allottedTo   = payload.assignedObj.allottedTo;
                asset.assignedObj.allottedDate = payload.assignedObj.allottedDate ? payload.assignedObj.allottedDate : moment().format("YYYY-MM-DD");
                asset.assignedObj.returnDate   = payload.assignedObj.returnDate;
                asset.assignedObj.returnable   = payload.assignedObj.returnable;
                asset.discarded_date = null;
                asset.isReturnable = payload.assignedObj.returnable;
                asset.deployedAt   = null;
                asset.isDiscarded  = false;

                let employeeData;
                [err, employeeData] = await to(CompanyEmployees.findById(payload.assignedObj.allottedTo));

                asset.location = employeeData.location;
                let returnDateForEmail = (asset.isReturnable == true) ? moment(asset.assignedObj.returnDate).format('DD-MM-YYYY') : "N/A";

                let metadata={
                    email: employeeData.employee_email,
                    mail_cc: assigningData.email,
                    // sgTemplate: "d-e68d428e128d4ce5b347cd281e14dc30",
                    sgTemplate: "d-4d04e270aa2f4799bb21bb32edfb90ed",
                    emailBody:{
                        subject: "Asset Allocation Details",
                        userName: employeeData.employee_name,
                        companyName: assigningData.company.companyName,
                        assetName: asset.asset_name,
                        assetCode: asset.asset_code,
                        assignedUser: assigningData.fullName+"("+assigningData.role.roleName+")",
                        returnFlag: (asset.isReturnable == true) ? "Yes" : "No",
                        returnDate: returnDateForEmail
                    }
                };

                [err, emaildata] = await to(MailService.sgSurveyMailService2(metadata));
            }
        }

        if(payload.hasOwnProperty("isDiscarded")){ //Discarding An Asset (DISCARD)
            if(payload.isDiscarded == 0){
                asset.isDiscarded   = false;
                asset.discordedNote = null;
            }else if(payload.isDiscarded != 0){
                asset.isDiscarded    = payload.isDiscarded;
                asset.discordedNote  = payload.discordedNote;
                asset.discarded_date = payload.discarded_date ? payload.discarded_date : Date.now();
                asset.location   = null;
                asset.deployedAt = null;
            }
        }

        if(payload.hasOwnProperty("deployedAt")  && payload.deployedAt != null){ //Asset Deployed Store (IN STACK)
            asset.deployedAt = payload.deployedAt;
            asset.isDiscarded= false;
            asset.discarded_date = null;

            let storeLocation;

            [err, storeLocation] = await to(StoreRooms.findById(payload.deployedAt));

            asset.location   = storeLocation.location;
            
        }else{
            asset.deployedAt = asset.deployedAt;
            asset.location   = asset.location;
        }

        if(payload.hasOwnProperty("using_location") && payload.using_location != null){ //Asset Deployed Location (IN USE)
            asset.using_location = payload.using_location;
            asset.location       = payload.location;
            asset.deployedAt     = null;
            asset.isDiscarded    = false;
            asset.discarded_date = null;
        }else{
            asset.using_location = asset.using_location;
            asset.location       = asset.location;
        }

        [err,updatedAssets] = await to(asset.save());
        if(err) {TE(err, true);}

        if(payload.hasOwnProperty('using_location') && payload.using_location != null){
            if(oldUsingLocation == null && payload.using_location != null){
                let activityDone, location;
                [err, location] = await to(Locations.findById(payload.using_location));

                activityDone = "Asset is deployed in location, "+location.name;
                
                await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(asset.company,asset._id,userId,"Deployed in location",activityDone);
            }else if(!updatedAssets.using_location.equals(oldUsingLocation) && payload.using_location != null){
                let activityDone, oldLocation, newLocation;
                
                [err, newLocation] = await to(Locations.findById(payload.using_location));
                [err, oldLocation] = await to(Locations.findById(oldUsingLocation));

                activityDone = "Asset is deployed in location, "+newLocation.name+" by removing from the location, "+oldLocation.name;
                
                await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(asset.company,asset._id,userId,"Deployed in location",activityDone);
            }
        }

        if(payload.hasOwnProperty("assignedObj")){
            let returnFlag;
            if(oldAssignedUser == null && payload.assignedObj.allottedTo != 0){
                let assigned;
                    
                [err, assigned] = await to(CompanyEmployees.findById(asset.assignedObj.allottedTo).populate('location',['name']));
                
                let activityDone =  "Asset is assigned to "+assigned.employee_name+"("+assigned.location.name+")";
    
                if(payload.assignedObj.returnable == true || payload.assignedObj.returnable === "true"){
                    returnFlag = "true";
                    await AssetAllotmentActivityLog.createAssetAllotmentActivityLogForReturnableAsset(asset.company,asset._id,userId,"Assigning",activityDone,returnFlag);
                }else{
                    returnFlag = "false";
                    await AssetAllotmentActivityLog.createAssetAllotmentActivityLogForReturnableAsset(asset.company,asset._id,userId,"Assigning",activityDone,returnFlag);
                }
                
            }else if(payload.assignedObj.hasOwnProperty("allottedTo") && payload.assignedObj.allottedTo != 0){
                if(!updatedAssets.assignedObj.allottedTo.equals(oldAssignedUser) && oldAssignedUser != null){
                    let assigned, oldAssigned;
                    
                    [err, assigned] = await to(CompanyEmployees.findById(asset.assignedObj.allottedTo).populate('location',['name']));
                    [err, oldAssigned] = await to(CompanyEmployees.findById(oldAssignedUser).populate('location',['name']));
        
                    let activityDone =  "Asset is assigned to "+assigned.employee_name+"("+assigned.location.name+"),by removing from "
                                        +oldAssigned.employee_name+"("+oldAssigned.location.name+")";
                    
                    if(payload.assignedObj.returnable == true || payload.assignedObj.returnable === "true"){
                        returnFlag = "true";
                        await AssetAllotmentActivityLog.createAssetAllotmentActivityLogForReturnableAsset(asset.company,asset._id,userId,"Assigning",activityDone,returnFlag);
                    }else{
                        returnFlag = "false";
                        await AssetAllotmentActivityLog.createAssetAllotmentActivityLogForReturnableAsset(asset.company,asset._id,userId,"Assigning",activityDone,returnFlag);
                    }
                }
            }
        }

        if(payload.hasOwnProperty("deployedAt") && payload.deployedAt != null){
            if(oldDeployedAt == null){
                let deployed;
                
                [err, deployed] = await to(StoreRooms.findById(asset.deployedAt).populate('location',['name']));
                
                let activityDone =  "Asset moved to store, "+deployed.store_name+"("+deployed.location.name+") and is in stock";
    
                await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(asset.company,asset._id,userId,"Moved to Store",activityDone);
            }else if(!updatedAssets.deployedAt.equals(oldDeployedAt) && oldDeployedAt!= null){
                let deployed, oldDeployed;
                
                [err, deployed] = await to(StoreRooms.findById(asset.deployedAt).populate('location',['name']));
                [err, oldDeployed] = await to(StoreRooms.findById(oldDeployedAt).populate('location',['name']));
    
                let activityDone =  "Asset moved to store, "+deployed.store_name+"("+deployed.location.name+"), by removing from "
                                    +oldDeployed.store_name+"("+oldDeployed.location.name+") and is in stock";
    
                await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(asset.company,asset._id,userId,"Moved to Store",activityDone);
            }
        }

        if(payload.isDeployedAndUsing != false && payload.using_location != null){
            let old_asset_using_loc, new_asset_using_loc;
            if((!updatedAssets.using_location.equals(payload.using_location)
                    && updatedAssets.isDeployedAndUsing != payload.isDeployedAndUsing)
                &&
                (updatedAssets.using_location != null)
            ){
                [err, old_asset_using_loc] = await to(Locations.find({"_id": updatedAssets.using_location},{"name": 1}));
                [err, new_asset_using_loc] = await to(Locations.find({"_id": payload.using_location},{"name": 1}));
                
                let activityDone = "Asset "+updatedAssets.asset_name+", is deployed at "+
                                    new_asset_using_loc.name+"(location) for usage by removing from "+old_asset_using_loc.name
                                    +" (location).";
    
                await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(updatedAssets.company,updatedAssets._id,userId,"Deployed",activityDone);
            }
        }
        
        if(payload.isDiscarded != oldIsDiscarded)
            // && payload.discarded_date != moment(asset.discarded_date).format('YYYY-MM-DD'))
        {
            let activityDone, currentDiscardedDate;
            currentDiscardedDate = payload.discarded_date ? payload.discarded_date : moment().format('DD-MM-YYYY');
            if(payload.isDiscarded == true && payload.discarded_date != null){
                if(payload.discordedNote == null){
                    activityDone = "Asset "+asset.asset_name+" is discarded on "+currentDiscardedDate;
                }else{
                    activityDone = "Asset "+asset.asset_name+" is discarded on "+currentDiscardedDate
                                    + ". The reason for discarding is, "+payload.discordedNote;
                }
                await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(asset.company,asset._id,userId,"Discarded",activityDone);
            }
        }
        
        if(activityData){
            await AssetAllotmentActivityLog.createAssetActivityLog(asset.company, asset._id, userId, "Asset Updated", activityData);
        }
        
        [err,allAssets] = await to(Assets.find({"company":asset.company, "_id": asset._id})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt',['store_name','store_email'])
                                    .populate('using_location',['name'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}));
        if(err) {TE(err.message, true);}

        return allAssets?{data: allAssets, permissions: obj}:false;
    }
},

assetPurchaseDetails: async function(assetId, roleId, payload, userId){
    let err, asset, updatedAssets;
    let roleData, obj, allAssets,activityData = [], activityString;
    
    [err, roleData] = await to(UserRoles.find({"_id": roleId},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

    [err, asset] = await to(Assets.findById(assetId));
    if(err) {TE(err.message, true);}

    if(asset){

        if(payload.asset_price && payload.asset_price != asset.asset_price){
            activityData.push("Asset Price");
        }
        if(payload.purchaseDate && payload.purchaseDate != moment(asset.purchaseDate).format('YYYY-MM-DD')){
            activityData.push("Purchase Date");
        }
        if(payload.purchasedFrom && payload.purchasedFrom != asset.purchasedFrom){
            activityData.push("Purchase From");
        }
        if(payload.warrantyDue && payload.warrantyDue != moment(asset.warrantyDue).format('YYYY-MM-DD')){
            activityData.push("Warrenty Date");
        }
        if(payload.lifeTime && payload.lifeTime != asset.lifeTime){
            activityData.push("Lifetime");
        }

        if(activityData.length > 0){
            if(activityData.length === 1){
                activityString = activityData[0] + " has been Changed";
            }else if(activityData.length > 1){
                activityString = ""
                activityData.forEach((key,index)=>{
                    if (index === activityData.length - 1) {
                        activityString += " " + key;
                    } else if (index <= activityData.length) {
                        activityString += " " + key + ",";
                    }
                })
                activityString += " has been changed";
            }
        }

        asset.asset_price  = payload.asset_price?payload.asset_price:asset.asset_price;
        asset.purchaseDate = payload.purchaseDate?payload.purchaseDate:asset.purchaseDate;
        asset.purchasedFrom= payload.purchasedFrom?payload.purchasedFrom:asset.purchasedFrom,
        asset.warrantyDue  = payload.warrantyDue?payload.warrantyDue:asset.warrantyDue;
        asset.lifeTime     = payload.lifeTime?payload.lifeTime:asset.lifeTime;

        [err,updatedAssets] = await to(asset.save());
        if(err) {TE(err.message, true);}

        if(activityData.length > 0 && updatedAssets){
            await AssetAllotmentActivityLog.createAssetActivityLog(asset.company, asset._id, userId, "Asset Updated", activityString);
        }
        
        [err,allAssets] = await to(Assets.find({"company":asset.company, "_id": asset._id})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt',['store_name','store_email'])
                                    .populate('using_location',['name'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}));
        if(err) {TE(err.message, true);}

        return allAssets?{data: allAssets, permissions: obj}:false;
    }
},

assetPPMDetails: async function(assetId, roleId, payload, userId){
    let err, asset, updatedAssets;
    let roleData, obj, allAssets,activityData=[],activityString;
    
    [err, roleData] = await to(UserRoles.find({"_id": roleId},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

    [err, asset] = await to(Assets.findById(assetId));
    if(err) {TE(err.message, true);}

    if(asset){

        if(payload.hasOwnProperty("maintenanceValidationData")){
            [err, assetData] = await to(Assets.update({_id: assetId}, {$pull: {"maintenanceValidationData": {$exists: true}}}));
            
            payload.maintenanceValidationData.forEach(async data=>{
                asset.maintenanceValidationData.push(data);
            });
        }

        if(payload.hasOwnProperty("predictive_maintenance")){
            if(payload.predictive_maintenance.timePeriod && (payload.predictive_maintenance.timePeriod != asset.predictive_maintenance.timePeriod)){
                activityData.push("Maintenance Time Period");
            } 
            if(payload.predictive_maintenance.endsOn && (payload.predictive_maintenance.endsOn != moment(asset.predictive_maintenance.endsOn).format('YYYY-MM-DD'))){
                activityData.push("Maintenance Ends On");
            }
            
            if(activityData.length > 0){
                if(activityData.length === 1){
                    activityString = activityData[0] + " has been Changed";
                }else if(activityData.length > 1){
                    activityString = ""
                    await activityData.forEach((key,index)=>{
                        if (index === activityData.length - 1) {
                            activityString += " " + key;
                        } else if (index <= activityData.length) {
                            activityString += " " + key + ",";
                        }
                    })
                    activityString += " has been changed"
                }
            }

            if(payload.predictive_maintenance.timePeriod == "Week"){
                asset.predictive_maintenance.date   = null;
                asset.predictive_maintenance.month  = null;
                asset.predictive_maintenance.day    = payload.predictive_maintenance.day?payload.predictive_maintenance.day:asset.predictive_maintenance.day;
                asset.predictive_maintenance.endsOn = payload.predictive_maintenance.endsOn?payload.predictive_maintenance.endsOn:asset.predictive_maintenance.endsOn;
                asset.predictive_maintenance.timePeriod = payload.predictive_maintenance.timePeriod?payload.predictive_maintenance.timePeriod:asset.predictive_maintenance.timePeriod;

            }else if(payload.predictive_maintenance.timePeriod == "Month"){
                asset.predictive_maintenance.date   = payload.predictive_maintenance.date?payload.predictive_maintenance.date:asset.predictive_maintenance.date;
                asset.predictive_maintenance.month  = null;
                asset.predictive_maintenance.day    = null;
                asset.predictive_maintenance.endsOn = payload.predictive_maintenance.endsOn?payload.predictive_maintenance.endsOn:asset.predictive_maintenance.endsOn;
                asset.predictive_maintenance.timePeriod = payload.predictive_maintenance.timePeriod?payload.predictive_maintenance.timePeriod:asset.predictive_maintenance.timePeriod;
            
            }else if(payload.predictive_maintenance.timePeriod == "Year"){
                asset.predictive_maintenance.date   = payload.predictive_maintenance.date?payload.predictive_maintenance.date:asset.predictive_maintenance.date;
                asset.predictive_maintenance.month  = payload.predictive_maintenance.month?payload.predictive_maintenance.month:asset.predictive_maintenance.month;
                asset.predictive_maintenance.day    = null;
                asset.predictive_maintenance.endsOn = payload.predictive_maintenance.endsOn?payload.predictive_maintenance.endsOn:asset.predictive_maintenance.endsOn;
                asset.predictive_maintenance.timePeriod = payload.predictive_maintenance.timePeriod?payload.predictive_maintenance.timePeriod:asset.predictive_maintenance.timePeriod;

            }else if(payload.predictive_maintenance.timePeriod == "Day"){
                asset.predictive_maintenance.date   = null;
                asset.predictive_maintenance.month  = null;
                asset.predictive_maintenance.day    = null;
                asset.predictive_maintenance.endsOn = payload.predictive_maintenance.endsOn?payload.predictive_maintenance.endsOn:asset.predictive_maintenance.endsOn;;
                asset.predictive_maintenance.timePeriod = payload.predictive_maintenance.timePeriod?payload.predictive_maintenance.timePeriod:asset.predictive_maintenance.timePeriod;
            }
        }

        [err,updatedAssets] = await to(asset.save());
        if(err) {TE(err.message, true);}

        if(activityData.length > 0 && updatedAssets){
            await AssetAllotmentActivityLog.createAssetActivityLog(asset.company, asset._id, userId, "Asset Updated", activityString);
        }
        
        [err,allAssets] = await to(Assets.find({"company":asset.company, "_id": asset._id})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt',['store_name','store_email'])
                                    .populate('using_location',['name'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}));
        if(err) {TE(err.message, true);}

        return allAssets?{data: allAssets, permissions: obj}:false;
    }
},

returnAssetToStack: async function(activityId, assetId, roleId, payload, userId){
    let err, asset, updatedAssets;
    let roleData, obj, allAssets, assetData;
    let activityDone, assetReturnDate;

    if(payload.returnDate && payload.returnDate != null){
        assetReturnDate = moment(payload.returnDate).format('DD-MM-YYYY');
    }else{
        assetReturnDate = moment().format('DD-MM-YYYY');
    }
    
    [err, roleData] = await to(UserRoles.find({"_id": roleId},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

    [err, asset] = await to(Assets.findById(assetId));
    if(err) {TE(err.message, true);}

    let assetAllottedDate = moment(asset.assignedObj.allottedDate).format('DD-MM-YYYY');
    let assetExpectedReturnDate = moment(asset.assignedObj.returnDate).format('DD-MM-YYYY');
    let assetReturningUserData, assetAllottedUserData;

    [err, assetAllottedUserData] = await to(CompanyEmployees.findById(asset.assignedObj.allottedTo));

    [err, assetReturningUserData] = await to(CompanyContacts.findById(userId)
                                                    .populate('company',{"companyName": 1, "email": 1})
                                                    .populate('role',{'roleName': 1}));
    

    if(asset && asset.isReturnable == true){

        if(payload.hasOwnProperty("allocationValidationData")){
            [err, assetData] = await to(Assets.update({_id: assetId},
                                    {$pull: {"allocationValidationData": {$exists: true}}}));
            
            payload.allocationValidationData.forEach(async data=>{
                asset.allocationValidationData.push(data);
            });
        }

        asset.returnDate = payload.returnDate ? payload.returnDate : Date.now();
        asset.returnNote = payload.returnNote ? payload.returnNote : null;
        asset.deployedAt = payload.deployedAt ? payload.deployedAt : null;
        asset.location   = payload.location ? payload.location : null;
        asset.returnedBy = userId;
        asset.asset_status = payload.asset_status?payload.asset_status:asset.asset_status;
        asset.statusCondition    = payload.statusCondition?payload.statusCondition:asset.statusCondition;
        asset.returnCondition    = payload.returnCondition ? payload.returnCondition : null;
        asset.using_location     = null;
        asset.isDeployedAndUsing = false;
        asset.isAssignedAndUsing = false;
        asset.assignedObj.allottedTo   = null;
        asset.assignedObj.allottedDate = null;
        asset.assignedObj.returnDate   = null;
        asset.assignedObj.returnable   = false;
              
        [err,updatedAssets] = await to(asset.save());
        if(err) {TE(err.message, true);}

        if(updatedAssets){
            let metadata={
                email: assetReturningUserData.company.email,
                mail_cc: '',
                // sgTemplate: "d-50cc2a5629ba4f9ab2c89cd52d23c869",
                sgTemplate: "d-a2b82f7e39bf4054a0ba84939597fd52",
                emailBody:{
                    subject: "Asset Returning Details",
                    companyName: assetReturningUserData.company.companyName,
                    assetName: asset.asset_name,
                    assetCode: asset.asset_code,
                    assignedTo: assetAllottedUserData.employee_name,
                    assignedDate: assetAllottedDate,
                    returnedUser: assetReturningUserData.fullName+" ("+assetReturningUserData.role.roleName+")",
                    dueReturnDate: assetExpectedReturnDate,
                    returnDate: assetReturnDate
                }
            };
            [err, emaildata] = await to(MailService.sgSurveyMailService2(metadata));
            
            let activiyLog;
            [err, activiyLog] = await to(AssetAllotmentActivityLogModel.updateOne({"_id": activityId},{"enableReturn": false}));
        }

        if(payload.hasOwnProperty('deployedAt')){
            let deployedData;
            [err, deployedData] = await to(StoreRooms.findById(payload.deployedAt).populate('location', ['name']));

            activityDone =  "Asset, "+updatedAssets.asset_name+" is returned on, "+assetReturnDate+" and moved to store, "+
                            deployedData.store_name+" ("+ deployedData.location.name+")";
        }else{
            activityDone =  "Asset, "+updatedAssets.asset_name+" is returned on, "+assetReturnDate;
        }
        
        await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(asset.company,asset._id,userId,"Returned",activityDone);

        [err,allAssets] = await to(Assets.find({"company":asset.company, "_id": asset._id})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt',['store_name','store_email'])
                                    .populate('using_location',['name'])
                                    .populate('returnCondition',['_id','name'])
                                    .populate('returnedBy',['fullName','email'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}));
        if(err) {TE(err.message, true);}

        return allAssets?{data: allAssets, permissions: obj}:false;
    }
},

findMaintenanceAssets: async function(req, payload){
    let err, assets, timePeriod;
    let startDate, endDate, datesArray;
    let comparisonValues;
    let days = [], dates = [], months = [], years = [];

    let options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };

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

    }

    let assetAggregate = Assets.aggregate();
    assetAggregate.match(
                        {
                            "company": new mongoose.Types.ObjectId(payload.company),
                            $or: [
                            {
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
                    )
                    .lookup({
                        from: "tickets",
                        localField: "_id",
                        foreignField: "assets",
                        as: "ticket_assets"
                    })
                    .lookup({
                        from:"locations",
                        localField:"location",
                        foreignField:"_id",
                        as:"locationData"
                    })
                    .unwind({ 'path': '$locationData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"user_dropdowns",
                        localField:"category",
                        foreignField:"_id",
                        as:"categoryData"
                    })
                    .unwind( { 'path': '$categoryData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"admin_dropdowns",
                        localField:"asset_status",
                        foreignField:"_id",
                        as:"assetStatusData"
                    })
                    .unwind( { 'path': '$assetStatusData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"user_dropdowns",
                        localField:"condition",
                        foreignField:"_id",
                        as:"assetCondition"
                    })
                    .unwind( { 'path': '$assetCondition', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"stores",
                        localField:"deployedAt",
                        foreignField:"_id",
                        as:"deployedStore"
                    })
                    .unwind( { 'path': '$deployedStore', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"company_employees",
                        localField:"assignedObj.allottedTo",
                        foreignField:"_id",
                        as:"assignedEmployee"
                    })
                    .unwind( { 'path': '$assignedEmployee', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from:"locations",
                        localField:"using_location",
                        foreignField:"_id",
                        as:"assetUsingLocation"
                    })
                    .sort({"createdAt":-1})
                    .project({
                        "_id":1, "asset_name":1,"asset_code":1, "status" : 1,"createdAt" : 1,
                        "location": {"$ifNull": ["$locationData", null]},
                        "category" : {"$ifNull": ["$categoryData", null]},
                        "asset_status" : {"$ifNull": ["$assetStatusData", null]},
                        "ticketCount": {"$size": "$ticket_assets"},
                        "deployedAt": {"$ifNull": ["$deployedStore", null]},
                        "assignedTo": {"$ifNull": ["$assignedEmployee", null]},
                        "condition": {"$ifNull": ["$assetCondition", null]},
                        "using_location": {"$ifNull": ["$assetUsingLocation", null]},
                        "predictive_maintenance": 1,
                        "maintenanceValidationData": 1,
                        "allocationValidationData": 1
                    });
        
    [err, assets] = await to(Assets.aggregatePaginate(assetAggregate,options));
    return assets ? assets : false;
},

getDateArray: async function(start, end){
    let arr, dt;

    dt = new Date(start);
    arr = new Array();
    end = new Date(end);

    while (dt <= end) {
        arr.push(moment(dt).format('YYYY-MM-DD'));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
},

getAssetDocumentsByAssetId: async function(assetId){
    let data, err;

    [err, data] = await to(AssetImages.find({"assetId":assetId, "isDocument": true}));
    if(err) {TE(err.message);}

    return data?data:false;
},

deleteAssetDocumentById: async function(assetId, docId){
    let data, err, images;

    [err, data] = await to(AssetImages.deleteOne({"_id": docId, "assetId": assetId, "isDocument": true}));
    if(err) {TE("Document deletion is unsuccessful. Try again!");}

    [err, images] = await to(AssetImages.find({"assetId": assetId, "isDocument": true}));
    if(err) {TE("No asset documents available!");}

    return (images)?images:false;
},

maintenanceAssetsListOfCompany: async function(req, payload, role){
    let err, tickets, maintenance_tickets = [];
    let roleData, obj, ticketAggregate;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tickets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].tickets;
    };

    var options = {
        sort : { createdAt: -1 },
        lean : true,
        page : req.query.page,
        limit: req.query.pageSize
    };

    let extraData = Object.assign({}, payload);

    if(payload.hasOwnProperty('maintenance_date')){
        let startDate = new Date(payload.maintenance_date);
        let endDate;
        if(payload.hasOwnProperty('endDate')){
            endDate = new Date(payload.endDate);
        }else{
            nextDate  = new Date(payload.maintenance_date);
            endDate = new Date(new Date(payload.maintenance_date).setHours(new Date().getHours() + 24));
        }

        extraData.maintenance_duedate = {
            "$gte": startDate ,
            "$lte": endDate
        }
    }

    if(extraData.hasOwnProperty('company')){
        extraData.company = new mongoose.Types.ObjectId(extraData.company);
    }

    if(extraData.hasOwnProperty('location') && extraData.hasOwnProperty('asset_type')){
        extraData["$expr"] = {
            $and: [
                {
                    $eq:["$categoryData._id",new mongoose.Types.ObjectId(extraData.asset_type)]
                },{
                    $eq:["$locationData._id",new mongoose.Types.ObjectId(extraData.location)]
                }
            ]
        }
    }else if(!extraData.hasOwnProperty('location') && extraData.hasOwnProperty('asset_type')){
        extraData["$expr"] = {
            $eq:["$categoryData._id",new mongoose.Types.ObjectId(extraData.asset_type)]
        }
    }else if(extraData.hasOwnProperty('location') && !extraData.hasOwnProperty('asset_type')){
        extraData["$expr"] = {
            $eq:["$locationData._id",new mongoose.Types.ObjectId(extraData.location)]
        }
    }
    
    delete extraData['maintenance_date'];
    delete extraData['endDate'];
    delete extraData['location'];
    delete extraData['asset_type'];

    ticketAggregate = Tickets.aggregate();
    ticketAggregate.match({
                            "maintenance_duedate": {$ne: null}
                            // "maintenance_duedate": {$exists: true}
                        })
                    .lookup({
                        from: "assets",
                        localField: "assets",
                        foreignField: "_id",
                        as: "ticket_assets"
                    })
                    .unwind({ 'path': '$ticket_assets', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "locations",
                        localField: "ticket_assets.location",
                        foreignField: "_id",
                        as: "locationData"
                    })
                    .unwind({ 'path': '$locationData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "user_dropdowns",
                        localField: "ticket_assets.category",
                        foreignField: "_id",
                        as: "categoryData"
                    })
                    .unwind( { 'path': '$categoryData', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "ticket_priorites",
                        localField: "priority",
                        foreignField: "_id",
                        as: "ticket_priority"
                    })
                    .unwind( { 'path': '$ticket_priority', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "company_contacts",
                        localField: "assignedTo",
                        foreignField: "_id",
                        as: "assignedUser"
                    })
                    .unwind( { 'path': '$assignedUser', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "vendorServiceProvider",
                        localField: "serviceProvider",
                        foreignField: "_id",
                        as: "serviceExecutive"
                    })
                    .unwind({ 'path': '$serviceExecutive', 'preserveNullAndEmptyArrays': true })
                    .lookup({
                        from: "user_dropdowns",
                        localField: "ticket_status",
                        foreignField: "_id",
                        as: "ticketstatus"
                    })
                    .unwind({ 'path': '$ticketstatus', 'preserveNullAndEmptyArrays': true })
                    .match(extraData)
                    .sort({"createdAt":-1})
                    .project({
                        "_id": 1, "ticket_assets.asset_name": 1,"ticket_assets.asset_code": 1,
                        "location": {"$ifNull": ["$locationData", null]},
                        "category" : {"$ifNull": ["$categoryData", null]},
                        "priority": {"$ifNull": ["$ticket_priority", null]},
                        "assignedTo": {"$ifNull": ["$assignedUser", null]},
                        "serviceProvider": {"$ifNull": ["$serviceExecutive", null]},
                        "ticket_status": {"$ifNull": ["$ticketstatus", null]},
                        "ticket_assets.predictive_maintenance": 1,"createdAt" : 1, "company": 1,
                        "ticketId": 1, "maintenance_duedate": 1, "ticket_assets._id": 1
                    });
    [err, tickets] = await to(Tickets.aggregatePaginate(ticketAggregate,options));
    if(err) {TE(err.message, true);}

    return tickets ? {'data': tickets, 'permissions': obj} : false;
},

assetDetailsUsingBarcodeScan: async function(assetId, company, role){
    let asset, err, roleData, obj;
    let assetDocs, assetPhotos;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

    [err, asset] = await to(Assets.findOne({"assetId": assetId, "company": company})
                                    .populate('customform',['formName'])
                                    .populate('category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('asset_status',['_id','name'])
                                    .populate('location',['_id','name','address','zip_code'])
                                    .populate('floor',['_id','name'])
                                    .populate('block',['_id','name'])
                                    .populate('assignedObj.allottedTo',['employee_name','employee_email'])
                                    .populate('deployedAt',['store_name','store_email'])
                                    .populate('using_location',['name'])
                                    .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                    .sort({"createdAt":-1}));
    if(err) {TE(err.message);}

    if(asset){
        [err, assetPhotos] = await to(AssetImages.find({"assetId": asset._id, "isDocument": false},{"filename": 1}));
        if(err) {TE(err.message, true);}
    
        [err, assetDocs] = await to(AssetImages.find({"assetId": asset._id, "isDocument": true},{"filename": 1}));
        if(err) {TE(err.message, true);}
    }
    
    return asset?{data: asset, images: assetPhotos, documents: assetDocs, permissions: obj}:false;
},

assetAuditDataLog: async function(assetId, company, role){
    let assetAuditLog, err, roleData, obj;
    let assetDocs, assetPhotos;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"assets":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].assets;
    };

    [err, assetAuditLog] = await to(AuditReports.find({"assetId": assetId, "company": company})
                                    .populate('auditId',['auditName'])
                                    .populate('auditedBy',['_id','fullName'])
                                    .populate('assetAvailability',['_id','name'])
                                    .populate('assetCodition',['_id','name'])
                                    .sort({"createdAt":-1}));
    if(err) {TE(err.message);}

    
    return assetAuditLog?{data: assetAuditLog, permissions: obj}:false;
},
}