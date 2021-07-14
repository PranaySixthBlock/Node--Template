var jwt = require('jsonwebtoken');
const {to} =  require('../middlewares/utilservices');
var AuthService = require('../services/AuthService');
var randomize = require('randomatic');
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
var Company = require('../models/Company');
var UserRoles = require('../models/UserRoles');
var CompanyContacts = require('../models/CompanyContacts');
// var Permissions = require('../models/Permissions');
var User = require('../models/User');
var AdminAcitvityLogController = require('../controllers/AdminActivityLogController');
module.exports = {

token: function (req, res) {

    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) return res.status(400).json({"message":"Please provide email and password!","success":false});

    User.findOne({email: email}, function (error, user) {

        if (error) return res.status(500).json({"message":"Server Error", "success":false, "status":500});
        if (!user) return res.status(400).json({"message":"Sorry, Looks like you didn't register yet. Please register and login", "success":false, "status":400});
        
        user.comparePassword(password, async function (error, valid) {

            if (error) return res.status(500).json({"message":"Server Error", "success":false, "status":500});
            if (!valid) {
                return res.status(400).json({"message":"Invalid Password", "success":false, "status":400});
            }else{
                if(user.status === true || user.status === 1){
                    req.auth_user = {"_id":user._id,"email":user.email,"name":user.name,"status":user.status}
                    let test = {
                        user: user,
                        token:"Bearer "+jwt.sign(
                            user.toJSON(),
                            process.env.jwt_secret,
                            {expiresIn: process.env.jwt_expires}
                        ),
                        expires: process.env.jwt_expires
                    };

                    let activity = user.email+" has logged in to the Admin Portal";
                    
                    let adminActivitySaving;
                    [err, adminActivitySaving] = await to(AdminAcitvityLogController.createAdminActivity(user._id,"Admin",activity));

                    return res.status(200).json({"status":200,"data":test,"success":true});
                }else{
                    return res.status(400).json({"message":"Invalid password. Please contact admin!", "success":false, "status":400});
                }
            }
        });
    })
},

customerRegister: async function(req, res){
    let err, newCustomer;
   
    [err,newCustomer] = await to(AuthService.createNewCustomer(req.body));
    if(err) {
        return res.status(500).json({"message":err.message,"success":false, "status":500});
    }
    if(newCustomer){
        res.status(200).json({"status":200,"data":newCustomer,"success":true})
   }
},

userSocialRegister: async function(req, res){
    let err, newCustomer;
    [err,newCustomer] = await to(AuthService.createNewCustomer(
                                {
                                    fullName:req.body.name,
                                    companyName:"",
                                    password:"",
                                    phone:"",
                                    address:"",
                                    email:req.body.email,
                                    isSocial:1
                                }));
    if(err) {
        return res.status(500).json({"message":err.message,"success":false, "status":500});
    }
    if(newCustomer){
        res.status(200).json({"status":200,"data":newCustomer,"success":true})
   }
},

userSocialSignIn:async function(req, res){

    let err, mycontacts,emaildata;
    var email = req.body.email;
    let sampleData, companyCheck;

    if(!email) return res.status(400).json({"message":"Please provide email and password!","success":false});

    [err, mycontacts] = await to(CompanyContacts.findOne({email: email},['fullName','email','password','phone','status','role'])
                                    .populate('company',["accountid","company_name","email","status"])
                                    .populate('role')
                                    .collation({locale: "en", strength: 2}).exec());

    if(!mycontacts || mycontacts==null) return res.status(400).json({"message":"Sorry, we do not have an account with this email. Please register and login.", "success":false, "status":400})
    if(err) return res.status(500).json({"message":"Server Error", "success":false, "status":500});
    
    [err, sampleData] = await to(CompanyContacts.findOne({email: email},['fullName','email','password','phone','status','role','company'])
                                    .collation({locale: "en", strength: 2}).exec());

    [err,companyCheck] = await to(Company.find({"_id":mycontacts.company,"contacts":{$in:[mycontacts._id]}}));
    if(err) return res.status(500).json({"message":"Server Error", "status":false, "status":500});
    
    if(mycontacts.status==true && companyCheck[0].status==true && companyCheck){
        let test = {
                        user: mycontacts, 
                        token: "Bearer "+jwt.sign(sampleData.toJSON(),                     
                            process.env.jwt_secret,
                            {expiresIn: process.env.jwt_expires}
                        ),
                        expires: process.env.jwt_expires
                    }
        
        let user_activity = email+" has logged into the User Portal";

        await AdminAcitvityLogController.createUserActivity(sampleData.company, sampleData._id,"User Portal",user_activity);
        
        return res.status(200).json({"status":200,"data":test,"success":true});
    }else{
        return res.status(400).json({"message":"Your Account is In-active, Email was sent to "+req.body.email+".Please check your inbox and click on the verification link. Please check spam folder if you cannot find email in your inbox", "success":false, "status":400});
    }
},

