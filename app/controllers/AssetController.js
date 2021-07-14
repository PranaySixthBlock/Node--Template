var {to} = require('../middlewares/utilservices');
var AssetService = require('../services/AssetService');

module.exports = {
createAsset: async function(req, res){
    let err, asset;
    let userId = req.user._id;
    let roleId = req.user.role._id;

    [err, asset] = await to(AssetService.createNewAsset(req.params.companyId, req.body, roleId, userId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(asset && asset!==false){
        return res.status(200).json({"status": 200,"success": true,"data": asset});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot add asset to company. Try again!"});
    }
},

listOfCompanyAssets: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.companyAssetsList(req,req.params.companyId, roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company assets. Try again!"});
    }
},

listOfFilteredCompanyAssets: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.filteredCompanyAssetsList(req, req.body,roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company assets. Try again!"});
    }
},

listOfQuickSearchAssets: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.quickSearchAssetsList(req.user.company._id,req.body,roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company assets. Try again!"});
    }
},

updateAssetData: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;
    let userId = req.user._id;

    [err, assets] = await to(AssetService.updateAssetDetails(req.params.id, req.body, roleId,userId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update asset details. Try again!"});
    }
},

locationAssets: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.locationWiseAssetsList(req.params.locationId, roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display location-wise assets. Try again!"});
    }
},

getAssetData: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.companyAssetData(req.params.assetId, roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display asset data. Try again!"});
    }
},

getAssetImages: async function(req, res){
    let err, data;

    [err, data] = await to(AssetService.displayAssetImages(req.params.companyId, req.params.assetId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display asset images. Try again!"});
    }
},

getAssetImagesById: async function(req, res){
    let err, data;

    [err, data] = await to(AssetService.getAssetImagesByAssetId(req.params.assetId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display asset images. Try again!"});
    }
},

removeAssetImageById: async function(req, res){
    let err, data;

    [err, data] = await to(AssetService.deleteAssetImagesById(req.params.assetId,req.params.imageId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot delete asset images. Try again!"});
    }
},

deleteAssetImage: async function(req, res){
    let err, data;

    [err, data] = await to(AssetService.deleteImage(req.params.assetId, req.params.imageId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot delete asset image. Try again!"});
    }
},

SearchCompanyAssets: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.searchAssets(req.params.companyId, roleId, req.params.asset, req));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company assets. Try again!"});
    }
},

SearchAutoCompleteAssets: async function(req, res){
    let err, assets;
    // let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.autoCompleteSearch(req.params.companyId, req.params.keyword, req));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company assets. Try again!"});
    }
},

FilterNameAndCode : async function(req,res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.filterAssetNamesAndCodes(req.params.companyId, roleId, req.params.searchtype, req.params.asset, req));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company assets. Try again!"});
    }
},

getAssetAllotmentActivityLog: async function(req, res){
    let err, activityLog;

    [err, activityLog] = await to(AssetService.getAllotmentActivityOfAnAsset(req, req.params.assetId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    
    if(activityLog && activityLog!==false){
        return res.status(200).json({"status": 200,"success": true,"data": activityLog});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display asset activity log. Try again!"});
    }
},

getAssetActivityLog: async function(req, res){
    let err, activityLog;

    [err, activityLog] = await to(AssetService.getActivityOfAnAsset(req, req.params.assetId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(activityLog && activityLog!==false){
        return res.status(200).json({"status": 200,"success": true,"data": activityLog});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display asset activity log. Try again!"});
    }
},

allocateAsset: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;
    let userId = req.user._id;

    [err, assets] = await to(AssetService.assetAllocation(req.params.assetId, roleId, req.body, userId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot allocate the asset. Try again!"});
    }
},

addAssetPurchaseDetails: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;
    let userId = req.user._id;

    [err, assets] = await to(AssetService.assetPurchaseDetails(req.params.assetId, roleId, req.body, userId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update asset purchase detils. Try again!"});
    }
},

addAssetPPM: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;
    let userId = req.user._id;

    [err, assets] = await to(AssetService.assetPPMDetails(req.params.assetId, roleId, req.body,userId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update asset PPM detils. Try again!"});
    }
},

returningAsset: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;
    let userId = req.user._id;

    [err, assets] = await to(AssetService.returnAssetToStack(req.params.activityId, req.params.assetId, roleId, req.body, userId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot return asset. Try again!"});
    }
},

maintenanceAssets: async function(req, res){
    let err, assets;

    [err, assets] = await to(AssetService.findMaintenanceAssets(req, req.body));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot return asset. Try again!"});
    }
},

getCompanyMaintenanceAssets: async function(req, res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(AssetService.maintenanceAssetsListOfCompany(req, req.body, roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company maintenance assets list. Try again!"});
    }
},

getAssetDocumentsById: async function(req, res){
    let err, data;

    [err, data] = await to(AssetService.getAssetDocumentsByAssetId(req.params.assetId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display asset's documents. Try again!"});
    }
},

removeAssetDocumentById: async function(req, res){
    let err, data;

    [err, data] = await to(AssetService.deleteAssetDocumentById(req.params.assetId, req.params.docId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot delete asset document. Try again!"});
    }
},

assetDetailsUsingAssetId: async function(req, res){
    let err, data;
    let companyId = req.user.company._id
    let roleId = req.user.role._id;

    [err, data] = await to(AssetService.assetDetailsUsingBarcodeScan(req.params.assetId, companyId, roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});
    
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot get asset details. Try again!"});
    }
},

getAssetsAuditDataLog: async function(req, res){
    let err, data;
    let companyId = req.user.company._id
    let roleId = req.user.role._id;

    [err, data] = await to(AssetService.assetAuditDataLog(req.params.assetId, companyId, roleId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message": err});
    
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot get asset details. Try again!"});
    }
},
}