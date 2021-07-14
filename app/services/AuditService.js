var {to, TE} = require('../middlewares/utilservices');
var Audit = require('../models/Audit');
var Assets = require('../models/Assets');
var moment  = require('moment');
var UserRoles = require('../models/UserRoles');
var AuditReports = require('../models/AuditReports');
var AssetImages = require('../models/AssetImages');
var AuditImages = require('../models/AuditImages');
var AuditAssets = require('../models/AuditAssets');
var EmailService = require('../services/MailService');

module.exports = {
addNewAudit: async function(company, payload, role, userId){
    let err, audit, allAudits, roleData, obj;
    let auditAssetsList, auditAssets, duplicateData;
    let newAuditData; 

    [err, roleData] = await to(UserRoles.find({"_id": role},{"audit": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].audit;
    };

    [err, duplicateData] = await to(Audit.find({"company": company, "auditName": payload.auditName}));
    if(err) {TE(err, true);}
    
    if(duplicateData.length <= 0){
        [err, audit] = await to(Audit.create({
            company     : company,
            auditName   : payload.auditName?payload.auditName:null,
            locationId  : payload.location?payload.location:null,
            assetTypeId : payload.assetTypeId?payload.assetTypeId:null,
            auditUserId : payload.auditUserId?payload.auditUserId:null,
            startDate   : payload.startDate?payload.startDate:null,
            auditStatus : payload.auditStatus?payload.auditStatus:null,
            endDate     : payload.endDate?payload.endDate:null,
            status      : payload.status?payload.status:1,
            createdBy   : userId
        }));
    
        if(err) {TE(err.message, true);}

        if(audit){
            [err, auditAssetsList] = await to(this.getAssetListAudit(audit._id, role));

            if(auditAssetsList.data.hasOwnProperty("assetsList")){
                let assetsArray = auditAssetsList.data.assetsList;
                if(assetsArray.length > 0){
                    await assetsArray.forEach(async data => {
                        [err, auditAssets] = await to(AuditAssets.create({
                            company : data.company,
                            auditId : audit._id,
                            assetId : data._id
                        }));
                    });
                }
            }
            [err, newAuditData] = await to(Audit.findById(audit._id)
                                                .populate('company',['companyName','email'])
                                                .populate('locationId',['name'])
                                                .populate('assetTypeId',['name'])
                                                .populate('auditStatus',['name'])
                                                .populate('auditUserId',['fullName','email'])
                                                .populate('createdBy',['fullName','email']));
            
            let auditLocationsArray=[], locationString;
            let auditAssetTypeArray=[], assetTypeString;
            let auditorsArray=[], auditorsString;

            if(newAuditData.assetTypeId.length > 0){
                newAuditData.assetTypeId.forEach(data => {
                    auditAssetTypeArray.push(data.name);
                });
            }
            assetTypeString = auditAssetTypeArray.join(', ');

            if(newAuditData.locationId.length > 0){
                newAuditData.locationId.forEach(data => {
                    auditLocationsArray.push(data.name);
                });
            }
            locationString = auditLocationsArray.join(', ');

            if(newAuditData.auditUserId.length > 0){
                newAuditData.auditUserId.forEach(data => {
                    auditorsArray.push(data.fullName);
                });
            }
            auditorsString = auditorsArray.join(', ');

            if(newAuditData.auditUserId.length > 0){
                newAuditData.auditUserId.forEach(async userData => {
                    if(userData.email == newAuditData.company.email){
                        let metadata={
                            email:userData.email,
                            mail_cc:"",
                            sgTemplate:"d-519b57955ab64dd083cc30f621d1aab7",
                            emailBody:{
                                subject:"Audit Assignement - "+newAuditData.company.companyName,
                                company:newAuditData.company.companyName,
                                creationText:"A new audit has been created and assigned to you. Please find the details below.",
                                created_by:newAuditData.createdBy.fullName,
                                auditor_name:userData.fullName,
                                audit_name:newAuditData.auditName,
                                audit_locations:locationString,
                                audit_status:newAuditData.auditStatus ? newAuditData.auditStatus.name : "",
                                start_date: payload.startDate?moment(payload.startDate).format('DD-MM-YYYY'):"Not Specified",
                                end_date: payload.endDate?moment(payload.endDate).format('DD-MM-YYYY'):"Not Specified",
                                auditors: auditorsString
                            }
                        };
                        [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));
                    }else{
                        let metadata={
                            email:userData.email,
                            mail_cc:newAuditData.company.email,
                            sgTemplate:"d-519b57955ab64dd083cc30f621d1aab7",
                            emailBody:{
                                subject:"Audit Assignement - "+newAuditData.company.companyName,
                                company:newAuditData.company.companyName,
                                creationText:"A new audit has been created and assigned to you. Please find the details below.",
                                created_by:newAuditData.createdBy.fullName,
                                auditor_name:userData.fullName,
                                audit_name:newAuditData.auditName,
                                audit_locations:locationString,
                                audit_status:newAuditData.auditStatus ? newAuditData.auditStatus.name : "",
                                start_date: payload.startDate?moment(payload.startDate).format('DD-MM-YYYY'):"Not Specified",
                                end_date: payload.endDate?moment(payload.endDate).format('DD-MM-YYYY'):"Not Specified",
                                auditors: auditorsString
                            }
                        };
                        [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));
                    }
                });
            }
        }
        [err,allAudits] = await to(Audit.find({"company": company}).sort({"createdAt": -1}));
        if(err) {TE(err.message);}
    
        return (allAudits)?{data: allAudits, permissions: obj}:false;
    }else{
        {TE(payload.auditName+" Audit already exists");}
    }
},
getAllAuditList: async function(company, user){
    let err, audits, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": user.role._id},{"audit":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].audit;
    };

    if(user.role.roleName=='SUPERUSER'){
        [err, audits] = await to(Audit.aggregate([
                            {
                                $match : {"company" : new mongoose.Types.ObjectId(company)}
                            },{
                                $lookup: {
                                    from: "locations",
                                    localField: "locationId",
                                    foreignField: "_id",
                                    as: "audit_locations"
                                }
                            },{
                                $lookup: {
                                    from: "user_dropdowns",
                                    localField: "assetTypeId",
                                    foreignField: "_id",
                                    as: "AssetType"
                                }
                            },{
                                $lookup: {
                                    from: "assets",
                                    localField: "locationId",
                                    foreignField: "location",
                                    as: "AssetTypecount"
                                } 
                            },{
                                $lookup: {
                                    from: "company_contacts",
                                    localField: "auditUserId",
                                    foreignField: "_id",
                                    as: "auditUser"
                                }
                            },{
                                $lookup: {
                                    from: "admin_dropdowns",
                                    localField: "auditStatus",
                                    foreignField: "_id",
                                    as: "auditStatus"
                                }
                            },{
                                $lookup: {
                                    from: "audit_report",
                                    localField: "_id",
                                    foreignField: "auditId",
                                    as: "auditReport"
                                }
                            },{
                                $lookup: {
                                    from: "audit_assets",
                                    localField: "_id",
                                    foreignField: "auditId",
                                    as: "audit_assets"
                                }
                            },{
                                $project: {
                                    "_id": 1, "completedOn": 1, "auditName": 1,"locationId" : "$audit_locations",
                                    "auditStatus.name": 1, "assetTypeId": "$AssetType.name",
                                    "assetsCount": {"$size":"$audit_assets"}, "status": 1,
                                    "auditUserId": "$auditUser.fullName", "startDate": 1,
                                    "endDate": 1, "audit_assets": 1, "createdAt": 1
                                }
                            }]).sort({"createdAt": -1}));
        if(err) {TE(err.message, true);}

        if(audits.length > 0){
            await audits.forEach(auditAsset => {
                let verifiedCounter = 0, unverifiedCounter = 0;

                if(auditAsset.audit_assets.length > 0){
                    auditAsset.audit_assets.forEach(data => {
                        (data.isVerified == false) ? unverifiedCounter += 1 : verifiedCounter += 1;
                    });
                }
                auditAsset["verifiedAssets"] = verifiedCounter;
                auditAsset["unverifiedAssets"] = unverifiedCounter;
            });
        }
    }else{
            [err, audits] = await to(Audit.aggregate([
                {
                    $match : {
                            "company" : new mongoose.Types.ObjectId(company),
                            $or: [{
                                "auditUserId": new mongoose.Types.ObjectId(user._id)
                            },{
                                "createdBy": new mongoose.Types.ObjectId(user._id)
                            }]
                        }
                },{
                    $lookup: {
                        from: "locations",
                        localField: "locationId",
                        foreignField: "_id",
                        as: "audit_locations"
                    }
                },{
                    $lookup: {
                        from: "user_dropdowns",
                        localField: "assetTypeId",
                        foreignField: "_id",
                        as: "AssetType"
                    }
                },{
                    $lookup: {
                        from: "assets",
                        localField: "locationId",
                        foreignField: "location",
                        as: "AssetTypecount"
                    } 
                },{
                    $lookup: {
                        from: "company_contacts",
                        localField: "auditUserId",
                        foreignField: "_id",
                        as: "auditUser"
                    }
                },{
                    $lookup: {
                        from: "admin_dropdowns",
                        localField: "auditStatus",
                        foreignField: "_id",
                        as: "auditStatus"
                    }
                },{
                    $lookup: {
                        from: "audit_report",
                        localField: "_id",
                        foreignField: "auditId",
                        as: "auditReport"
                    }
                },{
                    $lookup: {
                        from: "audit_assets",
                        localField: "_id",
                        foreignField: "auditId",
                        as: "audit_assets"
                    }
                },{
                    $project: {
                        "_id": 1, "completedOn": 1, "auditName": 1,"locationId": "$audit_locations",
                        "auditStatus.name": 1, "assetTypeId": "$AssetType.name",
                        "assetsCount": {"$size": "$audit_assets"},
                        "status": 1, "auditUserId": "$auditUser.fullName", "startDate": 1,
                        "endDate": 1, "audit_assets": 1, "createdAt": 1
                    }
                }]).sort({"createdAt": -1}));
        if(err) {TE(err.message, true);}

        if(audits.length > 0){
            await audits.forEach(auditAsset => {
                let verifiedCounter = 0, unverifiedCounter = 0;

                if(auditAsset.audit_assets.length > 0){
                    auditAsset.audit_assets.forEach(data => {
                        (data.isVerified == false) ? unverifiedCounter += 1 : verifiedCounter += 1;
                    });
                }
                auditAsset["verifiedAssets"] = verifiedCounter;
                auditAsset["unverifiedAssets"] = unverifiedCounter;
            });
        }
    }
    return audits?{data: audits, permissions: obj}:false;
},

