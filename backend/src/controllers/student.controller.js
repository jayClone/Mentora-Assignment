const Student = require("../models/Student");
const mongoose = require("mongoose");

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// CREATE STUDENT
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

// GET STUDENTS (only parent's students)
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

// GET SINGLE STUDENT
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

// UPDATE STUDENT
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

// DELETE STUDENT
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