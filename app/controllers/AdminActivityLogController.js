var {to} = require('../middlewares/utilservices');
var AdminActivityLog = require('../models/AdminActivityLog');
var AdminActivityLogService = require('../services/AdminActivityLogService');
var UserActivityLog = require('../models/UserActivityLog');
var AssetAllotmentActivityLog = require('../models/AssetAllotmentActivityLog');
var AssetActivityLog = require('../models/AssetActivityLog');

module.exports = {
createAdminActivity: async function(user, module, activityDone){
    let err, activity;
    
    [err, activity] = await to(AdminActivityLog.create({
        user    : user,
        module  : module,
        activity: activityDone
    }));
    activity.save();
},

getAdminActivityLog: async function(req, res){
    let err, activity;

    [err, activity] = await to(AdminActivityLogService.getAdminActivityList(req));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(activity && activity!==false){
        return res.status(200).json({"status": 200,"success": true,"data": activity});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display admin activity log. Try again!"});
    }
},

createUserActivity: async function(company, user, module, activityDone){
    let err, activity;
    
    [err, activity] = await to(UserActivityLog.create({
        company : company,
        user    : user,
        module  : module,
        activity: activityDone
    }));
    activity.save();
},

getUserActivityLog: async function(req, res){
    let err, activity;

    [err, activity] = await to(AdminActivityLogService.getUserActivityList(req));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(activity && activity!==false){
        return res.status(200).json({"status": 200,"success": true,"data": activity});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display admin activity log. Try again!"});
    }
},

createAssetAllotmentActivityLog: async function(company, asset, user, module, activityDone){
    let err, activity;
    
    [err, activity] = await to(AssetAllotmentActivityLog.create({
        company : company,
        assetId : asset,
        userId  : user,
        module  : module,
        activity: activityDone
    }));
    activity.save();
},

createAssetAllotmentActivityLogForReturnableAsset: async function(company, asset, user, module, activityDone, flag){
    let err, activity;
    
    [err, activity] = await to(AssetAllotmentActivityLog.create({
        company : company,
        assetId : asset,
        userId  : user,
        module  : module,
        activity: activityDone,
        enableReturn : (flag === "true") ? 1 : 0
    }));
    activity.save();
},

createAssetActivityLog: async function(company, asset, user, module, activityString){
    let err, activity;
    
    [err, activity] = await to(AssetActivityLog.create({
        company : company,
        assetId : asset,
        userId  : user,
        module  : module,
        activity: activityString
    }));
    activity.save();
}
}