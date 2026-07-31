const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./modules/users/models/User");
const { initializeUserDashboard } = require("./modules/dashboard/services/dashboardInitializationService");
require("dotenv").config();

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is not defined in environment variables!");
      process.exit(1);
    }

    console.log(`Connecting to database: ${mongoUri.replace(/:([^@]+)@/, ":*****@")}`);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    // 1. Create Admin
    const adminEmail = "admin@constructai.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      admin = await User.create({
        name: "Admin Consultancy",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        phone: "1234567890",
        city: "San Francisco",
        company: "ConstructAI",
        organization: "ConstructAI",
        address: "123 Main St",
        skills: ["Management", "Planning"],
        department: "Operations",
        workMode: "office",
        experience: 5,
        availability: "available"
      });
      await initializeUserDashboard(admin._id);
      console.log(`Admin user (admin@constructai.com) created successfully.`);
    } else {
      console.log(`Admin user (admin@constructai.com) already exists.`);
    }

    // 2. Create Engineer (client role)
    const engineerEmail = "engineer@constructai.com";
    let engineer = await User.findOne({ email: engineerEmail });
    if (!engineer) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      engineer = await User.create({
        name: "Engineer Maaran",
        email: engineerEmail,
        password: hashedPassword,
        role: "client",
        phone: "9876543210",
        city: "Chennai",
        company: "Maaran Consultancy",
        organization: "Maaran Consultancy",
        address: "456 Side St",
        skills: ["Engineering", "Inspection"],
        department: "Engineering",
        workMode: "field",
        experience: 3,
        availability: "available"
      });
      await initializeUserDashboard(engineer._id);
      console.log(`Engineer user (engineer@constructai.com) created successfully.`);
    } else {
      console.log(`Engineer user (engineer@constructai.com) already exists.`);
    }

    console.log("Seeding process completed successfully!");

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

seed();
