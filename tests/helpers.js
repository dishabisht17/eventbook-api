const mongoose = require("mongoose");
const request =  require("supertest");
const app = require("../src/app");

const connect = async () =>{
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
}
const clearDb = async() =>{
    await Promise.all(
        Object.values(mongoose.connection.collections).map((c) => c.deleteMany({}))
    )
}
const disconnect = () => mongoose.disconnect();

const registerUser  = async(email = "user@test.com",role) =>{
    const res= await request(app)
    .post("/api/v1/auth/register")
    .send({name:"Test User",email,password:"secret123"});
    if(role) await mongoose.model("User").updateOne({email},{role});
    return{
        token:res.body.accessToken,
        id:res.body.data._id,
        cookie: res.headers["set-cookie"][0].split(";")[0],
    }
}
const createEvent = async(adminToken,overrides = {}) =>{
    const res= await request(app)
.post("/api/v1/events")
.set("Authorization",`Bearer ${adminToken}`)
.send({title:"Rock Night",city:"mumbai",date:"2026-12-15",totalSeats:20,...overrides});
return res.body.data;
}
module.exports = {connect,clearDb,disconnect,createEvent,registerUser};