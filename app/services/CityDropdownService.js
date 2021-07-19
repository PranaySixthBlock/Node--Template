var {to, TE} = require('../middlewares/utilservices');
var CityDropDown = require('../models/CityDropDowns');

module.exports = {
    addNewCityDropdown: async function(company, payload){
    let err, dropdown, allDropdowns, data, roleData, obj, typeName;
    
    [err, data] = await to(CityDropDown.find({"company": company, "name": payload.name, "type": payload.type}));
    if(err) {TE(err.message, true);}
   
    if(data.length<1){
        [err, dropdown] = await to(CityDropDown.create({
            company : company,
            stateId : payload.stateId,
            type    : payload.type?payload.type:null,
            name    : payload.name,
            message : payload.message?payload.message:null
            // key_code: payload.key_code
        }));
        dropdown.save();
        if(err) {TE(err.message, true);}
    
        [err,allDropdowns] = await to(CityDropDown.find({"company":company}).sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    
        // return (allDropdowns)?{data: allDropdowns, permissions:obj}:false;
        return (allDropdowns)?allDropdowns:false;
    }else{
        {TE(payload.name+" dropdown already exists");}
    }
    
},
companyCityDropdownsList: async function(company){
    let err, dropdowns;

    [err, dropdowns] = await to(CityDropDown.find({company: company}).populate("stateId"));
    if(err) {TE(err.message, true);}
    return dropdowns?dropdowns:false;
},


updateCityDropdown: async function(dropdownId, payload){
    let err, dropdown, updatedMenu, allDropdowns;
    let roleData, obj, typeName, duplicateData;
    
    [err,dropdown] = await to(CityDropDown.findById(dropdownId));
    if(err) {TE(err.message, true);}
    
    [err, duplicateData] = await to(CityDropDown.find({"company": dropdown.company,"name": payload.name,"stateId" : payload.stateId,
                                                        "type": dropdown.type}));
    if(err) {TE(err.message, true);}

    if(dropdown){
        if(dropdown.name === payload.name){
            dropdown.stateId = payload.stateId?payload.stateId:dropdown.stateId;
            dropdown.type     = payload.type?payload.type:dropdown.type;
            dropdown.status   = payload.status?payload.status:dropdown.status;
            dropdown.message  = payload.message?payload.message:dropdown.message;
            
            [err,updatedMenu]= await to(dropdown.save());
            if(err) {TE(err.message, true);}
    
            [err,allDropdowns] = await to(CityDropDown.find({"company":dropdown.company}).sort({"createdAt":-1}));
            if(err) {TE(err.message, true);}
    
            return allDropdowns?{data: allDropdowns, permissions: obj}:false;
        }else{
            if(duplicateData.length <= 0){
                dropdown.stateId = payload.stateId?payload.stateId:dropdown.stateId;
                dropdown.type     = payload.type?payload.type:dropdown.type;
                dropdown.name     = payload.name?payload.name:dropdown.name;
                dropdown.status   = payload.status?payload.status:dropdown.status;
                dropdown.message  = payload.message?payload.message:dropdown.message;
                
                [err,updatedMenu]= await to(dropdown.save());
                if(err) {TE(err.message, true);}
        
                [err,allDropdowns] = await to(CityDropDown.find({"company":dropdown.company,"stateId" : dropdown.stateId}).sort({"createdAt":-1}));
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
getcompanyCityDropdownDetails: async function(dropdownId){
    let err, dropdown;

    [err, dropdown] = await to(CityDropDown.find({_id: dropdownId}));
    if(err) {TE(err.message, true);}
    return dropdown?dropdown:false;
},
}