'use strict'
const {to, TE} = require('../middlewares/utilservices');
var AdminDropdowns = require('../models/AdminDropdowns');

module.exports = {

getDropDown:async function(req, res){
    let err, dropdown;
    [err,dropdown]= await to(AdminDropdowns.findById(req.params.menuId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message":err.message});

    if(dropdown && dropdown!==false){
        return res.status(200).json({"status": 200,"success": true,"data":dropdown});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message":"cannot find the dropdown. Try adding few!"});
    }
},

getAllDropDowns:async function(req, res) {
    let err, alldropdowns;
    var options = (req.query.type)? {type: req.query.type}:{};

    [err,alldropdowns]= await to(AdminDropdowns.find(options).sort({"createdAt":-1}));
    if(err) return res.status(500).json({"status": 500,"success": false,"message":err.message});

    if(alldropdowns && alldropdowns!==false){
        return res.status(200).json({"status": 200,"success": true,"data":alldropdowns});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message":"cannot find the dropdowns. Try adding few!"});
    }
},

createNew:async function(req, res){
    let err, newMenu;

    var dropdown = new AdminDropdowns({
        type     : req.body.type,
        name     : req.body.name,
        status   : req.body.status ? req.body.status : 1,
        key_code : req.body.key_code ? req.body.key_code : null,
        defaultValue : req.body.defaultValue ? req.body.defaultValue : 0,
        message : req.body.message ? req.body.message : null
    });
    
    [err,newMenu]= await to(dropdown.save());
    if(err) return res.status(500).json({"status": 500,"success": false,"message":err.message});

    if(newMenu && newMenu!==false){
        return res.status(200).json({"status": 200,"success": true,"data":newMenu});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message":"Can not create any dropdown. Try again later!"});
    }
},

updateDropDown:async function(req, res){
    let err, dropdown, updatedMenu;

    [err,dropdown]= await to(AdminDropdowns.findById(req.params.menuId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message":err.message});
    if(dropdown){
        dropdown.type     = req.body.type?req.body.type:dropdown.type;
        dropdown.name     = req.body.name?req.body.name:dropdown.name;
        dropdown.status   = req.body.status?req.body.status:dropdown.status;
        dropdown.key_code = req.body.key_code?req.body.key_code:dropdown.key_code;
        dropdown.defaultValue = req.body.defaultValue?req.body.defaultValue:dropdown.defaultValue;
    
        [err,updatedMenu] = await to(dropdown.save());
        if(err) return res.status(500).json({"status": 500,"success": false,"message":err.message});
        if(updatedMenu) return res.status(200).json({"status": 200,"success": true,"data":updatedMenu});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message":"Can not update dropdown. Try again later!"});
    }
},

dropdownInactive:async function(req, res){
    let err, dropdown;
    [err,dropdown]= await to(AdminDropdowns.findById(req.params.menuId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message":err.message});
    if(dropdown){
        dropdown.status = req.body.status;
        [err,dropdown] = await to(dropdown.save());
        if(dropdown) {
            return res.status(200).json({"status": 200,"success": true,"data":dropdown});
        }
    }else{
        return res.status(401).json({"status": 401,"success": false,"message":"Can not update dropdown status. Try again later!"});
    }
}
}