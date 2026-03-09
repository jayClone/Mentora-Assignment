const express = require("express");
const router = express.Router();
const {
    getAllSessions,
    createSession,
    getMentorSessions,
    getSessionsByLesson,
    getSessionById,
    updateSession,
    deleteSession,
    joinSession,
    leaveSession
} = require("../controllers/session.controller");
const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

router.get("/", requireAuth, getAllSessions);
router.get("/mentor/my-sessions", requireAuth, requireRole("mentor"), getMentorSessions);
router.get("/lesson/:lessonId", getSessionsByLesson);
router.get("/:id", getSessionById);
router.post("/", requireAuth, requireRole("mentor"), createSession);
router.post("/:id/join", requireAuth, joinSession);
router.post("/:id/leave", requireAuth, leaveSession);
router.put("/:id", requireAuth, requireRole("mentor"), updateSession);
router.delete("/:id", requireAuth, requireRole("mentor"), deleteSession);

module.exports = router;