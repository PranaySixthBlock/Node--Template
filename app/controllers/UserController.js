'use strict'
const {to} = require('../middlewares/utilservices');
var UserService = require('../services/UserService');

module.exports = {

getOneUser: async function(req, res){
    let err, respData;

    [err, respData]= await to(UserService.findOneUser(req.params.userId));
    if(err) return res.status(500).json({"message":err.message,"success":false, "status":500});
    if(respData && respData!=false){
        return res.status(200).json({"data":respData,"success":true, "status":200});
    }else{
        return res.status(400).json({"message":"Sorry, can't find any user!","success":false, "status":400});
    }
    
},


getUsers: async function(req, res){
    let err, usersDocs;

    [err, usersDocs]= await to(UserService.getAllUsers());
    if(err) return res.status(500).json({"message":err.message,"success":false, "status":500});
    if(usersDocs && usersDocs!=false){
        return res.status(200).json({"data":usersDocs,"success":true, "status":200});
    }else{
        return res.status(400).json({"message":"Sorry, can't find any user!","success":false, "status":400});
    }
},


createNew:async function (req, res) {
    let err, newUser;

    [err,newUser]= await to(UserService.createNewUser(req.body));
    if(err) return res.status(500).json({"message":err.message,"success":false, "status":500});
    if(newUser && newUser!=false){
        return res.status(200).json({"data":newUser,"success":true, "status":200});
    }else{
        return res.status(400).json({"message":"Bad Request","success":false, "status":400});
    }    
},

updateUser:async function (req, res) {
    let err, userDoc;

    [err,userDoc]= await to(UserService.editUserDoc(req.body, req.params.userId));
    if(err) return res.status(500).json({"message":err.message,"success":false, "status":500});
    if(userDoc==204) return res.status(204).json({"message":"Sorry, can't find any user to update","success":false, "status":204});
    if(userDoc && userDoc!==false){
        return res.status(200).json({"data":userDoc,"success":true, "status":200});
    }else{
        return res.status(400).json({"message":"Bad Request","success":false, "status":400});
    }
},


destroy:async function (req, res) {
    let err, respDoc;

    [err,respDoc]= await to(UserService.updateUserStatus(req.body, req.params.userId));
    if(err) return res.status(500).json({"message":err.message,"success":false, "status":500});
    if(respDoc==204) return res.status(204).json({"message":"Sorry, can't find any user to update","success":false, "status":204});
    if(respDoc && respDoc!==false){
        return res.status(200).json({"data":respDoc,"success":true, "status":200});
    }else{
        return res.status(400).json({"message":"Bad Request","success":false, "status":400});
    }
}

};