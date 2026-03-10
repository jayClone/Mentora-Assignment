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
 * Create a new student record (parent-only)
 * Registers a child with age and name validation
 * 
 * @async
 * @function createStudent
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Student name (1-100 characters)
 * @param {number} req.body.age - Student age (1-120 years)
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, student: Object} - Created student with parentId
 * @throws {400} Missing required fields or validation fails
 * @throws {500} Server error
 */
exports.createStudent = async (req, res) => {
    try {
        const { name, age } = req.body;
        if (!name?.trim() || age === undefined) {
            return res.status(400).json({
                message: "Name and age are required"
            });
        }
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            return res.status(400).json({
                message: "Age must be between 1 and 120"
            });
        }
        const trimmedName = name.trim();
        if (trimmedName.length === 0 || trimmedName.length > 100) {
            return res.status(400).json({
                message: "Name must be 1-100 characters"
            });
        }
        const student = await Student.create({
            name: trimmedName,
            age: ageNum,
            parentId: req.user._id
        });
        res.status(201).json({
            message: "Student created successfully",
            student
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create student" });
    }
};

/**
 * Retrieve all students for the authenticated parent
 * Parent-only endpoint to view all their registered children
 * 
 * @async
 * @function getStudents
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {students: Array} - Array of student objects
 * @throws {401} Unauthorized (not authenticated)
 * @throws {403} Forbidden (not a parent)
 * @throws {500} Server error
 */
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({
            parentId: req.user._id
        });
        res.json({ students });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch students" });
    }
};

/**
 * Retrieve a single student by ID
 * Parent can only view their own students
 * 
 * @async
 * @function getStudentById
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Student MongoDB ObjectId
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {student: Object} - Student details
 * @throws {400} Invalid student ID format
 * @throws {403} Parent trying to view another's student
 * @throws {404} Student not found
 * @throws {500} Server error
 */
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }
        
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only view your own students"
            });
        }
        res.json({ student });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch student" });
    }
};

/**
 * Update student information (parent-only)
 * Parent can only update their own students
 * 
 * @async
 * @function updateStudent
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Student MongoDB ObjectId
 * @param {Object} req.body - Request body (partial)
 * @param {string} [req.body.name] - New student name (optional, 1-100 chars)
 * @param {number} [req.body.age] - New student age (optional, 1-120 years)
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string, student: Object} - Updated student
 * @throws {400} Invalid student ID format or validation fails
 * @throws {403} Parent trying to update another's student
 * @throws {404} Student not found
 * @throws {500} Server error
 */
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age } = req.body;
        
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }
        
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own students"
            });
        }
        
        if (name) {
            const trimmedName = name.trim();
            if (trimmedName.length === 0 || trimmedName.length > 100) {
                return res.status(400).json({
                    message: "Name must be 1-100 characters"
                });
            }
            student.name = trimmedName;
        }
        
        if (age !== undefined) {
            const ageNum = parseInt(age, 10);
            if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
                return res.status(400).json({
                    message: "Age must be between 1 and 120"
                });
            }
            student.age = ageNum;
        }
        
        await student.save();
        res.json({
            message: "Student updated successfully",
            student
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update student" });
    }
};

/**
 * Delete a student record permanently (parent-only)
 * Parent can only delete their own students
 * 
 * @async
 * @function deleteStudent
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Student MongoDB ObjectId
 * @param {Object} req.user - Authenticated parent user
 * @param {Object} res - Express response object
 * @returns {Object} {message: string}
 * @throws {400} Invalid student ID format
 * @throws {403} Parent trying to delete another's student
 * @throws {404} Student not found
 * @throws {500} Server error
 */
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }
        
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only delete your own students"
            });
        }
        await Student.findByIdAndDelete(id);
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete student" });
    }
};