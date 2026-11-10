const {z} = require("zod");
const createBookingSchema = z.object({

seats:z.number().int().min(1).max(10),
    

})
module.exports = {createBookingSchema};