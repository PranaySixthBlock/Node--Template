var passport = require("passport");
const CompanyContacts   = require('../models/CompanyContacts');
const Users = require('../models/User');
const dotenv = require("dotenv");
var {to}=require("./utilservices");
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
dotenv.config();

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.jwt_secret;



// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//     CompanyContacts.findOne({_id: id}, function (err, user) {
//         done(err, user);
//     });
// });

passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {

    let err, user;
    [err, user] = await to(Users.findOne({'_id':jwt_payload._id}));
    if(err) return done(err, false);
    if(user) {
        return done(null, user);
    }else{
        return done(null, false);
    }
}));


passport.use('jwt-1',
    new JwtStrategy(opts,async function (payload, done) {
        let err, authUser,companyResource;
        [err,authUser] = await to(CompanyContacts.findOne({"_id":payload._id}).populate('company',
                                ["accountid","company_name","email","status"])
                                .populate('role').lean().exec());
                                
        if (err) return done(err, false);
        if (!authUser) return done(null, false);
        
        let user= authUser;
   
        if(user.status==true && user.company.status==true){
            // let test={};
            // test.auth_user = {"_id":user._id,"email":user.email,"name":user.fullName,status:user.status};
            // test.auth_company=user.company._id;
            // test.isAdmin=false;
            // test.auth_role=user.role;
            // user.authObj = test;
            user.isAdmin = false;
            return done(null, user);
        }else{
            return done(err, false);
        }
    })
);

passport.use('jwt-userAdmin',
    new JwtStrategy(opts,async function (payload, done) {
        let err, userResource, adminResource,userID;
        userID=payload._id || payload.id;
        [err,userResource] = await to(CompanyContacts.findById(payload._id).populate('company',
                             ["accountid","company_name","email","status"])
                             .populate('role').lean().exec());
                                
        if (err) return done(err, false);
        if(userResource){
            let user= userResource;
            if(user.status==true && user.company.status==true){
                // let test={};
                // test.auth_user = {"_id":user._id,"email":user.email,"name":user.fullName,status:user.status};
                // test.auth_company=user.company._id;
                // test.isAdmin=false;
                // test.auth_role=user.role;
                // user.authObj = test;
                user.isAdmin = false;

                return done(null, user);
            }else{
                return done(err, false);
            }
        }else{
            [err, adminResource]=await to(Users.findById(userID).lean().exec());

            if (err) return done(err, false);
            if (!adminResource) return done(null, false);
                // let test={};
                // test.auth_user = {"_id":adminResource._id,"email":adminResource.email,"name":adminResource.name,status:adminResource.status};
                // test.isAdmin=true;

                adminResource.isAdmin = true;
                return done(null, adminResource);
        }
    })
);
