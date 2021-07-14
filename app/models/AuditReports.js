var mongoose = require("mongoose");
var schema = mongoose.Schema(
{
  company           : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
  auditId           : {type: mongoose.Schema.Types.ObjectId, ref: 'audits', required: true},
  assetId           : {type: mongoose.Schema.Types.ObjectId, ref: 'assets', required: true},
  auditAssetId      : {type: mongoose.Schema.Types.ObjectId, ref: 'audit_assets', required: false},
  comments          : [{
                        comment        : {type: String, required: false},
                        commentedBy    : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
                        commentedTime  : {type: Date, required: false, default: Date.now()},
                        assetAvailability : {type: mongoose.Schema.Types.ObjectId, ref: 'admin_dropdowns', required: true},
                        assetCodition     : {type: mongoose.Schema.Types.ObjectId, ref: 'admin_dropdowns', required: true},
                        auditId           : {type: mongoose.Schema.Types.ObjectId, ref: 'audits', required: true},
                        assetId           : {type: mongoose.Schema.Types.ObjectId, ref: 'assets', required: true},
                        comment_images    : [{ 
                                              path: {type: String, required: false},
                                              fileName: {type: String, required: false}
                                          }]
                      }],
  assetAvailability : {type: mongoose.Schema.Types.ObjectId, ref: 'admin_dropdowns', required: true},
  assetCodition     : {type: mongoose.Schema.Types.ObjectId, ref: 'admin_dropdowns', required: true},
  auditedBy         : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: true},
  verificationStatus: {type: Boolean, required: false, default: 0},
  verificationDate  : {type: Date, required: false, default: null}
},{
  versionKey: false,
  timestamps: true
});

module.exports = mongoose.model("audit_report", schema, "audit_report");