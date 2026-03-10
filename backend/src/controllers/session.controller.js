const Session = require("../models/Session");
const Lesson = require("../models/Lesson");
const Booking = require("../models/Booking");
const Student = require("../models/Student");
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
 * Retrieve sessions for lessons the parent has booked
 * Parents can only see sessions for lessons they have active bookings for
 * 
 * @async
 * @function getAllSessions
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {sessions: Array} - Sessions sorted by date, with mentor info
 * @throws {401} Unauthorized (not authenticated)
 * @throws {500} Server error
 */
exports.getAllSessions = async (req, res) => {
    try {
        const bookings = await Booking.find({ parentId: req.user._id }).select("lessonId");
        const bookedLessonIds = bookings.map((b) => b.lessonId);

        const sessions = await Session.find({ lessonId: { $in: bookedLessonIds } })
            .populate({ path: "lessonId", populate: { path: "mentorId", select: "name" } })
            .sort({ date: 1 });

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Create a new session for a lesson (mentor-only)
 * Validates mentor ownership of lesson and future date requirement
 * 
 * @async
 * @function createSession
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.lessonId - Lesson MongoDB ObjectId
 * @param {string} req.body.date - Session date (ISO 8601 format, must be future date)
 * @param {string} req.body.topic - Session topic (3-200 characters)
 * @param {string} [req.body.summary] - Session summary (optional, ≤2000 characters)
 * @param {Object} req.user - Authenticated mentor user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, session: Object}
 * @throws {400} Missing required fields or invalid format
 * @throws {403} Mentor trying to create session for another's lesson
 * @throws {404} Lesson not found
 * @throws {500} Server error
 */
exports.createSession = async (req, res) => {
    try {
        const { lessonId, date, topic, summary } = req.body;
        
        if (!lessonId || !date || !topic?.trim()) {
            return res.status(400).json({
                message: "lessonId, date, and topic are required"
            });
        }

        if (!validateObjectId(lessonId)) {
            return res.status(400).json({ message: "Invalid lesson ID format" });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        if (lesson.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only create sessions for your own lessons"
            });
        }

        const sessionDate = new Date(date);
        if (isNaN(sessionDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date format. Use ISO 8601 (e.g., 2026-03-20T10:00:00Z)"
            });
        }
        if (sessionDate < new Date()) {
            return res.status(400).json({
                message: "Session date cannot be in the past"
            });
        }

        const trimmedTopic = topic.trim();
        if (trimmedTopic.length < 3 || trimmedTopic.length > 200) {
            return res.status(400).json({
                message: "Topic must be 3-200 characters"
            });
        }

        const session = await Session.create({
            lessonId,
            date: sessionDate,
            topic: trimmedTopic,
            summary
        });
        res.status(201).json({
            message: "Session created successfully",
            session
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create session" });
    }
};

/**
 * Retrieve all sessions created by the authenticated mentor
 * Mentor-only endpoint for managing their lesson sessions
 * 
 * @async
 * @function getMentorSessions
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated mentor user
 * @param {Object} res - Express response object
 * @returns {Object} {sessions: Array} - Sessions for mentor's lessons
 * @throws {401} Unauthorized (not a mentor)
 * @throws {500} Server error
 */
exports.getMentorSessions = async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate({
                path: "lessonId",
                match: { mentorId: req.user._id }
            })
            .then(s => s.filter(session => session.lessonId !== null));
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your sessions" });
    }
};

/**
 * Retrieve all sessions for a specific lesson
 * Public endpoint available to browse lesson schedule
 * 
 * @async
 * @function getSessionsByLesson
 * @param {Object} req - Express request object
 * @param {string} req.params.lessonId - Lesson MongoDB ObjectId
 * @param {Object} res - Express response object
 * @returns {Object} {sessions: Array} - Sessions for the lesson, sorted by date
 * @throws {400} Invalid lesson ID format
 * @throws {500} Server error
 */
exports.getSessionsByLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;

        if (!validateObjectId(lessonId)) {
            return res.status(400).json({ message: "Invalid lesson ID format" });
        }

        const sessions = await Session.find({ lessonId }).sort({ date: 1 });
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sessions" });
    }
};

/**
 * Retrieve a single session by ID
 * Public endpoint to view session details
 * 
 * @async
 * @function getSessionById
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Session MongoDB ObjectId
 * @param {Object} res - Express response object
 * @returns {Object} {session: Object} - Session with populated lesson reference
 * @throws {400} Invalid session ID format
 * @throws {404} Session not found
 * @throws {500} Server error
 */