customerlogin: async function(req, res){

    let err, mycontacts,emaildata;
    let sampleData, companyCheck;
    
    var email = req.body.email;
    var password = req.body.password;

    if(!email || !password) return res.status(400).json({"message":"Please provide email and password!","success":false});

    [err, mycontacts] = await to(CompanyContacts.findOne({email: email},['fullName','email','password','phone','status','role'])
                                    .populate('company',["accountid","company_name","email","status"])
                                    .populate('role')
                                    .collation({locale: "en", strength: 2}).exec());
    if(!mycontacts || mycontacts==null) return res.status(400).json({"message":"Sorry, we do not have an account with this email. Please register and login.", "success":false, "status":400})
    
    if(err) return res.status(500).json({"message":"Server Error", "success":false, "status":500});
    
    [err, sampleData] = await to(CompanyContacts.findOne({email: email},['fullName','email','password','phone','status','role','company'])
                                    .collation({locale: "en", strength: 2}).exec());

    [err,companyCheck] = await to(Company.find({"_id":mycontacts.company,"contacts":{$in:[mycontacts._id]}}));
    if(err) return res.status(500).json({"message":"Server Error", "status":false, "status":500});

    if(mycontacts.status==true && companyCheck[0].status==true && companyCheck){
        bcrypt.compare(password, mycontacts.password,async function (error, match) {
            if (match) {
                let testUser,isTestUser;

                [err,testUser]=await to(User.findOne({email:email}).exec());
                if(err || !testUser) isTestUser=false;

                if(testUser) isTestUser=true;
                let test = {
                                user: mycontacts,
                                testUser:isTestUser,  
                                token: "Bearer "+jwt.sign(sampleData.toJSON(),                     
                                    process.env.jwt_secret,
                                    {expiresIn: process.env.jwt_expires}
                                ),
                                expires: process.env.jwt_expires
                            }
                
                let user_activity = email+" has logged into the User Portal";

                await AdminAcitvityLogController.createUserActivity(sampleData.company, sampleData._id,"User Portal",user_activity);
                
                return res.status(200).json({"status":200,"data":test,"success":true});
            }else{
                return res.status(400).json({"message":"Incorrect username or password. Please try again.", "success":false, "status":400});
            }
        }); 
    }else{
        return res.status(400).json({"message":"Your Account is In-active, Email was sent to "+req.body.email+".Please check your inbox and click on the verification link. Please check spam folder if you cannot find email in your inbox", "success":false, "status":400});
    }
},

changePassword: async function(req, res){
    let err, data;

    let auth_user = req.user._id;
    let roleId = req.user.role._id;

    [err, data] = await to(AuthService.updateUserPassword(req.body, auth_user, roleId));
    if(err) return res.json({"status": 500,"success": false, "message": err.message});
    if(data && data!==false){
        return res.json({"status": 200,"success": true,"data": data});
    }else{
        return res.json({"status": 401,"success": false,"message": "Can't update user password. Try Again!"});
    }
}
}