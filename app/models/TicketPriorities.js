var mongoose = require("mongoose");
var schema = mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    slaFrom: {
      type: String,
      required: false
    },
    slaTo: {
      type: String,
      required: false
    },
    slaType: {
      type: String,
      enum: ["days", "week", "month"],
      required: false
    },
    status: {
      type: Boolean,
      required: false,
      default: 1
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company_contacts",
      required: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

module.exports = mongoose.model("ticket_priorites", schema, "ticket_priorites");
