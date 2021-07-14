'use strict'
const {to} = require('../middlewares/utilservices');
var AuditAssetsService = require('../services/AuditAssetsService');

module.exports = {
getAuditAssetsList: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(AuditAssetsService.getAssetListAudit(req.params.audit, roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(data && data !== false){
        return res.status(200).json({"status": 200, "success": true, "data": data});
    }else{
        return res.status(401).json({"status": 401, "success": false, "message": "Can not create Audit Assets"});
    }
},

getAuditAssetsByVerificationStatus: async function(req, res){
    let err, data;

    let roleId = req.user.role._id;

    [err, data] = await to(AuditAssetsService.auditAssetsListByVerificationStatus(req.params.audit, roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});

    if(data && data !== false){
        return res.status(200).json({"status": 200, "success": true, "data": data});
    }else{
        return res.status(401).json({"status": 401, "success": false, "message": "Can not create Audit Assets"});
    }
}
}