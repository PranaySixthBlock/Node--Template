var {to, TE} = require('../middlewares/utilservices');
var UsersPermissions = require('../models/UsersPermissions');
var CompanyContacts = require('../models/CompanyContacts');

module.exports = {
addNewUserRole: async function(payload){
    let err, data, permissions, duplicateData, roleData, obj;

    [err, duplicateData] = await to(UsersPermissions.find({"roleName":payload.roleName}));
    if(err) {TE(err.message, true);}

    if(duplicateData.length < 1){
        [err, data] = await to(UsersPermissions.create({
            // company   : companyId,
            roleName  : payload.roleName,
            // createdBy : userId,
            
            user_management : payload.hasOwnProperty("user_management")?{
                canCreate     : payload.user_management.canCreate?payload.user_management.canCreate:0,
                canView       : payload.user_management.canView?payload.user_management.canView:0,
                canUpdate     : payload.user_management.canUpdate?payload.user_management.canUpdate:0,
                canDelete     : payload.user_management.canDelete?payload.user_management.canDelete:0
            }:0,
            users : payload.hasOwnProperty("users")?{
                canCreate     : payload.users.canCreate?payload.users.canCreate:0,
                canView       : payload.users.canView?payload.users.canView:0,
                canUpdate     : payload.users.canUpdate?payload.users.canUpdate:0,
                canDelete     : payload.users.canDelete?payload.users.canDelete:0
            }:0,
            permissions : payload.hasOwnProperty("permissions")?{
                canCreate     : payload.permissions.canCreate?payload.permissions.canCreate:0,
                canView       : payload.permissions.canView?payload.permissions.canView:0,
                canUpdate     : payload.permissions.canUpdate?payload.permissions.canUpdate:0,
                canDelete     : payload.permissions.canDelete?payload.permissions.canDelete:0
            }:0
            
        }));
        data.save();
        if(err) {TE(err.message, true);}

        return (data)? data :false;
    }else{
        {TE("User Role exists")}
    }
},

getCompanyUserRoles: async function(){
    let err, data;

    [err, data] = await to(UsersPermissions.aggregate([
       {
            $project: {
                createdAt: {
                    $dateToString: {
                        format: "%d-%m-%G",
                        date: "$createdAt"
                    }
                },
                 "roleName": 1, "users": 1, "permissions": 1, "user_management": 1
                
            }
        }
    ]));
    if(err) {TE(err.message, true);}

    return data? data : false;
},

updateUserRolePermissions: async function(permissionId, payload){
    let err, data, permissionData, permissions, duplicate, roleData, obj;

    [err, permissionData] = await to(UsersPermissions.findById(permissionId));
    if(err) {TE(err.message, true);}

    if(permissionData){
        permissionData.roleName  = payload.roleName?payload.roleName:permissionData.roleName;
        permissionData.status    = payload.status?payload.status:permissionData.status;
        
        if(payload.hasOwnProperty("user_management")){
            permissionData.user_management.canCreate = payload.user_management.canCreate;
            permissionData.user_management.canView   = payload.user_management.canView;
            permissionData.user_management.canUpdate = payload.user_management.canUpdate;
            permissionData.user_management.canDelete = payload.user_management.canDelete;
        }
        
        if(payload.hasOwnProperty("users")){
            permissionData.users.canCreate = payload.users.canCreate;
            permissionData.users.canView   = payload.users.canView;
            permissionData.users.canUpdate = payload.users.canUpdate;
            permissionData.users.canDelete = payload.users.canDelete;
        }

        if(payload.hasOwnProperty("permissions")){
            permissionData.permissions.canCreate = payload.permissions.canCreate;
            permissionData.permissions.canView   = payload.permissions.canView;
            permissionData.permissions.canUpdate = payload.permissions.canUpdate;
            permissionData.permissions.canDelete = payload.permissions.canDelete;
        }

       
        [err,data] = await to(permissionData.save());
        if(err) {TE(err.message, true);}

        // [err,permissions] = await to(UserRoles.find({"company":permissionData.company}));
        [err, permissions] = await to(UsersPermissions.aggregate([
            {
                $project: {
                    createdAt: {
                        $dateToString: {
                            format: "%d-%m-%G",
                            date: "$createdAt"
                        }
                    },
                    "roleName": 1, "users": 1, "permissions": 1, "user_management": 1
                }
            }
        ]));

        if(err) {TE(err.message, true);}

        return permissions? permissions :false;
    }
},

displayOneUserRolePermissionsById: async function(permissionId){
    let err, data;

    [err, data] = await to(UsersPermissions.findById(permissionId));
    if(err) {TE(err.message, true);}

    return data? data:false;
},
}