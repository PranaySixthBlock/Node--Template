'use strict'
const {to,TE} = require('../middlewares/utilservices');
var User = require('../models/User');
module.exports={

findOneUser:async function(id){
    let err, userobj;

    [err,userobj]= await to(User.findById(id).populate('role').lean().exec());
    if(err) {TE(err, true);}
    if (!userobj) return false;
    if(userobj) return userobj;
},


getAllUsers:async function() {
    let err, users;
    var options = {
        sort: { createdAt: -1 },
        lean: true,
        page: 1,
        limit: 10
        };
    [err,users]= await to(User.paginate({},options));
    if(err) {TE(err, true);}
    if (!users || users.length === 0) return false;
    if(users) return users
    
},


createNewUser:async function(payload){
    let err, newUser;
    var user = new User({
        email     : payload.email,
        password  : payload.password,
        name      : payload.name,
        status    : 1,
        role      : payload.role,
    });
    [err,newUser]= await to(user.save());
    if(err) {TE(err, true);}
    if(newUser){
        return newUser;
    }else{
        return false;
    }
},

editUserDoc:async function(payload, user_id){
    let err, user, updateUser;
    
    [err,user]= await to(User.findById(user_id));
    if(!user) return 204;
    if(err) {TE(err, true);}
        user.email   = payload.email;
        user.name    = payload.name;
        user.status  = payload.status ? payload.status:0;
        user.role    = payload.role;
    [err,updateUser]= await to(user.save());
    if(err) {TE(err, true);}
    if(updateUser){
        return updateUser;
    }else{
        return false;
    }
},


updateUserStatus:async function(payload, user_id){
    let err, user, saveduser;

    [err,user]= await to(User.findById(user_id));
    if(err) TE(err, true);
    if(!user){
        return 204;
    }else{
        user.status = payload.status;  
        [err,saveduser]= await to(user.save());
        if(err) {TE(err, true);}
        if(saveduser){
            return saveduser;
        }else{
            return false;
        }
    } 
}

};