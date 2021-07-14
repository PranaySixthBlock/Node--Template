'use strict'
const {to} = require('../middlewares/utilservices');
const UsersDataService = require('../services/UsersDataService');
const CompanyContacts = require('../models/UsersData');
const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();

module.exports={
    addingNewUser: async function(req,res){
        let err, newMember;
    
        [err,newMember]= await to(UsersDataService.addingNewUserData(req.body));
    
        if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
        if(newMember && newMember!==false){
            return res.status(200).json({"status": 200,"success": true,"data": newMember});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Cannot add user to company. Try again!"});
        }
    },

    updateUserDetails: async function (req, res) {
        let err, memberData;
    
        [err,memberData]= await to(UsersDataService.editUserDetails(req.params.memberId,req.body));
    
        if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
        if(memberData && memberData!==false){
            return res.status(200).json({"status": 200,"success": true,"data": memberData});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not update member. Try again!"});
        }
    },
    getOneUserData: async function(req,res){
        let err, memberData;
    
        [err,memberData]= await to(UsersDataService.getUserData(req.params.userId));
    
        if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
       
        if(memberData && memberData!==false){
            return res.status(200).json({"status": 200,"success": true,"data": memberData});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not get details. Try again!"});
        }
    },
    
    getAllUsersData: async function(req,res){
        let err, memberData;

        [err,memberData]= await to(UsersDataService.getAllUsers());

        if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
    
        if(memberData && memberData!==false){
            return res.status(200).json({"status": 200,"success": true,"data": memberData});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not get details. Try again!"});
        }
    },
    deleteUserData: async function(req,res){
        let err, memberData;
    
        [err,memberData]= await to(UsersDataService.deleteOneUser(req.params.userId));
    
        if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
        if(memberData && memberData!==false){
            return res.status(200).json({"status": 200,"success": true,"data": memberData});
        }else{
            return res.status(401).json({"status": 401,"success": false,"message": "Sorry, Can not delete member details. Try again!"});
        }
    },
}