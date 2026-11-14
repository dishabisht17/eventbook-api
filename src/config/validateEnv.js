const REQUIRED = ["MONGO_URI","JWT_ACCESS_SECRET"];
const REQUIRED_IN_PRODUCTION =[
"CORS_ORIGINS",
"CLIENT_URL",
"CLOUDINARY_CLOUD_NAME",
"CLOUDINARY_API_KEY",
"CLOUDINARY_API_SECRET",
];
const validateEnv = () =>{
    const isProd = process.env.NODE_ENV === 'production';
    const needed = isProd? [...REQUIRED,... REQUIRED_IN_PRODUCTION] : REQUIRED;
    const missing = needed.filter((key) => !process.env[key]);

    if(missing.length){
console.error(`Missing environment variables : ${missing.join(",")}`);
process.exit(1);
    }
if(process.env.JWT_ACCESS_SECRET.length < 32){
    console.error("JWT_ACCESS_SECRET must be at least 32 characters");
    process.exit(1);
}
if(isProd &&  !process.env.SMTP_HOST){
    console.warn("SMTP_HOST is not set: emails will go to a fake Ethereal inbox, not to real users");

}
}
module.exports = validateEnv;
