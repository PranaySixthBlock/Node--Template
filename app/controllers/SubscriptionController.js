'use strict'
const {to} = require('../middlewares/utilservices');
var SubscriptionService = require('../services/SubscriptionService');

module.exports={

getSubscription:async function (req, res) {
    let err, subsc_data;

    [err,subsc_data]= await to(SubscriptionService.findSubscription(req.params.subId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(subsc_data){
        return res.status(200).json({"status": 200,"success": true,"data": subsc_data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry couldn't find Subscription."});
    } 
},

getAll:async function (req, res) {
    let err, subscriptions;

    [err,subscriptions]= await to(SubscriptionService.getAllSubscriptions());
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(subscriptions){
        return res.status(200).json({"status": 200,"success": true,"data": subscriptions});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "No Subscriptions Exists Try adding One"});
    }
},

createSubscription:async function (req, res) {
    let err, newsubscription;

    [err,newsubscription]= await to(SubscriptionService.createNewSubscription(req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(newsubscription){
        return res.status(200).json({"status": 200,"success": true,"data": newsubscription});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Couldn't create new Subscription, Try Again!"});
    }
},

subscriptionUpdate:async function (req, res) {
    let err, subscription;

    [err,subscription]= await to(SubscriptionService.subscriptionUpdate(req.body, req.params.subId));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(subscription) {
        return res.status(200).json({"status": 200,"success": true,"data": subscription});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Couldn't update new Subscription, Try Again!"});
    }
},

changeStatus:async function (req, res) {
    let err, subscription;

    [err,subscription]= await to(SubscriptionService.subscriptionStatus(req.body, req.params.subId));
    if(err) res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(subscription) {
        return res.status(200).json({"status": 200,"success": true,"data": subscription});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Couldn't update status Subscription, Try Again!"});   
    }
},
};