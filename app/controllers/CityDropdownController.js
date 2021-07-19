'use strict'
const {to} = require('../middlewares/utilservices');
var CityDropdownService = require('../services/CityDropdownService');

module.exports={
createCityDropdown: async function(req,res){
    let err, dropdown;

    [err,dropdown]= await to(CityDropdownService.addNewCityDropdown(req.params.companyId,req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    
    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot add dropdown to company. Try again!"});
    }
},

getAllCompanyCityDropdowns: async function(req,res){
    let err, dropdowns;

    [err, dropdowns] = await to(CityDropdownService.companyCityDropdownsList(req.params.companyId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdowns && dropdowns!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdowns});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdowns. Try again!"});
    }
},
updateCityDropdown: async function(req,res){
    let err, dropdown;
    // let roleId = req.user.role._id;

    [err, dropdown] = await to(CityDropdownService.updateCityDropdown(req.params.dId,req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company dropdown. Try again!"});
    }
},
getCityDropdownData: async function(req,res){
    let err, dropdown;

    [err, dropdown] = await to(CityDropdownService.getcompanyCityDropdownDetails(req.params.dId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdown data. Try again!"});
    }
},
}
