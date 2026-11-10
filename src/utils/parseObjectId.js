const AppError = require("./AppError");
const parseObjectId = (raw) =>{
    if(!/^[a-f\d]{24}$/i.test(raw)){
        throw new AppError("Invalid id",400);
    }
    return raw;
} 
module.exports = parseObjectId;