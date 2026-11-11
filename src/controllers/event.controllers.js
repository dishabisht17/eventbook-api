const Event = require("../models/event.models");
const AppError= require("../utils/AppError");
const {uploadBuffer,deleteImage} = require("../config/cloudinary");
const {looksLikeImage }= require("../utils/imageType");
const parseObjectId = require("../utils/parseObjectId");
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getEvents = async (req,res) =>{
    const page = Math.max(parseInt(req.query.page) || 1,1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10,1),50);
    const filter = {}
    if(req.query.city ) filter.city = String(req.query.city).trim().toLowerCase();
if(req.query.search) {
    filter.title = {$regex:escapeRegex(String(req.query.search)),$options:"i"};
}
const sort = req.query.sort ==="date" ? {date:1} :{createdAt:-1};
const [data,total]=await Promise.all([
    Event.find(filter).sort(sort).skip((page-1)*limit).limit(limit),
    Event.countDocuments(filter),
])
    res.status(200).json({success:true,page,limit,total,totalPage:Math.ceil(total/limit),count:data.length,data});
};

const getEventsById = async (req,res) =>{
const  event = await Event.findById(parseObjectId(req.params.id));
if(!event)  throw new AppError("Event not found",404);
res.status(200).json({success:true,data:event});
 
    }

const createEvent = async (req,res)=>{
    const event = await Event.create({...req.body,availableSeats:req.body.totalSeats})
    res.status(201).json({success:true,data:event});
};
const updateFields = async (req,res) =>{
    const event = await Event.findByIdAndUpdate(
        parseObjectId(req.params.id),
        {$set:req.body},
{returnDOcument: "after" ,runValidators:true}    );
    if(!event)  throw new AppError("Event not found",404);
res.status(200).json({success:true,data:event});
 
}

const deleteEvent= async (req,res)=>{
    const event = await Event.findByIdAndDelete(
        parseObjectId(req.params.id));
        
    if(!event)  throw new AppError("Event not found",404);
if(event.image?.publicId)
    await deleteImage(event.image.publicId).catch((err)=>
console.error("Cloudinary delete failed:",err.message));
    res.status(204).send({ success: true, message: "Event deleted" });

}

const uploadEventImage = async(req,res) =>{
    const id = parseObjectId(req.params.id);
    if(!req.file) throw new AppError ("Image file is required (form field:image)",400);
    if(!looksLikeImage(req.file.buffer)) throw new AppError("File is not a valid image ",415);
    const event=  await Event.findById(id);
    if(!event) throw new AppError("App not Found",404);
    let result;
try{   
     result = await uploadBuffer(req.file.buffer,"eventbook/events");
}    catch(err){
    console.error("Cloudinary upload failed :",err.message);
    throw new AppError("Image service unavailable",502);
}
const oldPublicId = event.image?.publicId;
event.image= {url:result.secure_url,publicId:result.public_id};
await event.save();
if(oldPublicId) await  deleteImage(oldPublicId).catch(()=>{});
res.status(200).json({success:true,data:event});
}

module.exports = {getEventsById,getEvents,createEvent,updateEvent:updateFields,deleteEvent,replaceEvent:updateFields,uploadEventImage};