'use strict'
const {to} = require('../middlewares/utilservices');
var StoreRoomService = require('../services/StoreRoomService');

module.exports={
createNewStore: async function(req,res){
    let err, location;
    let roleId = req.user.role._id;

    [err,location] = await to(StoreRoomService.addNewStoreRoom(req.params.companyId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(location && location!==false){
        return res.status(200).json({"status": 200,"success": true,"data": location});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot create a store-room. Try again!"});
    }
},

companyStoresList: async function(req,res){
    let err, locations;
    let roleId = req.user.role._id;

    [err, locations] = await to(StoreRoomService.listOfCompanyStores(req.params.companyId, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(locations && locations!==false){
        return res.status(200).json({"status": 200,"success": true,"data": locations});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company stores. Try again!"});
    }
},

updateStoreRoomData: async function(req,res){
    let err, store;
    let roleId = req.user.role._id;

    [err, store] = await to(StoreRoomService.updateCompanyStoreRoomData(req.params.storeId, req.body, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(store && store!==false){
        return res.status(200).json({"status": 200,"success": true,"data": store});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update store data. Try again!"});
    }
},

getStoreRoomData: async function(req,res){
    let err, store;
    let roleId = req.user.role._id;

    [err, store] = await to(StoreRoomService.getCompanyStoreData(req.params.id, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(store && store!==false){
        return res.status(200).json({"status": 200,"success": true,"data": store});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display store room data. Try again!"});
    }
},
}