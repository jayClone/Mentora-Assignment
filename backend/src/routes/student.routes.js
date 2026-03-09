const express = require("express");
const router = express.Router();
const {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} = require("../controllers/student.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

router.post("/", requireAuth, requireRole("parent"), createStudent);
router.get("/", requireAuth, requireRole("parent"), getStudents);
router.get("/:id", requireAuth, requireRole("parent"), getStudentById);
router.put("/:id", requireAuth, requireRole("parent"), updateStudent);
router.delete("/:id", requireAuth, requireRole("parent"), deleteStudent);

module.exports = router;