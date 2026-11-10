const multer = require("multer");
const AppError = require("../utils/AppError");
const ALLOWED = ["image/jpeg","image/png","image/webp"];
const upload = multer({
    storage:multer.memoryStorage(),
    limits:{fileSize:2*1024*1024,files:1},
    fileFilter:(req,file,cb) =>
ALLOWED.includes(file.mimetype)
? cb(null,true)
:cb(new AppError("Only JPG, PNG or WebP images are allowed",415))    
})
module.exports = upload.single("image");