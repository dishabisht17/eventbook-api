const express = require('express');
const cookieParser =  require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const openapi= require("./docs/openapi");
const eventRoutes = require("./routes/event.routes");
const bookingRoutes = require("./routes/booking.routes")


const authRoutes = require("./routes/auth.routes")
const userBookingRoutes = require("./routes/userBooking.routes");

const noSqlGuard=require("./middleware/noSqlGuard");
const {notFound,errorHandler} = require("./middleware/error.middleware");
const {apiLimiter } = require("./middleware/rateLimit")
const app = express();
if(process.env.NODE_ENV ==="production") app.set("trust proxy",1);

const allowedOrigins=(process.env.CORS_ORIGINS || "")
.split(",")
.map((s)=>s.trim())
.filter(Boolean);

app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapi,{swaggerOptions:{persistAuthorization:true}})
)

app.use(helmet());
app.use(compression());
app.use(
    cors({
        origin:(origin,cb)=>cb(null,!origin ||  allowedOrigins.includes(origin)),
        credentials:true,
    })
)

app.use(express.json({limit:"100kb"}));
app.use(cookieParser());
app.use(noSqlGuard);
app.use(apiLimiter);

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/events/:eventId/bookings",bookingRoutes);
app.use("/api/v1/events",eventRoutes);
app.use("/api/v1/bookings",userBookingRoutes);

app.use(notFound);
app.use(errorHandler);


module.exports = app;