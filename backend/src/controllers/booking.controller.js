const Booking = require("../models/Booking");
const Student = require("../models/Student");
const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The ID string to validate
 * @returns {boolean} True if valid ObjectId format
 */
const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Create a lesson booking for a student
 * Validates student ownership and prevents duplicate bookings via unique index
 * 
 * @async
 * @function createBooking
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.studentId - Student MongoDB ObjectId
 * @param {string} req.body.lessonId - Lesson MongoDB ObjectId
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, booking: Object}
 * @throws {400} Missing or invalid IDs
 * @throws {403} Parent trying to book for another's student
 * @throws {404} Student or lesson not found
 * @throws {409} Duplicate booking exists
 * @throws {500} Server error
 */
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

/**
 * Retrieve all bookings based on user role
 * Parents see only their bookings; mentors see bookings for their lessons
 * 
 * @async
 * @function getBookings
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user (parent or mentor)
 * @param {Object} res - Express response object
 * @returns {Object} {bookings: Array} - Populated bookings with student and lesson details
 * @throws {401} Unauthorized (no token)
 * @throws {500} Server error
 */
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

/**
 * Retrieve a single booking by ID with authentication checks
 * Parents can only view their own bookings; mentors can only view bookings for their lessons
 * 
 * @async
 * @function getBookingById
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Booking MongoDB ObjectId
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} {booking: Object} - Booking with populated references
 * @throws {400} Invalid booking ID format
 * @throws {403} Unauthorized access
 * @throws {404} Booking not found
 * @throws {500} Server error
 */
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

/**
 * Cancel a booking (soft/hard delete)
 * Only the parent who created the booking can delete it
 * 
 * @async
 * @function deleteBooking
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Booking MongoDB ObjectId
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string}
 * @throws {400} Invalid booking ID format
 * @throws {403} Parent trying to cancel another's booking
 * @throws {404} Booking not found
 * @throws {500} Server error
 */
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