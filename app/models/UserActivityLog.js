const mongoosePaginate = require('mongoose-paginate-v2');
var schema = mongoose.Schema({
    company : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    user    : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: true},
    module  : {type: String, required: true},
    activity: {type: String, required: false}
},{
    versionKey: false,
    timestamps: true,
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model('userActivityLog',schema,'userActivityLog');