var {to, TE} = require('../middlewares/utilservices');
var UserDropDown = require('../models/UserDropDown');
var CountryDropDown = require('../models/CountryDropDowns');
var StateDropDown = require('../models/StateDropDowns');
// var Location = require('../models/Locations');
// var Assets = require('../models/Assets');
// var VendorServiceProvider = require('../models/VendorServiceProvider');
// var TicketPriorities = require('../models/TicketPriorities');
var UserRoles = require('../models/UserRoles');
var AdminDropdowns = require('../models/AdminDropdowns');
// var StoreRooms = require('../models/StoreRooms');
// var CompanyEmployees = require('../models/CompanyEmployees');
var CompanyContacts = require('../models/CompanyContacts');

module.exports = {
    addNewStateDropdown: async function(company, payload){
    let err, dropdown, allDropdowns, data, roleData, obj, typeName;
    // switch (payload.type) {
    //     case "country":
    //         typeName = "Country";
    //         break;
    //     case "state":
    //         typeName = "State";
    //         break;
    //     case "city":
    //         typeName = "City";
    //         break;
    //     case "department":
    //         typeName = "Department";
    //         break;
    //     case "tendercategory":  
    //         typeName = "TenderCategory";
    //         break;
    //     default:
    //         typeName = payload.type;
    //         break;
    //   }

    // let filterType = '{"' + typeName + '":1,"_id":0}';
    // var query = JSON.parse(filterType);

    // [err, roleData] = await to(UserRoles.find({"_id": role},query));
    // if(err) {TE(err, true);}

    // if(roleData){
    //     obj=roleData[0][typeName];
    // };
    [err, data] = await to(StateDropDown.find({"company": company, "name": payload.name, "type": payload.type}));
    if(err) {TE(err.message, true);}
   
    if(data.length<1){
        [err, dropdown] = await to(StateDropDown.create({
            company : company,
            countryId : payload.countryId,
            type    : payload.type,
            name    : payload.name,
            message : payload.message?payload.message:null
            // key_code: payload.key_code
        }));
        dropdown.save();
        if(err) {TE(err.message, true);}
    
        [err,allDropdowns] = await to(StateDropDown.find({"company":company}).sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    
        // return (allDropdowns)?{data: allDropdowns, permissions:obj}:false;
        return (allDropdowns)?allDropdowns:false;
    }else{
        {TE(payload.name+" dropdown already exists");}
    }
    
},
companyStateDropdownsList: async function(company){
    let err, dropdowns;

    [err, dropdowns] = await to(StateDropDown.find({company: company}).populate("countryId"));
    if(err) {TE(err.message, true);}
    return dropdowns?dropdowns:false;
},


updateStateDropdown: async function(dropdownId, payload){
    let err, dropdown, updatedMenu, allDropdowns;
    let roleData, obj, typeName, duplicateData;
    // switch (payload.type) {
    //     case "assetcategories":
    //         typeName = "assetCategory";
    //         break;
    //     case "assetcondition":
    //         typeName = "assetCondition";
    //         break;
    //     case "assetstatus":
    //         typeName = "assetStatus";
    //         break;
    //     case "ticketstatus":
    //         typeName = "ticketStatus";
    //         break;
    //     case "tickettype":  
    //         typeName = "ticketType";
    //         break;
    //     case "block":
    //         typeName = "block";
    //         break;
    //     case "floor":
    //         typeName = "floor";
    //         break;
    //     default:
    //         typeName = payload.type;
    //         break;
    //   }

    // let filterType = '{"' + typeName + '":1,"_id":0}';
    // var query = JSON.parse(filterType);

    // [err, roleData] = await to(UserRoles.find({"_id": role},query));
    // if(err) {TE(err, true);}

    // if(roleData){
    //     obj = roleData[0][typeName];
    // };
    
    [err,dropdown] = await to(StateDropDown.findById(dropdownId));
    if(err) {TE(err.message, true);}
    
    [err, duplicateData] = await to(StateDropDown.find({"company": dropdown.company,"name": payload.name,"countryId" : payload.countryId,
                                                        "type": dropdown.type}));
    if(err) {TE(err.message, true);}

    if(dropdown){
        if(dropdown.name === payload.name){
            dropdown.countryId = payload.countryId?payload.countryId:dropdown.countryId;
            dropdown.type     = payload.type?payload.type:dropdown.type;
            dropdown.status   = payload.status?payload.status:dropdown.status;
            dropdown.message  = payload.message?payload.message:dropdown.message;
            
            [err,updatedMenu]= await to(dropdown.save());
            if(err) {TE(err.message, true);}
    
            [err,allDropdowns] = await to(StateDropDown.find({"company":dropdown.company}).sort({"createdAt":-1}));
            if(err) {TE(err.message, true);}
    
            return allDropdowns?{data: allDropdowns, permissions: obj}:false;
        }else{
            if(duplicateData.length <= 0){
                dropdown.countryId = payload.countryId?payload.countryId:dropdown.countryId;
                dropdown.type     = payload.type?payload.type:dropdown.type;
                dropdown.name     = payload.name?payload.name:dropdown.name;
                dropdown.status   = payload.status?payload.status:dropdown.status;
                dropdown.message  = payload.message?payload.message:dropdown.message;
                
                [err,updatedMenu]= await to(dropdown.save());
                if(err) {TE(err.message, true);}
        
                [err,allDropdowns] = await to(StateDropDown.find({"company":dropdown.company,"countryId" : dropdown.countryId}).sort({"createdAt":-1}));
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
getcompanyStateDropdownDetails: async function(dropdownId){
    let err, dropdown;

    [err, dropdown] = await to(StateDropDown.find({_id: dropdownId}));
    if(err) {TE(err.message, true);}
    return dropdown?dropdown:false;
},
filteredCompanyStatesList: async function(req, payload){
    let err, assets, roleData, obj;
    let startDate, endDate, datesArray;
    let comparisonValues, timePeriod, Aggregate;
    let days = [], dates = [], months = [], years = [];
    
    // [err, roleData] = await to(UserRoles.find({"_id": role},{"assets": 1}));
    // if(err) {TE(err, true);}

    // if(roleData){
    //     obj = roleData[0].assets;
    // };

    let extraData = Object.assign({}, payload);

    if(extraData.hasOwnProperty('createdAt')){
        let startDate = new Date(extraData.createdAt).toISOString();
        let nextDate  = new Date(extraData.createdAt);
        let dateValue = nextDate.getDate() + 1;
        nextDate.setDate(dateValue);
        let endDate = nextDate.toISOString()
        extraData.createdAt = {
            "$gte": startDate ,
            "$lte": endDate
        }
    }

    const match = {}

    // var options = {
    //     sort: { createdAt: -1 },
    //     lean: true,
    //     page: req.query.page,
    //     limit: req.query.pageSize
    // };
    
    if(extraData.hasOwnProperty('company')){
        extraData.company = new mongoose.Types.ObjectId(extraData.company);
    }
    if(extraData.hasOwnProperty('countryId')){
        extraData.countryId = new mongoose.Types.ObjectId(extraData.countryId);
    }
    if(extraData.hasOwnProperty('stateId')){
        extraData._id = new mongoose.Types.ObjectId(extraData.stateId);
    }
    // if(extraData.hasOwnProperty('location')){
    //     extraData.location = new mongoose.Types.ObjectId(extraData.location);
    // }
    // if(extraData.hasOwnProperty('condition')){
    //     extraData.condition = new mongoose.Types.ObjectId(extraData.condition);
    // }
    delete extraData['stateId'];
    assetAggregate = StateDropDown.aggregate();
        assetAggregate.match(extraData)
                        .lookup({
                            from: "country_dropdowns",
                            localField: "countryId",
                            foreignField: "_id",
                            as: "countryId"
                        })
                        .unwind( { 'path': '$countryId', 'preserveNullAndEmptyArrays': true })
                        .sort({"createdAt":-1});
                        // .project({
                        //     "countryId.name" : 1
                        // });
                        //     "_id":1, "asset_name":1,"asset_code":1,
                        //     "status" : 1,"createdAt" : 1,"assetId": 1,
                        //     "location": {"$ifNull": ["$locationData", null]},
                        //     "category" : {"$ifNull": ["$categoryData", null]},
                        //     "asset_status" : {"$ifNull": ["$assetStatusData", null]},
                        //     "ticketCount": {"$size": "$ticket_assets"},
                        //     "deployedAt": {"$ifNull": ["$deployedStore", null]},
                        //     "assignedTo": {"$ifNull": ["$assignedEmployee", null]},
                        //     "condition": {"$ifNull": ["$assetCondition", null]},
                        //     "using_location": {"$ifNull": ["$assetUsingLocation", null]},
                        //     "predictive_maintenance": 1,"maintenanceValidationData": 1,
                        //     "allocationValidationData": 1,"purchasedFrom":1,
                        //     "warrantyDue":1, "lifeTime":1, "purchaseDate":1, "asset_price":1
                        // });
            // console.log(JSON.stringify(assetAggregate));
        [err, assets] = await to(assetAggregate);

        return assets? assets:false;
},
}