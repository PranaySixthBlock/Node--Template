const {to,TE}=require('../middlewares/utilservices');
const paypal = require('../middlewares/PayPalConfig');
const Subscription = require('../models/Subscription');
const CompanySubscription = require('../models/CompanySubscription');
const Company = require('../models/Company');

var self = module.exports = {
  
/**
 * Creating new FreeTrial subscription at the time of skill creation
 */
skillTrailSubscrption: async function(payload){
    let err, subData, subscriptionData;
    [err,subscriptionData] = await to(Subscription.findById({_id:payload.subscription})); 
    var companySubscriptionData = new CompanySubscription({
        company         :   payload._id,
        subscription    :   payload.subscription,
        subscriberState :   payload.paymentState,
        subscriptionObj :   subscriptionData,
        planID          :   subscriptionData.planID,
        isPremium       :   subscriptionData.isPremium,
        total_assets    :   subscriptionData.total_assets,
        total_users     :   subscriptionData.total_users,
        total_tickets   :   subscriptionData.total_tickets,
        agreedAmount    :   subscriptionData.amount,
        status          :   true
    });
    [err,subData]= await to(companySubscriptionData.save());
    if(err) {TE(err, true);}
    if(subData) return subData;
},

/**
 * Displaying all company subscriptions
 */
getAllCompanySubscription: async function(req, companyId){
    let err, subscriptions, sub_count;
    var options = {
        sort: { createdAt: -1 },
        lean: true,
        page: req.query.page,
        limit: req.query.pageSize
    };
    // [err,sub_count] = await to(CompanySubscription.count({company:companyId}));
    
    // var paginate = PaginateService.paginate({"count":sub_count});

    // [err,subscriptions]= await to(CompanySubscription.paginate(
    //                                     CompanySubscription.find({company:companyId})
    //                                 ),options);
    [err,subscriptions]= await to(
        CompanySubscription.find({company:companyId}).sort({"createdAt" : -1}));
    if(err) {TE(err, true);}
    return subscriptions?{data:subscriptions}:false;
},

/**
 * Creating new line item after successful payment
 */
skillPaymentSubscription: async function(payload,companyId){
    let err, respData, skillData, companySub;
    [err,companySub] = await to(CompanySubscription.findOne({company:companyId, status:true}).exec());
    if(err) {TE(err, true);}
    [err,skillData] = await to(Company.findById(companyId).exec());
    if(err) {TE(err, true);}
    if(skillData){
        // skillData.status = "Published";
        skillData.paymentState = "Purchased";
        skillData.save();
    }
    if(companySub){
        companySub.subscriberState = "Purchased";
        companySub.status           = true;
        companySub.agreementID      = payload.id;
        companySub.start_date       = payload.start_date;
        // companySub.nextDueDate      = payload.agreement_details.next_billing_date,
        if(payload.agreement_details.next_billing_date){
            var recurrDate = new Date(payload.agreement_details.next_billing_date);
            recurrDate.setDate(recurrDate.getDate() + 30);
            companySub.nextDueDate = recurrDate;
        }
        companySub.agreementStatus  = payload.state;
        companySub.agreementObject  = payload;
        companySub.final_payment_date = payload.agreement_details.final_payment_date;
        companySub.failed_payment_count = payload.agreement_details.failed_payment_count;
    }
    [err,respData] = await to(companySub.save());
    if(err) {TE(err, true);}
    return (respData) ? respData : false;
},

/**
 * Updating data for a Suspended Agreement
 */
updateSuspendedAgreement:async function(payload,agreementId){
    let err, companySub, updatedSubcr;
   
    [err,companySub] = await to(CompanySubscription.findOne({agreementID: agreementId, status: true}));
    if(err) {TE(err, true);}
    if (!companySub){
        TE("Subscription not found", true);
    }else{
        var finalDate = payload.agreement_details.final_payment_date;
        companySub.agreementStatus  =   payload.state;
        companySub.agreementObject  =   payload;
        companySub.discontinue_date =   (payload.state=="Suspended"||payload.state=="Canceled")? new Date():null;
        if(payload.agreement_details.next_billing_date){
            companySub.nextDueDate = payload.agreement_details.next_billing_date;
        }
        companySub.final_payment_date = (finalDate) ? finalDate:null;
        companySub.failed_payment_count = payload.agreement_details.failed_payment_count;
        [err,updatedSubcr] = await to(companySub.save());
        if(err) {TE(err, true);}
        if(updatedSubcr) return updatedSubcr;
    }

},

/**
 * Displaying Active Company Subscriptions
 */
getAllActiveCompanySubscriptions: async function(payload){
    let err, companyData;
    [err,companyData] = await to(CompanySubscription.find({skill:payload,status:true},{_id:1,skill:1,subscription:1,subscriptionObj:1,agreementID:1,agreementStatus:1})
                                    .populate('skill',["_id","skill_id","skill_name","subscription","skillState"])
                                    .populate('subscription',["_id","subscription_code","subscription_type","subscription_name","permissions"])
                                    .lean().exec());
    if(err) {TE(err, true);}
    if(!companyData) return false;
    if(companyData) return companyData;
},

getCurrentCompanySubscription: async function(req, companyId){
    let err, subscription_data;

    [err, subscription_data] = await to(CompanySubscription.find({company: companyId, status: true})
                                                            .populate('company',['companyName','accountid','phone',
                                                                                'email','subscription','address'])
                                                            .populate('subscription',['planID','amount','isPremium',
                                                                                    'status','currency_code','paypal_state',
                                                                                    'subscription_code','subscription_type',
                                                                                    'subscription_name','state']
                                                            ));
    if(err) {TE(err, true);}

    return subscription_data ? subscription_data : false;
},

getPremiumSubscriptions: async function(){
    let err,subscriptions;

    [err, subscriptions] = await to(Subscription.find({isPremium: true, status: true}));
    if(err) {TE(err, true);}

    return subscriptions ? subscriptions : false;
}
};