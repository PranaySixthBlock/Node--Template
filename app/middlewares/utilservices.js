const {to} = require('await-to-js');
const pe = require('parse-error');
// var _ = require('underscore');
//const logger = require('../../util/ErrorLogger');

module.exports.to = async (promise) => {
    let err, res;
    [err, res] = await to(promise);
    if(err) return [pe(err)];

    return [null, res];
};

module.exports.ReE = function(res, err, code){ // Error Web Response
    if(typeof err == 'object' && typeof err.message != 'undefined'){
        console.log(err);
        err = err.message;
    }
    console.log(err);
    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json({status:code,success:false, error: err});
};

module.exports.ReS = function(res, data, code){ // Success Web Response
    let send_data = {status:code,success:true};

    if(typeof data == 'object'){
        send_data = Object.assign(data, send_data);//merge the objects
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json(send_data)
};

module.exports.TE = TE = function(err, log){ // TE stands for Throw Error
    // var error = new Error();
    if(log === true){
        //logger.error(err);
        console.error(err);
    }
    if (err instanceof Error) {
        throw new Error(err.message);
    } else if (err) {
        //logger.error(err);
        throw new Error(err);
    }

    
};

module.exports.paginate = paginateService = function(options){ // TE stands for Throw Error
    try {
        var pageSize = parseInt(options.pageSize  || 10);
        var pageCount = 0;
        var start     = 0;
        var currentPage = 1;
        pageCount     =  Math.ceil(options.count / pageSize);
        if(options.page !== 'undefined'){
            currentPage = options.page;
        }
        if(currentPage >1){
            start = (currentPage - 1) * pageSize;
        }
        return({'start':start,DataCount:options.count,pageSize: pageSize, pageCount: pageCount,currentPage: currentPage});
    } catch (err) {
        return({'start':0,DataCount:options.count,pageSize: 10, pageCount: 0,currentPage: 0});
    }
};

// module.exports.merge_object_arrays= function (arr1, arr2, match) {
//     return _.union(
//       _.map(arr1, function (obj1) {
//         var same = _.find(arr2, function (obj2) {
//           return obj1[match] === obj2[match];
//         });
//         return same ? _.extend(obj1, same) : obj1;
//       }),
//       _.reject(arr2, function (obj2) {
//         return _.find(arr1, function(obj1) {
//           return obj2[match] === obj1[match];
//         });
//       })
//     );
// };