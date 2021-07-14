var mongoose = require("mongoose");
var schema = mongoose.Schema(
  {
    company     : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: true},
    name        : {type: String, required: true},
    type        : {type: String, enum: ['vendor','serviceProvider'], required: true},
    mobile      : {type: String, required: true},
    email       : {type: String, required: false, default: null},
    address     : {type: String, required: false, default: null},
    servicesOffered : [{type: String,required: false}],
    status      : {type: Boolean, required: false, default: 1},
    location    : {type: mongoose.Schema.Types.ObjectId, ref: 'locations', required: false},
    serviceCompany: {type: String, required: false, default: null}
  },
  {
    versionKey: false,
    timestamps: true
  }
);

module.exports = mongoose.model("vendorServiceProvider", schema, "vendorServiceProvider");