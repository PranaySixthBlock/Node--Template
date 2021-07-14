const mongoosePaginate = require('mongoose-paginate-v2');
var schema = mongoose.Schema({
    company  : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    assetId  : {type: mongoose.Schema.Types.ObjectId, ref: 'assets', required: true},
    module   : {type: String, required: false},
    userId   : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: true},
    activity : {type: String, required: false},
    enableReturn : {type: Boolean, required: false, default: true}
},{
    versionKey: false,
    timestamps: true,
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model('assetAllotmentActivityLog',schema,'assetAllotmentActivityLog');