var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var {to, TE} = require('../middlewares/utilservices');

var schema = mongoose.Schema({
    fullName      : {type: String, required: true},
    email         : {type: String, unique: false, required : true},
    password      : {type: String, required: false, default:null},
    phone         : {type: String, required: false},
    status        : {type: Boolean, required: true, default: 0},
    company       : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    role          : {type: mongoose.Schema.Types.ObjectId, ref: 'user_roles', required: false},
    locations     : [{type: mongoose.Schema.Types.ObjectId, ref: 'locations', required: false}],
    createdBy     : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
    address       : {type: String, required: false, default: null}
  },{
    versionKey: false,
    timestamps: true
});


schema.pre('save', function (next){
  var contact = this;
  if(contact.isModified("password") || contact.isNew){
    bcrypt.genSalt(10, function (error, salt){
      if (error) return next(error);
      bcrypt.hash(contact.password, salt, function (error, hash) {
        if (error) return next(error);
        contact.password = hash;
        //contact.created_by = req.auth_user || req.authUser;
        next(null, contact);
      });
    });
  }else{
    next(null, contact);
  }
});

schema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('This Email is taken!'));
  } else {
    next(error);
  }
});


module.exports = mongoose.model("company_contacts", schema, "company_contacts");