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
    required: true
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