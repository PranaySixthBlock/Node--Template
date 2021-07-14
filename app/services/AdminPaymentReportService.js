"use strict";
const {to, TE} = require("../middlewares/utilservices");
var Payments = require("../models/Payment");
var CompanySubscriptons = require("../models/CompanySubscription");

module.exports = {
  findAllInvoices: async function (req) {
    let invoices, err;

    var options = {
      sort: {createdAt: -1},
      lean: true,
      page: req.query.page,
      limit: req.query.pageSize,
    };

    [err, invoices] = await to(Payments.paginate({}, options));
    if (err) {
      TE(err, true);
    }

    return invoices ? invoices : false;
  },

  findAllTransactions: async function (req) {
    let transactions, err;

    var options = {
      sort: {createdAt: -1},
      lean: true,
      page: req.query.page,
      limit: req.query.pageSize,
    };

    [err, transactions] = await to(
      CompanySubscriptons.paginate(
        CompanySubscriptons.find(
          {},
          {
            agreementID: 1,
            agreementStatus: 1,
            agreedAmount: 1,
            purchase_date: 1,
          }
        ).populate("company", ["companyName", "email"]),
        options
      )
    );
    if (err) {
      TE(err, true);
    }

    return transactions ? transactions : false;
  },

  filteredTransactions: async function (req, payload) {
    let err, getfilteredTransactions;

    var options = {
      sort: {createdAt: -1},
      lean: true,
      page: req.query.page,
      limit: req.query.pageSize,
    };

    let extraData = Object.assign({}, payload);
    let filterData = payload;

    if (payload.hasOwnProperty("startAt") && payload.hasOwnProperty("endAt")) {
      let startDate = new Date(filterData.startAt).toISOString();
      let nextDate = new Date(filterData.endAt);
      let dateValue = nextDate.getDate() + 1;
      nextDate.setDate(dateValue);
      let endDate = nextDate.toISOString();
      extraData.purchase_date = {
        $gte: startDate,
        $lte: endDate,
      };
      delete extraData["startAt"];
      delete extraData["endAt"];
    } else if (payload.hasOwnProperty("startAt")) {
      let startDate = new Date(filterData.startAt).toISOString();
      let nextDate = new Date(filterData.startAt);
      let dateValue = nextDate.getDate() + 1;
      nextDate.setDate(dateValue);
      let endDate = nextDate.toISOString();
      extraData.purchase_date = {
        $gte: startDate,
        $lte: endDate,
      };
      delete extraData["startAt"];
    }
    if (!req.query.pagination) {
      [err, getfilteredTransactions] = await to(
        CompanySubscriptons.find(extraData, {
          agreementID: 1,
          agreementStatus: 1,
          agreedAmount: 1,
          purchase_date: 1,
        })
          .populate("company", ["companyName", "email"])
          .sort({createdAt: -1})
      );
      if (err) {
        TE(err.message, true);
      }
    } else {
      [err, getfilteredTransactions] = await to(
        CompanySubscriptons.paginate(
          CompanySubscriptons.find(extraData, {
            agreementID: 1,
            agreementStatus: 1,
            agreedAmount: 1,
            purchase_date: 1,
          })
            .populate("company", ["companyName", "email"])
            .sort({createdAt: -1}),
          options
        )
      );
      if (err) {
        TE(err.message, true);
      }
    }

    return getfilteredTransactions ? getfilteredTransactions : false;
  },
};
