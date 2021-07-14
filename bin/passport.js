var passport = require("passport");
var {to}=require("../app/middlewares/utilservices");
var User = require('../app/models/User');
var CompanyContacts = require('../app/models/CompanyContacts');
const dotenv = require("dotenv");
dotenv.config();

// app.use(passport.session());
require('../app/middlewares/TokenAuth');

// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//     User.findOne({_id: id}, function (err, user) {
//         done(err, user);
//     });
// });

// Local authentication

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({email: username}, function (error, user) {
            if (error) return done(error);
            if (!user) return done("Incorrect username", false);
            user.verifyPassword(password, function (error, valid) {
                if (error) return done(error, false);
                if (!valid) return done("Incorrect password", false);
                return done(null, user);
            });
        });
    }
));


// JWT authentication

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var options = {};

options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.jwt_secret;

passport.use(new JwtStrategy(options, function (payload, done) {
    console.log(payload)
    User.findOne({_id: payload._id}, function (error, user) {

        if (error) return done(error, false);
        if (!user) return done(null, false);
        // req.auth_user = {"_id":user._id,"email":user.email,"name":user.name,"status":user.status}
        done(null, user);
    });
}));

passport.use('user_rule',
    new JwtStrategy(options,async function (payload, done) {
        console.log(payload)
        let err, authUser,companyResource;
        [err,authUser] = await to(CompanyContacts.findById(payload._id).populate('company',
                                ["accountid","company_name","email","status"]));
                                
        if (err) return done(err, false);
        if (!authUser) return done(null, false);
        let user= authUser;
        if(user.status==true && user.company.status==true){
            req.auth_user = {"_id":user._id,"email":user.email,"fullName":user.fullName,status:user.status};
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
        console.log(payload)
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

//Local Authentication for Native Application's customers

passport.use('customer_rule', 
    new JwtStrategy(options,async function(payload, done){
        let err, customerData;
        [err, customerData] = await to(Customer.findOne({"phone":payload.phone,"status":true}));
        if(err) return done(err, false);
        if(!customerData) return done("Incorrect Phone Number!", false);
        if(customerData){
            req.auth_user = customerData.phone;
            return done(null, customerData);
        }
}));