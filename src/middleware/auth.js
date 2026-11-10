const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const AppError=require("../utils/AppError");
const authenticate = async(req,res,next) =>{
    const[scheme,token] = (req.headers.authorization || "").split(" ");
    if(scheme!=="Bearer" || !token){
        throw new AppError("Authentication required",401);
    }
    let payload;
    try{
        payload=jwt.verify(token,process.env.JWT_ACCESS_SECRET,{algorithms:["HS256"]});

    }catch{
        throw new AppError("Invalid or expired token",401);
    }
    const user = await User.findById(payload.sub).select("name email role");
    if(!user)  throw new AppError("Invalid or expired token",401);
    req.user = user;
    next();

}
const authorize = (...roles) => (req,res,next) =>{
    if(!roles.includes(req.user.role)){
        throw new AppError("You have not permission to do this",403)
    }
    next();
}
module.exports = {authenticate,authorize};