var schema = mongoose.Schema({
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    type: {
        type: String,
        enum: ['assetcondition', 'assetcategories', 'assetstatus', 'ticketstatus', 'block', 'floor', 'tickettype'],
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: false
    },
    message: {
        type: String,
        required: false,
        unique: false
    },
    status: {
        type: Boolean,
        required: false,
        default: 1
    },
    key_code: {type: String, required: false},
    isEditable : {type: Boolean, required: false, default: 1}
},{
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model("user_dropdowns", schema, "user_dropdowns");