const {z} = require("zod");
const eventFields = z.object({
    title:z.string().trim().min(3,"title must be 3 characters").max(100),
    city:z.string().trim().min(2,"city must be at least 2 characters"),
    date:z
    .string()
    .refine((v)=> !Number.isNaN(Date.parse(v)),"date must be a valid date, e.g. 2026-12-01")
})

const createEventSchema = eventFields.extend({
totalSeats:z.number().int().min(1).max(100000),
});
const replaceEventSchema = eventFields;
const updateEventSchema = eventFields
.partial()
.refine((obj)=>Object.keys(obj).length>0,"Send atleast one field to update");
module.exports ={createEventSchema,replaceEventSchema,updateEventSchema};