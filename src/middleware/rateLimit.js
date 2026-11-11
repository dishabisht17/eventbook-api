const rateLimit = require("express-rate-limit");
const AppError =  require("../utils/AppError");
const make =(windowMs,limit,extra ={}) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders:"draft-7",
        legacyHeaders : false,
        skip:() =>process.env.NODE_ENV === 'test',
        handler:(req,res,next) =>
            next(new AppError("Too many requests,please try again later",429)),
        ...extra,
    })
    const apiLimiter = make(15*60*1000,300);
    const loginLimiter = make(15*60*1000,5,{skipSuccessfulRequests:true});
    const strictLimiter = make(60*60*1000,5)
    const passwordLimiter = make(15 * 60 * 1000, 5, {skipSuccessfulRequests:true});
    module.exports ={apiLimiter,loginLimiter,strictLimiter,passwordLimiter};