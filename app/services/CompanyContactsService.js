'use strict'
const {to,TE} = require('../middlewares/utilservices');
const Company = require('../models/Company');
const CompanyContacts = require('../models/CompanyContacts');
const UserRoles = require('../models/UserRoles');
const EmailService = require('./MailService');
const Locations = require('../models/Locations');
const crypto = require('crypto');
const dotenv = require("dotenv");
const IV_LENGTH = 16;
dotenv.config();

module.exports = {
addNewMemberToCompany: async function(userId,payload,role){
    let err, err1, userData, newMember, companyData;
    let companyDump, duplicateData, roleData, obj;
    let newUserRole, emaildata;
    let companySubscription, usersLimit;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"users":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].users;
    };

    [err,userData] = await to(CompanyContacts.findById(userId));
    if(err) {TE(err, true);}

    if(userData){
        // [err, companySubscription] = await to(Company.findById(userData.company).populate('subscription'));
        // if(err) {TE(err, true);}

        // if((companySubscription.paymentState=="FreeTrial" || companySubscription.paymentState=="Purchased")
        //     && companySubscription.subscription){
            
        //     let subscription = companySubscription.subscription;
        //     let contactsCount = companySubscription.contacts.length;

            // if(subscription.total_users){
            //     if(contactsCount <= subscription.total_users){
            //         [err, duplicateData] = await to(CompanyContacts.find({"email": payload.email}));
            //         if(err) {TE(err, true);}

            //         if(duplicateData.length>0){
            //             {TE("Email already exists!");}
            //         }
            //         [err, newMember] = await to(CompanyContacts.create({
            //             fullName    : payload.fullName,
            //             email       : payload.email,
            //             password    : payload.password,
            //             phone       : payload.phone,
            //             status      : payload.status?payload.status:1,
            //             locations   : payload.locations?payload.locations:[],
            //             company     : userData.company,
            //             role        : payload.role,
            //             createdBy   : userId,
            //             address     : payload.address?payload.address:null
            //         }));
            //         if(err){TE(err.message, true);}

            //         if(newMember){
            //             let newUserData, userLocations = "", locationsArray = [];
                        
            //             [err, newUserData] = await to(CompanyContacts.findById(newMember._id).populate('locations',['name']));

            //             if(newUserData){
            //                 if(newUserData.locations.length > 0){
            //                     newUserData.locations.forEach(data => {
            //                         locationsArray.push(data.name);
            //                     });

            //                     userLocations = locationsArray.join(', ');
            //                 }
            //             }

            //             [err, newUserRole] = await to(UserRoles.find({"_id": payload.role},{"roleName": 1}));

            //             let metadata = {
            //                 email: newMember.email,
            //                 mail_cc:"",
            //                 // sgTemplate:"d-fea4702820294bd5b96c3645acc9d9be",
            //                 sgTemplate:"d-a23a8386dce74974a3d6e5f4d099095e",
            //                 emailBody:{
            //                     subject: "New User Creation - PinAsset.com",
            //                     companyname: companySubscription.companyName,
            //                     username : newMember.fullName,
            //                     phone    : newMember.phone ? newMember.phone : "Not Specified",
            //                     email    : newMember.email,
            //                     role     : newUserRole[0].roleName,
            //                     assigned_location : userLocations
            //                 }
            //             };
            //             [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));
            //         }
            //         [err,companyData] = await to(Company.findById(userData.company));
            //         if(err){TE(err.message,true);}

            //         companyData.contacts.push(newMember._id);
            //         [err, companyData] = await to(companyData.save());

            //         [err, companyDump] = await to(Company.findById(userData.company)
            //                                             .populate('contacts')
            //                                             .populate({
            //                                                 path : 'contacts',
            //                                                 populate: { 
            //                                                     path:  'role',
            //                                                     model: 'user_roles'
            //                                                 }
            //                                             })
            //                                             .populate('locations')
            //                                             );
            //         if(err) return err;
            //         return {data: companyDump.contacts, permissions: obj};
            //     }else{
            //         {TE("Can't add a user as you are exceeding limit of users");}
            //     }
            // }else{
                [err, duplicateData] = await to(CompanyContacts.find({"email": payload.email}));
                if(err) {TE(err, true);}

                if(duplicateData.length>0){
                    {TE("Email already exists!");}
                }
                [err, newMember] = await to(CompanyContacts.create({
                    fullName    : payload.fullName,
                    email       : payload.email,
                    password    : payload.password,
                    phone       : payload.phone,
                    status      : payload.status?payload.status:1,
                    locations   : payload.locations?payload.locations:[],
                    company     : userData.company,
                    role        : payload.role,
                    createdBy   : userId,
                    address     : payload.address?payload.address:null
                }));
                if(err){TE(err.message, true);}

                // if(newMember){
                //     let newUserData, userLocations = "", locationsArray = [];
                //     [err, newUserData] = await to(CompanyContacts.findById(newMember._id).populate('locations',['name']));

                //     if(newUserData){
                //         if(newUserData.locations.length > 0){
                //             newUserData.locations.forEach(data => {
                //                 locationsArray.push(data.name);
                //             });

                //             userLocations = locationsArray.join(', ');
                //         }
                //     }

                //     [err, newUserRole] = await to(UserRoles.find({"_id": payload.role},{"roleName": 1}));

                    // let metadata = {
                    //     email: newMember.email,
                    //     mail_cc:"",
                    //     // sgTemplate:"d-fea4702820294bd5b96c3645acc9d9be",
                    //     sgTemplate:"d-a23a8386dce74974a3d6e5f4d099095e",
                    //     emailBody:{
                    //         subject: "New User Creation - PinAsset.com",
                    //         companyname: companySubscription.companyName,
                    //         username : newMember.fullName,
                    //         phone    : newMember.phone ? newMember.phone : "Not Specified",
                    //         email    : newMember.email,
                    //         role     : newUserRole[0].roleName,
                    //         assigned_location : userLocations
                    //     }
                    // };
                    // [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));
                // }

                [err,companyData] = await to(Company.findById(userData.company));
                if(err){TE(err.message,true);}

                companyData.contacts.push(newMember._id);
                [err, companyData] = await to(companyData.save());

                [err, companyDump] = await to(Company.findById(userData.company)
                                                    .populate('contacts')
                                                    .populate({
                                                        path : 'contacts',
                                                        populate: { 
                                                            path:  'role',
                                                            model: 'user_roles'
                                                        }
                                                    })
                                                    // .populate('locations')
                                                    );
                if(err) return err;
                return {data: companyDump.contacts, permissions: obj};
            // }
        // }else{
        //     {TE("You can't create users as you don't have any active subscription!");}
        // }
    }else{
        return false;
    }
},

