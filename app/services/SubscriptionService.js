const {to,TE} = require('../middlewares/utilservices');
const moment = require("moment");
const Subscription = require('../models/Subscription');
const randomize = require('randomatic');
module.exports = {

findSubscription:async function(subId){
    let err, subscription;

    [err,subscription]= await to(Subscription.findById(subId));
    if(err) {TE(err, true);}
    if(subscription){
        return subscription;
    }else{
        return false;
    }
},

getAllSubscriptions:async function() {
    let err, subscriptions;

    var options = {
            sort: { createdAt: -1 },
            lean: true,
            page: 1,
            limit: 10
        };
    [err,subscriptions]= await to(Subscription.paginate({},options));
    if(err) {TE(err, true);}
    if(subscriptions){
        return subscriptions;
    }else{
        return false;
    }
},

createNewSubscription:async function(payload){
    let err, new_subscription;

    var subscription = new Subscription({
        subscription_code  : "SB-S"+randomize('0', 5),
        subscription_type  : payload.subscription_type,
        subscription_name  : payload.subscription_name,
        description        : payload.description,
        status             : payload.status,
        amount             : payload.amount,
        total_assets       : payload.total_assets,
        total_users        : payload.total_users,
        total_tickets      : payload.total_tickets,
        isPremium          : payload.isPremium,
        state              : payload.state,
        currency_code      : payload.currency_code,
        duration_type      : payload.duration_type,
    });
    [err,new_subscription]= await to(subscription.save());
    if(err) {TE(err, true);}
    if(new_subscription) return new_subscription;
},

/**
 * Bussiness logic for updating an Subscription
 * @param:: Payload ==> Form Body from Request.
 * @param:: id      ==> SubscriptionId for Find & update.
*/
// updateSubscription:async function(payload, id){
//     let err, subscr, updatedSubcr;
   
//     [err,subscr]= await to(Subscription.findById(id));
//     if(err) {TE(err, true);}
//     if(subscr){
//         subscr.subscription_type  = payload.subscription_type;
//         subscr.subscription_name  = payload.subscription_name;
//         subscr.description        = payload.description;
//         subscr.status             = payload.status;
//         subscr.amount             = payload.amount;
//         subscr.total_assets      = payload.total_assets;
//         subscr.deviceCount        = payload.deviceCount,
//         subscr.isPremium          = payload.isPremium,
//         subscr.state              = payload.state,
//         subscr.currency_code      = payload.currency_code,
    
//         //[err,updatedSubcr]= await to(subscr.save());
//         [err, subscr]=await to(subscr.save());
//         if(err) { 
//             console.log(err);
            
//             TE(err, true);}
//         if(subscr){
//             return subscr;
//         }
//     }else{
//         return false;
//     }

// },

subscriptionUpdate: async function(payload, subId){
    let err, subDoc;

    [err, subDoc]=await to(Subscription.findOneAndUpdate({_id:subId},payload,{new:true,upsert:true,strict:true}));
    if(err) TE(err.message, true);
    if(subDoc){
        return subDoc;
    }else{
        return false;
    }
},






/**
 * Bussiness logic for making an Subscrption inactive as we are not allowing any hard delete's
 * @param:: Payload ==> Form Body from Request.
 * @param:: id      ==> SubscriptionId for Find & update.
*/
subscriptionStatus:async function(payload, id){
    let err, subscr;

    [err, subscr]=await to(Subscription.findOneAndUpdate({_id:id},payload,{new:true,upsert:true,strict:true}));

    if(err) {TE(err, true);}
    if(subscr){
        // subscr.status = payload.status;
        // [err,subscr]= await to(subscr.save());
        // if(err) {TE(err, true);}
        return subscr;
    }else{
        return false;
    }
    
},

/**
 * Find Basic Subscription
 * @param::payload
 * Payload is a req replica
*/
findBasicSubscription:async function(){
    let err, subscription;
    [err,subscription]= await to(Subscription.findOne({subscription_type:"Basic"}));
    if(err) {TE(err, true);}
    if (!subscription) return [];
    if(subscription) return subscription;
},


// validSubscrptions:async function(){
//     let err, subscriptions;
//     console.log(moment().format('YYYY-MM-DD'));
//     [err,subscriptions]= await to(Subscription.find({
//                                  status:true,
//                                 //  plan_start_date: {"$lte": moment().format('YYYY-MM-DD')},
//                                 //  plan_end_date:{"$gte": moment().format('YYYY-MM-DD')}
//                                 }));
//     if(err) {TE(err, true);}
//     // console.log("DATA "+subscriptions)
//     if (!subscriptions) return false;
//     if(subscriptions) return subscriptions;
// }
    
    
}