const passport       = require("passport");
require('./passport');
module.exports = function (req, res, next) {

    passport.authenticate('jwt', function (err, user) {

        if(err) return res.status(500).json(err);
        if (!user) return res.status(401).json({"error":"You are not an authorized user!"});
        next();

    })(req, res, next);

};

module.exports.UserAuth = function(req, res, next){

    passport.authenticate('jwt-1', function (error, user) {

        if (error) return res.status(500).json(err);
        if (!user) return res.status(401).json({"message":"No User found", "status":401, "success":false});
        req.user = user;
        next();

    })(req, res, next);

};

module.exports.UserAdmin_Auth = function(req, res, next){

    passport.authenticate('jwt-userAdmin', function (error, user) {

        if (error) return res.status(500).json(err);
        if (!user) return res.status(401).json({"message":"No User found", "status":401, "success":false});
        req.user = user;
        next();

    })(req, res, next);

};