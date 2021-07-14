var {to,TE} = require('../middlewares/utilservices');
var UserRoleService = require('../services/UserRoleService');

module.exports = {
createUserRole: async function(req,res){
    let err, data;
    let roleId = req.user.role._id;

    [err,data] = await to(UserRoleService.addNewUserRole(req.params.companyId,req.params.userId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can not add role. Try again!"});
    }
},

getCompanyRoles: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(UserRoleService.getCompanyUserRoles(req.params.companyId,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't display user roles. Try again!"});
    }
},

updatePermissions: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(UserRoleService.updateUserRolePermissions(req.params.permissionId, req.body, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't update user role and permissions. Try again!"});
    }
},

getRolePermissionsById: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(UserRoleService.displayUserRolePermissionsById(req.params.permissionId, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't display user role and permissions. Try again!"});
    }
},

getUserPermissions: async function(req, res){
    let err, data;

    [err, data] = await to(UserRoleService.getUserPermissionsById(req.params.userId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't display user role and permissions. Try again!"});
    }
},

getMenuPermissions: async function(req, res){
    let data, err;
    let roleId = req.user.role._id;

    [err, data] = await to(UserRoleService.getUserMenuPermissions(req.params.menuName, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't display user role and permissions. Try again!"});
    }
},

permissionChanges: async function(req, res){
    let data, err;

    [err, data] = await to(UserRoleService.getAllSuperUserMenuPermissions(req.body));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Can't display user role and permissions. Try again!"});
    }
},
}