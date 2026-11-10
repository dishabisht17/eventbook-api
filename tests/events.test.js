const request = require("supertest");
const app = require("../src/app");
const {connect,clearDb,disconnect,registerUser,createEvent} = require("./helpers");
const EVENTS= "/api/v1/events";

beforeAll(connect);
beforeEach(clearDb);
afterAll(disconnect);

describe("events",() =>{
    it("returns 401 without a token, 403 for a user, 201 for an admin",async () =>{
        const user =  await registerUser("u@test.com");
        const admin = await registerUser("admin@test.com","admin");
        const body = {title:"jazz night",city:"delhi",date:"2026-12-15",totalSeats:10} ;

        expect((await request(app).post(EVENTS).send(body)).status).toBe(401);
        const  bearer = (t) => ["Authorization",`Bearer ${t}`];
        expect((await request(app).post(EVENTS).set(...bearer(user.token)).send(body)).status).toBe(403);


        const created =  await request(app).post(EVENTS).set(...bearer(admin.token)).send(body);
        expect(created.status).toBe(201);
        expect(created.body.data.availableSeats).toBe(10);
    })

    it("lists events publicly and filters by city ignoring case",async()=>{
        const admin = await registerUser("admin@test.com","admin");
        await createEvent(admin.token, {city :"Delhi"});
        await createEvent(admin.token, {city :"Mumbai"});

        const all = await request(app).get(EVENTS);
        const delhi = await request(app).get(`${EVENTS}?city=DELHI`);

        expect(all.status).toBe(200);
        expect(all.body.total).toBe(2);
        expect(delhi.body.data).toHaveLength(1);



    })
    it("returns 400 for a malformed id and 404 for a missing one",async() =>{
        expect((await request(app).get(`${EVENTS}/abc`)).status).toBe(400);
        expect((await request(app).get(`${EVENTS}/64b7f0f0f0f0f0f0f0f0f0f0`)).status).toBe(404);

    })
})