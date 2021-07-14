var {to, TE} = require('../middlewares/utilservices');
var UserRoles = require('../models/UserRoles');
var Employees = require('../models/CompanyEmployees');

module.exports = {
addNewCompanyEmployee: async function(company, payload, role){
    let err, emp, allemps, roleData, obj={}, duplicateData;

    [err, roleData] = await to(UserRoles.find({"_id": role},{"companyEmployees":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].companyEmployees;
    };

    [err, duplicateData] = await to(Employees.find({"company": company, "location": payload.location,
                                        "employee_email": payload.employee_email}));
    if(err) {TE(err, true);}
    
    if(duplicateData.length <= 0){
        [err, emp] = await to(Employees.create({
            company         : company,
            location        : payload.location,
            employee_name   : payload.employee_name?payload.employee_name:null,
            employee_phone  : payload.employee_phone?payload.employee_phone:null,
            employee_email  : payload.employee_email?payload.employee_email:null,
            employee_address: payload.employee_address?payload.employee_address:null,
            status          : payload.status?payload.status:1
        }));
    
        emp.save();
    
        if(err) {TE(err.message, true);}
    
        [err,allemps] = await to(Employees.find({"company": company})
                                        .populate('location', ['name'])
                                        .sort({"createdAt":-1}));
        if(err) {TE(err.message);}
    
        return (allemps)?{data: allemps, permissions: obj}:false;
    }else{
        {TE(payload.employee_email+" Store Room already exists");}
    }
},

listOfCompanyEmployees: async function(company, role){
    let err, emps, roleData, obj={};

    [err, roleData] = await to(UserRoles.find({"_id": role},{"companyEmployees":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].companyEmployees;
    };
    
    [err, emps] = await to(Employees.find({"company": company})
                                        .populate('location', ['name'])
                                        .sort({"createdAt":-1}));
    if(err) {TE(err.message, true);}
    return emps?{data: emps, permissions: obj}:false;
},

updateCompanyEmployeeData: async function(empId, payload, role){
    let err, emp, updatedEmp, duplicateData;
    let allEmps, roleData, obj={};

    [err, roleData] = await to(UserRoles.find({"_id": role},{"companyEmployees":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].companyEmployees;
    };

    [err,emp]= await to(Employees.findById(empId));
    if(err) {TE(err.message, true);}
    if(emp){
        if(emp.employee_email === payload.employee_email){
            emp.location         = payload.location?payload.location:emp.location; 
            emp.employee_phone   = payload.employee_phone?payload.employee_phone:emp.employee_phone;
            emp.employee_address = payload.employee_address?payload.employee_address:emp.employee_address;
            emp.employee_name    = payload.employee_name?payload.employee_name:emp.employee_name;
            emp.status           = payload.status?payload.status:emp.status;
                
            [err,updatedEmp]= await to(emp.save());
            if(err) {TE(err.message, true);}
    
            [err,allEmps] = await to(Employees.find({"company":emp.company})
                                            .populate('location', ['name'])
                                            .sort({"createdAt":-1}));
            if(err) {TE(err.message, true);}
    
            return allEmps?{data: allEmps, permissions: obj}:false;
        }else{
            [err, duplicateData] = await to(Employees.find({"company": emp.company,"employee_email": payload.employee_email}));
            if(err) {TE(err.message, true);}

            if(duplicateData.length <= 0){
                emp.location         = payload.location?payload.location:emp.location;
                emp.employee_phone   = payload.employee_phone?payload.employee_phone:emp.employee_phone;
                emp.employee_address = payload.employee_address?payload.employee_address:emp.employee_address;
                emp.employee_name    = payload.employee_name?payload.employee_name:emp.employee_name;
                emp.employee_email   = payload.employee_email?payload.employee_email:emp.employee_email;
                emp.status           = payload.status?payload.status:emp.status;
                    
                [err,updatedEmp] = await to(emp.save());
                if(err) {TE(err.message, true);}
        
                [err,allEmps] = await to(Employees.find({"company": emp.company})
                                                .populate('location', ['name'])
                                                .sort({"createdAt":-1}));
                if(err) {TE(err.message, true);}
        
                return allEmps?{data: allEmps, permissions: obj}:false;
            }else{
                {TE(emp.employee_email+" Employee not found");}
            }
        }
    }else{
        {TE("Employee not found");}
    }
},

getCompanyEmployeeData: async function(id, role){
    let err, emp, roleData, obj={};

    [err, roleData] = await to(UserRoles.find({"_id": role},{"companyEmployees":1}));
    if(err) {TE(err, true);}

    if(roleData){
        obj=roleData[0].companyEmployees;
    };

    [err, emp] = await to(Employees.find({_id: id}).populate('location', ['name']));

    if(err) {TE(err.message, true);}
    return emp?{data: emp, permissions: obj}:false;
},
}