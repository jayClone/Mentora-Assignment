const Lesson = require("../models/Lesson");

// GET ALL LESSONS (public - for parents to browse)
exports.getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find()
            .select("title description mentorId createdAt")
            .populate("mentorId", "name")
            .lean();
        res.json({ lessons });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch lessons" });
    }
};

// GET MENTOR'S OWN LESSONS (for mentors only)
exports.getMentorLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find({ mentorId: req.user._id })
            .populate("mentorId", "name");
        res.json({ lessons });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your lessons" });
    }
};

// CREATE LESSON (mentor only)
exports.createLesson = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }
        const lesson = await Lesson.create({
            title,
            description,
            mentorId: req.user._id
        });
        res.status(201).json({
            message: "Lesson created successfully",
            lesson
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create lesson"
        });
    }
};

// GET SINGLE LESSON
exports.getLessonById = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        res.json({ lesson });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch lesson" });
    }
};

// UPDATE LESSON (mentor only)
exports.updateLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        if (lesson.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own lessons"
            });
        }
        if (title) lesson.title = title;
        if (description) lesson.description = description;
        await lesson.save();
        res.json({
            message: "Lesson updated successfully",
            lesson
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update lesson" });
    }
};

// DELETE LESSON (mentor only)
exports.deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        if (lesson.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only delete your own lessons"
            });
        }
        await Lesson.findByIdAndDelete(id);
        res.json({ message: "Lesson deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete lesson" });
    }
};