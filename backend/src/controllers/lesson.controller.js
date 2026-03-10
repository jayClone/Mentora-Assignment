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
 * Retrieve all available lessons in the system (public endpoint)
 * Used by parents to browse lessons and book for their students
 * 
 * @async
 * @function getLessons
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} {lessons: Array} - Array of lesson objects with mentor info
 * @throws {500} Server error
 */
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

/**
 * Retrieve all lessons created by the authenticated mentor
 * Mentor-only endpoint for managing their lesson catalog
 * 
 * @async
 * @function getMentorLessons
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated mentor user
 * @param {Object} res - Express response object
 * @returns {Object} {lessons: Array} - Lessons created by the mentor
 * @throws {401} Unauthorized (not a mentor)
 * @throws {500} Server error
 */
exports.getMentorLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find({ mentorId: req.user._id })
            .populate("mentorId", "name");
        res.json({ lessons });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your lessons" });
    }
};

/**
 * Create a new lesson (mentor-only)
 * Validates title and description length requirements
 * 
 * @async
 * @function createLesson
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Lesson title (3-200 characters)
 * @param {string} req.body.description - Lesson description (10-5000 characters)
 * @param {Object} req.user - Authenticated mentor user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, lesson: Object}
 * @throws {400} Missing or invalid fields
 * @throws {500} Server error
 */
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

/**
 * Retrieve a single lesson by ID
 * Public endpoint available to all users to view lesson details
 * 
 * @async
 * @function getLessonById
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Lesson MongoDB ObjectId
 * @param {Object} res - Express response object
 * @returns {Object} {lesson: Object} - Complete lesson object
 * @throws {400} Invalid lesson ID format
 * @throws {404} Lesson not found
 * @throws {500} Server error
 */
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

/**
 * Update lesson details (mentor-only)
 * Only the lesson creator can modify their lessons
 * 
 * @async
 * @function updateLesson
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Lesson MongoDB ObjectId
 * @param {Object} req.body - Request body (partial)
 * @param {string} [req.body.title] - New lesson title (optional, 3-200 chars)
 * @param {string} [req.body.description] - New lesson description (optional, 10-5000 chars)
 * @param {Object} req.user - Authenticated mentor user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, lesson: Object} - Updated lesson
 * @throws {400} Invalid lesson ID format or validation fails
 * @throws {403} Mentor trying to update another's lesson
 * @throws {404} Lesson not found
 * @throws {500} Server error
 */
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

/**
 * Delete a lesson permanently (mentor-only)
 * Only the lesson creator can delete their lessons
 * 
 * @async
 * @function deleteLesson
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Lesson MongoDB ObjectId
 * @param {Object} req.user - Authenticated mentor user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string}
 * @throws {400} Invalid lesson ID format
 * @throws {403} Mentor trying to delete another's lesson
 * @throws {404} Lesson not found
 * @throws {500} Server error
 */
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