getUpdatedAudit: async function(auditId, payload, role){
    let err, audit, updatedaudit, duplicateData;
    let allAudits, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"audit":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].audit;
    };

    [err,audit]= await to(Audit.findOne({"_id": auditId}));
    if(err) {TE(err.message, true);}

    if(audit){
        if(audit.auditName == payload.auditName){
            audit.locationId  =  payload.location?payload.location:audit.locationId;
            audit.assetTypeId =  payload.assetTypeId?payload.assetTypeId:audit.assetTypeId;
            audit.auditUserId =  payload.auditUserId?payload.auditUserId:audit.auditUserId;
            audit.startDate   =  payload.startDate?payload.startDate:audit.startDate;
            audit.endDate     =  payload.endDate?payload.endDate:audit.endDate;
            audit.auditStatus =  payload.auditStatus?payload.auditStatus:audit.auditStatus;
            audit.status      =  payload.status!=null?payload.status:audit.status;
            audit.completedOn =  payload.completedOn!=null?payload.completedOn:audit.completedOn;
  
            [err,updatedaudit]= await to(audit.save());
            if(err) {TE(err.message, true);}
    
            if(updatedaudit){
                await this.sendAuditUpdateEmails(auditId);
            }

            [err, allAudits] = await to(Audit.aggregate([
                {
                    $lookup: {
                        from: "locations",
                        localField: "locationId",
                        foreignField: "_id",
                        as: "audit_locations"
                    }
                },{
                    $lookup: {
                        from: "user_dropdowns",
                        localField: "assetTypeId",
                        foreignField: "_id",
                        as: "AssetType"
                    }
                },{
                    $lookup: {
                        from: "company_contacts",
                        localField: "auditUserId",
                        foreignField: "_id",
                        as: "auditUser"
                    }
                },{
                    $project: {
                        createdAt: {
                            $dateToString: {
                                format: "%d-%m-%G",
                                date: "$createdAt"
                            }
                        },
                        "_id":1, "auditName": 1,"locationId" : "$audit_locations.name",
                        "assetTypeId" : "$AssetType.name",
                        "status": 1,"auditUserId": "$auditUser.fullName","startDate":1,"endDate":1
                    }
                }]).sort({"createdAt":-1}));
    
            return allAudits?{data: allAudits, permissions: obj}:false;
        }else{
            [err, duplicateData] = await to(Audit.find({"company": audit.company, "auditName": payload.auditName}));
            if(err) {TE(err.message, true);}

            if(duplicateData.length <= 0){
               
                audit.auditName   =  payload.auditName? payload.auditName:audit.auditName;
                audit.locationId  =  payload.location?payload.location:audit.locationId;
                audit.assetTypeId =  payload.assetTypeId?payload.assetTypeId:audit.assetTypeId;
                audit.auditUserId =  payload.auditUserId?payload.auditUserId:audit.auditUserId;
                audit.startDate   =  payload.startDate?payload.startDate:audit.startDate;
                audit.endDate     =  payload.endDate?payload.endDate:audit.endDate;
                audit.auditStatus =  payload.auditStatus?payload.auditStatus:audit.auditStatus;
                audit.status      =  payload.status?payload.status:audit.status;
        
                [err,updatedaudit]= await to(audit.save());
                if(err) {TE(err.message, true);}

                if(updatedaudit){
                    await this.sendAuditUpdateEmails(auditId);
                }

                [err, allAudits] = await to(Audit.aggregate([
                    {
                        $lookup: {
                            from: "locations",
                            localField: "locationId",
                            foreignField: "_id",
                            as: "audit_locations"
                        }
                    },{
                        $lookup: {
                            from: "user_dropdowns",
                            localField: "assetTypeId",
                            foreignField: "_id",
                            as: "AssetType"
                        }
                    },{
                        $lookup: {
                            from: "company_contacts",
                            localField: "auditUserId",
                            foreignField: "_id",
                            as: "auditUser"
                        }
                    },{
                        $project: {
                            createdAt: {
                                $dateToString: {
                                    format: "%d-%m-%G",
                                    date: "$createdAt"
                                }
                            },
                            "_id":1, "auditName": 1,"locationId" : "$audit_locations.name",
                            "assetTypeId" : "$AssetType.name",
                            "status": 1,"auditUserId": "$auditUser.fullName","startDate":1,"endDate":1
                        }
                    }]).sort({"createdAt":-1}));
        
                return allAudits?{data: allAudits, permissions: obj}:false;
            }else{
                {TE(audit.auditName+" Audit already exists!");}
            }
        }
    }else{
        {TE("Audit not found");}
    }
},

