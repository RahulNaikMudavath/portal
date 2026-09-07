const User = require("../../../modules/users/models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔐 SIGNUP
exports.signup = async (req, res) => {
  try {
    const { 
      name, email, password, phone, city, company, address,
      skills, department, workMode, experience, availability, photo
    } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let parsedSkills = [];
    if (skills) {
      try {
        parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills;
      } catch (e) {
        parsedSkills = String(skills).split(",").map(s => s.trim()).filter(Boolean);
      }
    }

    // Public signup is strictly assigned 'client' role to prevent privilege escalation
    const enforcedRole = "client";

    // create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: enforcedRole,
      phone: phone || "",
      city: city || "",
      company: company || "",
      organization: company || "",
      address: address || "",
      skills: parsedSkills,
      department: department || "",
      workMode: workMode || "field",
      experience: Number(experience) || 0,
      availability: availability || "available",
      photo: photo || ""
    });

    const { initializeUserDashboard } = require("../../../modules/dashboard/services/dashboardInitializationService");
    await initializeUserDashboard(user._id);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({ message: "User created successfully", user: safeUser });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 🔑 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";

    // check user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "7d" }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      message: "Login successful",
      token,
      user: safeUser
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🌐 GOOGLE AUTH LOGIN / REGISTRATION
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google ID Token is required" });
    }

    let payload;
    // Dynamic mock check ONLY for non-production environments
    if (token.startsWith("mock-")) {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Mock Google authentication is disabled in production" });
      }
      const mockEmail = token.replace("mock-", "").toLowerCase().trim();
      payload = {
        sub: `google-mock-id-${Date.now()}`,
        name: mockEmail.split("@")[0].split(/[._+-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        email: mockEmail,
        picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        email_verified: true
      };
    } else if (!token.includes(".")) {
      // Access token: fetch user info directly from Google OAuth API
      const axios = require("axios");
      const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = googleResponse.data;
      payload = {
        sub: data.sub,
        name: data.name,
        email: data.email,
        picture: data.picture,
        email_verified: data.email_verified || true
      };
    } else {
      // JWT ID token: verify using Google client library
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    // Check if user exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        provider: "google",
        name: payload.name,
        email: normalizedEmail,
        avatar: payload.picture || "",
        emailVerified: payload.email_verified || false,
        role: "client", // default client role for new users
        lastLogin: new Date()
      });
      const { initializeUserDashboard } = require("../../../modules/dashboard/services/dashboardInitializationService");
      await initializeUserDashboard(user._id);
    } else {
      user.googleId = user.googleId || payload.sub;
      user.provider = user.provider || "google";
      user.avatar = user.avatar || payload.picture || "";
      user.emailVerified = user.emailVerified || payload.email_verified || false;
      user.lastLogin = new Date();
      await user.save();
    }

    // Sign JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "1d" }
    );

    const isOnboarded = !!user.phone && (!!user.organization || !!user.company);

    res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || user.photo || "",
        isOnboarded
      }
    });

  } catch (error) {
    console.error("GOOGLE LOGIN CONTROLLER ERROR:", error);
    res.status(500).json({ error: error.message || "Google token validation failed" });
  }
};

// 📋 COMPLETE ONBOARDING PROFILE
exports.completeProfile = async (req, res) => {
  try {
    const { 
      phone, organization, role, department, engineerType,
      jobTitle, experience, address, emergencyContact, bio, preferredLanguage
    } = req.body;

    // Validation
    if (!phone) return res.status(400).json({ message: "Phone number is required" });
    if (!organization) return res.status(400).json({ message: "Organization/Company name is required" });
    if (!department) return res.status(400).json({ message: "Department is required" });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.phone = phone;
    user.organization = organization;
    user.company = organization; // sync legacy field
    user.department = department;

    // Preserve existing role; prevent elevating client to admin on self-serve onboarding
    if (user.role === "admin" && role === "admin") {
      user.role = "admin";
      user.engineerType = "none";
    } else {
      user.role = "client";
      user.engineerType = (engineerType && engineerType !== "none") ? engineerType : "field";
      user.workMode = user.engineerType === "field" ? "field" : "office";
    }

    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (experience !== undefined) user.experience = Number(experience) || 0;
    if (address !== undefined) user.address = address;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (bio !== undefined) user.bio = bio;
    if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;

    if (req.file) {
      user.photo = req.file.path;
    }

    await user.save();

    const { initializeUserDashboard } = require("../../../modules/dashboard/services/dashboardInitializationService");
    await initializeUserDashboard(user._id);

    // Re-sign token with verified role
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Profile onboarding completed successfully",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || user.photo || "",
        isOnboarded: true
      }
    });

  } catch (error) {
    console.error("COMPLETE PROFILE CONTROLLER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};