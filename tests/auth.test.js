const request = require("supertest");
const app = require("../src/app");
const {connect,clearDb,disconnect,registerUser} = require("./helpers");
const API= "/api/v1/auth";

beforeAll(connect);
beforeEach(clearDb);
afterAll(disconnect);


describe("auth",() =>{


    it("registers a user, ignores a client-sent role, and never leaks the hash",async()=>{
        const res= await request(app)
        .post(`${API}/register`)
        .send({name:"Disha",email:"d@test.com",password:"secret123",role:"admin"});
         
        expect(res.status).toBe(201);
        expect(res.body.data.role).toBe("user");
        expect(res.body.data.passwordHash).toBeUndefined();
expect(res.body.accessToken).toBeDefined();

    });
    it("rejects a duplicate email with 409",async () =>{
        await registerUser("dup@test.com");
        const res= await request(app)
        .post(`${API}/register`)
        .send({name:"Again",email:"dup@test.com",password:"secret123"});
        expect(res.status).toBe(409);

    })

 it("rejects a short password with 422",async () =>{
        const res= await request(app)
        .post(`${API}/register`)
        .send({name:"Short",email:"p@test.com",password:"123"});
        expect(res.status).toBe(422);

    })
    it("gives the same 401 for wrong password and an unknown email",async()=>{
        await registerUser("a@test.com");
        const wrong = await request(app).post(`${API}/login`).send({ email: "a@test.com", password: "wrong-pass-1" });
        const unknown =await request(app).post(`${API}/login`).send ({email: "nobody@test.com", password: "wrong-pass-1"});
        expect(wrong.status).toBe(401);
        expect(unknown.status).toBe(401);
        expect(wrong.body.message).toBe(unknown.body.message);
    })
    it("protects/me",async()=>{
        const {token} = await registerUser("me@test.com");
        
    expect((await request(app).get(`${API}/me`)).status).toBe(401);
    expect((await request(app).get(`${API}/me`).set("Authorization",`Bearer ${token}`)).status).toBe(200);

    })
    it("rotates refresh tokens and rejects a replayed one",async ()=>{
        const {cookie} = await registerUser("r@test.com");
        const first = await request(app).post(`${API}/refresh`).set("Cookie",cookie);
        const replay = await request(app).post(`${API}/refresh`).set("Cookie",cookie);
        expect(first.status).toBe(200);
        expect(replay.status).toBe(401);

    })
    it("rejects a refresh request from an unknown origin with 403",async ()=>{
        const {cookie} = await registerUser("o@test.com");
        const res=await request(app)
        .post(`${API}/refresh`)
        .set("Cookie",cookie)
            .set("Origin","http://evil.com");
            expect(res.status).toBe(403);
        
    })
})
describe("changePassword",()=>{
   const change = (token,body) =>
       request(app)
   .patch(`${API}/password`)
   .set("Authorization",`Bearer ${token}`)   
    .send(body);
   it("returns 403 for a wrong current password",async() =>{   
     const {token} = await registerUser("cp1@test.com");
   const res =  await change(token,{currentPassword:"wrong-pass-1",newPassword:"newsecret456"});
   expect(res.status).toBe(403);
})
it("rejects the same password with 422",async() =>{
   const {token} = await registerUser("cp2@test.com");
   const res =  await change(token,{currentPassword:"secret123",newPassword:"secret123"}); 
      expect(res.status).toBe(422);
})
it("changes the password, logs out old sessions, and keeps this device logged in",async() =>{  
      const {token,cookie} = await registerUser("cp3@test.com");    
      const res =  await change(token,{currentPassword:"secret123",newPassword:"newsecret456"});    
      expect(res.body.accessToken).toBeDefined();
      expect(res.status).toBe(200);
      const oldRefresh = await request(app).post(`${API}/refresh`).set("Cookie",cookie);
expect(oldRefresh.status).toBe(401);
const oldLogin = await request(app).post(`${API}/login`).send({email: "cp3@test.com", password: "secret123" });
const newLogin = await request(app).post(`${API}/login`).send({email: "cp3@test.com", password: "newsecret456" });
    expect(oldLogin.status).toBe(401);
    expect(newLogin.status).toBe(200);

    })
    it("rejects a too-short new password with 422", async () => {
  const { token } = await registerUser("cp4@test.com");
  const res = await change(token, { currentPassword: "secret123", newPassword: "s123" });
  expect(res.status).toBe(422);
});
})
