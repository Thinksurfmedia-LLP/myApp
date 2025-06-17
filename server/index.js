// Imports
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

// Logo Schema to store current logo filename
const logoSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Logo = mongoose.model("Logo", logoSchema);

// Metal Prices Schema
const MetalPricesSchema = new mongoose.Schema(
  {
    gold24K: {
      type: Number,
      required: true,
      min: 0,
    },
    gold22K: {
      type: Number,
      required: true,
      min: 0,
    },
    gold18K: {
      type: Number,
      required: true,
      min: 0,
    },
    gold14K: {
      type: Number,
      required: true,
      min: 0,
    },
    silver: {
      type: Number,
      required: true,
      min: 0,
    },
    platinum: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    palladium: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MetalPrices = mongoose.model("MetalPrices", MetalPricesSchema);

// Diamond Prices Schema
const DiamondPricesSchema = new mongoose.Schema(
  {
    shape: {
      type: String,
      enum: ["Round", "Fancy"],
      required: true,
    },
    weightFrom: {
      type: Number,
      required: true,
      min: 0,
    },
    weightTo: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerCarat: {
      type: Number,
      required: true,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const DiamondPrices = mongoose.model("DiamondPrices", DiamondPricesSchema);

// Validation middleware
const validateInput = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = {};

  // Email validation
  if (!email || !email.trim()) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Please enter a valid email";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  // Name validation for registration
  if (req.path === "/register") {
    if (!name || !name.trim()) {
      errors.name = "Name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Auth middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Create uploads directory if it doesn't exist
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Helper function to remove old logo files
const removeOldLogos = () => {
  const files = fs.readdirSync(uploadsDir);
  const logoFiles = files.filter((file) => file.startsWith("logo."));
  logoFiles.forEach((file) => {
    fs.unlinkSync(path.join(uploadsDir, file));
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Remove any existing logo files before saving new one
    removeOldLogos();
    cb(null, "logo" + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  },
});

// Routes

// Register
app.post("/api/auth/register", authLimiter, validateInput, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Server error during registration",
    });
  }
});

// Login
app.post("/api/auth/login", authLimiter, validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
});

// Get current user profile
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      message: "User profile retrieved successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      message: "Server error retrieving profile",
    });
  }
});

// Logout current user
app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Server error during logout",
    });
  }
});

// Logo upload route
app.post(
  "/api/upload/logo",
  authenticateToken,
  upload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const logoUrl = `http://localhost:5000/uploads/${req.file.filename}`;

      // Save logo info to database
      try {
        // Delete existing logo record
        await Logo.deleteMany({});

        // Create new logo record
        const logoRecord = new Logo({
          filename: req.file.filename,
          originalName: req.file.originalname,
        });
        await logoRecord.save();
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue even if database save fails
      }

      res.status(200).json({
        message: "Logo uploaded successfully",
        logoUrl: logoUrl,
      });
    } catch (error) {
      console.error("Logo upload error:", error);
      res.status(500).json({ message: "Error uploading logo" });
    }
  }
);

// Get current logo route - FIXED
app.get("/api/logo", async (req, res) => {
  try {
    // First try to get logo info from database
    const logoRecord = await Logo.findOne().sort({ uploadedAt: -1 });

    if (logoRecord) {
      const logoPath = `./uploads/${logoRecord.filename}`;
      if (fs.existsSync(logoPath)) {
        return res.status(200).json({
          logoUrl: `http://localhost:5000/uploads/${logoRecord.filename}`,
        });
      }
    }

    // Fallback: Check for any logo file in uploads directory
    const uploadsDir = "./uploads";
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const logoFile = files.find((file) => file.startsWith("logo."));

      if (logoFile) {
        return res.status(200).json({
          logoUrl: `http://localhost:5000/uploads/${logoFile}`,
        });
      }
    }

    // If no logo found, return default
    res.status(200).json({
      logoUrl:
        "https://www.shutterstock.com/image-vector/vector-icon-demo-600nw-1148418773.jpg",
    });
  } catch (error) {
    console.error("Get logo error:", error);
    res.status(200).json({
      logoUrl:
        "https://www.shutterstock.com/image-vector/vector-icon-demo-600nw-1148418773.jpg",
    });
  }
});

// METAL PRICES ROUTES

// Get current metal prices
app.get("/api/metal-prices", async (req, res) => {
  try {
    let metalPrices = await MetalPrices.findOne()
      .sort({ createdAt: -1 })
      .populate("updatedBy", "name email");

    // If no prices exist, create default ones
    if (!metalPrices) {
      metalPrices = new MetalPrices({
        gold24K: 6847,
        gold22K: 6280,
        gold18K: 5135,
        gold14K: 3995,
        silver: 84.5,
        platinum: 3200,
        palladium: 2800,
        updatedBy: null,
        isDefault: true,
      });
      await metalPrices.save();
    }

    res.json({
      success: true,
      metalPrices,
    });
  } catch (error) {
    console.error("Error fetching metal prices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch metal prices",
      error: error.message,
    });
  }
});

