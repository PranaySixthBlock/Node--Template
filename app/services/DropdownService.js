var {to, TE} = require('../middlewares/utilservices');
var UserDropDown = require('../models/UserDropDown');
var Location = require('../models/Locations');
var Assets = require('../models/Assets');
var VendorServiceProvider = require('../models/VendorServiceProvider');
var TicketPriorities = require('../models/TicketPriorities');
var UserRoles = require('../models/UserRoles');
var AdminDropdowns = require('../models/AdminDropdowns');
var StoreRooms = require('../models/StoreRooms');
var CompanyEmployees = require('../models/CompanyEmployees');
var CompanyContacts = require('../models/CompanyContacts');

module.exports = {
addNewUserDropdown: async function(company, payload, role){
    let err, dropdown, allDropdowns, data, roleData, obj, typeName;
    switch (payload.type) {
        case "assetcategories":
            typeName = "assetCategory";
            break;
        case "assetcondition":
            typeName = "assetCondition";
            break;
        case "assetstatus":
            typeName = "assetStatus";
            break;
        case "ticketstatus":
            typeName = "ticketStatus";
            break;
        case "tickettype":  
            typeName = "ticketType";
            break;
        case "block":
            typeName = "block";
            break;
        case "floor":
            typeName = "floor";
            break;
        default:
            typeName = payload.type;
            break;
      }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0][typeName];
    };

    [err, data] = await to(UserDropDown.find({"company": company, "name": payload.name, "type": payload.type}));
    if(err) {TE(err.message, true);}

    if(data.length<1){
        [err, dropdown] = await to(UserDropDown.create({
            company : company,
            type    : payload.type,
            name    : payload.name,
            message : payload.message?payload.message:null
            // key_code: payload.key_code
        }));
        dropdown.save();
        if(err) {TE(err.message, true);}
    
        [err,allDropdowns] = await to(UserDropDown.find({"company":company}).sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    
        // return (allDropdowns)?{data: allDropdowns, permissions:obj}:false;
        return (allDropdowns)?{data: allDropdowns, permissions: obj}:false;
    }else{
        {TE(payload.name+" dropdown already exists");}
    }
    
},

companyDropdownsList: async function(company){
    let err, dropdowns;

    [err, dropdowns] = await to(UserDropDown.find({company: company}));
    if(err) {TE(err.message, true);}
    return dropdowns?dropdowns:false;
},

updateUserDropdown: async function(dropdownId, payload, role){
    let err, dropdown, updatedMenu, allDropdowns;
    let roleData, obj, typeName, duplicateData;
    switch (payload.type) {
        case "assetcategories":
            typeName = "assetCategory";
            break;
        case "assetcondition":
            typeName = "assetCondition";
            break;
        case "assetstatus":
            typeName = "assetStatus";
            break;
        case "ticketstatus":
            typeName = "ticketStatus";
            break;
        case "tickettype":  
            typeName = "ticketType";
            break;
        case "block":
            typeName = "block";
            break;
        case "floor":
            typeName = "floor";
            break;
        default:
            typeName = payload.type;
            break;
      }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0][typeName];
    };
    
    [err,dropdown] = await to(UserDropDown.findById(dropdownId));
    if(err) {TE(err.message, true);}
    
    [err, duplicateData] = await to(UserDropDown.find({"company": dropdown.company,"name": payload.name,
                                                        "type": dropdown.type}));
    if(err) {TE(err.message, true);}

    if(dropdown){
        if(dropdown.name === payload.name){
            dropdown.type     = payload.type?payload.type:dropdown.type;
            dropdown.status   = payload.status?payload.status:dropdown.status;
            dropdown.message  = payload.message?payload.message:dropdown.message;
            
            [err,updatedMenu]= await to(dropdown.save());
            if(err) {TE(err.message, true);}
    
            [err,allDropdowns] = await to(UserDropDown.find({"company":dropdown.company}).sort({"createdAt":-1}));
            if(err) {TE(err.message, true);}
    
            return allDropdowns?{data: allDropdowns, permissions: obj}:false;
        }else{
            if(duplicateData.length <= 0){
                dropdown.type     = payload.type?payload.type:dropdown.type;
                dropdown.name     = payload.name?payload.name:dropdown.name;
                dropdown.status   = payload.status?payload.status:dropdown.status;
                dropdown.message  = payload.message?payload.message:dropdown.message;
                
                [err,updatedMenu]= await to(dropdown.save());
                if(err) {TE(err.message, true);}
        
                [err,allDropdowns] = await to(UserDropDown.find({"company":dropdown.company}).sort({"createdAt":-1}));
                if(err) {TE(err.message, true);}
        
                return allDropdowns?{data: allDropdowns, permissions: obj}:false;
            }else{
                {TE(payload.name+" dropdown already exists!");}
            }
        }
    }else{
        {TE(payload.name+" dropdown not found");}
    }
},

