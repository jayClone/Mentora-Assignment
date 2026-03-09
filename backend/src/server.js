require("dotenv").config();

require("./config/env");

const app = require("./app");

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;


// connect database
connectDB();


// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});