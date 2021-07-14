'use strict'
const {to} = require('../middlewares/utilservices');
var EmployeeService = require('../services/EmployeeService');

module.exports={
createNewEmployee: async function(req,res){
    let err, emp;
    let roleId = req.user.role._id;

    [err,emp] = await to(EmployeeService.addNewCompanyEmployee(req.params.companyId,req.body,roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(emp && emp!==false){
        return res.status(200).json({"status": 200,"success": true,"data": emp});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot create an employee. Try again!"});
    }
},

companyEmployeesList: async function(req,res){
    let err, emps;
    let roleId = req.user.role._id;

    [err, emps] = await to(EmployeeService.listOfCompanyEmployees(req.params.companyId, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(emps && emps!==false){
        return res.status(200).json({"status": 200,"success": true,"data": emps});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display company employees. Try again!"});
    }
},

updateEmployeeData: async function(req,res){
    let err, emp;
    let roleId = req.user.role._id;

    [err, emp] = await to(EmployeeService.updateCompanyEmployeeData(req.params.empId, req.body, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(emp && emp!==false){
        return res.status(200).json({"status": 200,"success": true,"data": emp});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot update Employee data. Try again!"});
    }
},

getSingleEmployeeData: async function(req,res){
    let err, emp;
    let roleId = req.user.role._id;

    [err, emp] = await to(EmployeeService.getCompanyEmployeeData(req.params.id, roleId));

    if(err) return res.status(500).json({"status": 500,"success": false,"message": err.message});
    if(emp && emp!==false){
        return res.status(200).json({"status": 200,"success": true,"data": emp});
    }else{
        return res.status(401).json({"status": 401,"success": false,"message": "Cannot display Employee data. Try again!"});
    }
},
}