getcompanyDropdownDetails: async function(dropdownId){
    let err, dropdown;

    [err, dropdown] = await to(UserDropDown.find({_id: dropdownId}));
    if(err) {TE(err.message, true);}
    return dropdown?dropdown:false;
},

groupWiseDropdownsList: async function(companyId,type,role){
    let err, dropdown, roleData, obj, typeName;
    switch (type) {
        case "assetcategories":
            typeName = "assetCategory";
            break;
        case "assetcondition":
            typeName = "assetCondition";
            break;
        case "assetstatus":
            typeName = "assetStatus";
            break;
        case "ticketstatus":
            typeName = "ticketStatus";
            break;
        case "tickettype":  
            typeName = "ticketType";
            break;
        case "block":
            typeName = "block";
            break;
        case "floor":
            typeName = "floor";
            break;
        default:
            typeName = type;
            break;
      }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0][typeName];
    };

    // [err, dropdown] = await to(UserDropDown.find({company: companyId,type: type}).sort({"createdAt":-1}));
    [err, dropdown] = await to(UserDropDown.aggregate([
                                                        {
                                                            $match: {
                                                                company : new mongoose.Types.ObjectId(companyId),
                                                                type    : type
                                                            }
                                                        },
                                                        {
                                                            $project: {
                                                                createdAt: {
                                                                    $dateToString: {
                                                                        // format: "%d-%m-%G %H:%M:%S",
                                                                        format: "%d-%m-%G",
                                                                        date: "$createdAt"
                                                                    }
                                                                },
                                                                "company": 1, "type": 1, "name": 1,
                                                                "status": 1, "key_code": 1, "updatedAt": 1
                                                            }
                                                        },
                                                        {
                                                            $sort: { createdAt: -1}
                                                        }]));
    if(err) {TE(err.message, true);}

    return dropdown?{data: dropdown, permissions: obj}:false;
},

updateGroupWiseUserDropdown: async function(type, dropdownId, payload, role){
    let err, dropdown, updatedMenu, allDropdowns, dropdowns;
    let roleData, obj, typeName, duplicateData;

    switch (payload.type) {
        case "assetcategories":
            typeName = "assetCategory";
            break;
        case "assetcondition":
            typeName = "assetCondition";
            break;
        case "assetstatus":
            typeName = "assetStatus";
            break;
        case "tickettype":  
            typeName = "ticketType";
            break;
        case "ticketstatus":
            typeName = "ticketStatus";
            break;
        case "block":
            typeName = "block";
            break;
        case "floor":
            typeName = "floor";
            break;
        default:
            typeName = type;
            break;
    }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0][typeName];
    };

    [err,dropdowns] = await to(UserDropDown.find({"_id":dropdownId, "type":type}));
    dropdown = dropdowns[0];
    if(err) {TE(err.message, true);}

    [err, duplicateData] = await to(UserDropDown.find({"company":dropdown.company,"name":dropdown.name,"type":type}));
    if(err) {TE(err.message, true);} 

    if(dropdown && dropdown.name == payload.name && duplicateData.length == 1){
        dropdown.type     = payload.type?payload.type:dropdown.type;
        dropdown.name     = payload.name?payload.name:dropdown.name;
        dropdown.status   = payload.status?payload.status:dropdown.status;
        dropdown.message   = payload.message?payload.message:dropdown.message;
        // dropdown.key_code = payload.key_code?payload.key_code:dropdown.key_code;
    
        [err,updatedMenu]= await to(dropdown.save());
        if(err) {TE(err.message, true);}

        [err,allDropdowns] = await to(UserDropDown.find({"company":dropdown.company, "type":type}).sort({"createdAt":-1}));
        if(err) {TE(err.message, true);}

        return allDropdowns?{data: allDropdowns, permissions: obj}:false;
    }else{
        {TE(payload.name+" dropdown already exists");}
    }
},

