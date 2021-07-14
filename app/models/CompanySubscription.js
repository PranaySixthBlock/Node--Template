var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
var schema = mongoose.Schema({
    company             : {type: mongoose.Schema.Types.ObjectId, unique: false, ref: 'company', required: true},
    subscription        : {type: mongoose.Schema.Types.ObjectId, ref: 'subscriptions', required: true},
    subscriptionObj     : {type: Object, required: false, default: null },
    purchase_date       : {type: Date, required: false, default: Date.now},
    agreementID         : {type: String, required: false, default: null},
    start_date          : {type: Date, required: false, default: null},
    nextDueDate         : {type: Date, required: false, default: null},
    agreedAmount        : {type: Number, required: true, default: 0},
    agreementStatus     : {type: String, required: false, default: null},
    discontinue_date    : {type: Date, required: false, default: null},
    agreementObject     : {type: Object, default: null},
    planID              : {type: String, required: false, default: null},
    final_payment_date  : {type: Date},
    failed_payment_count: {type: Number},
    isPremium           : {type: Boolean, default: 1, required: false},
    subscriberState     : {type: String, enum:['FreeTrial','Purchased','Completed','Pending'], required: true},
    freeTrialStart      : {type: Date, default: Date.now()},
    // freeTrialEnd        : {type: Date, default: Date.now()+31*24*60*60*1000},
    freeTrialEnd        : {type: Date, required: false},
    status              : {type: Boolean, required: false, default: true},
    cancelDate          : {type: Date, default: null, required: false},
    total_assets        : {type: Number, required: false},
    total_users         : {type: Number, required: false},
    total_tickets       : {type: Number, required: false}
    
},{
    versionKey: false,
    timestamps: true
});
schema.plugin(mongoosePaginate);
module.exports = mongoose.model("company_subscriptions", schema, "company_subscriptions");