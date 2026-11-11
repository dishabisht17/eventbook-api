const AppError = require("../utils/AppError");
const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
const errorHandler = (err,req,res,next)=>{
    if(err.type==="entity.parse.failed"){
        err = new AppError("Invalid JSON in request body",400);
    }
if(err.name==="CastError") err = new AppError(`Invalid ${err.path}`,400);
if(err.code===11000) {
    const field = Object.keys(err.keyPattern || {}) [0] || "value";
    err = new AppError(`${field} already exists`,409);
}
if(err.name=== "MulterError"){
err=err.code ==="LIMIT_FILE_SIZE"
? new AppError("File too Large (max 2 MB)",413)
:
 new AppError(`Upload error: ${err.message}`,400);
}
if(err.name ==="ValidationError"){
    const details = Object.values(err.errors).map((e)=>({
        field:e.path,
        message:e.message
    }))
    err =new AppError("Validaion failed",422,details);
}
const isOperational = err.isOperational===true;
if (isOperational && !err.statusCode) {
    console.error("AppError created WITHOUT a status code:\n", err.stack);
  }
const status=isOperational? (err.statusCode || 500):500;
if(!isOperational) console.error(err);
res.status(status).json({
    success:false,
    message:isOperational?err.message:"Internal Server error",
...(err.details && {errors:err.details}),
})
}
module.exports={notFound,errorHandler};