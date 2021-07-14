'use strict'
const {to} = require('../middlewares/utilservices');
var VendorServiceProviderService = require('../services/VendorServiceProviderService');

module.exports={
createExternalStaff: async function(req,res){
    let err, data;
    let roleId = req.user.role._id;

    [err,data] = await to(VendorServiceProviderService.addNewExternalStaff(req.params.type,req.params.companyId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot create an external support staff. Try again!"});
    }
},

companyExternalStaffList: async function(req,res){
    let err, data;

    [err, data] = await to(VendorServiceProviderService.listOfCompanyExternalStaff(req.params.companyId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company external staff data. Try again!"});
    }
},

updateExternalStaffData: async function(req,res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(VendorServiceProviderService.updateCompanyExternalStaffData(req.params.id,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company extrenal staff data. Try again!"});
    }
},

getGroupWiseExternalStaffData: async function(req,res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(VendorServiceProviderService.getGroupWiseCompanyExternalData(req.params.type,req.params.companyId,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display group-wise company's external staff data. Try again!"});
    }
},

getExternalStaffData: async function(req,res){
    let err, data;

    [err, data] = await to(VendorServiceProviderService.getCompanyExternalStaffData(req.params.id));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company's external staff data. Try again!"});
    }
},

updateGroupWiseExternalStaff:  async function(req,res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(VendorServiceProviderService.updateGroupWiseExternalStaffData(req.params.type,req.params.id,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company extrenal staff data. Try again!"});
    }
},

ProviderSearchAutoCompleteAssets: async function(req, res){
    let err, assets;
    // let roleId = req.user.role._id;

    [err, assets] = await to(VendorServiceProviderService.providersAutoCompleteSearch(req.params.companyId, req.params.keyword, req));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company providers. Try again!"});
    }
},

}