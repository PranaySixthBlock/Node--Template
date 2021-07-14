'use strict'
const {to} = require('../middlewares/utilservices');
var PaymentReportServcie = require('../services/AdminPaymentReportService')


module.exports={

getAllInvoices:async function (req, res) {
    let err, invoice_data;

    [err,invoice_data] = await to(PaymentReportServcie.findAllInvoices(req));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    
    if(invoice_data){
        return res.status(200).json({"status": 200,"success": true,"data": invoice_data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry couldn't find Invoices."});
    } 
},

getAllTransactions:async function (req, res) {
    let err, transaction_data;

    [err,transaction_data] = await to(PaymentReportServcie.findAllTransactions(req));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(transaction_data){
        return res.status(200).json({"status": 200,"success": true,"data": transaction_data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry couldn't find Trasctions."});
    } 
},

getFilteredTransactions : async function(req,res){

    let err, filtered_transaction_data;

    [err,filtered_transaction_data] = await to(PaymentReportServcie.filteredTransactions(req,req.body));
    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});

    if(filtered_transaction_data){
        return res.status(200).json({"status": 200,"success": true,"data": filtered_transaction_data});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Sorry couldn't find Trasctions."});
    } 

}
}