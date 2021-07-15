'use strict'
var {to,TE, ReS} =  require('../middlewares/utilservices');
var randomize = require('randomatic');
var jwt = require('jsonwebtoken');
var dotenv = require("dotenv");
var Company = require('../models/Company');
var UserRoles = require('../models/UserRoles');
var CompanyContacts = require('../models/CompanyContacts');
var UserDropDown = require('../models/UserDropDown');
var AdminDropdowns = require('../models/AdminDropdowns');
var User = require('../models/User');
var TicketPriorities = require('../models/TicketPriorities');
var CompanySubscriptionService = require('../services/CompanySubscriptionService');
const crypto = require('crypto');
const EmailService = require('./MailService');
dotenv.config();
const IV_LENGTH = 16;

var self = module.exports={

createNewCustomer: async function(payload){
    let err, customerObj, user, emaildata, subscriptionData;
    let userRole, userDropdowns, userTicketTypes;

    if(payload.hasOwnProperty('companyName') && payload.hasOwnProperty('companyName') != null){
        let duplicateData;
        
        // [err, duplicateData] = await to(Company.find({"companyName": payload.companyName}));
        [err, duplicateData] = await to(Company.find({"email": payload.email.toLowerCase()}));

        if(duplicateData.length > 0){
            return TE("Company already exists with given Email. Try again!");
        }
    }
    var newcompany = new Company({
        companyName : payload.companyName || payload.fullName+randomize('A0',3),
        accountid   : randomize('0', 11),
        phone       : payload.phone?payload.phone:null, 
        email       : payload.email.toLowerCase(),
        address     : payload.address?payload.address:null
    });
    [err,customerObj] = await to(newcompany.save());
    if(err) {TE(err, true);}

    // if(customerObj){
        // if(customerObj.subscription){
        //     // customerObj.subscriberState = "FreeTrial";
        //     [err,subscriptionData] = await to(CompanySubscriptionService.skillTrailSubscrption(customerObj));
        //     if(err) {TE(err, true);}
        // }
        // let admin_dropdowns, dropdowns = [], dropdownTypesArray = ['tickettype','ticketstatus','assetstatus','assetcondition'];
        
        // [err, admin_dropdowns] = await to(AdminDropdowns.find({type: {$in:dropdownTypesArray},"status": true}));
        // if(err) {TE(err.message, true);}

    //     await admin_dropdowns.forEach(async data => {
    //         let statusObj = {
    //             company : customerObj._id,
    //             type    : data.type,
    //             name    : data.name,
    //             message : data.message ? data.message : null,
    //             status  : data.status,
    //             key_code: data.key_code,
    //             isEditable : 0,
    //         };

    //         dropdowns.push(statusObj);
    //     });
        
    //     [err, userDropdowns] = await to(UserDropDown.insertMany(dropdowns));
    //     if(err) {TE(err, true);}

    //     let admin_ticketPriorities, priorities = [], userTicketPriorities;
    //     [err, admin_ticketPriorities] = await to(AdminDropdowns.find({type: "ticketpriority", "status": true}));
    //     if(err) {TE(err.message, true);}

    //     await admin_ticketPriorities.forEach(async data=>{
    //         let sla;
    //         let priorityObj = {
    //             company : customerObj._id,
    //             name    : data.name,
    //             slaType : "days",
    //             slaTo   : data.defaultValue
    //         };

    //         priorities.push(priorityObj);
    //     });

    //     [err, userTicketPriorities] = await to(TicketPriorities.insertMany(priorities));
    //     if(err) {TE(err, true);}
    // }

    if(customerObj) {
        var newRole = new UserRoles({
            roleName : "SUPERUSER",
            company  : customerObj._id,
            
            dashboard : {
                canCreate : 1,
                canView   : 1,
                canUpdate : 1,
                canDelete : 1
            },
            user_management : {
                canCreate : 1,
                canView   : 1,
                canUpdate : 1,
                canDelete : 1
            },
            users :{
                canCreate     : 1,
                canView       : 1,
                canUpdate     : 1,
                canDelete     : 1
            },
            permissions :{
                canCreate     : 1,
                canView       : 1,
                canUpdate     : 1,
                canDelete     : 1
            },
            settings : {
                canCreate : 1,
                canView   : 1,
                canUpdate : 1,
                canDelete : 1
            },
            locations : {
                canCreate : 1,
                canView   : 1,
                canUpdate : 1,
                canDelete : 1
            },
            company_settings : {
                canCreate : 1,
                canView   : 1,
                canUpdate : 1,
                canDelete : 1
            }
        });
        [err, userRole] = await to(newRole.save());
        if(err) {TE(err, true);}

        [err, user]=await to(CompanyContacts.create({
                                fullName: payload.fullName,
                                email   : payload.email.toLowerCase(),
                                password: payload.password?payload.password:"",
                                phone   : payload.phone?payload.phone:null,
                                status  : 1,
                                company : customerObj._id,
                                role    : userRole._id
                            }));
        if(err){TE(err.message, true);}
        
        if(!payload.isSocial){
            
            if(user && customerObj){
                self.assignContact(customerObj._id, user._id);
                let userdata = JSON.stringify({
                    email: user.email,
                });
                let iv = crypto.randomBytes(IV_LENGTH);

                var cipher = crypto.createCipheriv(process.env.ENCRPYT_ALG, Buffer.concat([Buffer.from(process.env.ENCRPYT_KEY), Buffer.alloc(32)], 32), iv);  
                let encrypted =  cipher.update(userdata);
                encrypted = Buffer.concat([encrypted, cipher.final()]);

                var encryptedPassword = iv.toString('hex') + ':' + encrypted.toString('hex');
                
                let metadata={
                    email:customerObj.email,
                    mail_cc:"",
                    // sgTemplate:"d-6eadbd3ff9874d9a845180edb0b3940b",
                    sgTemplate:"d-9ee8a535c29946d393d61d18f1fbf2dc",
                    emailBody:{
                        subject:"Email Verifcation From PinAsset",
                        company:customerObj.companyName,
                        link:process.env.ASSET_USER+"emailverification/"+encryptedPassword
                    }
                };
                [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));
                if(err) return {message:"Cannot send email to "+payload.email,customer:customerObj};

                if(emaildata) return {
                                        message:"Please verify your mail sent to "+payload.email,
                                        customer:{
                                            "company_name":customerObj.company_name,
                                            "phone":customerObj.phone,
                                            "email":customerObj.email
                                        }
                                    };
                
            }else{
                return TE("Sorry, can't complete your action try again.! or reach us at support@pinasset.com");
            }
        }else{
            console.log('not isSocial');
            let sampleData, test, userData;
            self.assignContact(customerObj._id, user._id);

            [err, userData] = await to(CompanyContacts.findOne({email: user.email},['fullName','email','password','phone','status','role','company'])
                                        .populate('company',["accountid","company_name","email","status"])
                                        .populate('role')
                                        .collation({locale: "en", strength: 2}).exec());
            if(err){TE(err.message, true);}

            [err, sampleData] = await to(CompanyContacts.findOne({email: user.email},['fullName','email','password','phone','status','role','company'])
                                    .collation({locale: "en", strength: 2}).exec());
            if(err){TE(err.message, true);}

            return test = {
                user: userData,   
                token: "Bearer "+jwt.sign(sampleData.toJSON(),                     
                    process.env.jwt_secret,
                    {expiresIn: process.env.jwt_expires}
                ),
                expires: process.env.jwt_expires
            }
        }
    }else{
        return TE("Sorry, can't complete your action try again.! or reach us at support@pinasset.com");
    }
},

assignContact:async function(company, userId){
    let err, companyData, savedCompany;

    [err,companyData]=await to(Company.findById(company));
    if(companyData){
        companyData.contacts=[userId];
        companyData.save();
        return true;
    }else{
        return false;
    }
},

updateUserPassword: async function(payload, userId, role){
    let err, savedUserData, userData, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id":role},{"users":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].users;
    }

    [err, userData] = await to(CompanyContacts.findById(userId));
    if(err) {TE(err, true);}
    if(userData){
        userData.set(payload);
        [err, savedUserData] = await to(userData.save());
        if(savedUserData){
            return {data: savedUserData, permissions: obj};
        }
    }else{
        return false;
    }
}
}