const Student = require("../models/Student");

// CREATE STUDENT
exports.createStudent = async (req, res) => {
    try {
        const { name, age } = req.body;
        if (!name || !age) {
            return res.status(400).json({
                message: "Name and age are required"
            });
        }
        const student = await Student.create({
            name,
            age,
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
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own students"
            });
        }
        if (name) student.name = name;
        if (age) student.age = age;
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