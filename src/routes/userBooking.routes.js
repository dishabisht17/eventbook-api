const express = require("express");

const router = express.Router();

const {authenticate} = require("../middleware/auth");

const {getBookingById,cancelBooking} = require("../controllers/booking.controllers");
router.use(authenticate);
router.get("/:id",getBookingById);
router.delete("/:id",cancelBooking);

module.exports = router;