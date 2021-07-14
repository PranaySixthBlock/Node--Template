'use strict'
const {to} = require('../middlewares/utilservices');
var LocationService = require('../services/LocationService');

module.exports={
createNewLocation: async function(req,res){
    let err, location;
    let roleId = req.user.role._id;

    [err,location]= await to(LocationService.addNewLocation(req.params.companyId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(location && location!==false){
        return res.status(200).json({"status": 200,"success": true,"data": location});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot create a location. Try again!"});
    }
},

companyLocationsList: async function(req,res){
    let err, locations;
    let roleId = req.user.role._id;

    [err, locations] = await to(LocationService.listOfCompanyLocations(req.params.companyId, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(locations && locations!==false){
        return res.status(200).json({"status": 200,"success": true,"data": locations});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company locations. Try again!"});
    }
},

updateLocationData: async function(req,res){
    let err, location;
    let roleId = req.user.role._id;

    [err, location] = await to(LocationService.updateCompanyLocationData(req.params.locationId, req.body, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(location && location!==false){
        return res.status(200).json({"status": 200,"success": true,"data": location});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update company location data. Try again!"});
    }
},

getLocationData: async function(req,res){
    let err, location;
    let roleId = req.user.role._id;

    [err, location] = await to(LocationService.getCompanyLocationData(req.params.locationId, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(location && location!==false){
        return res.status(200).json({"status": 200,"success": true,"data": location});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company location data. Try again!"});
    }
},
}