editMemberDetails: async function(memberId,payload,role){
    let err, member, updateMember, companyData, roleData, obj;
    let duplicateData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"users":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].users;
    };
    
    [err,member] = await to(CompanyContacts.findById(memberId));
    if(err) {TE(err, true);}

    if(member){
        if(payload.email){
            if(member.email === payload.email.trim()){
                member.phone  = payload.phone ? payload.phone : member.phone;
                // member.email  = payload.email ? payload.email : member.email;
                member.role   = payload.role ? payload.role : member.role;
                member.locations = payload.locations ? payload.locations : member.locations;
                member.status = payload.status ? payload.status : member.status;
                member.password = payload.password ? payload.password : member.password;
                member.fullName = payload.fullName ? payload.fullName : member.fullName;
                member.address = payload.address ? payload.address : member.address;

                [err,updateMember]= await to(member.save());
                if(err) {TE(err, true);}
                
                [err, companyData] = await to(Company.findById(member.company).populate('contacts')
                                                    .populate('locations')
                                                    .populate({
                                                        path : 'contacts',
                                                        populate: { 
                                                            path:  'role',
                                                            model: 'user_roles'
                                                        }
                                                    }));
                if(updateMember) 
                return {data: companyData, permissions: obj};
            }else{
                [err, duplicateData] = await to(CompanyContacts.find({"email":payload.email}));
                if(err) {TE(err, true);}

                if(duplicateData.length>0){
                    {TE("Email already exists!");}
                }else{
                    member.phone  = payload.phone ? payload.phone : member.phone;
                    member.email  = payload.email ? payload.email : member.email;
                    member.role   = payload.role ? payload.role : member.role;
                    member.locations = payload.locations ? payload.locations : member.locations;
                    member.status = payload.status ? payload.status : member.status;
                    member.password = payload.password ? payload.password : member.password;
                    member.fullName = payload.fullName ? payload.fullName : member.fullName;
                    member.address = payload.address ? payload.address : member.address;
                    
                    [err,updateMember]= await to(member.save());
                    if(err) {TE(err, true);}

                    [err, companyData] = await to(Company.findById(member.company).populate('contacts')
                                                            .populate('locations')
                                                            .populate({
                                                                path : 'contacts',
                                                                populate: { 
                                                                    path:  'role',
                                                                    model: 'user_roles'
                                                                }
                                                            }));
                    if(updateMember) 
                    return {data: companyData, permissions: obj};
                }
            }
        }
    }else{
        return false;
    }
},

