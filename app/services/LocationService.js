var {to, TE} = require('../middlewares/utilservices');
var Locations = require('../models/Locations');
var Assets = require('../models/Assets');
var UserRoles = require('../models/UserRoles');

module.exports = {
addNewLocation: async function(company, payload, role){
    let err, location, allLocations, roleData, obj, duplicateData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"locations":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].locations;
    };

    [err, duplicateData] = await to(Locations.find({"company": company, "name": payload.name,
                                                    "city": payload.city, "state": payload.state,
                                                    "country": payload.country}));
    if(err) {TE(err, true);}
    
    if(duplicateData.length <= 0){
        [err, location] = await to(Locations.create({
            company     : company,
            name        : payload.name,
            description : payload.description?payload.description:null,
            address     : payload.address?payload.address:null,
            zip_code    : payload.zip_code?payload.zip_code:null,
            city        : payload.city?payload.city:null,
            state       : payload.state?payload.state:null,
            country     : payload.country?payload.country:null,
            status      : payload.status?payload.status:1,
            latitude    : payload.latitude?payload.latitude:null,
            longitude   : payload.longitude?payload.longitude:null
        }));
    
        location.save();
    
        if(err) {TE(err.message, true);}
    
        [err,allLocations] = await to(Locations.find({"company":company}).sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    
        return (allLocations)?{data: allLocations, permissions: obj}:false;
    }else{
        {TE(payload.name+" location already exists");}
    }
},

listOfCompanyLocations: async function(company, role){
    let err, locations, roleData, obj, tAssets;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"locations":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].locations;
    };

    // [err, tAssets] = await to(Assets.find({"company": company}).populate('location'));
    [err, tAssets] = await to(Locations.aggregate([
                        {
                            "$match" : {"company" : new mongoose.Types.ObjectId(company)}
                        },
                        {
                            $lookup: {
                                from: "assets",
                                localField: "_id",
                                foreignField: "location",
                                as: "asset_locations"
                            }
                        },
                        {
                            $lookup: {
                                from: "tickets",
                                localField: "_id",
                                foreignField: "locations",
                                as: "ticket_locations"
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
                                "_id":1, "name": 1,"city" :1,"state" : 1,"country" : 1,
                                "status": 1,"address":1,'updatedAt':1,
                                "assetCount": { "$size": "$asset_locations" },
                                "ticketCount" :  { "$size":"$ticket_locations"}
                            }
                        }]).sort({"createdAt":-1}));
    [err, locations] = await to(Locations.find({"company": company}).sort({"createdAt":-1}));

    // console.log(tAssets);
    if(err) {TE(err.message, true);}
    return locations?{data: tAssets, permissions: obj}:false;
},

updateCompanyLocationData: async function(locationId, payload, role){
    let err, location, updatedLocation, duplicateData;
    let allLocations, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"locations":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].locations;
    };

    [err,location]= await to(Locations.findById(locationId));
    if(err) {TE(err.message, true);}
    if(location){
        if(location.name === payload.name){
            location.status     = payload.status?payload.status:location.status;
            location.address    = payload.address?payload.address:location.address;
            location.zip_code   = payload.zip_code?payload.zip_code:location.zip_code;
            location.city       = payload.city?payload.city:location.city;
            location.state      = payload.state?payload.state:location.state;
            location.country    = payload.country?payload.country:location.country;
            location.latitude   = payload.latitude?payload.latitude:location.latitude;
            location.longitude  = payload.longitude?payload.longitude:location.longitude;
            location.description= payload.description?payload.description:location.description;
    
            [err,updatedLocation]= await to(location.save());
            if(err) {TE(err.message, true);}
    
            // [err,allLocations] = await to(Locations.find({"company":location.company}).sort({"createdAt":-1}));
            // if(err) {TE(err.message, true);}

            [err, allLocations] = await to(Locations.aggregate([
                {
                    "$match" : {"company" : new mongoose.Types.ObjectId(location.company)}
                },
                {
                    $lookup: {
                        from: "assets",
                        localField: "_id",
                        foreignField: "location",
                        as: "asset_locations"
                    }
                },
                {
                    $lookup: {
                        from: "tickets",
                        localField: "_id",
                        foreignField: "locations",
                        as: "ticket_locations"
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
                        "_id":1, "name": 1,"city" :1,"state" : 1,"country" : 1,
                        "status": 1,"address":1,'updatedAt':1,
                        "assetCount": { "$size": "$asset_locations" },
                        "ticketCount" :  { "$size":"$ticket_locations"}
                    }
                }]).sort({"createdAt":-1}));
    
            return allLocations?{data: allLocations, permissions: obj}:false;
        }else{
            [err, duplicateData] = await to(Locations.find({"company": location.company,"name": payload.name}));
            if(err) {TE(err.message, true);}

            if(duplicateData.length <= 0){
                location.name       = payload.name?payload.name:location.name;
                location.status     = payload.status?payload.status:location.status;
                location.address    = payload.address?payload.address:location.address;
                location.zip_code   = payload.zip_code?payload.zip_code:location.zip_code;
                location.city       = payload.city?payload.city:location.city;
                location.state      = payload.state?payload.state:location.state;
                location.country    = payload.country?payload.country:location.country;
                location.latitude   = payload.latitude?payload.latitude:location.latitude;
                location.longitude  = payload.longitude?payload.longitude:location.longitude;
                location.description= payload.description?payload.description:location.description;
        
                [err,updatedLocation]= await to(location.save());
                if(err) {TE(err.message, true);}
        
                // [err,allLocations] = await to(Locations.find({"company":location.company}).sort({"createdAt":-1}));
                // if(err) {TE(err.message, true);}

                [err, allLocations] = await to(Locations.aggregate([
                    {
                        "$match" : {"company" : new mongoose.Types.ObjectId(location.company)}
                    },
                    {
                        $lookup: {
                            from: "assets",
                            localField: "_id",
                            foreignField: "location",
                            as: "asset_locations"
                        }
                    },
                    {
                        $lookup: {
                            from: "tickets",
                            localField: "_id",
                            foreignField: "locations",
                            as: "ticket_locations"
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
                            "_id":1, "name": 1,"city" :1,"state" : 1,"country" : 1,
                            "status": 1,"address":1,'updatedAt':1,
                            "assetCount": { "$size": "$asset_locations" },
                            "ticketCount" :  { "$size":"$ticket_locations"}
                        }
                    }]).sort({"createdAt":-1}));
        
                return allLocations?{data: allLocations, permissions: obj}:false;
            }else{
                {TE(location.name+" location not found");}
            }
        }
    }else{
        {TE("Location not found");}
    }
},

getCompanyLocationData: async function(locationId, role){
    let err, location, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"locations":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].locations;
    };

    [err, location] = await to(Locations.find({_id: locationId}));

    if(err) {TE(err.message, true);}
    return location?{data: location, permissions: obj}:false;
},
}