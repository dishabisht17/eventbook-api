const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload")
const validate = require("../middleware/validate");
const{authenticate,authorize} = require("../middleware/auth");

const {createEventSchema,replaceEventSchema,updateEventSchema} = require("../schemas/event.schemas");
const {uploadEventImage} = require("../controllers/event.controllers")
const {getEvents,getEventsById,createEvent,updateEvent,replaceEvent,deleteEvent}= require("../controllers/event.controllers");

router
.route("/")
.get(getEvents)
.post(authenticate,authorize("admin"),validate(createEventSchema),createEvent);

router
.route("/:id")
.get(getEventsById)
.put(authenticate,authorize("admin"),validate(replaceEventSchema),replaceEvent)
.patch(authenticate,authorize("admin"),validate(updateEventSchema),updateEvent)
.delete(authenticate,authorize("admin"),deleteEvent);

router.post(
    "/:id/image",
    authenticate,
    authorize("admin"),
    upload,
    uploadEventImage
)

module.exports =router;