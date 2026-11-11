jest.mock("../src/utils/email",()=>({
sendEmail : jest.fn().mockResolvedValue({}),
}));
const request = require("supertest");
const app = require("../src/app");
const {sendEmail} = require("../src/utils/email");
const {connect,clearDb,disconnect,registerUser,createEvent} = require("./helpers");
const bearer =  (t)  =>["Authorization",`Bearer ${t}`];
const book = (eventId,token,seats =1) =>
    request(app).post(`/api/v1/events/${eventId}/bookings`).set(...bearer(token)).send({seats});

beforeAll(connect);
beforeEach(async () =>{
    await clearDb();
sendEmail.mockClear();
});
afterAll(disconnect);
describe("bookings",() =>{
    it("never oversells when requests arrive at the same time",async() =>{
        const admin =  await registerUser("admin@test.com","admin");
        const user = await registerUser("u@test.com");
        const event = await createEvent(admin.token,{totalSeats:3});
        
        const results = await Promise.all(Array.from({length:6},() =>book(event._id,user.token)));
const statuses = results.map((r)=>r.status);
expect(statuses.filter((s)=>s===201)).toHaveLength(3);
expect(statuses.filter((s)=>s===409)).toHaveLength(3);
const after = await request(app).get(`/api/v1/events/${event._id}`);
expect(after.body.data.availableSeats).toBe(0);
    })

    it("shows a booking to its owner and an admin, but returns 404 to a stranger",async() =>{
        const admin = await registerUser("admin@test.com","admin");
        const owner = await registerUser("owner@test.com");
        const stranger= await registerUser("stranger@test.com");
        const event = await createEvent(admin.token);
        const booking = (await book(event._id,owner.token)).body.data;
        const url = `/api/v1/bookings/${booking._id}`;
   
        expect ((await request(app).get(url).set(...bearer(owner.token))).status).toBe(200);
        expect ((await request(app).get(url).set(...bearer(admin.token))).status).toBe(200);
        expect ((await request(app).get(url).set(...bearer(stranger.token))).status).toBe(404);

    })

    it("sends a confirmation email without calling a real mail server",async() =>{
         const admin = await registerUser("admin@test.com","admin");
             const user = await registerUser("u@test.com");
                     const event = await createEvent(admin.token);

                     await book(event._id,user.token,2);
                     expect(sendEmail).toHaveBeenCalledTimes(1);
                     expect(sendEmail.mock.calls[0][0].to).toBe("u@test.com");


    })
    it("returns the seats only once when a booking is cancelled twice at the same time",async () =>{
        const admin = await registerUser("admin@test.com","admin");
             const user = await registerUser("u@test.com");
                                  const event = await createEvent(admin.token,{totalSeats:5});
                                           const booking = (await book(event._id,user.token,2)).body.data;
        const url = `/api/v1/bookings/${booking._id}`;
const results = await Promise.all([
    request(app).delete(url).set(...bearer(user.token)),
    request(app).delete(url).set(...bearer(user.token)),
])
expect(results.map((r) => r.status).sort()).toEqual([200,409]);
const after = await request(app).get(`/api/v1/events/${event._id}`);
expect(after.body.data.availableSeats).toBe(5);

    })

    it("lets an admin cancel any booking but not a stranger",async () =>{
         const admin = await registerUser("admin@test.com","admin");
        const owner = await registerUser("owner@test.com");
        const stranger= await registerUser("stranger@test.com");
        const event = await createEvent(admin.token);
        const booking = (await book(event._id,owner.token)).body.data;
        const url = `/api/v1/bookings/${booking._id}`;
        expect ((await request(app).delete(url).set(...bearer(stranger.token))).status).toBe(404);
        expect ((await request(app).delete(url).set(...bearer(owner.token))).status).toBe(200);


    })
})



