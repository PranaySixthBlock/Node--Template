var schema = mongoose.Schema({
  type : { type: String,required: true},
  name : { type: String,required: true},
  status : { type: Boolean,required: false,default: 1},
  key_code : { type: String,required: false},
  defaultValue : {type: String, required: false, default: null},
  message : { type: String,required: false}
},{
  versionKey: false,
  timestamps: true,
});

module.exports = mongoose.model("admin_dropdowns", schema, "admin_dropdowns");