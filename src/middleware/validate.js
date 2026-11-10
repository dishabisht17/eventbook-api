const AppError = require("../utils/AppError");
const validate = (schema)=>{
    if(!schema){
        throw new Error("validate() received and undefined schema.Chect the import and export names");

    }

return (req,res,next)=>{
    const result=schema.safeParse(req.body ?? {});
    if(!result.success){
        const details=result.error.issues.map((issue)=>({
            field:issue.path.join("."),
            message:issue.message,
        
        }));
return next(new AppError ("Validation failed",422,details));

    }
    req.body=result.data;
    next();
}
}
module.exports= validate;