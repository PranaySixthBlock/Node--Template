var mongoosePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
var schema = mongoose.Schema({
tenderId     : {type: String, unique: true},
tender_name  : {type: String, required: true},
emd_amount : {type: Number, required: false, default: 0},//, default: 0
company     : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: false},
tender_category    : {type: mongoose.Schema.Types.ObjectId, ref: 'country_dropdowns', required: false},
department   : {type: mongoose.Schema.Types.ObjectId, ref: 'country_dropdowns', required: false},
country    : {type: mongoose.Schema.Types.ObjectId, ref: 'country_dropdowns', required: false},
state       : {type: mongoose.Schema.Types.ObjectId, ref: 'state_dropdowns', required: false},
city       : {type: mongoose.Schema.Types.ObjectId, ref: 'city_dropdowns', required: false},
department_contact_person1    : {type: String, required: false, default: null},
department_contact_person2    : {type: String, required: false, default: null},
tender_owner       : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
emd_paid_by_company      : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: false},
last_date_to_apply : {type: Date, required: false, default: null},
consortium_allowed      : {type: Boolean, required: false, default: 0},
date_of_refund: {type: Date, required: false, default: null},
partners: [{
            name:{type: String,required: false},
            role:{type: mongoose.Schema.Types.ObjectId, ref: 'user_roles', required: false},
            contact_person :{type: String,required: false},
            company : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: false}
        }],
tender_status :{type: String, required: false},
primary_contact :{type: String, required: false},
secondary_contact :{type: String, required: false},
third_contact :{type: String, required: false},
createdBy   : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false}
},{
    versionKey: false,
    timestamps: true
});


schema.plugin(mongoosePaginate);
schema.plugin(aggregatePaginate);

module.exports = mongoose.model("tenders", schema, "tenders");