getOneAudit: async function(auditId, role){
    let err, audit, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"audit":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].audit;
    };

    [err, audit] = await to(Audit.aggregate([
            {
                "$match" : {"_id" : new mongoose.Types.ObjectId(auditId)}
            },{
                $lookup: {
                    from: "admin_dropdowns",
                    localField: "auditStatus",
                    foreignField: "_id",
                    as: "audit_status"
                }
            },{
                $lookup: {
                    from: "locations",
                    localField: "locationId",
                    foreignField: "_id",
                    as: "audit_locations"
                }
            },{
                $lookup: {
                    from: "user_dropdowns",
                    localField: "assetTypeId",
                    foreignField: "_id",
                    as: "AssetType"
                }
            },{
                $lookup: {
                    from: "company_contacts",
                    localField: "auditUserId",
                    foreignField: "_id",
                    as: "auditUser"
                }
            },{
                $project: {
                    createdAt: {
                        $dateToString: {
                            format: "%d-%m-%G",
                            date: "$createdAt"
                        }
                    },
                    "_id":1, "auditName": 1,"locationId" :"$audit_locations",
                    "assetTypeId" :"$AssetType", "auditStatus":"$audit_status",
                    "status": 1,"auditUserId":"$auditUser","startDate":1,"endDate":1
                }
            }]).sort({"createdAt":-1}));

    if(err) {TE(err.message, true);}

    return audit?{data: audit, permissions: obj}:false;
},
getAssetListAudit: async function(auditId, role){
    let err, assetsList, roleData, obj,auditData,auditimageData;
    let Objvalue, auditassetsList, imageData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"audit":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].audit;
    };

    [err, auditData] = await to(Audit.findById({"_id": auditId}));

    [err, assetsList] = await to(Assets.find({"location":{$in: auditData.locationId}})
                                        .populate('category',['name'])
                                        .populate('location',['name'])
                                        .populate('asset_status',['name'])
                                        .populate({
                                            path : 'auditIds',
                                            populate: { 
                                                path:  'auditedBy',
                                                model: 'company_contacts',
                                                select: {'fullName':1},
                                            },
                                            select: { '_id': 1,"auditId":1},
                                        })
                                        .populate({
                                            path : 'auditIds',
                                            populate: { 
                                                path:  'assetAvailability',
                                                model: 'admin_dropdowns',
                                                select: {'name':1},
                                            },
                                            select: { '_id': 1},
                                        })
                                        .populate({
                                            path : 'auditIds',
                                            populate: { 
                                                path:  'comments.commentedBy',
                                                model: 'company_contacts',
                                                select: {'fullName':1},
                                            },
                                            select: { '_id': 1},
                                        })
                                        .populate({
                                            path : 'auditIds',
                                            populate: { 
                                                path:  'comments.assetAvailability',
                                                model: 'admin_dropdowns',
                                                select: {'name':1},
                                            },
                                            select: { '_id': 1},
                                        }).populate({
                                            path : 'auditIds',
                                            populate: { 
                                                path:  'comments.assetCodition',
                                                model: 'admin_dropdowns',
                                                select: {'name':1},
                                            },
                                            select: { '_id': 1},
                                        })
                                        .populate({
                                            path : 'auditIds',
                                            populate: { 
                                                    path:  'assetCodition',
                                                    model: 'admin_dropdowns',
                                                    select: {'name':1},
                                                },
                                            select: { '_id': 1, 'verificationStatus': 1,'verificationDate': 1,"auditId":'comments.auditId','comments':1},
                                        }));

    if(err) {TE(err, true);}
    
    if(assetsList.length > 0){
        [err, imageData] = await to(AssetImages.find({"company":assetsList[0].company}));
        if(err) {TE(err.message);}
        
        [err, auditimageData] = await to(AuditImages.find({'company':assetsList[0].company, "auditId" : auditId}));
        if(err) {TE(err.message);}
    }else{
        imageData = [];
        auditimageData = [];
    }
    
    Objvalue = {
        "assetsList": assetsList,
        "auditData": auditData,
        "ImageData": imageData,
        "auditimageData": auditimageData
    };

    return assetsList?{data: Objvalue, permissions: obj}:false;
},

