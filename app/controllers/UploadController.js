const fs    = require('fs');
const path  = require('path');
const multer= require('multer');
const {to,TE}= require('../middlewares/utilservices');
const TicketImages = require('../models/TicketImages');
const AssetImages = require('../models/AssetImages');
const Company = require('../models/Company');
const Tickets = require('../models/Tickets');
const AuditImages=require('../models/AuditImages');
// var UploadService = require('../services/UploadService');

/**
 * Assets Upload
 */
var asset_storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        var uploadDir = path.join(__dirname+'../../../public/uploads/assets/');
        callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
        var tempname = file.originalname.split(".");
        var filename = "asset_"+req.params.companyId+"_"+tempname[0]+"."+tempname[1];
        callback(null, filename);
    }
});
var assets_upload = multer({ storage : asset_storage }).array('images',5);

/**
 * Tickets Upload
 */
var ticket_storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        var ticketUploadDir = path.join(__dirname+'../../../public/uploads/tickets/');
        callback(null, ticketUploadDir);
    },
    filename: function (req, file, callback) {
        var tempname = file.originalname.split(".");
        var filename = "ticket_"+req.params.companyId+"_"+tempname[0]+"."+tempname[1];
        callback(null, filename);
    }
});
var ticket_upload = multer({ storage : ticket_storage }).array('tickets',5);

/**
 * Ticket Comments Images Upload
 */
var ticketComments_storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        var ticketUploadDir = path.join(__dirname+'../../../public/uploads/ticketComments/');
        callback(null, ticketUploadDir);
    },
    filename: function (req, file, callback) {
        var tempname = file.originalname.split(".");
        var filename = "ticket_"+req.params.companyId+"_"+tempname[0]+"."+tempname[1];
        callback(null, filename);
    }
});
var ticketComments_upload = multer({ storage : ticketComments_storage }).array('tickets',5);

/**
 * Company Logo Upload
 */
var company_storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        var companyUploadDir = path.join(__dirname+'../../../public/uploads/company/');
        callback(null, companyUploadDir);
    },
    filename: function (req, file, callback) {
        var tempname = file.originalname.split(".");
        var filename = "logo_"+req.params.companyId+"_"+tempname[0]+"."+tempname[1];
        callback(null, filename);
    }
});
var company_upload = multer({ storage : company_storage }).single('companyLogo');

/**
 * Assets Upload
 */
var asset_documents_storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        var uploadDir = path.join(__dirname+'../../../public/uploads/assets/');
        callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
        var tempname = file.originalname.split(".");
        var filename = tempname[0]+"."+tempname[1];
        callback(null, filename);
    }
});
var assets_document_upload = multer({ storage : asset_documents_storage }).array('asset_documents',5);


var audit_storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        var uploadDir = path.join(__dirname+'../../../public/uploads/assets/');
        callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
        var tempname = file.originalname.split(".");
        var filename = "audit_"+req.params.companyId+"_"+tempname[0]+"."+tempname[1];
        callback(null, filename);
    }
});
var audit_upload = multer({ storage : audit_storage }).array('audits',5);

