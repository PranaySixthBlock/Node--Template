var mongoose = require("mongoose");
var schema = mongoose.Schema(
{
  company     : {type: mongoose.Schema.Types.ObjectId, ref:'company', required: true},
  auditName   : {type: String, required: true},
  locationId  : [{type: mongoose.Schema.Types.ObjectId, ref:'locations', required: true}],
  assetTypeId : [{type: mongoose.Schema.Types.ObjectId, ref:'user_dropdowns', required: true}],
  auditUserId : [{type: mongoose.Schema.Types.ObjectId, ref:'company_contacts', required: true}],
  status      : {type: Boolean, required: false, default: 1},
  auditStatus : {type: mongoose.Schema.Types.ObjectId, ref:'admin_dropdowns', required: true},
  completedOn : {type: Date, required: false, default: null},
  startDate   : {type: Date, required: false, default: null},
  endDate     : {type: Date, required: false, default: null},
  createdBy   : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false}
},{
  versionKey: false,
  timestamps: true
});

module.exports = mongoose.model("audits", schema, "audits");