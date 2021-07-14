'use strict'
module.exports.createModelForTemplate= function (name) {
    var establishedModels = {};
    if (!(name in establishedModels)) {
        //var Any = new Schema({ any: Schema.Types.Mixed });
        const Any = mongoose.Schema({ any: mongoose.Schema.Types.Mixed });
        establishedModels[name] = mongoose.model(name, Any);
    }
    return establishedModels[name];
}