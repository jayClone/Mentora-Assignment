const Booking = require("../models/Booking");
const Student = require("../models/Student");
const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");

// VALIDATION HELPER - Define FIRST, use later
const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// CREATE BOOKING
exports.createBooking = async (req, res) => {
    try {
        const { studentId, lessonId } = req.body;
        
        if (!studentId || !lessonId) {
            return res.status(400).json({
                message: "studentId and lessonId are required"
            });
        }
        
        if (!validateObjectId(studentId) || !validateObjectId(lessonId)) {
            return res.status(400).json({
                message: "Invalid studentId or lessonId format"
            });
        }
        
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        if (student.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only book lessons for your own students"
            });
        }
        
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        
        const booking = await Booking.create({
            studentId,
            lessonId,
            parentId: req.user._id
        });
        
        res.status(201).json({
            message: "Booking created successfully",
            booking
        });
    } catch (error) {
        if (error.code === 11000) { 
            return res.status(409).json({ 
                message: "Student is already booked for this lesson" 
            });
        }
        res.status(500).json({ message: "Booking failed" });
    }
};

// GET ALL BOOKINGS
exports.getBookings = async (req, res) => {
    try {
        let bookings;
        
        if (req.user.role === "parent") {
            bookings = await Booking.find({
                parentId: req.user._id
            })
                .populate("studentId")
                .populate({ path: "lessonId", populate: { path: "mentorId", select: "name" } });
        } else if (req.user.role === "mentor") {
            bookings = await Booking.find()
                .populate({
                    path: "lessonId",
                    match: { mentorId: req.user._id },
                    populate: { path: "mentorId", select: "name" }
                })
                .populate("studentId")
                .then(b => b.filter(booking => booking.lessonId !== null));
        }
        
        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

// GET SINGLE BOOKING
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ADD VALIDATION HERE
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid booking ID format" });
        }
        
        const booking = await Booking.findById(id)
            .populate("studentId lessonId");
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        
        if (req.user.role === "parent" && booking.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        if (req.user.role === "mentor" && booking.lessonId.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        res.json({ booking });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch booking" });
    }
};

// DELETE BOOKING
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ADD VALIDATION HERE
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid booking ID format" });
        }
        
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        
        if (booking.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only cancel your own bookings"
            });
        }
        
        await Booking.findByIdAndDelete(id);
        res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete booking" });
    }
};