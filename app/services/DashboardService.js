var _ = require("lodash");
var {to, TE} = require("../middlewares/utilservices");
var moment   = require("moment");
var Tickets  = require("../models/Tickets");
var Audits   = require('../models/Audit');
var Assets   = require("../models/Assets");
var Company  = require('../models/Company');
var Locations= require("../models/Locations");
var UserDropDown = require("../models/UserDropDown");
var AssetService = require('./AssetService');
var companyContacts = require("../models/CompanyContacts");
var CronActivityLog = require("../models/CronActivityLog");

module.exports = {
  getCompanyTicketsCount: async function (companyId, days, role, userId, userRole) {
    let err,
      openticketsCount,
      closedticketsCount,
      monthlyOpenTicketsCount,
      monthlyClosedTicketsCount,
      obj,
      allDates = [],
      closedDates = [],
      NewTicketsCounts = [];
      ClosedCounts = [];

    let newTicketsId, closedTicketsId;
    var monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    var monthNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let previousSixMonthsNames = [];

    function getDates(startDate, stopDate) {
      var dateArray = [];
      var currentDate = moment(startDate);
      var stopDate = moment(stopDate);
      while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format("DD-MM-YYYY"));
        currentDate = moment(currentDate).add(1, "days");
      }
      return dateArray;
    }

    if (days == 7 || days == 30) {
      [err, newTicketsId] = await to(
        UserDropDown.find({
          company: new mongoose.Types.ObjectId(companyId),
          name: "New",
          type: "ticketstatus",
        })
      );

      [err, closedTicketsId] = await to(
        UserDropDown.find({
          company: new mongoose.Types.ObjectId(companyId),
          name: "Closed-Resolved",
          type: "ticketstatus",
        })
      );

      var d = new Date();
      d.setDate(d.getDate() - days);

      const dummyArray = getDates(d, new Date());

      let openTicketsCountFilterObj = {};
      if(userRole === "SUPERUSER"){
        openTicketsCountFilterObj = {
          company: new mongoose.Types.ObjectId(companyId),
          createdAt: {$gt: d}
        }
      }else{
        openTicketsCountFilterObj = {
          $and: [{
            company: new mongoose.Types.ObjectId(companyId),
            createdAt: {$gt: d}
          },{
            $or: [{
              createdBy: new mongoose.Types.ObjectId(userId)
            },{
              assignedTo: new mongoose.Types.ObjectId(userId)
            }]
          }]
        }
      }

      [err, openticketsCount] = await to(
        Tickets.aggregate([
          {
            // $match: {
            //   company: new mongoose.Types.ObjectId(companyId),
            //   // ticket_status: new mongoose.Types.ObjectId(newTicketsId[0]._id),
            //   createdAt: {$gt: d},
            // },
            $match: openTicketsCountFilterObj
          },{
            $group: {
              _id: {$dateToString: {format: "%d-%m-%Y", date: "$createdAt"}},
              count: {$sum: 1},
            },
          },
          {$sort: {_id: -1}},
          {$project: {createdAt: "$_id", tickets: "$count", _id: 0}},
        ])
      );
      if (err) {
        TE(err, true);
      }

      let closedTicketsCountFilterObj = {};
      if(userRole === "SUPERUSER"){
        closedTicketsCountFilterObj = {
          company: new mongoose.Types.ObjectId(companyId),
          createdAt: {$gt: d},
          ticket_status: new mongoose.Types.ObjectId(closedTicketsId[0]._id)
        }
      }else{
        closedTicketsCountFilterObj = {
          $and: [{
            company: new mongoose.Types.ObjectId(companyId),
            createdAt: {$gt: d},
            ticket_status: new mongoose.Types.ObjectId(closedTicketsId[0]._id)
          },{
            $or: [{
              createdBy: new mongoose.Types.ObjectId(userId)
            },{
              assignedTo: new mongoose.Types.ObjectId(userId)
            }]
          }]
        }
      }

      [err, closedticketsCount] = await to(
        Tickets.aggregate([
          {
            // $match: {
            //   company: new mongoose.Types.ObjectId(companyId),
            //   ticket_status: new mongoose.Types.ObjectId(
            //     closedTicketsId[0]._id
            //   ),
            //   closedAt: {$gt: d},
            // },
            $match: closedTicketsCountFilterObj
          },
          {
            $group: {
              _id: {$dateToString: {format: "%d-%m-%Y", date: "$closedAt"}},
              count: {$sum: 1},
            },
          },
          {$sort: {_id: -1}},
          {$project: {closedAt: "$_id", tickets: "$count", _id: 0}},
        ])
      );
      if (err) {
        TE(err, true);
      }

      let closeddbdates = _.map(closedticketsCount, (key) => {
        return key.closedAt;
      });

      let dbdates = _.map(openticketsCount, (key) => {
        return key.createdAt;
      });

      dummyArray.map((newDate, i) => {
        if (!dbdates.includes(newDate)) {
          NewTicketsCounts.push(0);
          allDates.push(newDate);
        } else if (dbdates.includes(newDate)) {
          openticketsCount.map((peta, l) => {
            if (peta.createdAt === newDate && !allDates.includes(newDate)) {
              NewTicketsCounts.push(peta.tickets);
              allDates.push(newDate);
            }
          });
        }
      });

      dummyArray.map((newDate, i) => {
        if (!closeddbdates.includes(newDate)) {
          ClosedCounts.push(0);
          closedDates.push(newDate);
        } else if (closeddbdates.includes(newDate)) {
          closedticketsCount.map((peta, l) => {
            if (peta.closedAt === newDate && !closedDates.includes(newDate)) {
              ClosedCounts.push(peta.tickets);
              closedDates.push(newDate);
            }
          });
        }
      });

      return openticketsCount
        ? {
            data: {
                labels: allDates,
              //   closedDates: closedDates,
                newTickets: NewTicketsCounts,
                closedTickets: ClosedCounts,
              },
          }
        : false;
    } else if (days === "6months") {
      
      let sampleMonths =  [ , "January","February","March","April","May","June","July","August","September","October","November","December",];
      var d;
      let newMonthWiseTicketCount = [],newMonthWiseNames = [];
      let closedMonthWiseTicketCount = [],closedMonthWiseNames = [];

       [err, newTicketsId] = await to(
         UserDropDown.find({
            company: new mongoose.Types.ObjectId(companyId),
            name: "New",
            type: "ticketstatus",
        })
        );

        [err, closedTicketsId] = await to(
         UserDropDown.find({
            company: new mongoose.Types.ObjectId(companyId),
            name: "Closed-Resolved",
            type: "ticketstatus",
        })
        );


      var today = new Date();
      var n = monthNames[today.getMonth()];

      for (var i = 5; i >= 0; i -= 1) {
        d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        month = monthNames[d.getMonth()];
        previousSixMonthsNames.push(month);
      }

      let monthlyOpenTicketsCountFilterObj = {};
      if(userRole === "SUPERUSER"){
        monthlyOpenTicketsCountFilterObj = {
          company: new mongoose.Types.ObjectId(companyId),
          createdAt: {
            $lte: new Date(),
            $gte: new Date(new Date().setDate(new Date().getDate() - 180)),
          }
        }
      }else{
        monthlyOpenTicketsCountFilterObj = {
          $and: [{
            company: new mongoose.Types.ObjectId(companyId),
            createdAt: {
              $lte: new Date(),
              $gte: new Date(new Date().setDate(new Date().getDate() - 180)),
            }
          },{
            $or: [{
              createdBy: new mongoose.Types.ObjectId(userId)
            },{
              assignedTo: new mongoose.Types.ObjectId(userId)
            }]
          }]
        }
      }

      [err, monthlyOpenTicketsCount] = await to(
        Tickets.aggregate([
          {
            // $match: {
            //   company: new mongoose.Types.ObjectId(companyId),
            //   // ticket_status: new mongoose.Types.ObjectId(newTicketsId[0]._id),
            //   createdAt: {
            //     $lte: new Date(),
            //     $gte: new Date(new Date().setDate(new Date().getDate() - 180)),
            //   },
            // },
            $match: monthlyOpenTicketsCountFilterObj
          },
          {
            $group: {
              _id: {
                month: {$month: "$createdAt"},
                year: {$year: "$createdAt"},
              },
              count: {$sum: 1},
            },
          },

          {
            $project: {
              year: "$_id.year",
              tickets: "$count",
              month: "$_id.month",
              _id: 1,
            },
          },
          {
            $addFields: {
              month: {
                $let: {
                  vars: {
                    monthsInString: sampleMonths,
                  },
                  in: {
                    $arrayElemAt: ["$$monthsInString", "$month"],
                  },
                },
              },
            },
          },
          {
            $project: {
              monthNumber: "$_id.month",
              monthlyTickets: "$tickets",
              year: "$year",
              month: "$month",
              _id: 0,
            },
          },
          {$sort: {year: 1, monthNumber: 1}},
        ])
      );
      if (err) {
        TE(err, true);
      }

      let monthlyClosedTicketsCountFilterObj = {};
      if(userRole === "SUPERUSER"){
        monthlyClosedTicketsCountFilterObj = {
          company: new mongoose.Types.ObjectId(companyId),
          ticket_status: new mongoose.Types.ObjectId(closedTicketsId[0]._id),
          closedAt: {
            $lte: new Date(),
            $gte: new Date(new Date().setDate(new Date().getDate() - 180)),
          }
        }
      }else{
        monthlyClosedTicketsCountFilterObj = {
          $and: [{
            company: new mongoose.Types.ObjectId(companyId),
            ticket_status: new mongoose.Types.ObjectId(closedTicketsId[0]._id),
            closedAt: {
              $lte: new Date(),
              $gte: new Date(new Date().setDate(new Date().getDate() - 180)),
            }
          },{
            $or: [{
              createdBy: new mongoose.Types.ObjectId(userId)
            },{
              assignedTo: new mongoose.Types.ObjectId(userId)
            }]
          }]
        }
      }

      [err, monthlyClosedTicketsCount] = await to(
        Tickets.aggregate([
          {
            // $match: {
            //   company: new mongoose.Types.ObjectId(companyId),
            //   ticket_status: new mongoose.Types.ObjectId(closedTicketsId[0]._id),
            //   closedAt: {
            //     $lte: new Date(),
            //     $gte: new Date(new Date().setDate(new Date().getDate() - 180)),
            //   },
            // },
            $match: monthlyClosedTicketsCountFilterObj
          },
          {
            $group: {
              _id: {
                month: {$month: "$closedAt"},
                year: {$year: "$closedAt"},
              },
              count: {$sum: 1},
            },
          },

          {
            $project: {
              year: "$_id.year",
              tickets: "$count",
              month: "$_id.month",
              _id: 1,
            },
          },
          {
            $addFields: {
              month: {
                $let: {
                  vars: {
                    monthsInString: sampleMonths,
                  },
                  in: {
                    $arrayElemAt: ["$$monthsInString", "$month"],
                  },
                },
              },
            },
          },
          {
            $project: {
              monthNumber: "$_id.month",
              monthlyTickets: "$tickets",
              year: "$year",
              month: "$month",
              _id: 0,
            },
          },
          {$sort: {year: 1, monthNumber: 1}},
        ])
      );
      if (err) {
        TE(err, true);
      }

      let dbMonths = monthlyOpenTicketsCount.map((key) => key.month);

      let dbClosedMonths = monthlyClosedTicketsCount.map((key) => key.month);

      previousSixMonthsNames.map((mName, i) => {
        if (!dbMonths.includes(mName)) {
          newMonthWiseTicketCount.push(0);
          newMonthWiseNames.push(mName);
        } else if (dbMonths.includes(mName)) {
          monthlyOpenTicketsCount.map((data, i) => {
            if (data.month === mName && !newMonthWiseNames.includes(mName)) {
                newMonthWiseTicketCount.push(data.monthlyTickets);
                newMonthWiseNames.push(mName);
            }
          });
        }
      });

      previousSixMonthsNames.map((mName, i) => {
        if (!dbClosedMonths.includes(mName)) {
          closedMonthWiseTicketCount.push(0);
          closedMonthWiseNames.push(mName);
        } else if (dbClosedMonths.includes(mName)) {
            monthlyClosedTicketsCount.map((data, i) => {
            if (data.month === mName && !closedMonthWiseNames.includes(mName)) {
                closedMonthWiseTicketCount.push(data.monthlyTickets);
                closedMonthWiseNames.push(mName);
            }
          });
        }
      });

      return monthlyOpenTicketsCount
        ? {data: {labels: newMonthWiseNames, newTickets: newMonthWiseTicketCount,closedTickets : closedMonthWiseTicketCount}}
        : false;
    }
  },

  
