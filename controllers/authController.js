const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");

const JWT_SECRET = "serve_ease"; // Secret matching the sample backend secret

// User Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");

const JWT_SECRET = "serve_ease"; // Secret matching the sample backend secret

// User Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(200).json({ success: false, message: "Invalid email or password" });
    }

    // Support both hashed passwords (for signup) and plaintext passwords (for pre-seeded users)
    const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
    const match = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!match) {
      return res.status(200).json({ success: false, message: "Invalid email or password" });
    }

    // Check account status for wholesalers
    if (user.role === 'wholesaler') {
      const userStatus = user.status || 'approved';
      if (userStatus === 'pending') {
        return res.status(200).json({
          success: false,
          message: "Your business account is pending approval by the Admin."
        });
      } else if (userStatus === 'rejected') {
        return res.status(200).json({
          success: false,
          message: "Your business registration was rejected by the Admin."
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Hide password before returning user profile
    const userProfile = { ...user };
    delete userProfile.password;

    console.log(`🔑 Login successful: ${userProfile.name} (${userProfile.role})`);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userProfile
    });
  } catch (err) {
    console.error("Login controller error:", err);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// User Signup Controller
const signup = async (req, res) => {
  const { name, phone, gender, email, password, role, license_no, business_address, shop_picture, cnic_front, cnic_back } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Name, email, password, and role are required" });
  }

  try {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const isWholesaler = role.toLowerCase() === 'wholesaler';
    const userId = await UserModel.createUser({
      name,
      phone,
      gender,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
      status: isWholesaler ? 'pending' : 'approved',
      license_no: isWholesaler ? license_no : null,
      business_address: isWholesaler ? business_address : null,
      shop_picture: isWholesaler ? (shop_picture || null) : null,
      cnic_front: isWholesaler ? (cnic_front || null) : null,
      cnic_back: isWholesaler ? (cnic_back || null) : null,
    });

    console.log(`👤 Account created: ${name} (${role})`);
    return res.status(201).json({
      success: true,
      message: isWholesaler
        ? "Business registered successfully and is pending admin approval."
        : "Account created successfully.",
      user_id: userId
    });
  } catch (err) {
    console.error("Signup controller error:", err);
    return res.status(500).json({ success: false, message: "Failed to create account" });
  }
};

module.exports = { login, signup };
  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(200).json({ success: false, message: "Invalid email or password" });
    }

    // Support both hashed passwords (for signup) and plaintext passwords (for pre-seeded users)
    const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
    const match = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!match) {
      return res.status(200).json({ success: false, message: "Invalid email or password" });
    }

    // Check account status for wholesalers
    if (user.role === 'wholesaler') {
      const userStatus = user.status || 'approved';
      if (userStatus === 'pending') {
        return res.status(200).json({
          success: false,
          message: "Your business account is pending approval by the Admin."
        });
      } else if (userStatus === 'rejected') {
        return res.status(200).json({
          success: false,
          message: "Your business registration was rejected by the Admin."
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Hide password before returning user profile
    const userProfile = { ...user };
    delete userProfile.password;

    console.log(`🔑 Login successful: ${userProfile.name} (${userProfile.role})`);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userProfile
    });
  } catch (err) {
    console.error("Login controller error:", err);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// User Signup Controller
const signup = async (req, res) => {
  const { name, phone, gender, email, password, role, license_no, business_address } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Name, email, password, and role are required" });
  }

  try {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const isWholesaler = role.toLowerCase() === 'wholesaler';
    const userId = await UserModel.createUser({
      name,
      phone,
      gender,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
      status: isWholesaler ? 'pending' : 'approved',
      license_no: isWholesaler ? license_no : null,
      business_address: isWholesaler ? business_address : null
    });

    console.log(`👤 Account created: ${name} (${role})`);
    return res.status(201).json({
      success: true,
      message: isWholesaler 
        ? "Business registered successfully and is pending admin approval."
        : "Account created successfully.",
      user_id: userId
    });
  } catch (err) {
    console.error("Signup controller error:", err);
    return res.status(500).json({ success: false, message: "Failed to create account" });
  }
};

module.exports = { login, signup };