newAuditReport: async function(auditAssetId, company, payload, role){
    let err, auditReport,createAudit, allReports, roleData, obj;
    let duplicateData,auditReportData,auditData,assets,assetsList; 
    let auditAssetsData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"audit": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].audit;
    };

    [err, auditAssetsData] = await to(AuditAssets.findOne({"_id": auditAssetId}));
    if(err) {TE(err, true);}
    
    [err, duplicateData] = await to(AuditReports.find({"company": company, "auditId": payload.auditId,
                                                    "assetId": payload.assetId}));
    if(err) {TE(err, true);}

    if(duplicateData.length <= 0){
        [err, auditReport] = await to(AuditReports.create({
            company             : company,
            auditId             : payload.auditId?payload.auditId:null,
            assetId             : payload.assetId?payload.assetId:null,
            auditAssetId        : auditAssetId,
            comments            : payload.comments?{
                                                        comment:payload.comments.comment, 
                                                        commentedBy:payload.comments.commentedBy,
                                                        assetAvailability:payload.comments.assetAvailability,
                                                        assetCodition:payload.comments.assetCodition,
                                                        commentedTime  :Date.now(), 
                                                        auditId:payload.comments.auditId,
                                                        assetId:payload.comments.assetId
                                                        }:null,
            auditedBy           : payload.auditedBy?payload.auditedBy:null,
            assetAvailability   : payload.assetAvailability?payload.assetAvailability:null,
            assetCodition       : payload.assetCodition?payload.assetCodition:null,
            verificationStatus  : payload.verificationStatus?payload.verificationStatus:0,
            verificationDate    : payload.verificationDate?payload.verificationDate:null
        }));
        if(err) {TE(err.message, true);}

        [err, auditReportData] = await to(AuditReports.find({"auditId":payload.auditId,"assetId":payload.assetId}));
        if(err) {TE(err, true);}

        [err,assets] = await to(Assets.findOne({"_id":payload.assetId}));
        if(err) {TE(err, true);}

        if(auditReportData.length>=1){
            if(payload.status==true){
                assets.auditIds.push(auditReportData[0]._id);
                assets.auditAssetAvailability=1;
                assets.auditId=auditReportData[0]._id;
                assets.audit=payload.auditId;
                assets.save();

                auditAssetsData.auditDoneBy = payload.auditedBy?payload.auditedBy:null;
                auditAssetsData.isVerified  = payload.verificationStatus?payload.verificationStatus:0;
                auditAssetsData.auditedOn   = payload.verificationDate?payload.verificationDate:null;
                auditAssetsData.save();
            }else{
                assets.auditIds.push(auditReportData[0]._id);
                assets.auditAssetAvailability=0;
                assets.auditId=auditReportData[0]._id;
                assets.audit=payload.auditId;
                assets.save();

                auditAssetsData.auditDoneBy = payload.auditedBy?payload.auditedBy:null;
                auditAssetsData.isVerified  = payload.verificationStatus?payload.verificationStatus:0;
                auditAssetsData.auditedOn   = payload.verificationDate?payload.verificationDate:null;
                auditAssetsData.save();
                
            }
        }else{
            if(payload.status==true){
                assets.auditAssetAvailability=1;
                assets.save();

                auditAssetsData.auditDoneBy = payload.auditedBy?payload.auditedBy:null;
                auditAssetsData.isVerified  = payload.verificationStatus?payload.verificationStatus:0;
                auditAssetsData.auditedOn   = payload.verificationDate?payload.verificationDate:null;
                auditAssetsData.save();
            }else{
                assets.auditAssetAvailability=0;
                assets.save();

                auditAssetsData.auditDoneBy = payload.auditedBy?payload.auditedBy:null;
                auditAssetsData.isVerified  = payload.verificationStatus?payload.verificationStatus:0;
                auditAssetsData.auditedOn   = payload.verificationDate?payload.verificationDate:null;
                auditAssetsData.save();
            }
        }

        [err, auditData] = await to(Audit.findById({"_id": payload.auditId}));
        if(err) {TE(err, true);}

        [err, assetsList] = await to(AuditAssets.find({"auditId": payload.auditId})
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
                                            );
        if(err) {TE(err, true);}

        [err, imageData] = await to(AssetImages.find({"company":assetsList[0].company}));
        if(err) {TE(err.message);}
        
        [err, auditimageData] = await to(AuditImages.find({'company':assetsList[0].company, "auditId" : payload.auditId}));
        if(err) {TE(err.message);}

        let Objvalue={
            "data":assetsList,
            "auditData":auditData,
            "ImageData":imageData,
            "auditimageData":auditimageData,
            "Commentdata":auditReportData
        };

        return assetsList?{data: Objvalue, permissions: obj}:false;

    }else if(duplicateData.length >= 1){
        let err, auditUpdate, auditData, updatedauditreport, assetsList;

        [err, auditUpdate] = await to(AuditReports.findOne({"company": company, "auditId": payload.auditId,
                                                    "assetId": payload.assetId}));
        if(err) {TE(err, true);}

        if(auditUpdate){
            if(auditUpdate.auditId == payload.auditId){
                auditUpdate.comments.push(payload.comments);
                auditUpdate.auditedBy               = payload.auditedBy?payload.auditedBy:auditUpdate.auditedBy;
                auditUpdate.assetAvailability       = payload.assetAvailability?payload.assetAvailability:auditUpdate.assetAvailability;
                auditUpdate.assetCodition           = payload.assetCodition?payload.assetCodition:auditUpdate.assetCodition;
                auditUpdate.verificationStatus      = payload.verificationStatus?payload.verificationStatus:auditUpdate.verificationStatus;
                auditUpdate.verificationDate        = payload.verificationDate?payload.verificationDate:auditUpdate.verificationDate;

                auditAssetsData.auditDoneBy = payload.auditedBy?payload.auditedBy:auditUpdate.auditedBy;
                auditAssetsData.isVerified  = payload.verificationStatus?payload.verificationStatus:auditUpdate.verificationStatus;
                auditAssetsData.auditedOn   = payload.verificationDate?payload.verificationDate:auditUpdate.verificationDate;
                auditAssetsData.save();

                [err,updatedauditreport]= await to(auditUpdate.save());
                if(err) {TE(err.message, true);}

                [err, auditData] = await to(Audit.findById({"_id":payload.auditId}));
                if(err) {TE(err, true);}

                [err, assetsList] = await to(AuditAssets.find({"auditId": payload.auditId})
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
                                                    );
                if(err) {TE(err, true);}

                [err, imageData] = await to(AssetImages.find({"company":assetsList[0].company}));
                if(err) {TE(err.message);}

                [err, auditimageData] = await to(AuditImages.find({'company':assetsList[0].company, "auditId" : payload.auditId}));
                if(err) {TE(err.message);}

                [err, auditReportData] = await to(AuditReports.find({"auditId":payload.auditId,
                                                                    "assetId":payload.assetId}));
                if(err) {TE(err, true);}

                let Objvalue={
                    "data":assetsList,
                    "auditData":auditData,
                    "ImageData":imageData,
                    "auditimageData":auditimageData,
                    "Commentdata":auditReportData
                };

                return assetsList?{data: Objvalue, permissions: obj}:false;

            }else{
                {TE(" Audit Report not Found");}
            }
        }else{
            {TE(" Audit Report not Found");}
        }
    }else{
        {TE(" Audit Report already exists");}
    }
},

