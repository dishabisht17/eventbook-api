const Event = require("../models/event.models");
const AppError = require("../utils/AppError");
const {sendEmail} = require("../utils/email")
const parseObjectId = require("../utils/parseObjectId");
const Booking = require("../models/booking.models");
const createBooking = async(req,res) =>{
    const eventId = parseObjectId(req.params.eventId);
    const {seats } = req.body;
    const event=await Event.findOneAndUpdate(
{        _id:eventId,availableSeats:{$gte:seats}},
{$inc:{availableSeats:-seats}},
{new:true,runValidators:true}
    );
    if(!event){
        const exists = await Event.exists({_id:eventId});
        throw exists
        ?new AppError("Not Enough seats available",409)
        :new AppError("Event not found",404);

    }
    try{
        const booking= await Booking.create({event:eventId, user:req.user._id,seats});
        sendEmail({
            to:req.user.email,
            subject:`Booking Confirmed : ${event.title}`,
            text: `Hi ${req.user.name},your booking of ${seats} seat(s) for ${event.title} is confirmed.\nBooking id: ${booking._id}`,

        }).catch((err)=> console.error("Booking email failed:",err.message));
        res.status(201).json({success:true,data:booking});
    }catch(err){
        await Event.updateOne({_id:eventId},{$inc:{availableSeats:seats}});
        throw err;
    }
};
const getEventBookings = async(req,res)=>{
    const eventId = parseObjectId(req.params.eventId);
    const filter ={event:eventId};
    if(req.user.role!=="admin") filter.user = req.user._id;
  
    const bookings = await Booking.find(filter).sort({createdAt:-1});
    res.status(200).json({success:true,count:bookings.length,data:bookings});
}

const getBookingById =async(req,res) =>{
    const filter = {_id:parseObjectId(req.params.id)};
    if(req.user.role !=="admin") filter.user=req.user._id;
const booking= await Booking.findOne(filter).populate("event","title city date");
    if(!booking) throw new AppError("Booking not Found",404);
    res.status(200).json({success:true,data:booking});
}
const cancelBooking = async (req,res) =>{
    const filter = {_id: parseObjectId(req.params.id)};
    if(req.user.role !=="admin") 
    {filter.user = req.user._id};
        const booking = await Booking.findOneAndUpdate(
        {...filter,status:"confirmed"},
        {$set :{status:"cancelled"}},
        {returnDocument :"after"}
    )
       if(!booking){
        const exists = await Booking.exists(filter);
        throw exists
        ?new AppError("Booking already cancelled",409)
        :new AppError("Booking not found",404);

    }
    try{
        await Event.updateOne(
            {_id:booking.event},
            {$inc:{availableSeats:booking.seats}}
        )
    }
        catch(err) {
            await Booking.updateOne({_id:booking._id},{$set:{status:"confirmed"}})
            throw err;
        }
            res.status(200).json({success:true,data:booking});

    
}
module.exports = {createBooking,getEventBookings,getBookingById,cancelBooking};