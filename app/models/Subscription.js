var aggregatePaginate = require('mongoose-paginate-v2');
var schema = mongoose.Schema({
    subscription_code : {type: String, required: true, unique: true},
    subscription_type : {type: String, enum: ['Regular','Distributor'], required: true},
    subscription_name : {type: String, required: true},
    description       : {type: String, required: true, text: true, index: true},
    status            : {type: Boolean, required: true, default: 1},
    amount            : {type: Number, required: false, default: 0},
    isPremium         : {type: Boolean, required: false, default: 0},
    state             : {type: String, enum: ['Basic','Premium','Enterprise'], required: true},
    currency_code     : {type: String, enum: ['USD','INR','EUR'], required: false, default: "USD"},
    total_assets      : {type: Number, required: false},
    total_users       : {type: Number, required: false},
    total_tickets     : {type: Number, required: false},
    planID            : {type: String, required: false,default:null},
    paypal_state      : {type: String, enum: ['CREATED','ACTIVE','CANCEL'], default: "CREATED", required: false},
    paypalPlanObject  : {type: Object, required: false, default: null},
    duration_type     : {type: String, enum: ['Monthly','Quarterly','Yearly'], required: false, default: "Monthly"}
}, {
    versionKey: false,
    timestamps: true
}
);
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("subscriptions", schema, "subscriptions");