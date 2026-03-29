require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local" });
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Found" : "Not Found");
if (process.env.MONGODB_URI) {
    console.log("URI Masked:", process.env.MONGODB_URI.split('@')[1] || "No credentials found in URI");
}
