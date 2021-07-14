'use strict'
const {to} = require('../middlewares/utilservices');
var ReportsService = require('../services/ReportsService');

module.exports = {
getAssetsPriceReport: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(ReportsService.companyAssetsPriceReport(req, req.body, roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(data && data!==false){
        return res.status(200).json({"status": 200, "success": true, "data": data});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not get assets price report. Try again!"});
    }
},

getAssetDataForQRCode: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;
    let companyId = req.user.company._id;

    // [err, data] = await to(ReportsService.searchAssetByAssetCode(req.params.asset, roleId, companyId));
    [err, data] = await to(ReportsService.searchAssetByAssetCode(req.body, roleId, companyId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(data && data!==false){
        return res.status(200).json({"status": 200, "success": true, "data": data});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not get asset data. Try again!"});
    }
},

exportAssetsReport: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(ReportsService.exportAssetCountsReports(req.body, roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(data && data!==false){
        return res.status(200).json({"status": 200, "success": true, "data": data});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not get asset data. Try again!"});
    }
},

getAssetTypeReports: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(ReportsService.getAssetTypeWiseAssetReports(req, req.body, roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(data && data!==false){
        return res.status(200).json({"status": 200, "success": true, "data": data});
    }else{
        return res.status(400).json({"status": 400, "success": false, "message": "Can not get assets price report. Try again!"});
    }
},

getTicketsCreatedByUser: async function(req, res){
    let err, data;
    let userId = req.user._id;
    let roleId = req.user.role._id;

    [err, data] = await to(ReportsService.displayTicketsCreatedByUser(req,req.body,roleId,userId,req.params.type));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display ticket comments. Try again!"});
    }
}
}