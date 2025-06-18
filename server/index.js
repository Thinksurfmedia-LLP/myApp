// Imports
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import cors from "cors";
import rateLimit from "express-rate-limit";
import * as csvParse from "csv-parse";

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

// GoldAPI configuration
const GOLDAPI_CONFIG = {
  baseURL: "https://www.goldapi.io/api",
  apiKey: process.env.GOLDAPI_KEY, // Add your API key to .env file
  currency: "INR",
};

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

// Stone Prices Schema
const StonePricesSchema = new mongoose.Schema(
  {
    stoneType: {
      type: String,
      enum: ["Gemstone", "Moissanite"],
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
    rate: {
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

const StonePrices = mongoose.model("StonePrices", StonePricesSchema);

// MM to CT Conversion Schema
const MmToCtSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["round", "fancy"],
      required: true,
      lowercase: true, // This will automatically convert to lowercase
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    carat: {
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

const MmToCt = mongoose.model("MmToCt", MmToCtSchema);

const MakingChargesSchema = new mongoose.Schema(
  {
    purity: {
      type: String,
      enum: ["14K", "18K", "22K", "24K"],
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
    rate: {
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

const MakingCharges = mongoose.model("MakingCharges", MakingChargesSchema);

const SettingsSchema = new mongoose.Schema(
  {
    minimumMakingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    // ... other settings fields
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", SettingsSchema);

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
    const allowedMimeTypes = [
      // Image MIME types for logo upload
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      // CSV MIME types for bulk uploads
      "text/csv",
      "application/vnd.ms-excel",
      "text/plain",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image and CSV files are allowed"));
    }
  },
});

// Helper function to convert troy ounce to grams and calculate different karat prices
const convertPrices = (goldPricePerOunce, silverPricePerOunce) => {
  // 1 troy ounce = 31.1035 grams
  const TROY_OUNCE_TO_GRAMS = 31.1035;

  // Convert from per ounce to per gram
  const gold24KPerGram = goldPricePerOunce / TROY_OUNCE_TO_GRAMS;
  const silverPerGram = silverPricePerOunce / TROY_OUNCE_TO_GRAMS;

  // Calculate different karat prices based on gold content
  // 24K = 100% gold, 22K = 91.7% gold, 18K = 75% gold, 14K = 58.3% gold
  return {
    gold24K: Math.round(gold24KPerGram * 100) / 100,
    gold22K: Math.round(gold24KPerGram * 0.917 * 100) / 100,
    gold18K: Math.round(gold24KPerGram * 0.75 * 100) / 100,
    gold14K: Math.round(gold24KPerGram * 0.583 * 100) / 100,
    silver: Math.round(silverPerGram * 100) / 100,
  };
};

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

// Live metal prices route

// Endpoint to fetch live prices from GoldAPI.io
app.get("/api/metal-prices/live", async (req, res) => {
  try {
    // Check if API key is configured
    if (!GOLDAPI_CONFIG.apiKey) {
      return res.status(500).json({
        success: false,
        message:
          "GoldAPI key not configured. Please add GOLDAPI_KEY to environment variables.",
      });
    }

    // Fetch both gold and silver prices
    const [goldResponse, silverResponse] = await Promise.all([
      axios.get(`${GOLDAPI_CONFIG.baseURL}/XAU/${GOLDAPI_CONFIG.currency}`, {
        headers: {
          "x-access-token": GOLDAPI_CONFIG.apiKey,
        },
      }),
      axios.get(`${GOLDAPI_CONFIG.baseURL}/XAG/${GOLDAPI_CONFIG.currency}`, {
        headers: {
          "x-access-token": GOLDAPI_CONFIG.apiKey,
        },
      }),
    ]);

    // Extract prices from API response
    const goldPricePerOunce = goldResponse.data.price;
    const silverPricePerOunce = silverResponse.data.price;

    // Convert and calculate different karat prices
    const convertedPrices = convertPrices(
      goldPricePerOunce,
      silverPricePerOunce
    );

    // Fix: Handle timestamp properly
    let lastUpdated;
    if (goldResponse.data.timestamp) {
      // If timestamp is in seconds, convert to milliseconds
      const timestamp = goldResponse.data.timestamp;
      lastUpdated = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    } else {
      // Use current time if no timestamp from API
      lastUpdated = Date.now();
    }
    // Debug: Log the timestamp processing
    console.log("Original timestamp:", goldResponse.data.timestamp);
    console.log("Processed timestamp:", lastUpdated);
    console.log("Date from processed timestamp:", new Date(lastUpdated));

    res.json({
      success: true,
      livePrices: convertedPrices,
      lastUpdated: new Date(lastUpdated).toISOString(), // Convert to ISO string
      source: "GoldAPI.io",
      originalData: {
        goldPerOunce: goldPricePerOunce,
        silverPerOunce: silverPricePerOunce,
        currency: GOLDAPI_CONFIG.currency,
        rawTimestamp: goldResponse.data.timestamp,
      },
    });
  } catch (error) {
    console.error("Error fetching live metal prices:", error);

    // Handle different types of errors
    let errorMessage = "Failed to fetch live metal prices";
    let statusCode = 500;

    if (error.response) {
      // API responded with error status
      statusCode = error.response.status;
      if (error.response.status === 401) {
        errorMessage =
          "Invalid API key. Please check your GoldAPI credentials.";
      } else if (error.response.status === 429) {
        errorMessage = "API rate limit exceeded. Please try again later.";
      } else {
        errorMessage = error.response.data?.message || "API request failed";
      }
    } else if (error.request) {
      // Network error
      errorMessage = "Network error. Please check your internet connection.";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Sync endpoint to update database with live prices
app.post("/api/metal-prices/sync-live", authenticateToken, async (req, res) => {
  try {
    // First fetch live prices
    const liveResponse = await axios.get(
      `${req.protocol}://${req.get("host")}/api/metal-prices/live`
    );

    if (!liveResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch live prices for sync",
      });
    }

    const livePrices = liveResponse.data.livePrices;

    // Update database with live prices
    const updateData = {
      gold24K: livePrices.gold24K,
      gold22K: livePrices.gold22K,
      gold18K: livePrices.gold18K,
      gold14K: livePrices.gold14K,
      silver: livePrices.silver,
      // Keep existing platinum and palladium values or set defaults
      platinum: 3200,
      palladium: 2800,
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
      message: "Prices synced successfully from live market data",
      metalPrices: metalPrices,
      syncedFrom: "GoldAPI.io",
      syncedAt: new Date().toISOString(),
      livePrices: livePrices,
    });
  } catch (error) {
    console.error("Error syncing live metal prices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync live metal prices",
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

// STONE PRICES ROUTES

// Get current stone prices
app.get("/api/stone-prices", async (req, res) => {
  try {
    const stonePrices = await StonePrices.find()
      .sort({ createdAt: -1 })
      .populate("updatedBy", "name email");

    res.json({
      success: true,
      stonePrices,
    });
  } catch (error) {
    console.error("Error fetching stone prices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stone prices",
      error: error.message,
    });
  }
});

// Add new stone price entry
app.post("/api/stone-prices", authenticateToken, async (req, res) => {
  try {
    const { stoneType, weightFrom, weightTo, rate } = req.body;

    // Validation
    if (!stoneType || !weightFrom || !weightTo || !rate) {
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

    if (parseFloat(rate) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Rate must be greater than 0.",
      });
    }

    const stonePrice = new StonePrices({
      stoneType,
      weightFrom: parseFloat(weightFrom),
      weightTo: parseFloat(weightTo),
      rate: parseFloat(rate),
      updatedBy: req.user._id,
    });

    await stonePrice.save();

    res.json({
      success: true,
      message: "Stone price added successfully",
      stonePrice: await stonePrice.populate("updatedBy", "name email"),
    });
  } catch (error) {
    console.error("Error adding stone price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add stone price",
      error: error.message,
    });
  }
});

// Update stone price entry
app.put("/api/stone-prices/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { stoneType, weightFrom, weightTo, rate } = req.body;

    // Validation
    if (!stoneType || !weightFrom || !weightTo || !rate) {
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

    const updatedStonePrice = await StonePrices.findByIdAndUpdate(
      id,
      {
        stoneType,
        weightFrom: parseFloat(weightFrom),
        weightTo: parseFloat(weightTo),
        rate: parseFloat(rate),
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("updatedBy", "name email");

    if (!updatedStonePrice) {
      return res.status(404).json({
        success: false,
        message: "Stone price entry not found",
      });
    }

    res.json({
      success: true,
      message: "Stone price updated successfully",
      stonePrice: updatedStonePrice,
    });
  } catch (error) {
    console.error("Error updating stone price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stone price",
      error: error.message,
    });
  }
});

// Delete stone price entry
app.delete("/api/stone-prices/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStonePrice = await StonePrices.findByIdAndDelete(id);

    if (!deletedStonePrice) {
      return res.status(404).json({
        success: false,
        message: "Stone price entry not found",
      });
    }

    res.json({
      success: true,
      message: "Stone price deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting stone price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete stone price",
      error: error.message,
    });
  }
});

// MM TO CT CONVERSION ROUTES

// Get all MM to CT conversions
app.get("/api/mm-to-ct", async (req, res) => {
  try {
    const conversions = await MmToCt.find()
      .sort({ type: 1, size: 1 })
      .populate("updatedBy", "name email");

    res.json({
      success: true,
      conversions,
    });
  } catch (error) {
    console.error("Error fetching MM to CT conversions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch MM to CT conversions",
      error: error.message,
    });
  }
});

// Add new MM to CT conversion entry
app.post("/api/mm-to-ct", authenticateToken, async (req, res) => {
  try {
    const { type, size, carat } = req.body;

    // Validation
    if (!type || !size || !carat) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Uncomment this if you want to enforce size and carat to be greater than 0
    // if (parseFloat(size) <= 0 || parseFloat(carat) <= 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Size and carat must be greater than 0.",
    //   });
    // }

    // Check if entry already exists
    const existingEntry = await MmToCt.findOne({
      type: type.toLowerCase(),
      size: parseFloat(size),
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: "Entry with this type and size already exists.",
      });
    }

    const conversion = new MmToCt({
      type: type.toLowerCase(),
      size: parseFloat(size),
      carat: parseFloat(carat),
      updatedBy: req.user._id,
    });

    await conversion.save();

    res.json({
      success: true,
      message: "MM to CT conversion added successfully",
      conversion: await conversion.populate("updatedBy", "name email"),
    });
  } catch (error) {
    console.error("Error adding MM to CT conversion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add MM to CT conversion",
      error: error.message,
    });
  }
});

// Update MM to CT conversion entry
app.put("/api/mm-to-ct/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, size, carat } = req.body;

    // Validation
    if (!type || !size || !carat) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Uncomment this if you want to enforce size and carat to be greater than 0
    // if (parseFloat(size) <= 0 || parseFloat(carat) <= 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Size and carat must be greater than 0.",
    //   });
    // }

    const updatedConversion = await MmToCt.findByIdAndUpdate(
      id,
      {
        type: type.toLowerCase(),
        size: parseFloat(size),
        carat: parseFloat(carat),
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("updatedBy", "name email");

    if (!updatedConversion) {
      return res.status(404).json({
        success: false,
        message: "MM to CT conversion entry not found",
      });
    }

    res.json({
      success: true,
      message: "MM to CT conversion updated successfully",
      conversion: updatedConversion,
    });
  } catch (error) {
    console.error("Error updating MM to CT conversion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update MM to CT conversion",
      error: error.message,
    });
  }
});

// Delete MM to CT conversion entry
app.delete("/api/mm-to-ct/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedConversion = await MmToCt.findByIdAndDelete(id);

    if (!deletedConversion) {
      return res.status(404).json({
        success: false,
        message: "MM to CT conversion entry not found",
      });
    }

    res.json({
      success: true,
      message: "MM to CT conversion deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting MM to CT conversion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete MM to CT conversion",
      error: error.message,
    });
  }
});

// Bulk upload MM to CT conversions from CSV
app.post(
  "/api/mm-to-ct/bulk-upload",
  authenticateToken,
  upload.single("csvFile"),
  async (req, res) => {
    try {
      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No CSV file uploaded",
        });
      }

      // Read the CSV file
      const csvData = fs.readFileSync(req.file.path, "utf8");

      // Use csv-parse to parse CSV content with header
      const records = csvParse.parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Log the parsed records for debugging
      console.log("Parsed CSV Records:", records);

      // Check if records are valid
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: "CSV file must contain at least one data row",
        });
      }

      const results = [];
      const errors = [];

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        // Extract and normalize fields
        const typeRaw = row.type;
        const sizeRaw = row.size;
        const caratRaw = row.carat;

        // Check for missing fields
        if (!typeRaw || !sizeRaw || !caratRaw) {
          errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        const type = typeRaw.toLowerCase();
        const sizeNum = parseFloat(sizeRaw);
        const caratNum = parseFloat(caratRaw);

        // Validate the type
        if (!["round", "fancy"].includes(type)) {
          errors.push(`Row ${i + 2}: Type must be 'round' or 'fancy'`);
          continue;
        }

        // Validate size and carat
        if (
          isNaN(sizeNum) ||
          isNaN(caratNum) ||
          sizeNum <= 0 ||
          caratNum <= 0
        ) {
          errors.push(
            `Row ${i + 2}: Size and carat must be valid positive numbers`
          );
          continue;
        }

        try {
          // Check for existing entry
          const existingEntry = await MmToCt.findOne({ type, size: sizeNum });

          if (existingEntry) {
            existingEntry.carat = caratNum;
            existingEntry.updatedBy = req.user._id;
            await existingEntry.save();
            results.push({
              action: "updated",
              type,
              size: sizeNum,
              carat: caratNum,
            });
          } else {
            const conversion = new MmToCt({
              type,
              size: sizeNum,
              carat: caratNum,
              updatedBy: req.user._id,
            });
            await conversion.save();
            results.push({
              action: "created",
              type,
              size: sizeNum,
              carat: caratNum,
            });
          }
        } catch (dbError) {
          errors.push(`Row ${i + 2}: Database error - ${dbError.message}`);
        }
      }

      // Remove uploaded file
      fs.unlinkSync(req.file.path);

      // Respond with results and errors
      res.json({
        success: true,
        message: `Bulk upload completed. ${results.length} entries processed.`,
        results,
        errors,
      });
    } catch (error) {
      console.error("Error processing bulk upload:", error);

      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Failed to process bulk upload",
        error: error.message,
      });
    }
  }
);

