var mongoose = require("mongoose");
var {to, TE} = require('../middlewares/utilservices');

var schema = mongoose.Schema({
    roleName : {type: String, required: true},
    // company  : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    status   : {type: Boolean, required: false, default: 1},
    
    user_management :{
      canCreate     : {type: Boolean, default: 0, required: false},
      canView       : {type: Boolean, default: 0, required: false},
      canUpdate     : {type: Boolean, default: 0, required: false},
      canDelete     : {type: Boolean, default: 0, required: false},
      sequence      : {type: Number, default: 1, required: false},
      isMenu        : {type: Boolean, default: 1, required: false},
      parent        : {type: String, default: "user_management", required: false}
    },
    users :{
      canCreate     : {type: Boolean, default: 0, required: false},
      canView       : {type: Boolean, default: 0, required: false},
      canUpdate     : {type: Boolean, default: 0, required: false},
      canDelete     : {type: Boolean, default: 0, required: false},
      isMenu        : {type: Boolean, default: 0, required: false},
      parent        : {type: String, default: "user_management", required: false}
    },
    permissions :{
      canCreate     : {type: Boolean, default: 0, required: false},
      canView       : {type: Boolean, default: 0, required: false},
      canUpdate     : {type: Boolean, default: 0, required: false},
      canDelete     : {type: Boolean, default: 0, required: false},
      isMenu        : {type: Boolean, default: 0, required: false},
      parent        : {type: String, default: "user_management", required: false}
    }
    // createdBy     : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false}
    
   },{
    versionKey: false,
    timestamps: true
});

schema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('This Email is taken!'));
  } else {
    next(error);
  }
});


module.exports = mongoose.model("Users_permissions", schema, "Users_permissions");