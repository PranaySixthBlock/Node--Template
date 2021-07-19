var {to, TE} = require('../middlewares/utilservices');
var UserDropDown = require('../models/UserDropDown');
var CountryDropDown = require('../models/CountryDropDowns');
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
addNewUserDropdown: async function(company, payload){
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
    [err, data] = await to(CountryDropDown.find({"company": company, "name": payload.name, "type": payload.type}));
    if(err) {TE(err.message, true);}
   
    if(data.length<1){
        [err, dropdown] = await to(CountryDropDown.create({
            company : company,
            type    : payload.type,
            name    : payload.name,
            message : payload.message?payload.message:null
            // key_code: payload.key_code
        }));
        await to(dropdown.save());
        if(err) {TE(err.message, true);}
    
        [err,allDropdowns] = await to(CountryDropDown.find({"company":company}).sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    
        // return (allDropdowns)?{data: allDropdowns, permissions:obj}:false;
        return (allDropdowns)?allDropdowns:false;
    }else{
        {TE(payload.name+" dropdown already exists");}
    }
    
},
companyDropdownsList: async function(company){
    let err, dropdowns;

    [err, dropdowns] = await to(CountryDropDown.find({company: company}));
    if(err) {TE(err.message, true);}
    return dropdowns?dropdowns:false;
},
companyDropdownsListByType: async function(company,typeName){
    let err, dropdowns;

    [err, dropdowns] = await to(CountryDropDown.find({company: company, type:typeName}));
    if(err) {TE(err.message, true);}
    return dropdowns?dropdowns:false;
},

updateUserDropdown: async function(dropdownId, payload){
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
    
    [err,dropdown] = await to(CountryDropDown.findById(dropdownId));
    if(err) {TE(err.message, true);}
    
    [err, duplicateData] = await to(CountryDropDown.find({"company": dropdown.company,"name": payload.name,
                                                        "type": dropdown.type}));
    if(err) {TE(err.message, true);}

    if(dropdown){
        if(dropdown.name === payload.name){
            dropdown.type     = payload.type?payload.type:dropdown.type;
            dropdown.status   = payload.status?payload.status:dropdown.status;
            dropdown.message  = payload.message?payload.message:dropdown.message;
            
            [err,updatedMenu]= await to(dropdown.save());
            if(err) {TE(err.message, true);}
    
            [err,allDropdowns] = await to(CountryDropDown.find({"company":dropdown.company}).sort({"createdAt":-1}));
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
        
                [err,allDropdowns] = await to(CountryDropDown.find({"company":dropdown.company}).sort({"createdAt":-1}));
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

    [err, dropdown] = await to(CountryDropDown.find({_id: dropdownId}));
    if(err) {TE(err.message, true);}
    return dropdown?dropdown:false;
},
}