// Download CSV template
app.get("/api/mm-to-ct/template", (req, res) => {
  try {
    const csvContent = "type,size,carat\nround,1.0,0.005\nfancy,1.5,0.015";

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="mm-to-ct-template.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate template",
    });
  }
});

// Download selected entries as CSV
app.post("/api/mm-to-ct/download", authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;

    let conversions;
    if (ids && ids.length > 0) {
      // Download selected entries
      conversions = await MmToCt.find({ _id: { $in: ids } }).sort({
        type: 1,
        size: 1,
      });
    } else {
      // Download all entries
      conversions = await MmToCt.find().sort({ type: 1, size: 1 });
    }

    let csvContent = "type,size,carat\n";
    conversions.forEach((conversion) => {
      csvContent += `${conversion.type},${conversion.size},${conversion.carat}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="mm-to-ct-data.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download CSV",
      error: error.message,
    });
  }
});

// Delete multiple MM to CT conversion entries
app.delete("/api/mm-to-ct/bulk-delete", authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No IDs provided for deletion",
      });
    }

    const result = await MmToCt.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} entries deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete entries",
      error: error.message,
    });
  }
});

// Making Charges routes

app.get("/api/making-charges", async (req, res) => {
  try {
    const makingCharges = await MakingCharges.find()
      .sort({ purity: 1, weightFrom: 1 })
      .populate("updatedBy", "name email");

    res.json({
      success: true,
      makingCharges,
    });
  } catch (error) {
    console.error("Error fetching making charges:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch making charges",
      error: error.message,
    });
  }
});

app.post("/api/making-charges", authenticateToken, async (req, res) => {
  try {
    const { purity, weightFrom, weightTo, rate } = req.body;

    if (!purity || !weightFrom || !weightTo || !rate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (parseFloat(weightFrom) >= parseFloat(weightTo)) {
      return res.status(400).json({
        success: false,
        message: "'From Weight' must be less than 'To Weight'.",
      });
    }

    if (parseFloat(rate) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Rate must be greater than 0.",
      });
    }

    const newCharge = new MakingCharges({
      purity,
      weightFrom: parseFloat(weightFrom),
      weightTo: parseFloat(weightTo),
      rate: parseFloat(rate),
      updatedBy: req.user._id,
    });

    await newCharge.save();

    res.json({
      success: true,
      message: "Making charge added successfully",
      makingCharge: await newCharge.populate("updatedBy", "name email"),
    });
  } catch (error) {
    console.error("Error adding making charge:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add making charge",
      error: error.message,
    });
  }
});

app.put("/api/making-charges/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { purity, weightFrom, weightTo, rate } = req.body;

    if (!purity || !weightFrom || !weightTo || !rate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (parseFloat(weightFrom) >= parseFloat(weightTo)) {
      return res.status(400).json({
        success: false,
        message: "'From Weight' must be less than 'To Weight'.",
      });
    }

    if (parseFloat(rate) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Rate must be greater than 0.",
      });
    }

    const updatedCharge = await MakingCharges.findByIdAndUpdate(
      id,
      {
        purity,
        weightFrom: parseFloat(weightFrom),
        weightTo: parseFloat(weightTo),
        rate: parseFloat(rate),
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("updatedBy", "name email");

    if (!updatedCharge) {
      return res.status(404).json({
        success: false,
        message: "Making charge entry not found",
      });
    }

    res.json({
      success: true,
      message: "Making charge updated successfully",
      makingCharge: updatedCharge,
    });
  } catch (error) {
    console.error("Error updating making charge:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update making charge",
      error: error.message,
    });
  }
});

app.delete("/api/making-charges/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCharge = await MakingCharges.findByIdAndDelete(id);

    if (!deletedCharge) {
      return res.status(404).json({
        success: false,
        message: "Making charge entry not found",
      });
    }

    res.json({
      success: true,
      message: "Making charge deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting making charge:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete making charge",
      error: error.message,
    });
  }
});

// Route to get minimum making charge
app.get(
  "/api/settings/minimum-making-charge",
  authenticateToken,
  async (req, res) => {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        // Create default settings if none exist
        settings = new Settings({ minimumMakingCharge: 0 });
        await settings.save();
      }
      res.json({
        success: true,
        minimumMakingCharge: settings.minimumMakingCharge,
      });
    } catch (error) {
      console.error("Error fetching minimum making charge:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch minimum making charge",
        error: error.message,
      });
    }
  }
);

// Route to update minimum making charge
app.put(
  "/api/settings/minimum-making-charge",
  authenticateToken,
  async (req, res) => {
    try {
      const { minimumMakingCharge } = req.body;
      if (
        minimumMakingCharge === undefined ||
        minimumMakingCharge === null ||
        isNaN(minimumMakingCharge) ||
        minimumMakingCharge < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid minimum making charge",
        });
      }

      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings({ minimumMakingCharge });
      } else {
        settings.minimumMakingCharge = minimumMakingCharge;
      }
      await settings.save();

      res.json({
        success: true,
        message: "Minimum making charge updated successfully",
        minimumMakingCharge: settings.minimumMakingCharge,
      });
    } catch (error) {
      console.error("Error updating minimum making charge:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update minimum making charge",
        error: error.message,
      });
    }
  }
);

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
