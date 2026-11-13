const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken=require("../models/refreshToken.model");
const REFRESH_DAYS = Number(process.env.REFRESH_TTL_DAYS) ||7;
const DAY_MS = 24*60*60*1000;
const signAccessToken=(user) =>
jwt.sign({},process.env.JWT_ACCESS_SECRET,{
    subject:String(user._id),
    expiresIn:process.env.ACCESS_TTL ||"15m",
    algorithm:"HS256",

});
const hashToken = (raw)=> crypto.createHash("sha256").update(raw).digest("hex");
const createRefreshToken = async(userId) =>{
    const raw= crypto.randomBytes(40).toString("hex");
    await RefreshToken.create({
        user:userId,
        tokenHash:hashToken(raw),
        expiresAt:new Date(Date.now()+ REFRESH_DAYS * DAY_MS)
    })
    return raw;
}  
    const isProd =process.env.NODE_ENV === 'production';

const cookieOptions={
  httpOnly:true,
    secure:isProd,
    sameSite: isProd? "none": "lax",
    path:"/api/v1/auth",
     
  
}
const setRefreshCookie = (res,raw) =>{
    res.cookie("refreshToken",raw,{...cookieOptions,maxAge:REFRESH_DAYS*DAY_MS})
}
    const clearRefreshCookie = (res) =>res.clearCookie("refreshToken",cookieOptions);

module.exports ={
    signAccessToken,
    hashToken,
    createRefreshToken,
    setRefreshCookie,
    clearRefreshCookie,
}