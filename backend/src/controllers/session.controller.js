const Session = require("../models/Session");
const Lesson = require("../models/Lesson");
const Booking = require("../models/Booking");
const Student = require("../models/Student");
const mongoose = require("mongoose");

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// GET ALL SESSIONS - parents only see sessions for lessons they have booked
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

// CREATE SESSION (with mentor validation)
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

// GET MENTOR'S OWN SESSIONS (for mentors only)
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

// GET SESSIONS BY LESSON
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

// GET SINGLE SESSION
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

// UPDATE SESSION
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

// DELETE SESSION
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

// JOIN SESSION (Student attendance)
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

        // Verify the session belongs to a lesson the parent booked
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

        // Check if student already attending
        if (session.attendees.includes(studentId)) {
            return res.status(400).json({ message: "Student already attending this session" });
        }

        // Add student to attendees
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

// LEAVE SESSION
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

        // Verify student is actually in the session
        if (!session.attendees.includes(studentId)) {
            return res.status(400).json({
                message: "Student is not attending this session"
            });
        }

        // Remove student from attendees
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