exports.getSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID format" });
        }

        const session = await Session.findById(id).populate("lessonId");
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.json({ session });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch session" });
    }
};

/**
 * Update session details (mentor-only)
 * Only mentor who created the session's lesson can update it
 * 
 * @async
 * @function updateSession
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Session MongoDB ObjectId
 * @param {Object} req.body - Request body (partial)
 * @param {string} [req.body.topic] - New session topic (optional, 3-200 chars)
 * @param {string} [req.body.summary] - New session summary (optional, ≤2000 chars)
 * @param {Object} req.user - Authenticated mentor user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, session: Object} - Updated session
 * @throws {400} Invalid session ID format or validation fails
 * @throws {403} Mentor trying to update another's session
 * @throws {404} Session not found
 * @throws {500} Server error
 */
exports.updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { topic, summary } = req.body;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID format" });
        }

        const session = await Session.findById(id).populate("lessonId");
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.lessonId.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only update sessions for your own lessons"
            });
        }

        if (topic) {
            const trimmedTopic = topic.trim();
            if (!trimmedTopic || trimmedTopic.length < 3 || trimmedTopic.length > 200) {
                return res.status(400).json({
                    message: "Topic must be 3-200 characters"
                });
            }
            session.topic = trimmedTopic;
        }

        if (summary !== undefined) {
            if (summary) {
                const trimmedSummary = summary.trim();
                if (trimmedSummary.length > 2000) {
                    return res.status(400).json({
                        message: "Summary cannot exceed 2000 characters"
                    });
                }
                session.summary = trimmedSummary;
            } else {
                session.summary = null;
            }
        }

        await session.save();
        res.json({
            message: "Session updated successfully",
            session
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update session" });
    }
};

/**
 * Delete a session permanently (mentor-only)
 * Only mentor who created the session's lesson can delete it
 * 
 * @async
 * @function deleteSession
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Session MongoDB ObjectId
 * @param {Object} req.user - Authenticated mentor user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string}
 * @throws {400} Invalid session ID format
 * @throws {403} Mentor trying to delete another's session
 * @throws {404} Session not found
 * @throws {500} Server error
 */
exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID format" });
        }

        const session = await Session.findById(id).populate("lessonId");
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.lessonId.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only delete sessions for your own lessons"
            });
        }
        await Session.findByIdAndDelete(id);
        res.json({ message: "Session deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete session" });
    }
};

/**
 * Add student to session attendance list
 * Parent can only add their own students; requires active booking for lesson
 * 
 * @async
 * @function joinSession
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Session MongoDB ObjectId
 * @param {Object} req.body - Request body
 * @param {string} req.body.studentId - Student MongoDB ObjectId
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, session: Object} - Updated session with attendees
 * @throws {400} Invalid IDs or student already attending
 * @throws {403} Parent trying to add another's student or student not booked
 * @throws {404} Session or student not found
 * @throws {500} Server error
 */
exports.joinSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID format" });
        }

        if (!studentId) {
            return res.status(400).json({ message: "studentId is required" });
        }

        if (!validateObjectId(studentId)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only add your own students to sessions"
            });
        }

        const booking = await Booking.findOne({
            studentId,
            lessonId: session.lessonId,
            parentId: req.user._id
        });
        if (!booking) {
            return res.status(403).json({
                message: "Student is not booked for this lesson"
            });
        }

        if (session.attendees.includes(studentId)) {
            return res.status(400).json({ message: "Student already attending this session" });
        }

        session.attendees.push(studentId);
        await session.save();

        res.json({
            message: "Successfully joined session",
            session
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to join session" });
    }
};

/**
 * Remove student from session attendance list
 * Parent can only remove their own students
 * 
 * @async
 * @function leaveSession
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Session MongoDB ObjectId
 * @param {Object} req.body - Request body
 * @param {string} req.body.studentId - Student MongoDB ObjectId
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, session: Object} - Updated session with attendees
 * @throws {400} Invalid IDs or student not attending
 * @throws {403} Parent trying to remove another's student
 * @throws {404} Session or student not found
 * @throws {500} Server error
 */
exports.leaveSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId } = req.body;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID format" });
        }

        if (!studentId) {
            return res.status(400).json({ message: "studentId is required" });
        }

        if (!validateObjectId(studentId)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!session.attendees.includes(studentId)) {
            return res.status(400).json({
                message: "Student is not attending this session"
            });
        }

        session.attendees = session.attendees.filter(s => s.toString() !== studentId);
        await session.save();

        res.json({
            message: "Successfully left session",
            session
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to leave session" });
    }
};