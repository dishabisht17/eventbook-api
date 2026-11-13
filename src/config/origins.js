module.exports = (process.env.CORS_ORIGINS || "")
.split(",")
.map((s)=>s.trim())
.filter(Boolean);