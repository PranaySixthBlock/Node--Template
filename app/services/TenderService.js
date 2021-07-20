var {to,TE} = require('../middlewares/utilservices');
var Tenders  = require('../models/Tenders');
var moment  = require('moment');
var randomize = require('randomatic');
var UserRoles = require('../models/UserRoles');
var CountryDropDown = require('../models/CountryDropDowns');
const CompanyContacts = require('../models/CompanyContacts');
var StateDropDown = require('../models/StateDropDowns');
var CityDropDown = require('../models/CityDropDowns');
var Company = require('../models/Company');
// var AssetAllotmentActivityLog = require('../controllers/AdminActivityLogController');
// var StoreRooms = require('../models/StoreRooms');
// var Tickets = require('../models/Tickets');
// var CompanyEmployees = require('../models/CompanyEmployees');
// var AssetAllotmentActivityLogModel = require('../models/AssetAllotmentActivityLog');
// var AssetActivityLogModel = require('../models/AssetActivityLog');
// var MailService = require('./MailService');
// var AuditReports = require('../models/AuditReports');

module.exports = {
createNewTender: async function(companyId, payload, role, userId){
    let err, tender, allTenders, data;
    let tenderDuplicate, roleData, obj;
    // let tenderCount, companyAssetsLimit, companyData;
    let paymentStatus, subscription;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tenders":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].tenders;
    };

            [err, data] = await to(Tenders.find({"company": companyId,"tender_name": payload.tender_name}));
            if(err) {TE(err.message, true);}
            if(data.length>0){
                {TE("Tender already exists with given tender name!")};
            }
            [err, tender] = await to(Tenders.create({
                company     : companyId,
                tenderId     : randomize('0', 5),
                tender_name  : payload.tender_name,
                tender_category    : payload.tender_category,
                emd_amount : payload.emd_amount,
                department  : payload.department,
                country   : payload.country,
                state      : payload.state,
                city        : payload.city,
                department_contact_person1   : payload.department_contact_person1?payload.department_contact_person1:null,
                department_contact_person2   : payload.department_contact_person2?payload.department_contact_person2:null,
                tender_owner    : payload.tender_owner,
                emd_paid_by_company       : payload.emd_paid_by_company,
                last_date_to_apply       : payload.last_date_to_apply,
                consortium_allowed : payload.consortium_allowed,
                date_of_refund: payload.date_of_refund,
                partners : payload.partners?payload.partners:[],
                tender_status : payload.tender_status,
                primary_contact : payload.primary_contact,
                secondary_contact : payload.secondary_contact,
                third_contact : payload.third_contact,
                createdBy : userId
            }));
            tender.save();
            if(err) {TE(err.message, true);}
            // else{
            //     if(payload.asset_images){
            //         payload.asset_images.forEach(async data=>{
            //             asset.asset_images.push(data);
            //         });
            //     }
                
            //     if(payload.dynamicFormFileds){
            //         payload.dynamicFormFileds.forEach(async data=>{
            //             asset.dynamicFormFileds.push(data);
            //         });
            //     }

            //     if(payload.hasOwnProperty("newValidationData")){
            //         await payload.newValidationData.forEach(async data=>{
            //             asset.newValidationData.push(data);
            //         });
            //     }

            //     if(payload.customFormAnswers){
            //         payload.customFormAnswers.forEach(async data=>{
            //             asset.customFormAnswers.push(data);
            //         });
            //     }

            //     let activityDone = "Asset Created with name, "+ asset.asset_name;
            //     await AssetAllotmentActivityLog.createAssetAllotmentActivityLog(companyId, asset._id, userId, "Asset Creation", activityDone);
            //     await AssetAllotmentActivityLog.createAssetActivityLog(companyId, asset._id, userId, "Asset Created", activityDone);
            // }
            [err,allTenders] = await to(Tenders.find({"company": companyId, "_id": tender._id})
                                            // .populate('country_dropdowns',['name'])
                                            .populate('tender_category',['_id','name'])
                                            .populate('condition',['_id','name'])
                                            .populate('department',['_id','name'])
                                            .populate('country',['_id','name'])
                                            .populate('state',['_id','name'])
                                            .populate('city',['_id','name'])
                                            .populate('tender_owner')
                                            .populate('emd_paid_by_company')
                                            // .populate('deployedAt',['store_name','store_email'])
                                            // .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                            .sort({"createdAt":-1}));
            if(err) {TE(err.message);}

            return (allTenders)?{data: allTenders, permissions: obj}:false;
        // }
    // }else{
    //     {TE("You can't create assets as you don't have any active subscription!");}
    // }

},

updateTenderDetails: async function(id, payload, role, userId){

    let err, tender, allTenders, updatedTenders, duplicateAsset;
    let assetData, roleData, obj,activityData =[],activityString ; 

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tenders": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].tenders;
    };

    [err, tender] = await to(Tenders.findById(id));
    if(err) {TE(err.message, true);}

    if(tender){
        if(payload.hasOwnProperty('tender_name')){
            if(payload.tender_name != tender.tender_name){
                [err, duplicateData] = await to(Tenders.find({"company": tender.company, "asset_name": payload.tender_name}));
                
                if(duplicateData.length > 0){
                    {TE("Tender already exists with given tender name!");}
                }
            }
        }
        
        // if(payload.hasOwnProperty('asset_code')){
        //     if(payload.asset_code != asset.asset_code){
        //         [err, duplicateData] = await to(Assets.find({"company": asset.company, "asset_code": payload.asset_code}));

        //         if(duplicateData.length > 0){
        //             {TE("Asset already exists with given asset code!");}
        //         }
        //     }
        // }
        
        // if(payload.asset_name !== asset.asset_name){
        //     activityData.push("Asset Name");
        // } 
        // if(payload.asset_code !== asset.asset_code){
        //     activityData.push("Asset Code");
        // } 
        // if(asset.category && !asset.category.equals(payload.category)){
        //     activityData.push("Asset Type");
        // }
        // if(asset.condition && !asset.condition.equals(payload.condition)){
        //     activityData.push("Asset Condition");
        // }
        // if(payload.serialNo !== asset.serialNo){
        //     activityData.push("Serial Number");
        // }
        // if(payload.model !== asset.model){
        //     activityData.push("Model");
        // }
        // if(payload.color !== asset.color){
        //     activityData.push("Color");
        // }
        // let payloadStatus = (payload.status === "true") ? true : false;
        // if(payloadStatus !== asset.status){
        //     activityData.push("Status");
        // }
        // if(payload.brandName !== asset.brandName){
        //     activityData.push("Brand Name");
        // }
        // if(payload.description !== asset.description){
        //     activityData.push("Description");
        // }

        // if(activityData.length > 0){
        //     if(activityData.length === 1){
        //         activityString = activityData[0] + " has been Changed";
        //     }else if(activityData.length > 1){
        //         activityString = ""
        //         activityData.forEach((key,index)=>{
        //             if (index === activityData.length - 1) {
        //                 activityString += " " + key;
        //             } else if (index <= activityData.length) {
        //                 activityString += " " + key + ",";
        //             }
        //         })
        //         activityString += " has been changed"
        //     }
        // }
        tender.tender_name          = payload.tender_name?payload.tender_name:tender.tender_name;
        tender.tender_category      = payload.tender_category?payload.tender_category:tender.tender_category;
        tender.emd_amount           = payload.emd_amount?payload.emd_amount:tender.emd_amount;
        tender.department           = payload.department?payload.department:tender.department;
        tender.country              = payload.country?payload.country:tender.country;
        tender.state                = payload.state?payload.state:tender.state;
        tender.city                 = payload.city?payload.city:tender.city;
        tender.department_contact_person1   = payload.department_contact_person1?payload.department_contact_person1:tender.department_contact_person1;
        tender.department_contact_person2   = payload.department_contact_person2?payload.department_contact_person2:tender.department_contact_person2;
        tender.tender_owner                 = payload.tender_owner?payload.tender_owner:tender.tender_owner;
        tender.emd_paid_by_company          = payload.emd_paid_by_company?payload.emd_paid_by_company:tender.emd_paid_by_company;
        tender.last_date_to_apply           = payload.last_date_to_apply?payload.last_date_to_apply:tender.last_date_to_apply;
        tender.consortium_allowed           = payload.consortium_allowed?payload.consortium_allowed:payload.consortium_allowed;
        tender.date_of_refund               = payload.date_of_refund? payload.date_of_refund : tender.date_of_refund;
        tender.partners                     = payload.partners?payload.partners:tender.partners;
        tender.tender_status                = payload.tender_status?payload.tender_status:tender.tender_status;
        tender.primary_contact              = payload.primary_contact?payload.primary_contact:tender.primary_contact;
        tender.secondary_contact            = payload.secondary_contact?payload.secondary_contact:tender.secondary_contact
        tender.third_contact                = payload.third_contact? payload.third_contact : tender.third_contact,
        
        [err,updatedTenders] = await to(tender.save());
        if(err) {TE(err.message, true);}


        [err,allTenders] = await to(Tenders.find({"company": tender.company})
                                            .populate('tender_category',['_id','name'])
                                            .populate('condition',['_id','name'])
                                            .populate('department',['_id','name'])
                                            .populate('country',['_id','name'])
                                            .populate('state',['_id','name'])
                                            .populate('city',['_id','name'])
                                            .populate('tender_owner')
                                            .populate('emd_paid_by_company')
                                            .sort({"createdAt":-1}));
        if(err) {TE(err.message, true);}

        return allTenders?{data: allTenders, permissions: obj}:false;
    }
},
companyTendersList : async function(companyId, role){
    let err, tenders, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tenders":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].tenders;
    };

    // var options = {
    //     sort: { createdAt: -1 },
    //     lean: true,
    //     page: req.query.page,
    //     limit: req.query.pageSize
    // };
    [err, tenders] = await to(Tenders.find({"company": companyId})
                                    .populate('tender_category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('department',['_id','name'])
                                    .populate('country',['_id','name'])
                                    .populate('state',['_id','name'])
                                    .populate('city',['_id','name'])
                                    .populate('tender_owner')
                                    .populate('emd_paid_by_company')
                                    .sort({"createdAt":-1}));
    if(err) {TE(err.message);}

    return tenders?{data: tenders, permissions: obj}:false;
},
companyTenderData: async function(id, role){
    let err, tenders, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"tenders":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].tenders;
    };

    [err, tenders] = await to(Tenders.find({"_id": id})
                                    .populate('tender_category',['_id','name'])
                                    .populate('condition',['_id','name'])
                                    .populate('department',['_id','name'])
                                    .populate('country',['_id','name'])
                                    .populate('state',['_id','name'])
                                    .populate('city',['_id','name'])
                                    .populate('tender_owner')
                                    .populate('emd_paid_by_company')
                                    .sort({"createdAt":-1}));
    if(err) {TE(err.message);}

    return tenders?{data: tenders, permissions: obj}:false;
},
companyTenderRelatedDropdowns: async function(companyId){
    let err, department = [], tenderCategory = [], dropdownData, staffData;
    let locations, companies = [], country = [], vendors = [], serviceProviders = [], assetStatus = [];
    let statedropdownData = [], citydropdownData = [], priorityList, ticketTypes = [];
    let dropdownObj = {}, assets = [], assetsData, roles;

    [err, dropdownData] = await to(CountryDropDown.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    if(dropdownData){
        dropdownData.forEach(async data=>{
            if (data.type == "tender"){
                tenderCategory.push(data);
            }else if(data.type == "department"){
                department.push(data);
            }else if(data.type == "country"){
                country.push(data);
            }
        });
    }

    // [err, priorityList] = await to(TicketPriorities.find({"company": companyId, "status": true}));
    // if(err) {TE(err.message, true);}

    // [err, locations] = await to(Location.find({"company": companyId, "status": true}));
    // if(err) {TE(err.message, true);}

    [err, roles] = await to(UserRoles.find({"company": companyId, "status": true},{"roleName": 1}));
    if(err) {TE(err.message, true);}

    [err, companies] = await to(Company.find({"status": true}));
    if(err) {TE(err.message, true);}

    [err, statedropdownData] = await to(StateDropDown.find({"status": true}));
    if(err) {TE(err.message, true);}
    
    [err, citydropdownData] = await to(CityDropDown.find({"status": true}));
    if(err) {TE(err.message, true);}
    // [err, staffData] = await to(VendorServiceProvider.find({"company": companyId, "status": true}));
    // if(err) {TE(err.message, true);}

    // [err, admin_asset_status] = await to(AdminDropdowns.find({"type" : "asset_status", "status": true}));
    // if(err) {TE(err.message, true);}

    // [err, admin_audit_status] = await to(AdminDropdowns.find({"type" : "audit_status", "status": true}));
    // if(err) {TE(err.message, true);}

    // [err, asset_availability] = await to(AdminDropdowns.find({"type" : "asset_availability", "status": true}));
    // if(err) {TE(err.message, true);}

    // [err, asset_conditionData] = await to(AdminDropdowns.find({"type" : "asset_condition", "status": true}));
    // if(err) {TE(err.message, true);}

    // [err, storeRooms] = await to(StoreRooms.find({"company": companyId, "status": true}).populate('location', ['name']));
    // if(err) {TE(err.message, true);}

    // [err, company_employees] = await to(CompanyEmployees.find({"company": companyId, "status": true}));
    // if(err) {TE(err.message, true);}

    [err, companyContacts] = await to(CompanyContacts.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    // if(staffData){
    //     staffData.forEach(async data=>{
    //         if(data.type == "vendor"){
    //             vendors.push(data);
    //         }else{
    //             serviceProviders.push(data);
    //         }
    //     });
    // }
    
    // [err, assetsData] = await to(Assets.find({"company": companyId, "status": true})
    //                                     .populate('category',['_id','name'])
    //                                     .populate('condition',['_id','name'])
    //                                     .populate('asset_status',['_id','name'])
    //                                     .populate('location',['_id','name','address','zip_code'])
    //                                     .populate('floor',['_id','name'])
    //                                     .populate('block',['_id','name'])
    //                                     .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
    //                                     .sort({"createdAt":-1}));
    // if(err) {TE(err.message, true);}

    dropdownObj = {
        "company"   : companyId,
        "tenderCategory" : tenderCategory,
        "department" : department,
        "country"     : country,
        "companies"     : companies,
        "state" : statedropdownData,
        "city" : citydropdownData,
        // "assetFloors"     : floors,
        // "vendors"         : vendors,
        // "serviceProviders": serviceProviders,
        // "assets"          : assetsData,
        // "ticketPriorities": priorityList,
        // "ticketStatus"    : ticketStatus,
        "roles"           : roles,
        // "ticketType"      : ticketTypes,
        // "storeRooms"      : storeRooms,
        // "companyEmployees": company_employees,
        "companycontacts" : companyContacts,
        // "admin_asset_status": admin_asset_status,
        // "admin_audit_status":admin_audit_status,
        // "asset_availability":asset_availability,
        // "asset_conditionData":asset_conditionData
    }

    return dropdownObj?dropdownObj:false;
},
companyTenderStateDropdown:async function(countryId){
    let err, dropdownData;

    [err, dropdownData] = await to(StateDropDown.find({"countryId": countryId, "status": true}));
    if(err) {TE(err.message, true);}

    return dropdownData?dropdownData:false;
},
companyTenderCityDropdown:async function(stateId){
    let err, dropdownData;
    
    [err, dropdownData] = await to(CityDropDown.find({"stateId": stateId, "status": true}));
    if(err) {TE(err.message, true);}

    return dropdownData?dropdownData:false;
},

companyTenderRoleDropdown:async function(companyId){
    let err, dropdownData;
    
    [err, dropdownData] = await to(UserRoles.find({"company": companyId, "status": true},{"roleName": 1}));
    if(err) {TE(err.message, true);}

    return dropdownData?dropdownData:false;
},
}