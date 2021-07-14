'use strict'
const {to,TE} = require('../middlewares/utilservices');
var Company = require('../models/Company');
var UserRoles = require('../models/UserRoles');
var Assets = require('../models/Assets');
var CompanyContacts = require('../models/CompanyContacts');
var self= module.exports={
companyDetails: async function(companyId, role, isAdmin){
    let err, companyDetails, roleData, obj;
    let userData, usersList;
    if(isAdmin === false){
        [err, roleData] = await to(UserRoles.find({"_id":role},{"companySettings":1}));
        if(err) {TE(err, true);}

        if(roleData){
            obj=roleData[0].companySettings;
        }
    }
    [err, companyDetails] = await to(Company.aggregate([{$match:{
                                                    _id:new mongoose.Types.ObjectId(companyId)}},
                                                {
                                                    $lookup:{
                                                        from:"company_subscriptions",
                                                        localField:"_id",
                                                        foreignField:"company",
                                                        as:"subscriptions"
                                                    },
                                                },{
                                                    $lookup:{
                                                        from:"payments",
                                                        localField:"_id",
                                                        foreignField:"companyId",
                                                        as:"invoices"
                                                    },
                                                },{
                                                  $project:{
                                                      'about':1,'language':1,'country':1,'type':1,'email':1,
                                                      'status':1,'companyName':1,'accountid':1,'phone':1,'address':1,
                                                      'createdAt':1,'updatedAt':1,'subscriptions':1,'logo':1 ,'invoices':1
                                                  }  
                                                }]).exec());
    if(err) {TE(err, true);}
    usersList = companyDetails[0];
    if(companyDetails && isAdmin === true){
        [err, userData] = await to(CompanyContacts.find({"company":companyId})
                                                .populate('role',['roleName']));
        if(err) {TE(err, true);}

        companyDetails[0]['contacts'] = userData;
    
    }
    if(!companyDetails) return false;
    if(companyDetails && isAdmin === false) {return {data: companyDetails[0], permissions: obj}}
    else {return {data: companyDetails[0]}}
   
},

allCompanies: async function(req){
    let err, data, assets;

    var options = {
            sort: { createdAt: -1 },
            lean: true,
            page: req.query.page,
            limit: req.query.pageSize
        };

    [err, assets] = await to(Assets.aggregate([
        {
            $group:{
                "_id": "$company",
                "count": {$sum: 1}
            }
        },{
            $project:{
                "count": 1, "company":1
            }
        }
    ]));
    if(err) {TE(err.message, true);}

    [err,data]= await to(Company.paginate({},options));
    if(err) {TE(err, true);}
    if(data){
        let docs = data.docs;
        await docs.forEach(async data => {
            await assets.forEach(async assets => {
                if(data.id == assets._id){
                    data["assets_count"] = assets.count;
                }
            });
        });
        return data;
    }else{
        return false;
    }
},

editAuthUserProfile: async function(payload, authUserId, roleId){
    let err, profileData, updateData, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id":roleId},{"users":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].users;
    }

    [err, profileData]=await to(CompanyContacts.findById(authUserId).exec());
    if(err) TE(err.message, true);

    if(profileData){
        await profileData.set(payload);        
        [err, updateData]= await to(profileData.save());
        if(err){TE(err, true);}
        if(updateData){
            return {data: updateData, permissions: obj};
        }else{
            return false;
        }
    }else{
        return 404;
    }
},

changeUserPassword: async function(userId, payload, role){
    let err, userResource, savedUser, roleData, obj;

    [err, roleData] = await to(UserRoles.find({"_id":role},{"users":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].users;
    }

    [err,userResource]= await to(CompanyContacts.findById(userId));
    if(err) {TE(err, true);}
    if(userResource){
        userResource.set(payload);

        [err, savedUser]=await to(userResource.save());
        if(err) {TE(err, true);}
        if(savedUser){
            return {data: savedUser, permissions: obj};
        }
    }else{
        return false;
    }
},


/**
 * Admin Module==> Company Status Update
 * @param {*} payload :: body Object(Form Data).
 * @param {*} companyId :: company ID(PK).
 */
updateCompanyDetails: async function(companyId, payload){
    let err, company,savedCompany;

    [err, company]= await to(Company.findById(companyId).exec());
    if(err) TE(err.message, true);
    if(company){
        company.set(payload);
        [err, savedCompany]=await to(company.save());
        if(err) TE(err.message, true);
        return (savedCompany)? savedCompany:false;
    }else{
        return 404;
    }
},

/**
 * Admin Module==> Company Contact Status Change
 * @param {*} payload :: body Object(Form Data).
 * @param {*} contactId :: conatct ID(PK).
 */
companyContactStatus:async function(payload, contactId){
    let err, contactDetails;
    [err,contactDetails]= await to(CompanyContacts.findByIdAndUpdate(contactId, payload, {new: true}).exec());
    if(err) {TE(err, true);}
    if (!contactDetails) return false;
    if(contactDetails) return contactDetails;
},

addContact:async function(payload, authCompany){
    let err, contact;

    [err, contact]=await to(CompanyContacts.create({
                                fullName: payload.fullName,
                                email:payload.email.toLowerCase(),
                                password: payload.password,
                                phone:payload.phone,
                                primarycontact:0,
                                status:1,
                                company:authCompany,
                                role: payload.role
                            }));
    if(err) {TE(err, true);}
    return (contact)? contact:false;
},

displayCompanyLogo: async function(company){
    let err, data;

    [err, data] = await to(Company.find({"_id": company},{"logo":1}));

    if(err) {TE(err.message, true);}
    return data?data:false;
},

removeCompanyLogo: async function(company){
    let err, images, imageData, allImages;

    [err, imageData] = await to(Company.update({"_id":company},
                            {$set: {"logo": ""}}));
    if(err) TE(err.message);
    
    if (imageData) return "Logo deleted successfully!"
}
}