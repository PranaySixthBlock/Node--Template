var mongoose = require("mongoose");
var randomize = require('randomatic');
var mongoosePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
var schema = mongoose.Schema(
  {
    ticketId    : {type: String, unique: true},
    company     : {type: mongoose.Schema.Types.ObjectId, ref: 'company', required: false},
    locations   : [{type: mongoose.Schema.Types.ObjectId, ref: 'locations', required: false}],
    assets      : [{type: mongoose.Schema.Types.ObjectId, ref: 'assets', required: false}],
    description : {type: String, required: false},
    status      : {type: Boolean, required: false, default: 1},
    createdBy   : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
    solvedBy    : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
    priority    : {type: mongoose.Schema.Types.ObjectId, ref: 'ticket_priorites', required: false},
    ticket_type : {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
    ticket_status  : {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
    closedAt       : {type: Date, required: false},
    serviceProvider: {type: mongoose.Schema.Types.ObjectId, ref: 'vendorServiceProvider', required: false},
    timeline  : [{
                  status_id  : {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
                  message    : {type: String, required: false},
                  time       : {type: Date, default: Date.now(), required: false},
                  messagedBy : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
                  images     : [{type: mongoose.Schema.Types.ObjectId, ref: 'ticket_images', required: false}]
                }],
    comments  : [{
                  timelineStatus : {type: mongoose.Schema.Types.ObjectId, ref: 'user_dropdowns', required: false},
                  comment        : {type: String, required: false},
                  timelineId     : {type: String, refquired: false},
                  commentedBy    : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
                  commentedTime  : {type: Date, required: false, default: Date.now()},
                  comment_images : [{ 
                                      path: {type: String, required: false},
                                      fileName: {type: String, required: false}
                                  }]
                }],
    ticket_images: [{ path: {type: String, required: false} }],
    assignedTo  : {type: mongoose.Schema.Types.ObjectId, ref: 'company_contacts', required: false},
    maintenance_duedate : {type: Date, required: false},
    maintenanceTicket : {type: Boolean, required: false, default: 0}
  },
  {
    versionKey: false,
    timestamps: true
  }
);

schema.plugin(mongoosePaginate);
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("tickets", schema, "tickets");