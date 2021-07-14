var mongoose = require("mongoose");
var schema = mongoose.Schema(
  {
    company       : {type: mongoose.Schema.Types.ObjectId, ref:'company', required: true},
    location      : {type: mongoose.Schema.Types.ObjectId, ref:'locations', required: true},
    store_name    : {type: String, required: true},
    // store_address : {type: String, required: false, default: null},
    store_manager : {type: String, required: false, default: null},
    store_phone   : {type: String, required: false, default: null},
    store_email   : {type: String, required: false, default: null},
    status        : {type: Boolean, required: false, default: 1},
  },
  {
    versionKey: false,
    timestamps: true
  }
);

module.exports = mongoose.model("stores", schema, "stores");