companyAssetRelatedDropdowns: async function(companyId){
    let err, categories = [], conditions = [], dropdownData, staffData;
    let locations, blocks = [], floors = [], vendors = [], serviceProviders = [], assetStatus = [];
    let ticketPriorities = [], ticketStatus = [], priorityList, ticketTypes = [];
    let dropdownObj = {}, assets = [], assetsData, roles;
    let admin_asset_status, storeRooms, company_employees, companyContacts;

    [err, dropdownData] = await to(UserDropDown.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    if(dropdownData){
        dropdownData.forEach(async data=>{
            if (data.type == "assetcondition"){
                conditions.push(data);
            }else if(data.type == "assetcategories"){
                categories.push(data);
            }else if(data.type == "block"){
                blocks.push(data);
            }else if(data.type == "floor"){
                floors.push(data);
            }else if(data.type == "assetstatus"){
                assetStatus.push(data);
            }else if(data.type == "ticketstatus"){
                ticketStatus.push(data);
            }else if(data.type == "tickettype"){
                ticketTypes.push(data);
            }
        });
    }

    [err, priorityList] = await to(TicketPriorities.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    [err, locations] = await to(Location.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    [err, roles] = await to(UserRoles.find({"company": companyId, "status": true},{"roleName": 1}));
    if(err) {TE(err.message, true);}

    [err, staffData] = await to(VendorServiceProvider.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    [err, admin_asset_status] = await to(AdminDropdowns.find({"type" : "asset_status", "status": true}));
    if(err) {TE(err.message, true);}

    [err, admin_audit_status] = await to(AdminDropdowns.find({"type" : "audit_status", "status": true}));
    if(err) {TE(err.message, true);}

    [err, asset_availability] = await to(AdminDropdowns.find({"type" : "asset_availability", "status": true}));
    if(err) {TE(err.message, true);}

    [err, asset_conditionData] = await to(AdminDropdowns.find({"type" : "asset_condition", "status": true}));
    if(err) {TE(err.message, true);}

    [err, storeRooms] = await to(StoreRooms.find({"company": companyId, "status": true}).populate('location', ['name']));
    if(err) {TE(err.message, true);}

    [err, company_employees] = await to(CompanyEmployees.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    [err, companyContacts] = await to(CompanyContacts.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    if(staffData){
        staffData.forEach(async data=>{
            if(data.type == "vendor"){
                vendors.push(data);
            }else{
                serviceProviders.push(data);
            }
        });
    }
    
    [err, assetsData] = await to(Assets.find({"company": companyId, "status": true})
                                        .populate('category',['_id','name'])
                                        .populate('condition',['_id','name'])
                                        .populate('asset_status',['_id','name'])
                                        .populate('location',['_id','name','address','zip_code'])
                                        .populate('floor',['_id','name'])
                                        .populate('block',['_id','name'])
                                        .populate('vendor',['_id','name','email','mobile','type','serviceCompany','address'])
                                        .sort({"createdAt":-1}));
    if(err) {TE(err.message, true);}

    dropdownObj = {
        "company"   : companyId,
        "locations" : locations,
        "assetConditions" : conditions,
        "assetCategories" : categories,
        "assetStatus"     : assetStatus,
        "assetBlocks"     : blocks,
        "assetFloors"     : floors,
        "vendors"         : vendors,
        "serviceProviders": serviceProviders,
        "assets"          : assetsData,
        "ticketPriorities": priorityList,
        "ticketStatus"    : ticketStatus,
        "roles"           : roles,
        "ticketType"      : ticketTypes,
        "storeRooms"      : storeRooms,
        "companyEmployees": company_employees,
        "companycontacts" : companyContacts,
        "admin_asset_status": admin_asset_status,
        "admin_audit_status":admin_audit_status,
        "asset_availability":asset_availability,
        "asset_conditionData":asset_conditionData
    }

    return dropdownObj?dropdownObj:false;
}
}