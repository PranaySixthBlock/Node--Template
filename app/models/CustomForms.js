var mongoose = require("mongoose");
var schema = mongoose.Schema(
  {
    company     : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    createdBy   : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
    formObject  : {type: Object, required: false, default: null},
    status      : {type: Boolean, required: false, default: 1},
    formName        : {type: String, required: true},
    formDescription : {type: String, required: false}
  },
  {
    versionKey: false,
    timestamps: true
  }
);

module.exports = mongoose.model("customForms", schema, "customForms");