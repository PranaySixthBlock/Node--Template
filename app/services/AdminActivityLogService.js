var {to,TE} = require('../middlewares/utilservices');
var AdminActivityLog = require('../models/AdminActivityLog');
var UserActivityLog = require('../models/UserActivityLog');

module.exports = {
getAdminActivityList: async function(req){
    let err, activity;
    let options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };
    if(!req.query.page && !req.query.pageSize){
        [err, activity] = await to(AdminActivityLog.find({})
                                    .sort({"createdAt":-1}));
    }else{
        [err, activity] = await to(AdminActivityLog.paginate(AdminActivityLog.find({})
                                                            .sort({"createdAt":-1}),options));
    }
    if(err) {TE(err, message);}

    return activity ? activity : false;
},

getUserActivityList: async function(req){
    let err, activity;
    let options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };
    if(!req.query.page && !req.query.pageSize){
        [err, activity] = await to(UserActivityLog.find({})
                                    .populate('company',['companyName'])
                                    .populate({
                                        path : 'user',
                                        populate: { 
                                            path:  'role',
                                            model: 'user_roles',
                                            select: {'roleName':1},
                                        },
                                        select: { '_id': 1, 'email': 1},
                                    })
                                    .sort({"createdAt":-1}));
    }else{
        [err, activity] = await to(UserActivityLog.paginate(UserActivityLog.find({})
                                                            .populate('company',['companyName'])
                                                            .populate({
                                                                path : 'user',
                                                                populate: { 
                                                                    path:  'role',
                                                                    model: 'user_roles',
                                                                    select: {'roleName':1},
                                                                },
                                                                select: { '_id': 1, 'email': 1},
                                                            })
                                                            .sort({"createdAt":-1}),options));
    }
    if(err) {TE(err, message);}

    return activity ? activity : false;
}
}