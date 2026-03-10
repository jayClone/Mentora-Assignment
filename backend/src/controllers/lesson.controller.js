const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

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
        const trimmedTitle = title?.trim();
        const trimmedDesc = description?.trim();

        if (!trimmedTitle || !trimmedDesc) {
            return res.status(400).json({
                message: "Title and description cannot be empty"
            });
        }

        if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
            return res.status(400).json({
                message: "Title must be 3-200 characters"
            });
        }

        if (trimmedDesc.length < 10 || trimmedDesc.length > 5000) {
            return res.status(400).json({
                message: "Description must be 10-5000 characters"
            });
        }

        const lesson = await Lesson.create({
            title: trimmedTitle,
            description: trimmedDesc,
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

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid lesson ID format" });
        }

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

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid lesson ID format" });
        }

        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        if (lesson.mentorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own lessons"
            });
        }

        if (title) {
            const trimmedTitle = title.trim();
            if (!trimmedTitle) {
                return res.status(400).json({ message: "Title cannot be empty" });
            }
            if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
                return res.status(400).json({
                    message: "Title must be 3-200 characters"
                });
            }
            lesson.title = trimmedTitle;
        }

        if (description) {
            const trimmedDesc = description.trim();
            if (!trimmedDesc) {
                return res.status(400).json({ message: "Description cannot be empty" });
            }
            if (trimmedDesc.length < 10 || trimmedDesc.length > 5000) {
                return res.status(400).json({
                    message: "Description must be 10-5000 characters"
                });
            }
            lesson.description = trimmedDesc;
        }

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

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid lesson ID format" });
        }

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