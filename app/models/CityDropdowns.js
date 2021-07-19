var schema = mongoose.Schema({
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    stateId: {type: mongoose.Schema.Types.ObjectId, ref: 'state_dropdowns', required: true},
    type: {
        type: String,
        required: false
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
        required: false
    },
    key_code: {type: String, required: false},
    isEditable : {type: Boolean, required: false, default: 1}
},{
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model("city_dropdowns", schema, "city_dropdowns");