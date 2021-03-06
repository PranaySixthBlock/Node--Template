var {to, TE} = require('../middlewares/utilservices');
var UserRoles = require('../models/UserRoles');
var CompanyContacts = require('../models/CompanyContacts');

module.exports = {
addNewUserRole: async function(companyId, userId, payload, role){
    let err, data, permissions, duplicateData, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"permissions":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].permissions;
    };

    [err, duplicateData] = await to(UserRoles.find({"company":companyId, "roleName":payload.roleName}));
    if(err) {TE(err.message, true);}

    if(duplicateData.length < 1){
        [err, data] = await to(UserRoles.create({
            company   : companyId,
            roleName  : payload.roleName,
            createdBy : userId,
            dashboard : payload.hasOwnProperty("dashboard")?{
                canCreate     : payload.dashboard.canCreate?payload.dashboard.canCreate:0,
                canView       : payload.dashboard.canView?payload.dashboard.canView:0,
                canUpdate     : payload.dashboard.canUpdate?payload.dashboard.canUpdate:0,
                canDelete     : payload.dashboard.canDelete?payload.dashboard.canDelete:0
            }:0,
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
            }:0,
            settings : payload.hasOwnProperty("settings")?{
                canCreate     : payload.settings.canCreate?payload.settings.canCreate:0,
                canView       : payload.settings.canView?payload.settings.canView:0,
                canUpdate     : payload.settings.canUpdate?payload.settings.canUpdate:0,
                canDelete     : payload.settings.canDelete?payload.settings.canDelete:0
            }:0,
            locations : payload.hasOwnProperty("locations")?{
                canCreate     : payload.locations.canCreate?payload.locations.canCreate:0,
                canView       : payload.locations.canView?payload.locations.canView:0,
                canUpdate     : payload.locations.canUpdate?payload.locations.canUpdate:0,
                canDelete     : payload.locations.canDelete?payload.locations.canDelete:0
            }:0,
            company_settings : payload.hasOwnProperty("company_settings")?{
                canCreate     : payload.company_settings.canCreate?payload.company_settings.canCreate:0,
                canView       : payload.company_settings.canView?payload.company_settings.canView:0,
                canUpdate     : payload.company_settings.canUpdate?payload.company_settings.canUpdate:0,
                canDelete     : payload.company_settings.canDelete?payload.company_settings.canDelete:0
            }:0,
        }));
        data.save();
        if(err) {TE(err.message, true);}

        return (data)? {data: data, permissions: obj}:false;
    }else{
        {TE("User Role exists")}
    }
},

getCompanyUserRoles: async function(companyId, role){
    let err, data, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"permissions":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].permissions;
    };

    [err, data] = await to(UserRoles.aggregate([
        {
            $match: {
                company: new mongoose.Types.ObjectId(companyId)
            }
        },{
            $project: {
                createdAt: {
                    $dateToString: {
                        format: "%d-%m-%G",
                        date: "$createdAt"
                    }
                },
                "company": 1, "roleName": 1,  "dashboard": 1, "settings": 1,
                "users": 1, "permissions": 1, "user_management": 1, "locations": 1, "company_settings": 1
            }
        }
    ]));
    if(err) {TE(err.message, true);}

    return data?{data: data, permissions: obj}:false;
},

