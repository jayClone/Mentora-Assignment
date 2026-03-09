const Session = require("../models/Session");
const Lesson = require("../models/Lesson");
const Booking = require("../models/Booking");

// GET ALL SESSIONS - parents only see sessions for lessons they have booked
exports.getAllSessions = async (req, res) => {
    try {
        // Find all lesson IDs this parent has booked
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
        if (!lessonId || !date || !topic) {
            return res.status(400).json({
                message: "lessonId, date and topic are required"
            });
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
        const session = await Session.create({
            lessonId,
            date,
            topic,
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
        const session = await Session.findById(id).populate("lessonId");
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.lessonId.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only update sessions for your own lessons"
            });
        }
        if (topic) session.topic = topic;
        if (summary) session.summary = summary;
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

        if (!studentId) {
            return res.status(400).json({ message: "studentId is required" });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
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

        if (!studentId) {
            return res.status(400).json({ message: "studentId is required" });
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
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