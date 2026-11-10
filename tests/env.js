

require("dotenv").config();
const uri =  process.env.MONGO_URI_TEST;
const dbName = uri &&  (uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+)/) || [])[1];
if(!dbName ||  !dbName.endsWith("_test")){
    throw new Error(
        "Refusing to run tests: MONGO_URI_TEST must point to a database whose name ends with _test"
    );
}

process.env.MONGO_uri = uri;