'use strict'
const {to} = require('../middlewares/utilservices');
var DropdownService = require('../services/DropdownService');
var CountryDropdownService = require('../services/CountryDropdownService');
var StateDropdownService = require('../services/StateDropdownService');

module.exports={
createStateDropdown: async function(req,res){
    let err, dropdown;

    [err,dropdown]= await to(StateDropdownService.addNewStateDropdown(req.params.companyId,req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    
    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot add dropdown to company. Try again!"});
    }
},

getAllCompanyStateDropdowns: async function(req,res){
    let err, dropdowns;

    [err, dropdowns] = await to(StateDropdownService.companyStateDropdownsList(req.params.companyId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdowns && dropdowns!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdowns});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdowns. Try again!"});
    }
},
updateStateDropdown: async function(req,res){
    let err, dropdown;
    // let roleId = req.user.role._id;

    [err, dropdown] = await to(StateDropdownService.updateStateDropdown(req.params.dId,req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company dropdown. Try again!"});
    }
},
getStateDropdownData: async function(req,res){
    let err, dropdown;

    [err, dropdown] = await to(StateDropdownService.getcompanyStateDropdownDetails(req.params.dId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdown data. Try again!"});
    }
},

listOfFilteredCompanystates: async function(req, res){
    let err, states;
    // let roleId = req.user.role._id;

    [err, states] = await to(StateDropdownService.filteredCompanyStatesList(req, req.body));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(states && states!==false){
        return res.status(200).json({"status": 200,"success": true,"data": states});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company states. Try again!"});
    }
},
}