updateUserRolePermissions: async function(permissionId, payload, role){
    let err, data, permissionData, permissions, duplicate, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"permissions":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].permissions;
    };

    [err, permissionData] = await to(UserRoles.findById(permissionId));
    if(err) {TE(err.message, true);}

    if(permissionData){
        permissionData.roleName  = payload.roleName?payload.roleName:permissionData.roleName;
        permissionData.status    = payload.status?payload.status:permissionData.status;
        if(payload.hasOwnProperty("dashboard")){
            permissionData.dashboard.canCreate = payload.dashboard.canCreate;
            permissionData.dashboard.canView   = payload.dashboard.canView;
            permissionData.dashboard.canUpdate = payload.dashboard.canUpdate;
            permissionData.dashboard.canDelete = payload.dashboard.canDelete;
        }

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

        if(payload.hasOwnProperty("settings")){
            permissionData.settings.canCreate = payload.settings.canCreate;
            permissionData.settings.canView   = payload.settings.canView;
            permissionData.settings.canUpdate = payload.settings.canUpdate;
            permissionData.settings.canDelete = payload.settings.canDelete;
        }
        
        if(payload.hasOwnProperty("locations")){
            permissionData.locations.canCreate = payload.locations.canCreate;
            permissionData.locations.canView   = payload.locations.canView;
            permissionData.locations.canUpdate = payload.locations.canUpdate;
            permissionData.locations.canDelete = payload.locations.canDelete;
        }

        if(payload.hasOwnProperty("company_settings")){
            permissionData.company_settings.canCreate = payload.company_settings.canCreate;
            permissionData.company_settings.canView   = payload.company_settings.canView;
            permissionData.company_settings.canUpdate = payload.company_settings.canUpdate;
            permissionData.company_settings.canDelete = payload.company_settings.canDelete;
        }
        [err,data] = await to(permissionData.save());
        if(err) {TE(err.message, true);}

        // [err,permissions] = await to(UserRoles.find({"company":permissionData.company}));
        [err, permissions] = await to(UserRoles.aggregate([
            {
                $match: {
                    company: new mongoose.Types.ObjectId(permissionData.company)
                }
            },{
                $project: {
                    createdAt: {
                        $dateToString: {
                            format: "%d-%m-%G",
                            date: "$createdAt"
                        }
                    },
                    "company": 1, "roleName": 1, "users": 1, "permissions": 1, "user_management": 1,
                    "dashboard": 1, "settings": 1, "locations": 1, "company_settings": 1
                }
            }
        ]));

        if(err) {TE(err.message, true);}

        return permissions?{data: permissions, permissions: obj}:false;
    }
},

displayUserRolePermissionsById: async function(permissionId, role){
    let err, data, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"permissions":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].permissions;
    };

    [err, data] = await to(UserRoles.findById(permissionId));
    if(err) {TE(err.message, true);}

    return data?{data: data, permissions: obj}:false;
},

getUserPermissionsById: async function(user){
    let err, data, roleData, roleId;

    [err, data] = await to(CompanyContacts.findById(user).populate('role'));
    if(err) {TE(err.message, true);}
    console.log(user);
    return data?data.role:false;
},

getUserMenuPermissions: async function(menu, role){
    let err, data, roleData, roleId, typeName;

    switch (menu) {
        case "assetcategories":
            typeName = "assetCategory";
            break;
        case "assetcondition":
            typeName = "assetCondition";
            break;
        case "assetstatus":
            typeName = "assetStatus";
            break;
        case "ticketstatus":
            typeName = "ticketStatus";
            break;
        case "tickettype":
            typeName = "ticketType";
            break;
        case "block":
            typeName = "block";
            break;
        case "floor":
            typeName = "floor";
            break;
        case "vendor":
            typeName = "vendors";
            break;
        case "serviceProvider":
            typeName = "serviceProviders";
            break;
        case "assetTypeReports":
            typeName = "assetTypeReports";
            break;
        case "assetPriceReports":
            typeName = "assetPriceReports";
            break;
        case "ticketsCreatedByMe":
            typeName = "ticketsCreatedByMe";
            break;
        case "ticketsAssignedToMe":
            typeName = "ticketsAssignedToMe";
            break;
        default:
            typeName = menu;
            break;
      }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0][typeName];
    };
    
    return roleData?obj:false;
},

getAllSuperUserMenuPermissions: async function(payload){
    let err, permissionData, keyName;

    [err, permissionData] = await to(UserRoles.find({"roleName":"SUPERUSER"}));
    if(err) {TE(err.message, true);}

    keyName = Object.keys(payload)[0];

    permissionData.forEach(data => {
        if(!data.hasOwnProperty(keyName)){
            data[keyName].canCreate = payload[keyName].canCreate ? payload[keyName].canCreate : 0;
            data[keyName].canView = payload[keyName].canView ? payload[keyName].canView : 0;
            data[keyName].canUpdate = payload[keyName].canUpdate ? payload[keyName].canUpdate : 0;
            data[keyName].canDelete = payload[keyName].canDelete ?  payload[keyName].canDelete : 0;
    
            data.save();
        }
    });

    return true;
},
}