getCompnayMembers: async function(company, role){
    let err, members, roleData, obj, roleObj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"users":1, "roleName": 1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0].users;
        roleObj = roleData[0].roleName;
    };
    
    [err,members] = await to(Company.findById(company)
                                    .populate('contacts')
                                    .populate({
                                        path : 'contacts',
                                        populate: { 
                                            path:  'locations',
                                            model: 'locations'
                                        }
                                    })
                                    .populate({
                                        path : 'contacts',
                                        populate: { 
                                            path:  'role',
                                            model: 'user_roles'
                                        }
                                    }));
    if(err) {TE(err, true);}

    if(members) return {data: members.contacts, permissions: obj, role: roleObj};
},

getOneMember : async function(userid, role){
    let err, contact, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"users":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].users;
    };

    [err, contact] = await to(CompanyContacts.findById({_id: userid}).populate('role').populate('locations'));
    if(err) {TE(err, true);}

    if(contact) return {data: contact, permissions: obj};
},

deleteCompanyMember: async function(company,userId,role){
    let err, companyData;
    let member, memberData;
    let roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"users":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].users;
    };

    [err,member] = await to(CompanyContacts.findById(userId));
    if(err) {TE(err, true);}

    if(member!==null || member){
        [err, memberData] = await to(CompanyContacts.deleteOne({"_id":userId}));
        if(err) {TE(err, true);}

        [err, companyData] = await to(Company.findById(company).populate('contacts'));
        if(err) {TE(err, true);}
        
        if(companyData) return {data: companyData.contacts, permissions: obj};
    }else{
        return false;
    }
},
filterUserNames : async function(companyId, role,searchString, req){ 
    let err, result;

    var records =[];

   let key = [searchString];        
    key.forEach(function(opt){
        records.push(new RegExp(opt,"i"));                
    }); 
    
    [err, result] = await to(CompanyContacts.find({"company": companyId,"status": true, $or:[{"fullName":{$in:records}},
                                    {"email":{$in:records}}]},
                                    {"_id":1, "fullName" : 1, "email" : 1})
                                    .sort({"createdAt":-1}));
    if(err) {TE(err.message);}

    return result?{data: result}:false;
},

updateUserPassword: async function(payload){
    let err, user, emaildata;
    var inputEmail = payload.email.trim();

    [err,user] = await to(CompanyContacts.findOne({"email": inputEmail}));
    if(err){TE(err, true);}

    if(!user){
      return false;
    }

    if(user){
        let userdata = JSON.stringify({
            user: user._id,
            email: user.email
        });

        let iv = crypto.randomBytes(IV_LENGTH);

        var cipher = crypto.createCipheriv(process.env.ENCRPYT_ALG, Buffer.concat([Buffer.from(process.env.ENCRPYT_KEY), Buffer.alloc(32)], 32), iv);  
        let encrypted =  cipher.update(userdata);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        var encryptedPassword = iv.toString('hex') + ':' + encrypted.toString('hex');
         
        let metadata={
            email:user.email,
            mail_cc:"",
            // sgTemplate:"d-83de96f4ed4242839592de0f5de051af",
            sgTemplate:"d-6018cee5d098499bb9cb51bd56ae4b7f",
            emailBody:{
                subject:"Reset Password - PinAsset.com",
                user:user.fullName,
                link:process.env.ASSET_USER+"resetpassword/"+encryptedPassword
            }
        };
        [err, emaildata] = await to(EmailService.sgSurveyMailService2(metadata));
        if(err) return {message:"Cannot send Email to "+user.email};

        if(emaildata) return {
                                message:"Please reset password using mail sent to "+user.email,
                                customer:{
                                    "userId": user._id,
                                    "email" : user.email
                                }
                            };
    }
}
}