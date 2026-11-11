const bcrypt= require("bcryptjs");
const crypto= require("crypto");
const User = require("../models/user.models");
const RefreshToken= require("../models/refreshToken.model");
const AppError = require("../utils/AppError");
const {sendEmail} = require("../utils/email")
const{
    signAccessToken,
    hashToken,
    createRefreshToken,
    setRefreshCookie,
    clearRefreshCookie
} = require("../utils/tokens");
const DUMMY_HASH= bcrypt.hashSync("not-a-real-password",12);
const startSession=async(user,res)=>{
    const accessToken = signAccessToken(user);
    setRefreshCookie(res,await createRefreshToken(user._id));
    return accessToken;
}
const register = async(req,res) =>{
    const {name,email,password} = req.body;
    const passwordHash = await bcrypt.hash(password,12);
const user = await User.create({name,email,passwordHash});
const accessToken= await startSession(user,res);
res.status(201).json({success:true,accessToken,data:user});
}
const login = async(req,res) =>{
    const {email,password} = req.body;
    const user = await User.findOne({email}).select("+passwordHash");
    const ok = await bcrypt.compare(password,user?user.passwordHash:DUMMY_HASH);
    if(!user ||!ok) throw new AppError("Invalid email or password",401);
    const accessToken = await startSession(user,res);
    res.status(200).json({success:true,accessToken,data:user});
}
const refresh = async(req,res)=>{
    const raw = req.cookies?.refreshToken;
    if(!raw) throw new AppError("Refresh token missing",401);
    const tokenHash = hashToken(raw);
    const record = await RefreshToken.findOneAndUpdate(
        {tokenHash,revokedAt:null,expiresAt:{$gt:new Date()}},
        { $set: { revokedAt: new Date() } }

       
    )
    if(!record){
        const reused = await RefreshToken.findOne({tokenHash});
        if(reused && reused.revokedAt){
            await RefreshToken.updateMany(
                {user:reused.user,revokedAt:null},
                {$set:{revokedAt:new Date}}
            )
        }
        clearRefreshCookie(res);
        throw new AppError("Invalid refresh Token",401);
    }

const user = await User.findById(record.user);
if(!user) throw new AppError("Invalid refresh token",401);
const accessToken= await startSession(user,res);
res.status(200).json({success:true,accessToken});
}
const logout = async(req,res) =>{
    const raw = req.cookies?.refreshToken;
    if(raw){
        await RefreshToken.updateOne(
            {tokenHash:hashToken(raw),revokedAt:null},
            {$set:{revokedAt:new Date()}}
        )
    }
    clearRefreshCookie(res);
    res.status(204).send();
};
const me = (req,res)=>{
    res.status(200).json({success:true,data:req.user});



}

const forgotPassword = async(req,res) =>{
    
    const user = await User.findOne({email:req.body.email});
  
    if(user) {
        const raw= crypto.randomBytes(32).toString("hex");
        await User.updateOne(
            {_id:user._id},
            {
                $set:{
                    passwordResetHash:hashToken(raw),
                    passwordResetExpires:new Date(Date.now() +15*60*1000),
                }
            }
        )
       if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Reset token for ${user.email}: ${raw}`);
       }
      const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${raw}`;
      sendEmail({
        to:user.email,
        subject:"Reset your EventBook password",
text: `Use this link to reset your password (valid for 15 minutes):\n${link}\n\nIf you did not ask for this, ignore this email.`,      }).catch((err) => console.error("Reset email failed:",err.message)  );
    
    }
    res.status(200).json({
        success:true,
        message:"If that email is registered, a reset link has been sent",

    })
}

const resetPassword = async(req,res) =>{
    const{token,newPassword}= req.body;
    const passwordHash= await bcrypt.hash(newPassword,12);
    const user= await User.findOneAndUpdate(
        {passwordResetHash:hashToken(token),passwordResetExpires:{$gt:new Date()}},
        {$set:{passwordHash}, $unset:{passwordResetHash:1,passwordResetExpires:1}}
    )
    if(!user) throw new AppError("Reset link is invalid or has expired", 400)
        await RefreshToken.updateMany(
    {user:user._id,revokedAt:null},
    {$set:{revokedAt:new Date()}}
        )
        res.status(200).json({success:true,message:"Password updated. Please log in again."})
}

const changePassword = async (req,res) =>{
    const {currentPassword,newPassword} = req.body;
    const user = await User.findById(req.user._id).select("+passwordHash");
        if(!user) throw new AppError("Invalid or expired token", 401)
const ok = await bcrypt.compare(currentPassword,user.passwordHash);
        if(!ok) throw new AppError("Current password is incorrect",403);
        const passwordHash = await bcrypt.hash(newPassword,12);
        await User.updateOne(
            {_id:user._id},
            {
                $set:{passwordHash},
                $unset:{passwordResetHash:1,passwordResetExpires:1},
            }
        )
        await RefreshToken.updateMany(
            {user:user._id,revokedAt:null},
            {$set : {revokedAt: new Date()}}
        )
        const accessToken = await startSession(user,res);
        res.status(200).json({success:true,message:"Password updated",accessToken})
}

module.exports = {register,login,refresh,logout,me,forgotPassword,resetPassword,changePassword};