getAuditActivityLog: async function(company,auditId,role){
    let err, activityList, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"audit":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].audit;
    };

    [err, activityList] = await to(AuditReports.findOne({"_id":auditId})
                                                .populate("comments.commentedBy",['fullName'])
                                                .populate("comments.assetAvailability",['name'])
                                                .populate("comments.assetCodition",['name'])
                                                .populate("comments.assetId",['asset_name','asset_code'])
                                                .populate("comments.auditId",['auditName'])
                                                .sort({"createdAt":-1}));

    if(err) {TE(err, true);}

    [err, imageData] = await to(AuditImages.find({'company':company}));
    if(err) {TE(err.message);}
    
    return activityList?{data: activityList, imageData:imageData, permissions: obj}:false;
},

sendAuditUpdateEmails: async function(auditId){
    let err, start_date, end_date;
    let auditLocationsArray=[], locationString;
    let auditAssetTypeArray=[], assetTypeString;
    let auditorsArray=[], auditorsString;

    [err, newAuditData] = await to(Audit.findById(auditId)
                                        .populate('company',['companyName','email'])
                                        .populate('locationId',['name'])
                                        .populate('assetTypeId',['name'])
                                        .populate('auditStatus',['name'])
                                        .populate('auditUserId',['fullName','email'])
                                        .populate('createdBy',['fullName','email']));
    
    start_date = moment(newAuditData.startDate).format('DD-MM-YYYY');
    end_date = moment(newAuditData.endDate).format('DD-MM-YYYY');

    if(newAuditData.assetTypeId.length > 0){
        newAuditData.assetTypeId.forEach(data => {
            auditAssetTypeArray.push(data.name);
        });
    }
    assetTypeString = auditAssetTypeArray.join(', ');

    if(newAuditData.locationId.length > 0){
        newAuditData.locationId.forEach(data => {
            auditLocationsArray.push(data.name);
        });
    }
    locationString = auditLocationsArray.join(', ');

    if(newAuditData.auditUserId.length > 0){
        newAuditData.auditUserId.forEach(data => {
            auditorsArray.push(data.fullName);
        });
    }
    auditorsString = auditorsArray.join(', ');

    if(newAuditData.auditUserId.length > 0){
        newAuditData.auditUserId.forEach(async userData => {
            if(userData.email == newAuditData.company.email){
                let metadata={
                    email:userData.email,
                    mail_cc:"",
                    sgTemplate:"d-519b57955ab64dd083cc30f621d1aab7",
                    emailBody:{
                        subject:"Audit Update - "+newAuditData.company.companyName,
                        company:newAuditData.company.companyName,
                        creationText:"An audit details assigned to you have been modified. Please find the updated details below.",
                        created_by:newAuditData.createdBy.fullName,
                        auditor_name:userData.fullName,
                        audit_name:newAuditData.auditName,
                        audit_locations:locationString,
                        audit_status:newAuditData.auditStatus ? newAuditData.auditStatus.name : "",
                        start_date: newAuditData.startDate?start_date:"Not Specified",
                        end_date: newAuditData.endDate?end_date:"Not Specified",
                        auditors: auditorsString
                    }
                };
                [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));

                return "Success";
            }else{
                let metadata={
                    email:userData.email,
                    mail_cc:newAuditData.company.email,
                    sgTemplate:"d-519b57955ab64dd083cc30f621d1aab7",
                    emailBody:{
                        subject:"Audit Update - "+newAuditData.company.companyName,
                        company:newAuditData.company.companyName,
                        creationText:"An audit details assigned to you have been modified. Please find the updated details below.",
                        created_by:newAuditData.createdBy.fullName,
                        auditor_name:userData.fullName,
                        audit_name:newAuditData.auditName,
                        audit_locations:locationString,
                        audit_status:newAuditData.auditStatus ? newAuditData.auditStatus.name : "",
                        start_date: newAuditData.startDate?start_date:"Not Specified",
                        end_date: newAuditData.endDate?end_date:"Not Specified",
                        auditors: auditorsString
                    }
                };
                [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));

                return "Success";
            }
        });
    }else{
        return "Failure";
    }
}
}