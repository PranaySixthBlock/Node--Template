'use strict'
const {to,TE} = require('../middlewares/utilservices');
const Company = require('../models/Company');
const UsersData = require('../models/UsersData');
const UserRoles = require('../models/UserRoles');
const EmailService = require('./MailService');
const Locations = require('../models/Locations');
const crypto = require('crypto');
const dotenv = require("dotenv");
const IV_LENGTH = 16;
dotenv.config();

module.exports = {
    addingNewUserData: async function(payload){
    let err, err1, userData, newMember;
    let  duplicateData;

                [err, duplicateData] = await to(UsersData.find({"email": payload.email}));
                if(err) {TE(err, true);}

                if(duplicateData.length>0){
                    {TE("Email already exists!");}
                }
                [err, newMember] = await to(UsersData.create({
                    fullName    : payload.fullName,
                    email       : payload.email,
                    password    : payload.password,
                    phone       : payload.phone,
                    status      : payload.status?payload.status:1,
                    locations   : payload.locations?payload.locations:'',
                    // company     : userData.company,
                    role        : payload.role,
                    // createdBy   : userId,
                    address     : payload.address?payload.address:null
                }));
                if(err){TE(err.message, true);}

                 

                [err,userData] = await to(UsersData.find({'email':payload.email}));
                if(err){TE(err.message,true);}

                return {data:userData};
            
},

editUserDetails: async function(memberId,payload){
    let err, member, updateMember, companyData, roleData, obj;
    let duplicateData;

    
    [err,member] = await to(UsersData.findById(memberId));
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
                
                if(updateMember) 
                return updateMember;
            }else{
                [err, duplicateData] = await to(UsersData.find({"email":payload.email}));
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

                    if(updateMember) 
                    return updateMember;
                }
            }
        }
    }else{
        return false;
    }
},
getUserData : async function(userid){
    let err, contact;

    [err, contact] = await to(UsersData.findById({_id: userid}));
    if(err) {TE(err, true);}

    if(contact) return contact;
},

getAllUsers: async function(){
    let err, members;

    [err,members] = await to(UsersData.find());
    if(err) {TE(err, true);}

    if(members) return members;
},

deleteOneUser: async function(userId){
    let err, companyData;
    let member, memberData, users;

    [err,member] = await to(UsersData.findById(userId));
    if(err) {TE(err, true);}

    if(member!==null || member){
        [err, memberData] = await to(UsersData.deleteOne({"_id":userId}));
        if(err) {TE(err, true);}

        [err,users] = await to(UsersData.find());
        if(err) {TE(err, true);}

        if(users) return users;
    }else{
        return false;
    }
},

}