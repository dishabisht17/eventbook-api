const express =  require('express')
const router = express.Router();
const validate = require("../middleware/validate")
const {authenticate} =  require("../middleware/auth")
const {loginLimiter,strictLimiter} =require("../middleware/rateLimit");
const{register,login,refresh,logout,me,forgotPassword,resetPassword} = require("../controllers/auth.controllers")
const{registerSchema,loginSchema,forgotPasswordSchema,resetPasswordSchema}= require("../schemas/auth.schemas");
router.post("/register",validate(registerSchema),register);
router.post("/refresh",refresh);
router.post("/logout",logout)
router.get("/me",authenticate,me)
router.post("/login", loginLimiter,validate(loginSchema),login);
router.post("/forgot-password",strictLimiter,validate(forgotPasswordSchema),forgotPassword);
router.post("/reset-password",validate(resetPasswordSchema),resetPassword);
module.exports = router;