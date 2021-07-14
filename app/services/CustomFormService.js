var {to, TE} = require('../middlewares/utilservices');
var CustomForms = require('../models/CustomForms');
var UserRoles = require('../models/UserRoles');

module.exports = {
newCustomForm: async function(company, user, payload){
    let err, data, duplicate, forms;

    [err, duplicate] = await to(CustomForms.find({"company": company, "formName": payload.formName}));
    if(err) {TE(err.message, true);}

    if(duplicate.length>0){
        {TE("Custom Form with name '"+payload.formName+"' is already exists!");}
    }
    [err, data] = await to(CustomForms.create({
        company     : company,
        createdBy   : user,
        status      : payload.status?payload.status:1,
        formName    : payload.formName,
        formObject  : payload.formObject?payload.formObject:{},
        formDescription : payload.formDescription?payload.formDescription:null
    }));
    if(err) {TE(err.message, true);}

    [err,forms]= await to(data.save());
    if(err) {TE(err, true);}

    return (data)?data:false;
},

companyFormsList: async function(companyId, roleId){
    let err, data, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id":roleId},{"customFields":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].customFields;
    }

    // [err, data] = await to(CustomForms.find({"company": companyId}));
    [err, data] = await to(CustomForms.aggregate([
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
                "company": 1, "createdBy": 1, "formObject": 1,
                "status": 1, "formName": 1, "formDescription": 1,
                "updatedAt": 1
            }
        }
    ]));
    if(err) {TE(err.message, true);}

    return data?{data: data, permissions: obj}:false;
},

customFormById: async function(formId, role){
    let err, data, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id":role},{"customFields":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].customFields;
    }

    [err, data] = await to(CustomForms.findById(formId));
    if(err) {TE(err.message, true);}

    return data?{data: data, permissions: obj}:false;
},

updateFormById: async function(formId, payload, role){
    let err, data, formdata, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id":role},{"customFields":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].customFields;
    }

    [err, data] = await to(CustomForms.findById(formId));
    if(err) {TE(err.message, true);}

    if(data){
        data.set(payload);
        [err,formdata] = await to(data.save());
        if(err) {TE(err.message, true);}
        return {data: formdata, permissions: obj};
    }
    return false;
},

activeCompanyCustomFormsList: async function(companyId, role){
    let data, err, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"customFields":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].customFields;
    };

    [err, data] = await to(CustomForms.find({"company": companyId, "status": true}));
    if(err) {TE(err.message, true);}

    return data?{data: data, permissions: obj}:false;
}
}