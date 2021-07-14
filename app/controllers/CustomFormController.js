var {to} = require('../middlewares/utilservices');
var CustomFormService = require('../services/CustomFormService');

module.exports = {
createCustomForm: async function(req, res){
    let err, data, company, user;

    company = req.user.company._id;
    user = req.user._id;

    [err, data] = await to(CustomFormService.newCustomForm(company, user, req.body));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot create a new custom form. Try again!"});
    }
},

getCompanyForms: async function(req, res){
    let err, data, company, user;

    company = req.user.company._id;
    let roleId = req.user.role._id;

    [err, data] = await to(CustomFormService.companyFormsList(company, roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company's custom forms. Try again!"});
    }
},

getFormById: async function(req, res){
    let err, data, company, user;
    let roleId = req.user.role._id;

    [err, data] = await to(CustomFormService.customFormById(req.params.formId, roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display custom form data. Try again!"});
    }
},

updateCustomForm: async function(req, res){
    let err, data;
    let roleId = req.user.role._id;

    [err, data] = await to(CustomFormService.updateFormById(req.params.formId, req.body, roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update custom form data. Try again!"});
    }
},

getActiveCompanyForms: async function(req, res){
    let err, data, company, user;
    let roleId = req.user.role._id;
    company = req.params.companyId;

    [err, data] = await to(CustomFormService.activeCompanyCustomFormsList(company, roleId));
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(data && data!==false){
        return res.status(200).json({"status": 200,"success": true,"data": data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company's custom forms. Try again!"});
    }
}
}