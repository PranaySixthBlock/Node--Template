const {to, TE} = require('../middlewares/utilservices');
var Audits = require('../models/Audit');
var AuditAssets = require('../models/AuditAssets');
var UserRoles = require('../models/UserRoles');
var AssetImages = require('../models/AssetImages');
var AuditImages = require('../models/AuditImages');


module.exports = {
auditAssetsListByVerificationStatus: async function(audit, role){
    let err, assetsList, roleData, obj;
    let verifiedAssets = [], unverifiedAssets = [];

    [err, roleData] = await to(UserRoles.find({"_id": role},{"audit": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].audit;
    };

    [err, assetsList] = await to(AuditAssets.find({"auditId": audit})
                                            .populate('auditId')
                                            .populate('assetId')
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'auditIds',
                                                    populate: { 
                                                        path:  'auditedBy',
                                                        model: 'company_contacts'
                                                    }
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'auditIds',
                                                    populate: { 
                                                        path:  'assetCodition',
                                                        model: 'admin_dropdowns'
                                                    }
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'auditIds',
                                                    populate: { 
                                                        path:  'assetAvailability',
                                                        model: 'admin_dropdowns'
                                                    }
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'category',
                                                    model: 'user_dropdowns',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'condition',
                                                    model: 'user_dropdowns',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'location',
                                                    model: 'locations',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'using_location',
                                                    model: 'locations',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'asset_status',
                                                    model: 'admin_dropdowns',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'deployedAt',
                                                    model: 'stores',
                                                    select: {'store_name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'returnedBy',
                                                    model: 'company_employees',
                                                    select: {'employee_name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'returnCondition',
                                                    model: 'company_employees',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'assignedObj.allottedTo',
                                                    model: 'company_employees',
                                                    select: {'employee_name': 1}
                                                }
                                            })
                                            .sort({
                                                "createdAt": -1
                                            })
                                        );
    if(err) {TE(err, true);}

    if(assetsList && assetsList.length > 0){
        assetsList.forEach(data => {
            if(data.isVerified == true || data.isVerified == "true"){
                verifiedAssets.push(data);
            }else if(data.isVerified == false || data.isVerified == "false"){
                unverifiedAssets.push(data);
            }
        });
    }
    let responseObj = {
        "verified_assets"  : verifiedAssets,
        "unverified_assets": unverifiedAssets,
        "permissions" : obj
    }
    return assetsList ? responseObj : false;
},

getAssetListAudit: async function(audit, role){
    let err, assetsList, roleData, obj;
    let imageData, auditimageData;
    let auditData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"audit": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].audit;
    };

    [err, auditData] = await to(Audits.findById(audit));

    [err, assetsList] = await to(AuditAssets.find({"auditId": audit})
                                            .populate('auditId')
                                            .populate('assetId')
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'auditIds',
                                                    populate: { 
                                                        path:  'auditedBy',
                                                        model: 'company_contacts'
                                                    }
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'auditIds',
                                                    populate: { 
                                                        path:  'assetCodition',
                                                        model: 'admin_dropdowns'
                                                    }
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'auditIds',
                                                    populate: { 
                                                        path:  'assetAvailability',
                                                        model: 'admin_dropdowns'
                                                    }
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'category',
                                                    model: 'user_dropdowns',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'condition',
                                                    model: 'user_dropdowns',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'location',
                                                    model: 'locations',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'using_location',
                                                    model: 'locations',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'asset_status',
                                                    model: 'admin_dropdowns',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'deployedAt',
                                                    model: 'stores',
                                                    select: {'store_name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'returnedBy',
                                                    model: 'company_employees',
                                                    select: {'employee_name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'returnCondition',
                                                    model: 'company_employees',
                                                    select: {'name': 1}
                                                }
                                            })
                                            .populate({
                                                path : 'assetId',
                                                populate: { 
                                                    path:  'assignedObj.allottedTo',
                                                    model: 'company_employees',
                                                    select: {'employee_name': 1}
                                                }
                                            })
                                            .sort({
                                                "createdAt": -1
                                            })
                                        );
    if(err) {TE(err, true);}

    if(assetsList.length > 0){
        [err, imageData] = await to(AssetImages.find({"company": assetsList[0].company}));
        if(err) {TE(err.message);}
        
        [err, auditimageData] = await to(AuditImages.find({'company': assetsList[0].company, "auditId" : audit}));
        if(err) {TE(err.message);}
    }else{
        imageData = [];
        auditimageData = [];
    }

    let respObj = {
        "assetsList": assetsList,
        "auditData": auditData,
        "ImageData": imageData,
        "auditimageData": auditimageData
    };

    return assetsList ? {data: respObj, permissions : obj} : false;
}
}