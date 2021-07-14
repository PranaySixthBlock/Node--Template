const randomize = require('randomatic');
const mongoosePaginate = require('mongoose-paginate-v2');

var schema = mongoose.Schema({
    companyId   : {type:mongoose.Schema.Types.ObjectId,ref: 'company'},
    projectId   : {type:String,unique: true},
    projectName : {type:String,required: true},
    description : {type: String,required: false,text: true,default:null},
    state       : {type: String,required : false,default:null},
    country     : {type: String,required : false,default:null},
    phone       : {type: String,required : false},
    status      : {type: Boolean,required: true,default: 0}    
},{
    versionKey: false,
    timestamps: true,
    usePushEach : true
});

schema.pre('save', function (next) {
    var project = this;
    project.projectId = randomize('0', 11);
    next(null, project);
});

schema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('This Email was already taken.!'));
    } else {
        next(error);
    }
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model("project", schema, "project");