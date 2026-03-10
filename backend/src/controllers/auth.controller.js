const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * User signup with comprehensive validation
 * Creates new parent or mentor account with email uniqueness check
 * 
 * @async
 * @function signup
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User full name (1-100 characters)
 * @param {string} req.body.email - User email (unique, valid format required)
 * @param {string} req.body.password - User password (minimum 6 characters)
 * @param {string} req.body.role - User role ('parent' or 'mentor')
 * @param {Object} res - Express response object
 * @returns {Object} {token: string, user: {id, name, email, role}}
 * @throws {400} Missing required fields or invalid format
 * @throws {409} Email already exists
 * @throws {500} Server error during signup
 */
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: "Name, email, and password are required" 
            });
        }

        if (!["parent", "mentor"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedName) {
            return res.status(400).json({ message: "Name cannot be empty" });
        }

        if (!trimmedEmail) {
            return res.status(400).json({ message: "Email cannot be empty" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

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

/**
 * User login with email and password authentication
 * Validates credentials against hashed password in database
 * 
 * @async
 * @function login
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User email address
 * @param {string} req.body.password - User password (plain text)
 * @param {Object} res - Express response object
 * @returns {Object} {token: string, user: {id, name, email, role}}
 * @throws {400} Missing email or password
 * @throws {401} Invalid credentials
 * @throws {500} Server error during login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

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

/**
 * Retrieve current authenticated user information
 * Returns user object from JWT token payload (set by auth middleware)
 * 
 * @async
 * @function me
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} {user: {_id, name, email, role, createdAt, updatedAt}}
 * @throws {401} Unauthorized (no valid token)
 */
exports.me = async (req, res) => {

    res.json({
        user: req.user
    });

};