'use strict'
const {to} = require('../middlewares/utilservices');
var DropdownService = require('../services/DropdownService');

module.exports={
createUserDropdown: async function(req,res){
    let err, dropdown;
    let roleId = req.user.role._id;

    [err,dropdown]= await to(DropdownService.addNewUserDropdown(req.params.companyId,req.body,roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    
    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot add dropdown to company. Try again!"});
    }
},

getAllCompanyDropdowns: async function(req,res){
    let err, dropdowns;

    [err, dropdowns] = await to(DropdownService.companyDropdownsList(req.params.companyId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdowns && dropdowns!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdowns});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdowns. Try again!"});
    }
},

updateDropdown: async function(req,res){
    let err, dropdown;
    let roleId = req.user.role._id;

    [err, dropdown] = await to(DropdownService.updateUserDropdown(req.params.dId,req.body,roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company dropdown. Try again!"});
    }
},

getDropdownData: async function(req,res){
    let err, dropdown;

    [err, dropdown] = await to(DropdownService.getcompanyDropdownDetails(req.params.dId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company dropdown data. Try again!"});
    }
},

getGroupWiseDropdowns: async function(req,res){
    let err, dropdown;
    let roleId = req.user.role._id;

    [err, dropdown] = await to(DropdownService.groupWiseDropdownsList(req.params.companyId,req.params.type,roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display group-wise company dropdowns. Try again!"});
    }
},

updateGroupWiseDropdown: async function(req,res){
    let err, dropdown;
    let roleId = req.user.role._id;

    [err, dropdown] = await to(DropdownService.updateGroupWiseUserDropdown(req.params.type,req.params.dId,req.body,roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company dropdown. Try again!"});
    }
},

assetDropdowns: async function(req, res){
    let err, dropdown;

    [err, dropdown] = await to(DropdownService.companyAssetRelatedDropdowns(req.params.companyId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data": dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot get company dropdowns. Try again!"});
    }
}
}