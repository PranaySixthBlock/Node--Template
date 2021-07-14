var randomize = require('randomatic');
const mongoosePaginate = require('mongoose-paginate-v2');
var schema = mongoose.Schema({
    transactionId   : {type: String,required: false,unique: true},
    companyId       : {type: mongoose.Schema.Types.ObjectId,ref: 'company',required: true},
    subscriptionId  : {type: mongoose.Schema.Types.ObjectId,ref: 'subscriptions',required: true},
    planId          : {type: String,default: null},
    agreementID     : {type: String,required: false,default: null},
    amount          : {type: Number,default: 0,required: true},
    debtOn          : {type: Date,required: false,defualt: null},
    nextDue         : {type: Date,required: false, defualt: null},
    state           : {type: String,required: true,enum:['Success','Failed','Pending']},
    failDate        : {type: Date,required: false, defualt: null},
    companyEmail    : {type: String,required: true,default: null},

},{
    versionKey: false,
    timestamps: true,
});

schema.pre('save',async function (next) {
    var transaction = this;
    if(this.isNew){
        var unq = Date.now().toString();
        transaction.transactionId = "TS"+randomize('A0', 5)+unq.slice(-6);
        next(null,transaction);
    }else{
        next(null,transaction);
    }
});
schema.plugin(mongoosePaginate);
module.exports = mongoose.model('payments',schema,'payments');