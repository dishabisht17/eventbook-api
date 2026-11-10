const errorResponse = (description) =>({
description,
content:{"application/json": {schema:{$ref: "#/components/schemas/Error"}}},
})
const json =  (schema) => ({"application/json":{schema}});

module.exports = {
    openapi: "3.0.3",
info:{
    title:"EventBook API",
    version: "1.0.0",
    description: "Event booking  REST API with JWT authentication",
},
servers:[{url:"/api/v1"}],
tags:[{name:"Auth"},{name:"Events"},{name:"Bookings"}],
components:{
    securitySchemes:{
        bearerAuth:{type:"http", scheme:"bearer",bearerFormat:"JWT"},
    },
    schemas:{
        Error:{
            type:"object",
            properties:{
success:{type:"boolean",example:false},
message:{type:"string",example:"Validation failed"},
errors:{
    type:"array",
    items:{
        type:"object",
        properties:{field:{type:"string"},message:{type:"string"}},
    },
},
            },
        },
        Event:{
            type:"object",
            properties:{
                _id:{type:"string",example:"6ae6e233b1843df59fde27e5"},
                title:{type:"string",example:"Rock Night"},
                city:{type:"string",example:"Mumbai"},
                date:{type:"string",format:"date-time"},
                totalSeats:{type:"integer",example:20},
                availableSeats:{type:"integer",example:19},
                image:{type:"object",properties:{url:{type:"string"}}},
            },
            
        },
        EventInput:{
            type:"object",
            required:["title","city","date","totalSeats"],
            properties:{
                title:{type:"string",minLength:3,maxLength:100,example:"Rock Night"},
                city:{type:"string",minLength:2,example:"mumbai"},
                date:{type:"string",example:"2026-12-15"},
                totalSeats:{type:"integer",minimum:1,example:10},
            },
        },
    },
    },
    paths:{
        "/auth/register":{
            post:{
                tags:["Auth"],
                summary:"Create an account",
                requestBody:{
                    required:true,
                    content:json({
                        type:"object",
                        required:["name","email","password"],
                        properties:{
                            name:{type:"string",example:"Disha"},
                            email:{type:"string",format:"email",example:"dax@gmail.com"},
                            password:{type:"string",minLength:8,example:"secret123"},
                        },
                    }),
                },
                responses:{
                    201:{description:"Account created. Returns accessToken and sets the refresh cookie"},
                    409:errorResponse("Email already exists"),
                    422:errorResponse("Validation failed")
                },
            },
        },
        "/events" :{
            get:{
                tags:["Events"],
                summary:"List events (public) ",
                parameters:[
                    {name:"city",in:"query",schema:{type:"string"}},
                    {name:"search",in:"query",schema:{type:"string"}},
                    {name:"page",in:"query",schema:{type:"integer",default:1}},
                                        {name:"limit",in:"query",schema:{type:"integer",default:10,maximum:50}},
                    {name:"sort",in:"query",schema:{type:"string",enum:["date"]}},

                ],
                responses:{200:{description:"A page of events" }},
            },
post:{
    tags:["Events"],
    summary:"Create an event (admin only)",
    security:[{bearerAuth:[]}],
    requestBody:{required:true,content:json({$ref:"#/components/schemas/EventInput"})},
    responses:{
        201:{description:"Event created",content:json({$ref:"#/components/schemas/Event"})},
        401:errorResponse("Missing  or invalid token"),
        403:errorResponse("Not an admin"),
        422:errorResponse("Validation failed"),
    },

},

        },
        "/events/{eventId}/bookings":{
            post:{
                tags:["Bookings"],
                summary:"Book seats on an event",
                security:[{bearerAuth:[]}],
                parameters:[{name:"eventId",in:"path",required:true,schema:{type:"string"}}],
                requestBody:{
                    required:true,
                    content:json({
                        type:"object",
                        required:["seats"],
                        properties:{seats:{type:"integer",minimum:1,maximum:10,example:2}},
                    }),
                },
responses:{
      201: { description: "Booking confirmed" },
          401: errorResponse("Missing or invalid token"),
          404: errorResponse("Event not found"),
          409: errorResponse("Not enough seats available"),
          422: errorResponse("Validation failed"),
},
            },
        },
    },

}
