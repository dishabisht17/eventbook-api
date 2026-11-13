const express =  require('express');

const router = express.Router();
const validate = require("../middleware/validate")
const {authenticate} =  require("../middleware/auth");
const verifyOrigin = require("../middleware/verifyOrigin")
const {loginLimiter,strictLimiter,passwordLimiter} =require("../middleware/rateLimit");
const{register,login,refresh,logout,me,forgotPassword,resetPassword,changePassword} = require("../controllers/auth.controllers")
const{registerSchema,loginSchema,forgotPasswordSchema,resetPasswordSchema,changePasswordSchema}= require("../schemas/auth.schemas");
router.post("/register",validate(registerSchema),register);
router.post("/refresh",verifyOrigin,refresh);
router.post("/logout",verifyOrigin,logout);
router.get("/me",authenticate,me)
router.post("/login", loginLimiter,validate(loginSchema),login);
router.post("/forgot-password",strictLimiter,validate(forgotPasswordSchema),forgotPassword);
router.post("/reset-password",validate(resetPasswordSchema),resetPassword);
router.patch("/password",authenticate,passwordLimiter,validate(changePasswordSchema),changePassword);
module.exports = router;