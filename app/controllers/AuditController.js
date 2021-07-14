'use strict'
const {to} = require('../middlewares/utilservices');
var AuditService = require('../services/AuditService');

module.exports = {
createNewAudit: async function(req,res){
    let err, audit;
    let roleId = req.user.role._id;
    let userId = req.user._id;

    [err,audit] = await to(AuditService.addNewAudit(req.params.companyId,req.body,roleId,userId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(audit && audit!==false){
        return res.status(200).json({"status": 200,"success": true,"data": audit});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot create a Audit. Try again!"});
    }
},

companyAuditsList: async function(req, res){
    let err, allAudits;
    let roleId = req.user;

    [err,allAudits] = await to(AuditService.getAllAuditList(req.params.companyId,roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err});

    if(allAudits && allAudits!==false){
        return res.status(200).json({"status": 200,"success": true,"data": allAudits});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot Get Audits. Try again!"});
    }
},

updateAuditData: async function(req, res){
    let err, updatedAudit;
    let roleId = req.user.role._id;

    [err,updatedAudit] = await to(AuditService.getUpdatedAudit(req.params.auditId,req.body,roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    
    if(updatedAudit && updatedAudit!==false){
        return res.status(200).json({"status": 200,"success": true,"data": updatedAudit});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot Update Audit. Try again!"});
    }
},

getAuditData: async function(req, res){
    let err, audit;
    let roleId = req.user.role._id;

    [err,audit] = await to(AuditService.getOneAudit(req.params.auditId,roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(audit && audit!==false){
        return res.status(200).json({"status": 200,"success": true,"data": audit});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot Update Audit. Try again!"});
    }
},

getAssetListData: async function(req, res){
    let err, assetList;
    let roleId = req.user.role._id;

    [err,assetList] = await to(AuditService.getAssetListAudit(req.params.auditId, roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(assetList && assetList!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assetList});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot Get assets list. Try again!"});
    }
},

createNewReport: async function(req, res){
    let err, auditReport;
    let roleId = req.user.role._id;
    let companyId = req.user.company._id;

    [err,auditReport] = await to(AuditService.newAuditReport(req.params.auditasset, companyId, req.body, roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err});

    if(auditReport && auditReport!==false){
        return res.status(200).json({"status": 200,"success": true,"data": auditReport});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot Create Report. Try again!"});
    }
},

getAuditActivity: async function(req, res){
    let err, activityLog;
    let roleId = req.user.role._id;

    [err,activityLog] = await to(AuditService.getAuditActivityLog(req.user.company._id,req.params.Id,roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err});

    if(activityLog && activityLog!==false){
        return res.status(200).json({"status": 200,"success": true,"data": activityLog});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot get Reports. Try again!"});
    }
},
}