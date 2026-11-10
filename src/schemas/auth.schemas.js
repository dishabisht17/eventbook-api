const {z} = require("zod");
const registerSchema = z.object({
    name:z.string().trim().min(2).max(60),
    email:z.string().trim().toLowerCase().email("Enter a Valid email"),
    password:z
    .string()
    .min(8,"Password must be atleast 8 characters")
    .max(72, "password must be at most 72 characters"),

});
const loginSchema = z.object({
    email:z.string().trim().toLowerCase().email(),
    password:z.string().min(8).max(72),
})
const forgotPasswordSchema=z.object({
    email:z.string().trim().toLowerCase().email(),
})
const resetPasswordSchema=z.object({
    token:z.string().length(64),
    newPassword:z.string().min(8).max(72),
})
const changePasswordSchema = z
.object({
    currentPassword : z.string().min(1).max(72),
    newPassword: z
    .string()
    .min(8,"password must be at least 8 characters")
    .max(72,"password must be at most 72 characters"),
})
.refine((d) =>d.currentPassword !== d.newPassword,{
    message:"New password must be different from the current one",
    path:
})
module.exports={registerSchema,loginSchema,forgotPasswordSchema,resetPasswordSchema}