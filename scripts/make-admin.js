// eventbook-api/scripts/make-admin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user.models");

(async () => {
  const email = (process.argv[2] || "").toLowerCase();
  if (!email) {
    console.log("Usage: node scripts/make-admin.js <email>");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
  console.log(user ? `${user.email} is now admin` : "User not found");
  await mongoose.disconnect();
})();