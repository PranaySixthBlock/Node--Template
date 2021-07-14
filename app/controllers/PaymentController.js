const {to,TE} = require('../middlewares/utilservices');
const paypal = require('../middlewares/PayPalConfig');
const Subscription = require('../models/Subscription');
const CompanySubscription = require('../models/CompanySubscription');
const Payment = require('../models/Payment');
const CompanySubscriptionService = require('../services/CompanySubscriptionService');
const dotenv = require("dotenv");
const MailService = require("../services/MailService");
const moment = require("moment");

module.exports = {
/**
 * Creating a new payment plan
 */
createPlan: async function(req, res){
    let err, subsc_data;

    [err,subsc_data] = await to(Subscription.findById(req.params.id));
    if(!subsc_data) return res.status(401).json({
                                                "status": 401,
                                                "success": false,
                                                "message": "Sorry No Payment with this ID"
                                            });
    if(err) {
        return res.status(500).json({"status":500, "success": false, "message":err.message});
    }
    var billingPlanAttributes = {
        "description": subsc_data.description,
        "merchant_preferences": {
            "auto_bill_amount": "yes",
            "cancel_url": process.env.PAYMENT_CANCEL,
            "initial_fail_amount_action": "continue",
            "max_fail_attempts": "1",
            "return_url": process.env.PAYMENT_SUCCESS,
            "setup_fee": {
                "currency": subsc_data.currency_code,
                "value": "0"
            }
        },
        "name": "Vobo Monthly Plan 2",
        "payment_definitions": [
            {
                "amount": {
                    "currency": subsc_data.currency_code,
                    "value": subsc_data.amount
                },
                "charge_models": [
                    {
                        "amount": {
                            "currency": subsc_data.currency_code,
                            "value": "0"
                        },
                        "type": "SHIPPING"
                    },
                    {
                        "amount": {
                            "currency": subsc_data.currency_code,
                            "value": "0"
                        },
                        "type": "TAX"
                    }
                ],
                "cycles": "0",
                "frequency": "MONTH",
                "frequency_interval": "1",
                "name": subsc_data.subscription_name,
                "type": "REGULAR"
            }
        ],
        "type": "INFINITE"
    };
    
    paypal.billingPlan.create(billingPlanAttributes,async function (error, billingPlan) {
        if (error) {
            return res.status(500).json({"status":500, "success": false, "message":error});
        } else{
            subsc_data.planID = billingPlan.id;
            subsc_data.paypal_state = billingPlan.state;
            subsc_data.paypalPlanObject = billingPlan;
            [err,subsc_data]= await to(subsc_data.save());
            return res.status(200).json({"status": 200,"success": true,"data": subsc_data});
        }
    });
},

/**
 * Retrieving the plan details using Plan ID
 */
getPlanDetils: async function(req, res){
    paypal.billingPlan.get(req.params.BillingId, function (error, billingPlan) {
        if (error) {
            return res.status(500).json({"status":500, "success": false, "message":error});
        } else {
            return res.status(200).json({"status": 200,"success": true,"data": billingPlan});
        }
    });
},

/**
 * Activating the plan using Plan ID
 */
activatePlan: async function(req, res){
    let err, subsc_data;

    [err,subsc_data]= await to(Subscription.findOne({planID:req.params.BillingId}));
    if(!subsc_data) return res.status(401).json({
                                                "status": 401,
                                                "success": false,
                                                "message": "Can't find any Subscrption"
                                            });
    if(err) {
        return res.status(500).json({"status":500, "success": false, "message":err.message});
    }
    if(subsc_data.paypal_state=="ACTIVE"){
        return res.status(401).json({
                                    "status": 401,
                                    "success": false,
                                    "message": "Plan is already in ACTIVE state"
                                });
    }else{
        var billing_plan_update_attributes = [
            {
                "op": "replace",
                "path": "/",
                "value": {
                    "state": "ACTIVE"
                }
            }
        ];
        paypal.billingPlan.get(req.params.BillingId, function (error, billingPlan) {
            if (error) {
                return res.status(500).json({"status":500, "success": false, "message":error});
            } else {
                paypal.billingPlan.update(req.params.BillingId, billing_plan_update_attributes, function (error, response) {
                    if (error) {
                        return res.status(500).json({"status":500, "success": false, "message":error.response});
                    } else {
                        paypal.billingPlan.get(req.params.BillingId, async function (error, billingPlan) {
                            if (error) {
                                return res.status(500).json({"status":500, "success": false, "message":error.response});
                            } else 
                            {
                                if(subsc_data){
                                    subsc_data.paypal_state = billingPlan.state;
                                    subsc_data.paypalPlanObject = billingPlan;
                                    [err,subsc_data]= await to(subsc_data.save());
                                } 
                                return res.status(200).json({"status": 200,"success": true,"data": billingPlan.state});
                            }
                        });
                    }
                });
            }
        });
    }
    
},

/**
 * Creating a new agreement
 */
createAgreement: async function(req, res){
    let err, companySubData;

    [err,companySubData] = await to(CompanySubscription.findOne({
                                                                company:req.params.companyId,
                                                                status:true,
                                                                agreementID: null
                                                            }));
    if(!companySubData) return res.status(401).json({
                                                    "status": 401,
                                                    "success": false,
                                                    "message": "No subscription associated with this company!"
                                                });
    if(err) {
        return res.status(500).json({"status":500, "success": false, "message":err.message});
    }
    var d1 = new Date (), d2 = new Date (d1);
    d2.setMinutes (d1.getMinutes() + 5);
    var billingAgreementAttributes = {
        "name": companySubData.subscriptionObj.paypalPlanObject.name,
        "description": companySubData.subscriptionObj.paypalPlanObject.description,
        "start_date": d2,
        "plan": {
            "id": companySubData.planID
        },
        "payer": {
            "payment_method": "paypal"
        },
        "override_merchant_preferences": {
            "return_url": process.env.PAYMENT_SUCCESS,
            "cancel_url": process.env.PAYMENT_CANCEL
        }
    };
    paypal.billingAgreement.create(billingAgreementAttributes, function (error, billingAgreement) {
        if (error) {
            return res.status(500).json({"status":500, "success": false, "message": error.response.details});
        } else {
            for (var index = 0; index < billingAgreement.links.length; index++) {
                if (billingAgreement.links[index].rel === 'approval_url') {
                    var approval_url = billingAgreement.links[index].href;
                    return res.status(200).json({"status": 200,"success": true,"data": approval_url});
                }
            }
        }
    });
},

/**
 * Executing the Agreement 
 */
executeAgreement: async function(req, res){
    var companySub,err, transcLog, emaildata;
    [err,companySub] = await to(CompanySubscription.findOne({company:req.params.companyId,status:true}).populate('company'));
    if(!companySub) return res.status(401).json({
                                                "status": 401,
                                                "success": false,
                                                "message": "No subscription associated with this company!"
                                            });
    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

    paypal.billingAgreement.execute(req.params.paytoken, {},async function (error, billingAgreement) {
        if (error) {
            let err, transcLog;
            [err, transcLog] = await to(Payment.create({
                companyId     : companySub.company,
                subscriptionId: companySub.subscription,
                planId        : companySub.planID,
                agreementID   : null,
                amount        : companySub.agreedAmount,
                state         : 'Failed',
                failDate      : new Date(),
                companyEmail  : companySub.company.email
            }));
            [err, transcLog] = await to(transcLog.save());

            let metadata={
                email: companySub.company.email,
                mail_cc: billingAgreement.payer.payer_info.email,
                // sgTemplate: "d-54baaba4d095476188fd6631d23adbda",
                sgTemplate: "d-375849e3be624ab4881dad64ef2910a4",
                emailBody:{
                    subject: "Paypal Payment Status - PinAsset.com",
                    description: "Payment Failed",
                    userName: companySub.company.companyName,
                    transactionId: "N/A",
                    amount: companySub.agreedAmount,
                    planStartDate: "N/A",
                    planEndDate: "N/A",
                    usersLimit: "N/A",
                    assetsLimit: "N/A",
                    plan: "N/A"
                }
            };
            [err, emaildata] = await to(MailService.sgSurveyMailService2(metadata));

            return res.status(200).json({"status": 200,"success": true,"data": transcLog});
        } else {
            let err, transcLog, data;
            
            [err, data] = await to(CompanySubscriptionService.skillPaymentSubscription(billingAgreement,req.params.companyId));
            if(err) return res.status(500).json({"status": 500, "success": false, "message":err.message});

            var recurrDate = new Date(billingAgreement.agreement_details.next_billing_date);
            recurrDate.setDate(recurrDate.getDate() + 30);
            
            [err, transcLog] = await to(Payment.create({
                companyId     : companySub.company,
                subscriptionId: companySub.subscription,
                planId        : companySub.planID,
                agreementID   : billingAgreement.id,
                amount        : companySub.agreedAmount,
                debtOn        : new Date(),
                nextDue       : recurrDate,
                state         : 'Success',
                companyEmail  : companySub.company.email
            }));

            let metadata={
                email: companySub.company.email,
                mail_cc: billingAgreement.payer.payer_info.email,
                // sgTemplate: "d-54baaba4d095476188fd6631d23adbda",
                sgTemplate: "d-375849e3be624ab4881dad64ef2910a4",
                emailBody:{
                    subject: "Paypal Payment Status - PinAsset.com",
                    description: "Payment Successful",
                    userName: companySub.company.companyName,
                    transactionId: billingAgreement.id,
                    amount: companySub.agreedAmount,
                    planStartDate: moment().format("DD-MM-YYYY"),
                    planEndDate: moment(recurrDate).format("DD-MM-YYYY"),
                    usersLimit: companySub.subscriptionObj.total_users,
                    assetsLimit: companySub.subscriptionObj.total_assets,
                    plan: companySub.subscriptionObj.duration_type
                }
            };
            [err, emaildata] = await to(MailService.sgSurveyMailService2(metadata));
            
            return res.status(200).json({"status": 200,"success": true,"data": transcLog});
        }
    });
},

/**
 * Displaying an agreement data
 */
getAgreementDetails: async function(req, res){
    paypal.billingAgreement.get(req.params.agreementId, function (error, billingAgreement) {
        if (error) {
            return res.status(500).json({"status": 500, "success": false, "message":error});
        } else {
            return res.status(200).json({"status": 200,"success": true,"data": billingAgreement});
        }
    });
},

/**
 * Displaying all transactions
 */
listTransactions: async function(req, res){
    var start_date = "2019-08-01";
    var end_date = "2020-08-30";
    paypal.billingAgreement.searchTransactions(req.params.agreementId, start_date, end_date, function (error, results) {
        if (error) {
            return res.status(500).json({"status": 500, "success": false, "message":error});
        } else {
            return res.status(200).json({"status": 200,"success": true,"data": results});
        }
    });
},

/**
 * Suspending the agreement
 */
suspendAgreement:async function(req, res){
    var suspend_note = {
        "note": "Suspending the agreement"
    };
    var err, companySub, data;
    [err,companySub] = await to(CompanySubscription.findOne({agreementID:req.params.agreementId,status:true}));
    if(!companySub) return res.status(401).json({
                                                "status": 401,
                                                "success": false,
                                                "message": "No subscription associated with this company!"
                                            });
    if(err) return res.status(500).json({"status": 500, "success": false, "message":err.message});

    if(companySub.agreementStatus!=="Active") return res.status(401).json({
                                                                "status": 401,
                                                                "success": false,
                                                                "message": "sorry Agreement is already In-Active"
                                                            });
    paypal.billingAgreement.suspend(req.params.agreementId, suspend_note, function (error, response) {
        if (error) {
            return res.status(500).json({"status": 500, "success": false, "message":"Can't suspend the agreement"});
        }else{
            paypal.billingAgreement.get(req.params.agreementId, function (error, billingAgreement) {
                if (error) {
                    return res.status(500).json({"status": 500, "success": false, "message":"No billing data!"});
                } else {
                    data = billingAgreement;
                    var updatingData = CompanySubscriptionService.updateSuspendedAgreement(data, req.params.agreementId);
                    return res.status(200).json({"status": 200,"success": true,"data": billingAgreement});
                }
            });
        }
    });
},

/**
 * Re-activating the agreement
 */
reActivateAgreement:async function(req, res){
    var reactivate_note = {
        "note": "Re-activating the agreement"
    };
    var err, companySub;
    [err,companySub] = await to(CompanySubscription.findOne({agreementID:req.params.agreementId,status:true}));
    if(!companySub) return res.status(401).json({
                                                "status": 401,
                                                "success": false,
                                                "message": "No subscription associated with this company!"
                                            });
    if(err) return res.status(500).json({"status": 500, "success": false, "message":err.message});
    paypal.billingAgreement.reactivate(req.params.agreementId, reactivate_note, function (error, response) {
        if (error) {
            return res.status(500).json({"status": 500, "success": false, "message":"Can't re-activate the agreement"});
        } else {
            paypal.billingAgreement.get(req.params.agreementId, function (error, billingAgreement) {
                if (error) {
                    return res.status(500).json({"status": 500, "success": false, "message":"No billing data!"});
                } else {
                    var data = billingAgreement;
                    var updatingData = CompanySubscriptionService.updateSuspendedAgreement(data,data.id);
                }
                return res.status(200).json({"status": 200,"success": true,"data": billingAgreement});
            });
        }
    });
},

listInvoices:async function(req, res){
    let err, invoices,transCount;
    var options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };
    // [err,transCount]= await to(Payment.count({companyId: req.params.companyId}).exec());
    // if(!transCount||transCount==0) return notFound("No invoices for this company");
    // if(err) return res.serverError("Sorry something's not right");
    // var paginate = PaginateService.paginate({"count":transCount});
    [err, invoices]=await to(Payment.paginate(Payment.find({companyId: req.params.companyId})
                                            .populate('subscriptionId',['subscription_name','subscription_code'])), options);
    if(err) return res.status(500).json({"status": 500, "success": false, "message":err.message});
    if(invoices) return res.status(200).json({"status": 200,"success": true,"data": invoices});
}
}