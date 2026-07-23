const mongoose = require("mongoose");

const generateClientRollNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `CLT${timestamp}${random}`;
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return !this.provider || this.provider === "local";
    }
  },
  role: {
    type: String,
    enum: ["admin", "client"],
    default: "client"
  },
  rollNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  phone: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  company: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  photo: {
    type: String,
    default: ""
  },
  skills: {
    type: [String],
    default: []
  },
  department: {
    type: String,
    default: ""
  },
  workMode: {
    type: String,
    enum: ["office", "field", "hybrid"],
    default: "field"
  },
  experience: {
    type: Number,
    default: 0
  },
  availability: {
    type: String,
    enum: ["available", "busy", "on-leave"],
    default: "available"
  },
  googleId: {
    type: String,
    default: ""
  },
  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },
  avatar: {
    type: String,
    default: ""
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  organization: {
    type: String,
    default: ""
  },
  engineerType: {
    type: String,
    enum: ["office", "field", "none"],
    default: "none"
  },
  jobTitle: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  preferredLanguage: {
    type: String,
    default: "English"
  },
  emergencyContact: {
    type: String,
    default: ""
  },
  lastLogin: {
    type: Date
  },
  currentLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, default: "" },
    updatedAt: { type: Date, default: null }
  }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (this.role === "client" && !this.rollNumber) {
    let rollNumber;
    let exists = true;

    while (exists) {
      rollNumber = generateClientRollNumber();

      exists = await mongoose.models.User.exists({
        rollNumber
      });
    }

    this.rollNumber = rollNumber;
  }
});

module.exports = mongoose.model("User", userSchema);