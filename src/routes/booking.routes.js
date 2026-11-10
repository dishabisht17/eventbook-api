const express = require("express");
const {authenticate} = require("../middleware/auth");

const router = express.Router({mergeParams:true});
router.use(authenticate);
const validate = require("../middleware/validate");
const {createBookingSchema} = require("../schemas/booking.schemas");
const {createBooking,getEventBookings} =  require("../controllers/booking.controllers");

router.route("/").get(getEventBookings).post(validate(createBookingSchema),createBooking);
module.exports = router;