const express = require("express");
const router = express.Router();
const {
    createBooking,
    getBookings,
    getBookingById,
    deleteBooking
} = require("../controllers/booking.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

router.post("/", requireAuth, requireRole("parent"), createBooking);
router.get("/", requireAuth, getBookings);
router.get("/:id", requireAuth, getBookingById);
router.delete("/:id", requireAuth, requireRole("parent"), deleteBooking);

module.exports = router;