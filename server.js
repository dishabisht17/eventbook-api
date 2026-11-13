require("dotenv").config();
require("./src/config/validateEnv")();
const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB= require("./src/config/db");
const PORT = process.env.PORT ||5000;
let server;

const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    const force = setTimeout (()=>{
        console.error("Forced Shutdown after timeout");
        process.exit(1);

    },10000);
    force.unref();
     
    server.close(async () =>{
        await mongoose.connection.close();
        console.log("Closed Cleanly");
        process.exit(0);
    })
}

connectDB()
.then(()=>{
   server = app.listen(PORT,()=> console.log(`Server listening on PORT ${PORT}`));
   process.on("SIGTERM",() => shutdown("SIGNTERM"));
   process.on("SIGINT",() => shutdown("SIGINT"));
})
.catch((err)=>{
console.error("DB connection failed:",err.message);
process.exit(1);
});

process.on("unhandledRejection",(err) =>{
    console.error("Unhandled Rejection:", err);
})