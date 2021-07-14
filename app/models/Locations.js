var mongoose = require("mongoose");
var schema = mongoose.Schema(
  {
    company     : {type: mongoose.Schema.Types.ObjectId, ref:'company', required: true},
    name        : {type: String, required: true},
    description : {type: String, required: false, default: null},
    address     : {type: String, required: false, default: null},
    zip_code    : {type: String, required: false, default: null},
    city        : {type: String, required: false, default: null},
    state       : {type: String, required: false, default: null},
    country     : {type: String, required: false, default: null},
    status      : {type: Boolean, required: false, default: 1},
    latitude    : {type: String, required: false, default: null},
    longitude   : {type: String, required: false, default: null}
  },
  {
    versionKey: false,
    timestamps: true
  }
);

module.exports = mongoose.model("locations", schema, "locations");