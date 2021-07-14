const {to,TE} = require('../middlewares/utilservices');
const randomize = require('randomatic');
const mongoosePaginate = require('mongoose-paginate-v2');
const Subscription = require('./Subscription');
var schema = mongoose.Schema({
    accountid   : {type:String, unique: true,},
    companyName : {type:String, unique: true, required: true},
    about       : {type: String, required: false, text: true, index: true, default: null},
    language    : {type: String, required: false, default: "En"},
    country     : {type: String, required: false, default: null},
    phone       : {type: String, required: false},
    email       : {type: String, required: true,unique: true},
    logo        : {type: String, required: false},
    address     : {type: String, required: false},
    type        : {type: String, enum:['Guest','Distributor','Regular'], required: false, default: "Regular"},
    contacts    : [{type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false}],
    subscription: {type: mongoose.Schema.Types.ObjectId, ref: 'subscriptions', required: false},
    status      : {type: Boolean, required: true, default: 1},
    paymentState: {type: String, enum: ['FreeTrial','Purchased','Pending']}
},{
    versionKey: false,
    timestamps: true,
    usePushEach : true
});

// schema.pre('save', async function (next) {
//     if(this.isNew){
//         var company = this;
//         [err, subscr] = await to(Subscription.findOne({state:"Basic"}));
        
//         if(err) {TE(err, true);}
//         if(subscr){
//             company.paymentState = "FreeTrial";
//             company.subscription = subscr._id;
//         }else{
//            TE("Not found any Basic Subscription");
//         }
//         next(null, company);
//      }else{
//         next(null, company);
//      }
// });

// schema.post('save', function(error, doc, next) {
//     if (error.name === 'MongoError' && error.code === 11000) {
//         next(new Error('This Email was already taken.!'));
//     } else {
//         next(error);
//     }
// });

// schema.plugin(mongoosePaginate);
module.exports = mongoose.model("company", schema, "company");