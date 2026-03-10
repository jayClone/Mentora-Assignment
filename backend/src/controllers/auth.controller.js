const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// SIGNUP
exports.signup = async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        // Check fields exist
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: "Name, email, and password are required" 
            });
        }

        // ✅ VALIDATE ROLE EARLY
        if (!["parent", "mentor"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Trim whitespace
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        // Check if trimmed values are empty
        if (!trimmedName) {
            return res.status(400).json({ message: "Name cannot be empty" });
        }

        if (!trimmedEmail) {
            return res.status(400).json({ message: "Email cannot be empty" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters" 
            });
        }

        const existingUser = await User.findOne({ email: trimmedEmail });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: trimmedName,
            email: trimmedEmail,
            password: hashedPassword,
            role
        });

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Signup failed" });
    }

};

// LOGIN
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Validate required fields
        if (!email?.trim() || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const trimmedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: trimmedEmail });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }

};

// GET CURRENT USER
exports.me = async (req, res) => {

    res.json({
        user: req.user
    });

};