'use strict'
const {to} = require('../middlewares/utilservices');
var PermissionsService = require('../services/PermissionsService');

module.exports={
createPermissions: async function(req,res){
    let err, newMember;

    [err,newMember]= await to(PermissionsService.addNewRolePermissions(req.params.userId,req.body));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(newMember && newMember!==false){
        return res.status(200).json({"status": 200,"success": true,"data": newMember});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot add user to company. Try again!"});
    }    
}
}