var {to, TE} = require('../middlewares/utilservices');
var VendorServiceProvider = require('../models/VendorServiceProvider');
var UserRoles = require('../models/UserRoles');

module.exports = {
addNewExternalStaff: async function(type, company, payload, role){
    let err, vendor, alldata, data;
    let roleData, obj, typeName;
    
    switch (type) {
        case "vendor":
            typeName = "vendors";
            break;
        case "serviceProvider":
            typeName = "serviceProviders";
            break;
        default:
            typeName = "";
            break;
    }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0][typeName];
    };

    if(payload.name && payload.mobile){
        [err, data] = await to(VendorServiceProvider.find({"company":company,"type":type,
                                    "name":payload.name,"mobile":payload.mobile}));
        if(err) {TE(err.message, true);}
    }

    if(data.length<1){
        [err, vendor] = await to(VendorServiceProvider.create({
            company   : company,
            name      : payload.name,
            type      : type,
            mobile    : payload.mobile,
            email     : payload.email?payload.email:null,
            status    : payload.status?payload.status:1,
            address   : payload.address?payload.address:null,
            servicesOffered : payload.servicesOffered?payload.servicesOffered:[],
            location  : payload.location?payload.location:null,
            serviceCompany : payload.serviceCompany?payload.serviceCompany:null
        }));
        vendor.save();
        if(err) {TE(err.message, true);}
    
        [err,alldata] = await to(VendorServiceProvider.find({"company":company, "type":type}).sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    
        return (alldata)?{data: alldata, permissions: obj}:false;
    }else{
        {TE(payload.name+", "+type+" is already exists!");}
    }
    

    
},

listOfCompanyExternalStaff: async function(company){
    let err, data;

    [err, data] = await to(VendorServiceProvider.find({"company": company}).sort({"createdAt":-1}));
    if(err) {TE(err.message, true);}
    return data?data:false;
},

updateCompanyExternalStaffData: async function(Id, payload, role){
    let err, data, updatedData, allRecords;
    let roleData, obj, typeName, duplicateData;

    switch (payload.type) {
        case "vendor":
            typeName = "vendors";
            break;
        case "serviceProvider":
            typeName = "serviceProviders";
            break;
        default:
            typeName = "";
            break;
    }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0][typeName];
    };

    [err,data]= await to(VendorServiceProvider.findById(Id));
    if(err) {TE(err.message, true);}
    if(data){
        if(data.name === payload.name){
            data.status  = payload.status?payload.status:data.status;
            data.type    = payload.type?payload.type:data.type;
            data.mobile  = payload.mobile?payload.mobile:data.mobile;
            data.email   = payload.email?payload.email:data.email;
            data.servicesOffered  = payload.servicesOffered?payload.servicesOffered:data.servicesOffered;
            data.address = payload.address?payload.address:data.address;
            data.location= payload.location?payload.location:data.location;
            data.serviceCompany = payload.serviceCompany?payload.serviceCompany:data.serviceCompany;
    
            [err,updatedData]= await to(data.save());
            if(err) {TE(err.message, true);}
    
            [err,allRecords] = await to(VendorServiceProvider.find({"company":data.company}).sort({"createdAt":-1}));
            if(err) {TE(err.message, true);}
    
            return allRecords?{data: allRecords, permissions: obj}:false;
        }else{
            [err, duplicateData] = await to(VendorServiceProvider.find({"company":data.company,"name":payload.name,
                                                                        "mobile":payload.mobile,"type":payload.type}));
            if(err) {TE(err.message, true);}

            if(duplicateData.length <= 0){
                data.name    = payload.name?payload.name:data.name;
                data.status  = payload.status?payload.status:data.status;
                data.type    = payload.type?payload.type:data.type;
                data.mobile  = payload.mobile?payload.mobile:data.mobile;
                data.email   = payload.email?payload.email:data.email;
                data.servicesOffered  = payload.servicesOffered?payload.servicesOffered:data.servicesOffered;
                data.address = payload.address?payload.address:data.address;
                data.location= payload.location?payload.location:data.location;
                data.serviceCompany = payload.serviceCompany?payload.serviceCompany:data.serviceCompany;
        
                [err,updatedData]= await to(data.save());
                if(err) {TE(err.message, true);}
        
                [err,allRecords] = await to(VendorServiceProvider.find({"company":data.company}).sort({"createdAt":-1}));
                if(err) {TE(err.message, true);}
        
                return allRecords?{data: allRecords, permissions: obj}:false;
            }else{
                {TE(payload.name+" Service Provider already exists!");}
            }
        }
    }else{
        {TE("Service Provider not found");}
    }
},

