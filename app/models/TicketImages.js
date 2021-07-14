var schema = mongoose.Schema({
    encoding        : {type: String, required: false},
    mimetype        : {type: String, required: false},
    destination     : {type: String, required: false},
    filename        : {type: String, required: false},
    path            : {type: String, required: false},
    company         : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    ticketId        : {type: mongoose.Schema.Types.ObjectId, ref: 'tickets', required: false},
    isComment       : {type: Boolean, required: false, default: 0},
    status          : {type: Boolean, required: false, default: 1}
},{
    versionKey: false,
    timestamps: true,
});

module.exports = mongoose.model("ticket_images", schema);