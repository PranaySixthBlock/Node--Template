var mongoosePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
var schema = mongoose.Schema({
  assetId     : {type: String, unique: true},
  asset_name  : {type: String, required: true},
  asset_code  : {type: String, required: false},
  asset_price : {type: Number, required: false, default: 0},//, default: 0
  company     : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: false},
  category    : {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
  condition   : {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
  location    : {type: mongoose.Schema.Types.ObjectId, ref: 'locations', required: false},
  block       : {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
  floor       : {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
  asset_status: {type: mongoose.Schema.Types.ObjectId, ref: 'admin_dropdowns', required: false},
  serialNo    : {type: String, required: false, default: null},
  model       : {type: String, required: false, default: null},
  color       : {type: String, required: false, default: null},
  doorNo      : {type: String, required: false, default: null},
  brandName   : {type: String, required: false, default: null},
  purchasedFrom : {type: String, required: false, default: null},
  warrantyDue : {type: Date, required: false, default: null},
  lifeTime    : {type: String, required: false, default: null},
  description : {type: String, required: false, default: null},
  status      : {type: Boolean, required: false, default: 1},
  purchaseDate: {type: Date, required: false, default: null},
  installedAt : [{type: String,required: false}],
  predictive_maintenance: {
    timePeriod: {type: String, required: false},
    day       : {type: String, required: false}, //Monday(Week)
    date      : {type: Number, required: false}, //1-31(Monthly Date)
    month     : {type: Number, required: false}, //1-12(Month)
    endsOn    : {type: Date, required: false}
  },
  customform    :  {type: mongoose.Schema.Types.ObjectId, ref: 'customForms', required: false},
  asset_images  : [{path: {type: String, required: false}}],
  customFields  : {type: Object, required: false},
  dynamicFormFileds : [{type: String, required: false}],
  newValidationData : [{type: Object, required: false}],
  customFormAnswers : [{type: Object, required: false}],
  deployedAt        : {type: mongoose.Schema.Types.ObjectId, ref: 'stores', required: false},
  assignedObj : {
    allottedTo  : {type: mongoose.Schema.Types.ObjectId, ref: 'company_employees', required: false},
    allottedDate: {type: Date, required: false},
    returnable  : {type: Boolean, required: false, default: false},
    returnDate  : {type: Date, required: false}
  },
  discordedNote : {type: String, required: false},
  discarded_date: {type: Date, required: false},
  isDiscarded   : {type: Boolean, required: false, default: false},
  using_location: {type: mongoose.Schema.Types.ObjectId, ref: 'locations', required: false},
  statusCondition : {type: String, required: false},
  isDeployedAndUsing : {type: Boolean, required: false, default: false},
  isAssignedAndUsing : {type: Boolean, required: false, default: false},
  isReturnable  : {type: Boolean, required: false, default: false},
  returnDate    : {type: Date, required: false},
  returnNote    : {type: String, required: false},
  returnedBy    : {type: mongoose.Schema.Types.ObjectId, ref: 'company_employees', required: false},
  returnCondition: {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
  allocationValidationData : [{type: Object, required: false}],
  maintenanceValidationData: [{type: Object, required: false}],
  auditAssetAvailability   : {type: Boolean, required: false, default: 0},
  auditId                  : {type: mongoose.Schema.Types.ObjectId, ref:'audit_report', required: false},
  auditIds                 : [{type: mongoose.Schema.Types.ObjectId, ref:'audit_report', required: false}],
  audit                    : {type: mongoose.Schema.Types.ObjectId, ref:'audits', required: false},
},{
    versionKey: false,
    timestamps: true
});

schema.index({ 'asset_code': "text", 'asset_name': 'text'});

schema.plugin(mongoosePaginate);
schema.plugin(aggregatePaginate);

module.exports = mongoose.model("assets", schema, "assets");