const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        name:{type:String,required:true,trim:true,minlength:2,maxLength:60},
        email:{type:String,required:true,unique:true,trim:true,lowercase:true},
        passwordHash:{type:String,required:true,select:false},
        role:{type:String,enum:["user","admin"],default:"user"},
        passwordResetHash:{type:String, select:false},
passwordResetExpires:{type:Date, select:false}
    },
    {
        timestamps:true,
        toJSON:{
            transform:(dec,ret) =>{
                delete ret.passwordHash;
                delete ret.__v;
                return ret;
            }
        }
    }
)



module.exports = mongoose.model("User",userSchema);
