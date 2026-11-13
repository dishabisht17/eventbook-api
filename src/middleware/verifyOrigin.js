const AppError = require("../utils/AppError");
const allowedOrigins = require("../config/origins");

const verifyOrigin = (req,res,next) =>{
    const origin =  req.get("origin");
    if(!origin || allowedOrigins.includes(origin)) return next();
    throw new AppError("Origin not allowed", 403);
}
module.exports = verifyOrigin;