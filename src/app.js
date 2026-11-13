const express = require('express');
const mongoose = require('mongoose');
const crypto = require("crypto");
const morgan = require("morgan");
const cookieParser =  require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const openapi= require("./docs/openapi");
const allowedOrigins = require("./config/origins")
const eventRoutes = require("./routes/event.routes");
const bookingRoutes = require("./routes/booking.routes")


const authRoutes = require("./routes/auth.routes")
const userBookingRoutes = require("./routes/userBooking.routes");

const noSqlGuard=require("./middleware/noSqlGuard");
const {notFound,errorHandler} = require("./middleware/error.middleware");
const {apiLimiter } = require("./middleware/rateLimit")
const app = express();

if(process.env.NODE_ENV ==="production") app.set("trust proxy",1);

app.use((req,res,next)=>{
    const incoming = req.get("x-request-id");
    req.id = incoming && /^[\w-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
    res.setHeader("X-Request-Id",req.id);
    next();
})

morgan.token("id",(req)=>req.id);
app.use(
    morgan(":id :method :url :status :response-time ms", {
        skip: () => process.env.NODE_ENV === 'test',
    })
)


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

app.get("/health",(req,res) =>{
    const dbUp = mongoose.connection.readyState ===1;
    res.status(dbUp ? 200 :503).json({
        status : dbUp ? "ok" : "unavailable",
                db : dbUp ? "up" : "down",
uptime: Math.round(process.uptime()),
    })
})
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