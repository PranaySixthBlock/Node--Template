const {to,TE,ReS}=require('../middlewares/utilservices');
const paypal = require('../middlewares/PayPalConfig');
const CompanySubscriptionService = require('../services/CompanySubscriptionService');
const CompanySubscription = require('../models/CompanySubscription');
const Company = require('../models/Company');

module.exports = {

createCompanySubscription: async function(req, res){
    let err, subData;
    [err,subData] = await to(CompanySubscriptionService.insertCompanySubscription(req.body));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(subData && subData!==false){
        return res.status(200).json({"status": 200,"success": true,"data": subData});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot create company subscription. Try again!"});
    }
},

getAll: async function(req,res){
    let err, companySub;
    [err,companySub] = await to(CompanySubscriptionService.getAllCompanySubscription(req, req.params.companyId));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(companySub && companySub!==false){
        return res.status(200).json({"status": 200,"success": true,"data": companySub});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, No Company Subscription Exists. Try again!"});
    }
},

getActiveCompanySubscriptions: async function(req,res){
    let err, companySub;
    [err,companySub] = await to(CompanySubscriptionService.getAllActiveCompanySubscriptions(req.params.skill));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(companySub && companySub!==false){
        return res.status(200).json({"status": 200,"success": true,"data": companySub});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, No Company Subscription Exists. Try again!"});
    }
},

/**
 * Upgrading subscriptions
 */
subscrptionUpgrade: async function(req,res){
    let err, oldSubscrption, skill_data,newCompanySubscription;
     var cancel_note = {
         "note": "Cancelling the agreement"
     };
     [err,oldSubscrption] = await to(CompanySubscription.findOne(
                                            {
                                                company:req.body.company,
                                                subscription:req.body.oldSubscription,
                                                status:true
                                            }).exec());
     if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});

     if(!oldSubscrption) return res.status(401).json({
                                                        "status": 401,
                                                        "success": false,
                                                        "message": "Sorry You don't have any valid Subscription"
                                                    });

    if(oldSubscrption&&oldSubscrption.subscriberState!="FreeTrial"){
        paypal.billingAgreement.suspend(oldSubscrption.agreementID, cancel_note,async function (error, response) {
            if(error){
                if(error) return res.status(500).json({
                                                        "status": 500,
                                                        "success": false,
                                                        "message": error.response.message
                                                    });
            }else{
                paypal.billingAgreement.get(oldSubscrption.agreementID,async function (error, billingAgreement) {
                    if (error) {
                        if(error) return res.status(500).json({
                                                                "status": 500,
                                                                "success": false,
                                                                "message": error.response.message
                                                            });
                    } else {
                        [err, updateOldSubscption] = await to(CompanySubscriptionService.updateSuspendedAgreement(billingAgreement, oldSubscrption.agreementID));
                        if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
                        if(updateOldSubscption){
                            oldSubscrption.subscriberState = "Completed";
                            oldSubscrption.status = false;
                            oldSubscrption.save();
                        }
                        [err,skill_data] = await to(Company.findById(req.body.company));
                        if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
                        if(skill_data){
                            skill_data.subscription = req.body.newSubscription;
                            skill_data.paymentState = "Pending";
                            skill_data.save();
                            [err, newCompanySubscription]= await to(CompanySubscriptionService.skillTrailSubscrption(skill_data));
                            if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
                            return res.status(200).json({"status": 200,"success": true,"data": newCompanySubscription});
                        }
                    }
                });
            }
        });
    }else{
        let skillData,vSkill;
        [err,skillData] = await to(Company.findById(req.body.company));
        if(err) {TE(err, true);}
        if(skillData){
            skillData.subscription = req.body.newSubscription;
            skillData.paymentState = "Pending";
            [err,vSkill] = await to(skillData.save());
            if(vSkill){
                oldSubscrption.subscriberState = "Completed";
                oldSubscrption.status = false;
                oldSubscrption.discontinue_date = new Date();
                oldSubscrption.save();
            }
            [err, newSubscrption]=await to(CompanySubscriptionService.skillTrailSubscrption(vSkill));
            if(err) {TE(err, true);}
            if(!newSubscrption) return res.status(401).json({
                                                            "status": 401,
                                                            "success": false,
                                                            "message": "Can not upgrade to new subscription. Try again!"
                                                        });
            if(newSubscrption) return res.status(200).json({"status": 200,"success": true,"data": newSubscrption});
        }
    }
},

viewCompanySubscription: async function(req, res){
    let err, companySub;
    [err,companySub] = await to(CompanySubscriptionService.getCurrentCompanySubscription(req, req.params.companyId));

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(companySub && companySub!==false){
        return res.status(200).json({"status": 200,"success": true,"data": companySub});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, No Active Company Subscription Exists. Try again!"});
    }
},

premiumUpgradeSubscriptions: async function(req, res){
    let err, premiumSub;
    [err, premiumSub] = await to(CompanySubscriptionService.getPremiumSubscriptions());

    if(err) return res.status(500).json({"status":500, "success": false, "message":err.message});
    if(premiumSub && premiumSub!==false){
        return res.status(200).json({"status": 200,"success": true,"data": premiumSub});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry, No Subscriptions Exists. Try again!"});
    }
}
};
