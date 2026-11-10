const AppError = require("../utils/AppError");
const hasOperator = (value) =>{
    if(Array.isArray(value)) return value.some(hasOperator);
    if(value && typeof value ==='object') {
        return Object.entries(value).some(([key,val])=>key.includes("$") ||hasOperator(val));
    }
    return false;
}
const noSqlGuard=(req,res,next) =>{
    if(hasOperator(req.body)||hasOperator(req.query)){
        throw new AppError("Invalid characters in request",400);
    }
    next();
}
module.exports=noSqlGuard;