getGroupWiseCompanyExternalData: async function(type, company, role){
    let err, data;
    let roleData, obj, typeName;

    switch (type) {
        case "vendor":
            typeName = "vendors";
            break;
        case "serviceProvider":
            typeName = "serviceProviders";
            break;
        default:
            typeName = "";
            break;
    }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0][typeName];
    };

    // [err, data] = await to(VendorServiceProvider.find({"company": company, "type":type}).sort({"createdAt":-1}));
    [err, data] = await to(VendorServiceProvider.aggregate([
        {
            $match: {
                company : new mongoose.Types.ObjectId(company),
                type    : type
            }
        },
        {
            $project: {
                createdAt: {
                    $dateToString: {
                        // format: "%d-%m-%G %H:%M:%S",
                        format: "%d-%m-%G",
                        date: "$createdAt"
                    }
                },
                "company": 1, "type": 1, "name": 1,"serviceCompany": 1,
                "status": 1, "key_code": 1, "updatedAt": 1,
                "mobile": 1, "email": 1, "address": 1,
                "servicesOffered":1 ,"status":1 , "location":1
            }
        }
    ]));

    if(err) {TE(err.message, true);}
    return data?{data: data, permissions: obj}:false;
},

getCompanyExternalStaffData: async function(id){
    let err, data;

    [err, data] = await to(VendorServiceProvider.find({"_id": id}).sort({"createdAt":-1}));
    if(err) {TE(err.message, true);}
    return data?data:false;
},

updateGroupWiseExternalStaffData: async function(type, Id, payload, role){
    let err, data, updatedData, allRecords, staffRecords;
    let roleData, obj, typeName, duplicateData;

    switch (type) {
        case "vendor":
            typeName = "vendors";
            break;
        case "serviceProvider":
            typeName = "serviceProviders";
            break;
        default:
            typeName = "";
            break;
    }

    let filterType = '{"' + typeName + '":1,"_id":0}';
    var query = JSON.parse(filterType);

    [err, roleData] = await to(UserRoles.find({"_id": role},query));
    if(err) {TE(err, true);}

    if(roleData){
        obj = roleData[0][typeName];
    };

    [err,staffRecords]= await to(VendorServiceProvider.find({"_id":Id, "type":type}));
    data = staffRecords[0];

    if(err) {TE(err.message, true);}

    if(data){
        if(data.name === payload.name){
            data.status  = payload.status?payload.status:data.status;
            data.type    = payload.type?payload.type:data.type;
            data.mobile  = payload.mobile?payload.mobile:data.mobile;
            data.servicesOffered  = payload.servicesOffered?payload.servicesOffered:data.servicesOffered;
            data.email   = payload.email?payload.email:data.email;
            data.address = payload.address?payload.address:data.address;
            data.serviceCompany = payload.serviceCompany?payload.serviceCompany:data.serviceCompany;
    
            [err,updatedData]= await to(data.save());
            if(err) {TE(err.message, true);}
    
            [err,allRecords] = await to(VendorServiceProvider.find({"company":data.company, "type":type}).sort({"createdAt":-1}));
            if(err) {TE(err.message, true);}
    
            return allRecords?{data: allRecords, permissions: obj}:false;
        }else{
            [err, duplicateData] = await to(VendorServiceProvider.find({"company":data.company,"name":payload.name,
                                                                        "mobile":payload.mobile,"type":type}));
            if(err) {TE(err.message, true);}

            if(duplicateData.length <= 0){
                data.name    = payload.name?payload.name:data.name;
                data.status  = payload.status?payload.status:data.status;
                data.type    = payload.type?payload.type:data.type;
                data.mobile  = payload.mobile?payload.mobile:data.mobile;
                data.servicesOffered  = payload.servicesOffered?payload.servicesOffered:data.servicesOffered;
                data.email   = payload.email?payload.email:data.email;
                data.address = payload.address?payload.address:data.address;
                data.serviceCompany = payload.serviceCompany?payload.serviceCompany:data.serviceCompany;
        
                [err,updatedData]= await to(data.save());
                if(err) {TE(err.message, true);}
        
                [err,allRecords] = await to(VendorServiceProvider.find({"company":data.company, "type":type}).sort({"createdAt":-1}));
                if(err) {TE(err.message, true);}
        
                return allRecords?{data: allRecords, permissions: obj}:false;
            }else{
                {TE(payload.name+" Service Provider already exists!");}
            }
        }
    }else{
        {TE("Service Provider not found");}
    }
},

providersAutoCompleteSearch : async function(companyId, searchString, req){ 
    let err, assets, roleData, obj;

    var autoRecords =[];
    key = [searchString];        
    key.forEach(function(opt){
        autoRecords.push(new RegExp(opt,"i"));                
    }); 

   
    [err, assets] = await to( VendorServiceProvider.aggregate([
        {"$match" : {"company" : new mongoose.Types.ObjectId(companyId)}},
        { "$match": { "servicesOffered": { "$regex": searchString , "$options": "i" }} },
        { "$unwind": "$servicesOffered" },
        { "$match": { "servicesOffered": { "$regex": searchString, "$options": "i" }}},
        { "$group": {
          _id: null,
          data: { "$addToSet": "$servicesOffered" }
        }}
      ]));
    if(err) {TE(err.message);}

    return assets?{data: assets}:false;
}
}