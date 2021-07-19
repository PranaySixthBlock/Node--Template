'use strict'
const {to} = require('../middlewares/utilservices');
var DropdownService = require('../services/DropdownService');
var CountryDropdownService = require('../services/CountryDropdownService');

module.exports={
createUserDropdown: async function(req,res){
    let err, dropdown;

    [err,dropdown]= await to(CountryDropdownService.addNewUserDropdown(req.params.companyId,req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    
    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot add dropdown to company. Try again!"});
    }
},

getAllCompanyDropdowns: async function(req,res){
    let err, dropdowns;

    [err, dropdowns] = await to(CountryDropdownService.companyDropdownsList(req.params.companyId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdowns && dropdowns!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdowns});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdowns. Try again!"});
    }
},
getAllCompanyDropdownsByType: async function(req,res){
    let err, dropdowns;

    [err, dropdowns] = await to(CountryDropdownService.companyDropdownsListByType(req.params.companyId,req.params.typeName));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdowns && dropdowns!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdowns});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdowns. Try again!"});
    }
},
updateDropdown: async function(req,res){
    let err, dropdown;
    // let roleId = req.user.role._id;

    [err, dropdown] = await to(CountryDropdownService.updateUserDropdown(req.params.dId,req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company dropdown. Try again!"});
    }
},
getDropdownData: async function(req,res){
    let err, dropdown;

    [err, dropdown] = await to(CountryDropdownService.getcompanyDropdownDetails(req.params.dId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdown data. Try again!"});
    }
},
}