module.exports = {
    
uploadAssetPhotos: async function(req, res){
    assets_upload(req,res,async function(err) {
        if(err) {
            res.status(400).json({"status": 400,"success": false,"message": err});
        }else{
            return res.status(200).json({"status": 200,"success": false,"data": req.files});
        }
    });
},

uploadTicketPhotos: async function(req, res){
    ticket_upload(req,res,async function(err) {
        if(err) {
            res.status(400).json({"status": 400,"success": false,"message": err});
        }else{
            return res.status(200).json({"status": 200,"success": false,"data": req.files});
        }
    });
},

getDeviceImages: async function(req, res){
    let err, data;
    [err, data] = await to(UploadService.getImagesList(req.params.imageType,req.params.templateId,req.params.deviceId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't get device images. Try Again!"});
    }
},

removeImage: async function(req, res){
    let err, data;
    [err, data] = await to(UploadService.deleteImage(req.params.deviceId,req.params.imageId));
    if(err) return res.status(500).json({"status": 500, "success": false, "message":err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't delete device images. Try Again!"});
    }
},

uploadCompanyLogo: async function(req, res){
    company_upload(req,res,async function(err) {
        if(err) {
            res.status(400).json({"status": 400,"success": false,"message": err});
        }else{
            let err, data;
            [err, data] = await to(Company.updateOne({"_id":req.params.companyId},{$set: {"logo": req.file.filename}}));
            if(err || !data) res.status(500).json({"status": 500,"success": false,"message": err.message});
            return res.status(200).json({"status": 200,"success": true,"data": data});
        }
    });
},

uploadGroupwiseImages: async function(req, res){
    ticket_upload(req,res,async function(err) {
        if(err) {
            res.status(400).json({"status": 400,"success": false,"message": err.message});
        }
        let err1, images, uploadImages;
        let ticketTimeline, timelineObj;
        let uploadedImages = [], message;

        await req.files.forEach(async(data) => {
            [err1,images] = await to(TicketImages.create({
                path     : data.path,
                mimetype : data.mimetype,
                encoding : data.encoding,
                filename : data.filename,
                destination : data.destination,
                company   : req.params.companyId,
                ticketId  : req.params.ticketId
            }).then(async result => {
                await uploadedImages.push(result._id);
            }));
            if(err1) TE(err1.message);
        });

        if(req.query.type == "update"){
            if(req.files.length == 1){
                message = "One image has been added to this ticket";
            }else{
                message = req.files.length+" images have been added to this ticket";
            }

            [err1, ticketTimeline] = await to(Tickets.findById(req.params.ticketId));
            
            timelineObj = {
                message    : message,
                time       : Date.now(),
                messagedBy : req.user._id,
                images     : uploadedImages
            }

            ticketTimeline.timeline.push(timelineObj);
            ticketTimeline.save();
        }

        return res.json({"status": 200,"success": true,"data": req.files});
    });
},
uploadGroupwiseAssetImages: async function(req, res){
    assets_upload(req,res,async function(err) {
        if(err) {
            res.status(400).json({"status": 400,"success": false,"message": err.message});
        }
        let err1, images, devices, deviceData, templateData, uploadImageId, uploadImages, data;
        req.files.forEach(async(data) => {
            [err1,images] = await to(AssetImages.create({
                path     : data.path,
                mimetype : data.mimetype,
                encoding : data.encoding,
                filename : data.filename,
                destination : data.destination,
                company   : req.params.companyId,
                assetId  : req.params.assetId
            }));
            if(err1) TE(err1.message);
            images.save();
        }); 
        return res.json({"status": 200,"success": true,"data": req.files});
    });
},

uploadAuditImages: async function(req, res){
    audit_upload(req,res,async function(err) {
        if(err) {
            res.status(400).json({"status": 400,"success": false,"message": err.message});
        }
        let err1, images, oldData, auditimageData, flag = 0;
        oldData = JSON.parse(req.body.oldData);
        
        const setImages =  (newData, oldData) => {
            newData.forEach(async(data) => {
                [err1,images] = await to(AuditImages.create({
                    path     : data.path,
                    mimetype : data.mimetype,
                    encoding : data.encoding,
                    filename : data.filename,
                    destination : data.destination,
                    company   : req.user.company._id,
                    auditId   : req.params.auditId,   
                    auditReoportId : req.params.auditReoportId,
                }));
                if(err1) TE(err1.message);

                images.save();
            });

            oldData.forEach(async(data) => {
                [err1,images] = await to(AuditImages.create({
                    path     : data.path,
                    mimetype : data.mimetype,
                    encoding : data.encoding,
                    filename : data.filename,
                    destination : data.destination,
                    company   : req.user.company._id,
                    auditId   : req.params.auditId,  
                    auditReoportId : req.params.auditReoportId,
                }));
                if(err1) TE(err1.message);

                images.save();
            });
        }
        await setImages(req.files, oldData);
        
        [err, auditimageData] = await to(AuditImages.find({'company':req.user.company._id, "auditId" : req.params.auditId}));
        if(err) {TE(err.message);}

        return res.json({"status": 200,"success": true,"data": auditimageData});
    });
},

uploadTicketCommentsImages: async function(req, res){
    ticketComments_upload(req,res,async function(err) {
        if(err) {
            res.status(400).json({"status": 400,"success": false,"message": err.message});
        }
        let err1, images, devices, deviceData, templateData, uploadImageId, uploadImages, data;
        req.files.forEach(async(data) => {
            [err1,images] = await to(TicketImages.create({
                path     : data.path,
                mimetype : data.mimetype,
                encoding : data.encoding,
                filename : data.filename,
                destination : data.destination,
                company   : req.params.companyId,
                ticketId  : req.params.ticketId,
                isComment: 1
            }));
            if(err1) TE(err1.message);
            images.save();
        }); 
        return res.json({"status": 200,"success": true,"data": req.files});
    });
},

uploadAssetDocuments: async function(req, res){
    assets_document_upload(req, res, async function(err) {
        if(err) {
            res.status(400).json({"status": 400,"success": false,"message": err.message});
        }
        let err1, documents;
        req.files.forEach(async(data) => {
            [err1, documents] = await to(AssetImages.create({
                path     : data.path,
                mimetype : data.mimetype,
                encoding : data.encoding,
                filename : data.filename,
                destination : data.destination,
                company     : req.params.companyId,
                assetId     : req.params.assetId,
                isDocument  : 1
            }));
            if(err1) TE(err1.message);
            documents.save();
        }); 
        return res.json({"status": 200,"success": true,"data": req.files});
    });
}
}