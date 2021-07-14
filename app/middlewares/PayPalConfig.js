var dotenv = require("dotenv");
var paypal = require('paypal-rest-sdk');

dotenv.config();
paypal.configure({
    'mode': process.env.PAYPAL_Mode?process.env.PAYPAL_Mode:"sandbox", //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT,
    'client_secret': process.env.PAYPAL_SECERET
});
module.exports =paypal;