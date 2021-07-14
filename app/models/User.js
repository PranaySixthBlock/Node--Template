var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const mongoosePaginate = require('mongoose-paginate-v2');

var schema = mongoose.Schema({
        email: {type: String,required: true,unique: true},
        password: {type: String,required: true},
        name: {type: String,required: true},
        // Embed Role Document
        role:{type: String},
        status: {type: Boolean,required: true,default: 1},
    }, {
        versionKey: false,
        timestamps: true
    }
);

schema.pre('save', function (next) {

    var user = this;

    // generate a salt

    if (user.isModified("password") || user.isNew) {

        bcrypt.genSalt(10, function (error, salt) {

            if (error) return next(error);

            // hash the password along with our new salt

            bcrypt.hash(user.password, salt, function (error, hash) {

                if (error) return next(error);

                // override the cleartext password with the hashed one

                user.password = hash;

                next(null, user);
            });
        });

    } else {
        next(null, user);
    }
});

/**
 * Compare raw and encrypted password
 * @param password
 * @param callback
 */
schema.methods.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (error, match) {
        if (error) callback(error);
        if (match) {
            callback(null, true);
        } else {
            callback(error, false);
        }
    });
}
schema.plugin(mongoosePaginate);
module.exports = mongoose.model("user", schema, "user");
