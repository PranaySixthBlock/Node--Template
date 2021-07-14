var mongoose = require("mongoose");
var schema = mongoose.Schema(
  {
    company         : {type: mongoose.Schema.Types.ObjectId, ref:'company', required: true},
    location        : {type: mongoose.Schema.Types.ObjectId, ref:'locations', required: true},
    employee_name   : {type: String, required: true},
    employee_phone  : {type: String, required: false, default: null},
    employee_email  : {type: String, required: true, default: null},
    employee_address: {type: String, required: false, default: null},
    status          : {type: Boolean, required: false, default: 1}
  },
  {
    versionKey: false,
    timestamps: true
  }
);

module.exports = mongoose.model("company_employees", schema, "company_employees");