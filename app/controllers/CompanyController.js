'use strict'
const {to} = require('../middlewares/utilservices');
var CompanyService = require('../services/CompanyService');
const crypto = require('crypto');
var CompanyContacts = require('../models/CompanyContacts');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
const IV_LENGTH = 16;
const EmailService = require('../services/MailService');

module.exports={

getCompanyById: async function(req, res){
    let err, details;

    const Pk =  (req.user.hasOwnProperty("company")) ? ((req.user.company._id)? req.user.company._id:req.params.companyId):req.params.companyId;
    // const Pk = (req.user.company._id)? req.user.company._id:req.params.companyId;
    const roleId = req.user.role._id;
    [err, details]=await to(CompanyService.companyDetails(Pk,roleId,req.user.isAdmin));
   
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(details!==false){
        return res.status(200).json({"status": 200,"success": true,"data": details});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not get company details. Try again!"});
    }

},


listCompanies: async function(req, res){
    let err, companies;

    [err, companies]=await to(CompanyService.allCompanies(req));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(companies!==false){
        return res.status(200).json({"status": 200,"success": true,"data": companies});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, couldn't get any company details."});
    }
},

updateCompany: async function(req, res){
    let err, resp;

    [err, resp]=await to(CompanyService.updateCompanyDetails(req.params.companyId, req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(resp==404) return res.status(400).json({"status": 400,"success": false,"message": "Sorry cannot find any Company Details to update"});
    if(resp && resp!==false){
        return res.status(200).json({"status": 200,"success": true,"data": resp});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, couldn't get any company details to update."});
    }
},

changeContactStatus:async function(req, res){
    let err, contact;

    [err, contact]=await to(CompanyService.companyContactStatus(req.body, req.params.contactId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(contact==404) return res.status(400).json({"status": 400,"success": false,"message": "Sorry No Contact/User Exist's"});
    if(contact && contact!==false){
        return res.status(200).json({"status": 200,"success": true,"data": contact});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, couldn't get any company details to update."});
    }
},

editMyProfile:async function(req,res){
    let err, userObj;

    const userPK = (req.user._id)? req.user._id:req.params.userId;
    const roleId = req.user.role._id;

    [err,userObj]= await to(CompanyService.editAuthUserProfile(req.body, userPK, roleId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(userObj==404) return res.status(400).json({"status": 400,"success": false,"message": "Sorry No Contact/User Exist's"});
    if(userObj && userObj!==false){
        return res.status(200).json({"status": 200,"success": true,"data": userObj});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, couldn't get any company details to update."});
    }
},

changePasscode:async function(req, res){
    let err, resource;
    var userPK = (req.user._id)? req.user._id:req.params.userId;
    var roleId = req.user.role._id;

    [err,resource]= await to(CompanyService.changeUserPassword(userPK, req.body, roleId));
    if(err){
       return res.status(500).json({"status": 500,"success": false,"message": err.message});
    }
    if(resource==404) return res.status(400).json({"status": 400,"success": false,"message": "Sorry No Contact/User Exist's"});
    if(resource && resource!==false){
        return res.status(200).json({"status": 200,"success": true,"data": resource});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry,couldn't change password"});
    }
},

addCompanyUser:async function(req, res){
    let err, newcontact;

    if(req.isAdmin||req.auth_role==="SuperUser"){
        [err,newcontact]=await to(CompanyService.addContact(req.body, req.auth_company));
        if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
        if(newcontact&&newcontact!==false){
            return res.status(200).json({"status": 200,"success": true,"data": newcontact});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Sorry,couldn't add new Contact."});
        }
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry You are not authorized to add any User"});
    }
    
},

getCompanyLogo: async function(req, res){
    let err, logo;

    [err, logo] = await to(CompanyService.displayCompanyLogo(req.params.companyId));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(logo && logo!==false){
        return res.status(200).json({"status": 200,"success": true,"data": logo});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company logo. Try again!"});
    }
},

deleteCompanyLogo: async function(req, res){
    let err, logo;

    [err, logo] = await to(CompanyService.removeCompanyLogo(req.params.companyId));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(logo && logo!==false){
        return res.status(200).json({"status": 200,"success": true,"data": logo});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot delete company logo. Try again!"});
    }
},

verifyUserEmail:async function(req, res){
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
    
    
    [err, userObj] = await to(CompanyContacts.findOne({email: parsedText.email}).populate('company',
                                 ["accountid","email","status"]).collation({locale: "en", strength: 2}).exec());
    
    if(err) return res.serverError(err);

    if(!userObj || userObj == false){
       return res.notFound("Sorry, we can't find a User with this email. Try with a valid email");
    }

    if(userObj){
       userObj.set({status:1});

       [err, saveduser] = await to(userObj.save());
       if(err) return res.serverError(err);

       if(saveduser){
            let emaildata, testUser;

            let metadata={
                email:userObj.email,
                mail_cc:"",
                sgTemplate:"d-b2be9031989f40888653ce27249229e9",
                emailBody:{
                    subject: "Welcome to PinAsset.com",
                    name:userObj.fullName
                }
            };
            [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));

            [err,testUser] = await to(User.findOne({email:parsedText.email}).exec());

            let newUser = userObj.toJSON();
            delete newUser.password;

            return res.status(200).json({
                                            "status": 200,
                                            "success": true,
                                            "data": {
                                                user: newUser,
                                                testUser:(testUser) ? true:false,
                                                token: "Bearer "+jwt.sign(newUser,process.env.jwt_secret,
                                                            {expiresIn: process.env.jwt_expires}),
                                                expires: process.env.jwt_expires
                                            }
                                        });
       
       }
    }
},

}