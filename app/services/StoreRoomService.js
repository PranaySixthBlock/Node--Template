var {to, TE} = require('../middlewares/utilservices');
var Locations = require('../models/Locations');
var Assets = require('../models/Assets');
var UserRoles = require('../models/UserRoles');
var StoreRooms = require('../models/StoreRooms');

module.exports = {
addNewStoreRoom: async function(company, payload, role){
    let err, store, allStores, roleData, obj={}, duplicateData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"storeRooms":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].storeRooms;
    };

    [err, duplicateData] = await to(StoreRooms.find({"company": company, "store_name": payload.store_name,
                                                    "location": payload.location}));
    if(err) {TE(err, true);}
    
    if(duplicateData.length <= 0){
        [err, store] = await to(StoreRooms.create({
            company      : company,
            location     : payload.location,
            store_name   : payload.store_name?payload.store_name:null,
            // store_address: payload.store_address?payload.store_address:null,
            store_manager: payload.store_manager?payload.store_manager:null,
            store_phone  : payload.store_phone?payload.store_phone:null,
            store_email  : payload.store_email?payload.store_email:null,
            status       : payload.status?payload.status:1
        }));
    
        store.save();
    
        if(err) {TE(err.message, true);}
    
        [err,allStores] = await to(StoreRooms.find({"company": company}).sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    
        return (allStores)?{data: allStores, permissions: obj}:false;
    }else{
        {TE(payload.store_name+" Store Room already exists");}
    }
},

listOfCompanyStores: async function(company, role){
    let err, stores, roleData, obj={}, tAssets;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"storeRooms":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].storeRooms;
    };
    
    [err, stores] = await to(StoreRooms.find({"company": company})
                                        .populate('location', ['name'])
                                        .sort({"createdAt":-1}));
    if(err) {TE(err.message, true);}
    return stores?{data: stores, permissions: obj}:false;
},

updateCompanyStoreRoomData: async function(storeId, payload, role){
    let err, store, updatedStore, duplicateData;
    let allStores, roleData, obj={};

    [err, roleData] = await to(UserRoles.find({"_id": role},{"storeRooms":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].storeRooms;
    };

    [err,store]= await to(StoreRooms.findById(storeId));
    if(err) {TE(err.message, true);}
    if(store){
        if(store.store_name === payload.store_name){
            // store.store_address  = payload.store_address?payload.store_address:store.store_address;
            store.store_manager  = payload.store_manager?payload.store_manager:store.store_manager;
            store.store_phone    = payload.store_phone?payload.store_phone:store.store_phone;
            store.store_email    = payload.store_email?payload.store_email:store.store_email;
            store.location       = payload.location?payload.location:store.location;
            store.status         = payload.status?payload.status:store.status;
                
            [err,updatedStore]= await to(store.save());
            if(err) {TE(err.message, true);}
    
            [err,allStores] = await to(StoreRooms.find({"company":store.company}).sort({"createdAt":-1}));
            if(err) {TE(err.message, true);}
    
            return allStores?{data: allStores, permissions: obj}:false;
        }else{
            [err, duplicateData] = await to(StoreRooms.find({"company": store.company,
                                                "location": payload.location,"store_name": payload.store_name}));
            if(err) {TE(err.message, true);}

            if(duplicateData.length <= 0){
                store.store_name     = payload.store_name?payload.store_name:store.store_name;
                // store.store_address  = payload.store_address?payload.store_address:store.store_address;
                store.store_manager  = payload.store_manager?payload.store_manager:store.store_manager;
                store.store_phone    = payload.store_phone?payload.store_phone:store.store_phone;
                store.store_email    = payload.store_email?payload.store_email:store.store_email;
                store.location       = payload.location?payload.location:store.location;
                store.status         = payload.status?payload.status:store.status;
                    
                [err,updatedStore]= await to(store.save());
                if(err) {TE(err.message, true);}
        
                [err,allStores] = await to(StoreRooms.find({"company": store.company})
                                                    .populate('location', ['name'])
                                                    .sort({"createdAt":-1}));
                if(err) {TE(err.message, true);}
        
                return allStores?{data: allStores, permissions: obj}:false;
            }else{
                {TE(store.name+" store not found");}
            }
        }
    }else{
        {TE("Store not found");}
    }
},

getCompanyStoreData: async function(storeID, role){
    let err, store, roleData, obj={};

    [err, roleData] = await to(UserRoles.find({"_id": role},{"storeRooms":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].storeRooms;
    };

    [err, store] = await to(StoreRooms.find({_id: storeID}).populate('location',['name']));

    if(err) {TE(err.message, true);}
    return store?{data: store, permissions: obj}:false;
},
}