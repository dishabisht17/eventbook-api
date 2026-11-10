const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema(
    {

        title:{type:String,required:true,trim:true,minlength:3,maxLength:100},
        city:{type:String,required:true,trim:true,lowercase:true},
        date:{type:Date,required:true},
        totalSeats:{type:Number,required:true,min:1},
        availableSeats:{type:Number,required:true,min:0},
        image:{url:String,publicId:String}
    },
    {timestamps:true}
);
eventSchema.index({city:1,date:1});
module.exports=mongoose.model("Event",eventSchema);