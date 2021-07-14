var {to,TE} = require('../middlewares/utilservices');
var UsersPermissionsService = require('../services/UsersPermissionsService');

module.exports = {
createUserRole: async function(req,res){
    let err, data;

    [err,data] = await to(UsersPermissionsService.addNewUserRole(req.body));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can not add role. Try again!"});
    }
},

getCompanyRoles: async function(req, res){
    let err, data;

    [err, data] = await to(UsersPermissionsService.getCompanyUserRoles());

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't display user roles. Try again!"});
    }
},
updatePermissions: async function(req, res){
    let err, data;

    [err, data] = await to(UsersPermissionsService.updateUserRolePermissions(req.params.permissionId, req.body));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't update user role and permissions. Try again!"});
    }
},

getOneRolePermissions: async function(req, res){
    let err, data;
    console.log("req.params.permissionId");

    [err, data] = await to(UsersPermissionsService.displayOneUserRolePermissionsById(req.params.permissionId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't display user role and permissions. Try again!"});
    }
},
}