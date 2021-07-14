var schema = mongoose.Schema({
    encoding        : {type: String, required: false},
    mimetype        : {type: String, required: false},
    destination     : {type: String, required: false},
    filename        : {type: String, required: false},
    path            : {type: String, required: false},
    company         : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    assetId         : {type: mongoose.Schema.Types.ObjectId, ref: 'assets', required: false},
    isDocument      : {type: Boolean, required: false, default: false}
},{
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model("asset_images", schema);