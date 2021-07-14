const mongoosePaginate = require('mongoose-paginate-v2');
var schema = mongoose.Schema({
    module  : {type: String, required: true},
    activity: {type: String, required: false},
    status  : {type: Boolean, required: false, default: true}
},{
    versionKey: false,
    timestamps: true,
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model('cronActivityLog',schema,'cronActivityLog');