var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

var schema = mongoose.Schema(
{
    company     : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    auditId     : {type: mongoose.Schema.Types.ObjectId, ref: 'audits', required: true},
    assetId     : {type: mongoose.Schema.Types.ObjectId, ref: 'assets', required: true},
    auditDoneBy : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
    auditedOn   : {type: Date, required: false, default: null},
    isVerified  : {type: Boolean, required: false, default: false},
    status      : {type: Boolean, required: false, default: true}
},{
    versionKey: false,
    timestamps: true
});

schema.plugin(mongoosePaginate);
schema.plugin(aggregatePaginate);

module.exports = mongoose.model("audit_assets", schema, "audit_assets");