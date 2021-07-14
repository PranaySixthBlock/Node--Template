var passport = require("passport");
var User   = require('../app/models/User');
var CompanyContacts = require('../app/models/CompanyContacts');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var {to}=require("../app/middlewares/utilservices");
var dotenv = require("dotenv");

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findOne({_id: id}, function (err, user) {
        done(err, user);
    });
});

var options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.jwt_secret;

passport.use(new JwtStrategy(options, async function (jwt_payload, done) {
    let err, user;
    [err,user] = await to(User.findOne({'_id':jwt_payload._id}));
    console.log(user);
    if(err) return done(err, false);
    if(user) {
        return done(null, user);
    }else{
        return done(null, false);
    }
}));

passport.use('user_rule',
    new JwtStrategy(options,async function (payload, done) {
        let err, authUser,companyResource;
        [err,authUser] = await to(CompanyContacts.findById(payload._id).populate('company',
                                ["accountid","company_name","email","status"]).lean().exec());
                                
        if (err) return done(err, false);
        if (!authUser) return done(null, false);
        let user= authUser;
        if(user.status==true && user.company.status==true){
            req.auth_user = {"_id":user._id,"email":user.email,"name":user.fullname,status:user.status,isPrimary:user.primarycontact};
            req.auth_company=user.company._id;
            req.isAdmin=false;
            req.auth_role=user.role;
            done(null, user);
        }else{
            return done(err, false);
        }
    })
);

passport.use('useradmin_rule',
    new JwtStrategy(options,async function (payload, done) {
        let err, userResource, adminResource,userID;
        userID=payload._id || payload.id;
        [err,userResource] = await to(CompanyContacts.findById(payload._id).populate('company',
                             ["accountid","company_name","email","status"]).lean().exec());
                                
        if (err) return done(err, false);
        if(userResource){
            let user= userResource;
            if(user.status==true && user.company.status==true){
                req.auth_user = {"_id":user._id,"email":user.email,"name":user.fullname,status:user.status,isPrimary:user.primarycontact};
                req.auth_company=user.company._id;
                req.isAdmin=false;
                done(null, user);
            }else{
                return done(err, false);
            }
        }else{
            [err, adminResource]=await to(User.findById(userID).lean().exec());

            if (err) return done(err, false);
            if (!adminResource) return done(null, false);
            req.auth_user = {"_id":adminResource._id,"email":adminResource.email,"name":adminResource.name,"status":adminResource.status}
            req.isAdmin=true;
            done(null, adminResource);
        }
    })
);
