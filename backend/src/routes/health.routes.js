const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Service is healthy",
        uptime: process.uptime(),
        timestamp: new Date()
    });

});

module.exports = router;