// Update metal prices - Authentication required (Using findOneAndUpdate)
app.put("/api/metal-prices", authenticateToken, async (req, res) => {
  try {
    const { gold24K, gold22K, gold18K, gold14K, silver, platinum, palladium } =
      req.body;

    // Validation
    const prices = {
      gold24K,
      gold22K,
      gold18K,
      gold14K,
      silver,
    };

    for (const [key, value] of Object.entries(prices)) {
      if (value === undefined || value === null || isNaN(parseFloat(value))) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${key} price. Must be a valid number.`,
        });
      }
      if (parseFloat(value) < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${key} price. Must be a positive number.`,
        });
      }
    }

    // Update or create the metal prices document
    const updateData = {
      gold24K: parseFloat(gold24K),
      gold22K: parseFloat(gold22K),
      gold18K: parseFloat(gold18K),
      gold14K: parseFloat(gold14K),
      silver: parseFloat(silver),
      platinum: parseFloat(platinum || 3200),
      palladium: parseFloat(palladium || 2800),
      updatedBy: req.user._id,
      isDefault: false,
    };

    const metalPrices = await MetalPrices.findOneAndUpdate(
      {}, // Find any document (there should only be one)
      updateData,
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        runValidators: true, // Run schema validations
      }
    ).populate("updatedBy", "name email");

    res.json({
      success: true,
      message: "Metal prices updated successfully",
      metalPrices: metalPrices,
    });
  } catch (error) {
    console.error("Error updating metal prices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update metal prices",
      error: error.message,
    });
  }
});

// Get metal prices history - Authentication required
app.get("/api/metal-prices/history", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const history = await MetalPrices.find({ isDefault: { $ne: true } })
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MetalPrices.countDocuments({
      isDefault: { $ne: true },
    });

    res.json({
      success: true,
      history,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + history.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching metal prices history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch metal prices history",
      error: error.message,
    });
  }
});

// DIAMOND PRICES ROUTES - Add these after your metal prices routes

// Get current diamond prices
app.get("/api/diamond-prices", async (req, res) => {
  try {
    const diamondPrices = await DiamondPrices.find()
      .sort({ createdAt: -1 })
      .populate("updatedBy", "name email");

    res.json({
      success: true,
      diamondPrices,
    });
  } catch (error) {
    console.error("Error fetching diamond prices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch diamond prices",
      error: error.message,
    });
  }
});

// Add new diamond price entry
app.post("/api/diamond-prices", authenticateToken, async (req, res) => {
  try {
    const { shape, weightFrom, weightTo, pricePerCarat } = req.body;

    // Validation
    if (!shape || !weightFrom || !weightTo || !pricePerCarat) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (parseFloat(weightFrom) >= parseFloat(weightTo)) {
      return res.status(400).json({
        success: false,
        message: "Weight 'From' must be less than weight 'To'.",
      });
    }

    if (parseFloat(pricePerCarat) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price per carat must be greater than 0.",
      });
    }

    const diamondPrice = new DiamondPrices({
      shape,
      weightFrom: parseFloat(weightFrom),
      weightTo: parseFloat(weightTo),
      pricePerCarat: parseFloat(pricePerCarat),
      updatedBy: req.user._id,
    });

    await diamondPrice.save();

    res.json({
      success: true,
      message: "Diamond price added successfully",
      diamondPrice: await diamondPrice.populate("updatedBy", "name email"),
    });
  } catch (error) {
    console.error("Error adding diamond price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add diamond price",
      error: error.message,
    });
  }
});

// Update diamond price entry
app.put("/api/diamond-prices/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { shape, weightFrom, weightTo, pricePerCarat } = req.body;

    // Validation
    if (!shape || !weightFrom || !weightTo || !pricePerCarat) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (parseFloat(weightFrom) >= parseFloat(weightTo)) {
      return res.status(400).json({
        success: false,
        message: "Weight 'From' must be less than weight 'To'.",
      });
    }

    const updatedDiamondPrice = await DiamondPrices.findByIdAndUpdate(
      id,
      {
        shape,
        weightFrom: parseFloat(weightFrom),
        weightTo: parseFloat(weightTo),
        pricePerCarat: parseFloat(pricePerCarat),
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("updatedBy", "name email");

    if (!updatedDiamondPrice) {
      return res.status(404).json({
        success: false,
        message: "Diamond price entry not found",
      });
    }

    res.json({
      success: true,
      message: "Diamond price updated successfully",
      diamondPrice: updatedDiamondPrice,
    });
  } catch (error) {
    console.error("Error updating diamond price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update diamond price",
      error: error.message,
    });
  }
});

// Delete diamond price entry
app.delete("/api/diamond-prices/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDiamondPrice = await DiamondPrices.findByIdAndDelete(id);

    if (!deletedDiamondPrice) {
      return res.status(404).json({
        success: false,
        message: "Diamond price entry not found",
      });
    }

    res.json({
      success: true,
      message: "Diamond price deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting diamond price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete diamond price",
      error: error.message,
    });
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default app;
