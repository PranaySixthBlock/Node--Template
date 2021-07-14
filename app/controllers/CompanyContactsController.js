'use strict'
const {to} = require('../middlewares/utilservices');
const CompanyContactsService = require('../services/CompanyContactsService');
const CompanyContacts = require('../models/CompanyContacts');
const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();

module.exports={
addMemberToCompany: async function(req,res){
    let err, newMember;
    let roleId = req.user.role._id;

    [err,newMember]= await to(CompanyContactsService.addNewMemberToCompany(req.params.userId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(newMember && newMember!==false){
        return res.status(200).json({"status": 200,"success": true,"data": newMember});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot add user to company. Try again!"});
    }
},

updateMemberDetails: async function (req, res) {
    let err, memberData;
    let roleId = req.user.role._id;

    [err,memberData]= await to(CompanyContactsService.editMemberDetails(req.params.memberId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(memberData && memberData!==false){
        return res.status(200).json({"status": 200,"success": true,"data": memberData});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not update member. Try again!"});
    }
},

getAllMembers: async function(req,res){
    let err, memberData;
    let roleId = req.user.role._id;

    [err,memberData]= await to(CompanyContactsService.getCompnayMembers(req.params.companyId, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
   
    if(memberData && memberData!==false){
        return res.status(200).json({"status": 200,"success": true,"data": memberData});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not get details. Try again!"});
    }
},

getOneMember: async function(req,res){
    let err, memberData;
    let roleId = req.user.role._id;

    [err,memberData]= await to(CompanyContactsService.getOneMember(req.params.userId,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
   
    if(memberData && memberData!==false){
        return res.status(200).json({"status": 200,"success": true,"data": memberData});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not get details. Try again!"});
    }
},

deleteMember: async function(req,res){
    let err, memberData;
    let roleId = req.user.role._id;

    [err,memberData]= await to(CompanyContactsService.deleteCompanyMember(req.params.companyId,req.params.userId,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(memberData && memberData!==false){
        return res.status(200).json({"status": 200,"success": true,"data": memberData});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not delete member details. Try again!"});
    }
},
SearchUsersController : async function(req,res){
    let err, assets;
    let roleId = req.user.role._id;

    [err, assets] = await to(CompanyContactsService.filterUserNames(req.params.companyId, roleId, req.params.uname, req));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(assets && assets!==false){
        return res.status(200).json({"status": 200,"success": true,"data": assets});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot get users. Try again!"});
    }
},

userForgotPasscode: async function(req, res){
    let err, data;

    [err, data] = await to(CompanyContactsService.updateUserPassword(req.body));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't update user password. Try again!"});
    }
},

resetPassword: async function(req, res){
    let err, userObj, saveduser;
    let decipher, textParts, parsedText;
    let decrypted, encryptedText, iv;

    textParts = req.body.token.split(':');
    iv = Buffer.from(textParts.shift(), 'hex');
    encryptedText = Buffer.from(textParts.join(':'), 'hex');

    decipher = crypto.createDecipheriv(process.env.ENCRPYT_ALG,
                                        Buffer.concat([Buffer.from(process.env.ENCRPYT_KEY), 
                                        Buffer.alloc(32)], 32), iv); 
    decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    parsedText = JSON.parse(decrypted);
    
    
    [err, userObj] = await to(CompanyContacts.findOne({"email": parsedText.email})
                                                .populate('company',["accountid","email","status"]));
    
    if(err) return res.status(500).json({"message": err, "success": false, "status": 500});

    if(!userObj || userObj == false){
        return res.status(400).json({
                                    "message":"Sorry, we can't find a User with this email. Try with a valid email",
                                    "success":false,
                                    "status":400
                                });
    }

    if(userObj){
        // [err, saveduser] = await to(CompanyContacts.findOneAndUpdate({"email": parsedText.email},
        //                                                             {"password": req.body.newPassword}));

       userObj.password = req.body.newPassword;

       [err, saveduser] = await to(userObj.save());
       if(err) return res.status(500).json({"message": err, "success": false, "status": 500});

       if(saveduser){
            return res.status(200).json({"status": 200,"success": true,"data": userObj});
       }
    }
}
}