TotalDashboardCounts : async function(companyId, roleId, userId, userRole){
  let allTickets,openClosedTickets,newTicketsId, closedTicketsId,notAssigned;
  let err, total_assets, active_assets, inactive_assets, total_users;
  let resultObj = {}, location_assets, status_tickets, total_maintenance_assets = 0;
  let active_tickets = 0, inactive_tickets = 0, maintenance_assets_count;
  let startDate, endDate, datesArray, comparisonValues, assetsInStores;
  let days = [], dates = [], months = [], years = [];
  let auditsCount, ticketsAssignedToMeCount = 0;
  let ticketsCreatedByMeCount = 0;

  let excludeStatus = ["Duplicate","Rejected","On Hold","Invalid","Cancalled","Closed"];

  [err, assetsInStores] = await to(Assets.find({"company": companyId, "deployedAt": {$ne:null}}).countDocuments());
  if(err) {TE(err, true);}

  [err, total_users] = await to(companyContacts.find({"company": companyId}).countDocuments());
  if(err) {TE(err, true);}

  [err, total_assets] = await to(Assets.find({"company": companyId}).countDocuments());
  if(err) {TE(err, true);}

  [err, active_assets] = await to(Assets.find({"company": companyId, status: true}).countDocuments());
  if(err) {TE(err, true);}

  [err, inactive_assets] = await to(Assets.find({"company": companyId, status: false}).countDocuments());
  if(err) {TE(err, true);}

  [err, location_assets] = await to(Locations.aggregate([
                                              {"$match" : {"company" : new mongoose.Types.ObjectId(companyId)}},
                                              {
                                                $lookup:{
                                                    from: "assets",
                                                    localField: "_id",
                                                    foreignField: "location",
                                                    as: "asset_locations"
                                                },
                                              },
                                              { 
                                                $project: {
                                                  "_id":0, "name": 1,
                                                  "assetCount": { "$size": "$asset_locations" }
                                                }
                                              }
                                            ]).sort({"createdAt":-1}));
  if(userRole === "SUPERUSER"){
    [err, allTickets] = await to(Tickets.find({"company": companyId}).countDocuments());
    if(err) {TE(err, true);}
  }else{
    [err, allTickets] = await to(Tickets.aggregate([
      {
        $match: {
          $and: [{
            $or: [
              {
                createdBy: new mongoose.Types.ObjectId(userId)
              },{
                assignedTo: new mongoose.Types.ObjectId(userId)
              }
            ]
          },{
            "company": new mongoose.Types.ObjectId(companyId)
          }]
        }
      }
    ]));
    allTickets = allTickets.length;
  }
  
  let statusObj = {};
  if(userRole === "SUPERUSER"){
    statusObj = {
      company: new mongoose.Types.ObjectId(companyId)
    }
  }else{
    statusObj = {
      $and: [{
        company: new mongoose.Types.ObjectId(companyId)
      },{
        $or: [
          {
            createdBy: new mongoose.Types.ObjectId(userId)
          },{
            assignedTo: new mongoose.Types.ObjectId(userId)
          }
        ]
      }]
    }
  }

  [err, status_tickets] = await to(Tickets.aggregate([{$match: statusObj},
                                                      {
                                                        $lookup:{
                                                          from:"user_dropdowns",
                                                          localField:"ticket_status",
                                                          foreignField:"_id",
                                                          as:"ticketStatus"
                                                        }
                                                      },{
                                                        $group:{
                                                          "_id": "$ticketStatus.name",
                                                          "count": { $sum: 1 },
                                                          "ticket_status": { "$first": "$ticketStatus._id"}
                                                        }
                                                      }
                                                    ]));
  if(err) {TE(err, true);}

  status_tickets.forEach(async data => {
    if(excludeStatus.includes(data._id[0])){
      inactive_tickets = inactive_tickets + data.count;
    }else{
      active_tickets = active_tickets + data.count;
    }
  });

  /**
   * Maintenance Assets Counts Code Begin
   */

  startDate = moment(new Date()).format('YYYY-MM-DD');
  endDate = moment(startDate).add(10, 'days').format('YYYY-MM-DD');

  [err, datesArray] = await to(AssetService.getDateArray(startDate, endDate));

  await datesArray.forEach(date => {
      days.push(moment(date).format('dddd'));
      dates.push(parseInt(moment(date).format('DD')));
      months.push(parseInt(moment(date).format('M')));
      years.push(parseInt(moment(date).format('YYYY')));
  });

  comparisonValues = days.map(v => v.valueOf());
  days = days.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);

  comparisonValues = dates.map(v => v.valueOf());
  dates = dates.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);

  comparisonValues = months.map(v => v.valueOf());
  months = months.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);
  
  comparisonValues = years.map(v => v.valueOf());
  years = years.filter((v,i) => comparisonValues.indexOf(v.valueOf()) == i);

  [err, maintenance_assets_count] = await to(Assets.aggregate([
    {
      $match: {
        "company": new mongoose.Types.ObjectId(companyId)
      }
    },
    {
      $match: {
        $or: [
          {
            "predictive_maintenance.timePeriod": 'Day'
          },
          {
              "predictive_maintenance.day": {
                  $in: days
              },
              "predictive_maintenance.timePeriod": 'Week'
          },{
              "predictive_maintenance.date": {
                  $in: dates
              },
              "predictive_maintenance.day"  : null,
              "predictive_maintenance.year" : null,
              "predictive_maintenance.timePeriod": 'Month'
          },{
              $and:[
                  {
                      "predictive_maintenance.date": {
                          $in: dates
                      },
                      "predictive_maintenance.timePeriod": 'Year'
                  },{
                      "predictive_maintenance.month": {
                          $in: months
                      },
                      "predictive_maintenance.timePeriod": 'Year'
                  }   
              ]
          }
        ]
      }
    },
    {
      $group: {
        _id: null,
        count: {$sum: 1}
      }
    }
  ]));

  if(maintenance_assets_count[0] && maintenance_assets_count[0].hasOwnProperty("count")){
    total_maintenance_assets = maintenance_assets_count[0].count;
  }else{
    total_maintenance_assets = 0;
  }
  /**
   * Maintenance Assets Counts Code End
   */

  [err, ticketsCreatedByMeCount] = await to(Tickets.find({"company": companyId, "createdBy": userId})
                                              .countDocuments());
  [err, ticketsAssignedToMeCount] = await to(Tickets.find({"company": companyId, "assignedTo": userId})
                                              .countDocuments());
  if(userRole === "SUPERUSER"){
    [err, auditsCount] = await to(Audits.find({"company": companyId}).countDocuments());
  }else{
    [err, auditsCount] = await to(Audits.find({
      $and:[{
        "company": new mongoose.Types.ObjectId(companyId)
      },{
        $or:[{
          "createdBy": new mongoose.Types.ObjectId(userId)
        },{
          "auditUserId": {$in: [new mongoose.Types.ObjectId(userId)]}
        }]
      }]
    }).countDocuments());
  }
  
  resultObj["total_users"]    = total_users?total_users:0;
  resultObj["total_assets"]   = total_assets?total_assets:0;
  resultObj["total_audits"]   = auditsCount?auditsCount:0;
  resultObj["total_tickets"]  = allTickets?allTickets:0;
  resultObj["active_assets"]  = active_assets?active_assets:0;
  resultObj["active_tickets"] = active_tickets?active_tickets:0;
  resultObj["inactive_assets"]= inactive_assets?inactive_assets:0;
  resultObj["assetsInStores"] = assetsInStores?assetsInStores:0;
  resultObj["inactive_tickets"]   = inactive_tickets?inactive_tickets:0;
  resultObj["statusWise_tickets"] = status_tickets?status_tickets:0;
  resultObj["locationWise_assets"]= location_assets?location_assets:0;
  resultObj["maintenance_assets"] = total_maintenance_assets?total_maintenance_assets:0;
  resultObj["tickets_created_by_me"] = ticketsCreatedByMeCount?ticketsCreatedByMeCount:0;
  resultObj["tickets_assigned_to_me"] = ticketsAssignedToMeCount?ticketsAssignedToMeCount:0;

  return resultObj ? resultObj : false;
},

adminDashboardData: async function(){
  let err, users, companies, assets, tickets;

  [err, users] = await to(companyContacts.countDocuments({}));
  if(err) {TE(err.message, true);}

  [err, companies] = await to(Company.countDocuments({}));
  if(err) {TE(err.message, true);}

  [err, assets] = await to(Assets.countDocuments({}));
  if(err) {TE(err.message, true);}

  [err, tickets] = await to(Tickets.countDocuments({}));
  if(err) {TE(err.message, true);}

  let counts = {
    "users_count"  : users ? users : 0,
    "company_count": companies ? companies : 0,
    "assets_count" : assets ? assets : 0,
    "tickets_count": tickets ? tickets : 0
  };

  return counts ? counts : false;
},

displayCronJobLog: async function(){
  let data, err;

  [err, data] = await to(CronActivityLog.find({}).sort({"createdAt": -1}));

  if(err) {TE(err.message, true);}

  return data ? data : false;
}
};
