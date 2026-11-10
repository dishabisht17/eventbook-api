const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema(
    {
        event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true},
      user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        seats:{type:Number,required:true,min:1,max:10},
        status:{type:String,enum:["confirmed","cancelled"],default:"confirmed"}
    },
    {timestamps:true}
)
bookingSchema.index({event:1,user:1});
module.exports=mongoose.model("Booking",bookingSchema);