// Imports
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

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

// Add these schemas after your existing schemas
const ShopifyConfigSchema = new mongoose.Schema(
  {
    storeUrl: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    apiVersion: {
      type: String,
      default: "2024-01",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSync: {
      type: Date,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ShopifyConfig = mongoose.model("ShopifyConfig", ShopifyConfigSchema);

const ShopifyProductSchema = new mongoose.Schema(
  {
    shopifyId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    handle: String,
    description: String,
    vendor: String,
    productType: String,
    tags: [String],
    status: {
      type: String,
      enum: ["active", "archived", "draft"],
      default: "active",
    },
    images: [
      {
        url: String,
        altText: String,
      },
    ],
    variants: [
      {
        shopifyVariantId: String,
        title: String,
        price: Number,
        compareAtPrice: Number,
        sku: String,
        inventory: Number,
        weight: Number,
        weightUnit: String,
      },
    ],
    options: [
      {
        name: String,
        values: [String],
      },
    ],
    lastSynced: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ShopifyProduct = mongoose.model("ShopifyProduct", ShopifyProductSchema);

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

// 1. Logo Upload Configuration
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    removeOldLogos();
    cb(null, "logo" + path.extname(file.originalname));
  },
});
const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for logo"));
    }
  },
});

 // 2. CSV Upload Configuration
 const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "bulk-products-" + Date.now() + path.extname(file.originalname));
  },
});

const csvUpload = multer({
  storage: csvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for CSV
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "text/plain",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});


// 3. Product Media Upload Configuration

const productMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  },
});


const productMediaUpload = multer({
  storage: productMediaStorage,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB for videos, images
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      // Image MIME types
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      // Video MIME types
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/mov",
      "video/avi",
      "video/quicktime",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed for products"));
    }
  },
});


// Create products upload directory
const productsUploadsDir = "./uploads/products";
if (!fs.existsSync(productsUploadsDir)) {
  fs.mkdirSync(productsUploadsDir, { recursive: true });
}



// Helper function to convert troy ounce to grams and calculate different karat prices //

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

// ****************Shopify API Helper Functions**************** //

const shopifyGraphQL = async (query, variables = {}) => {
  try {
    const config = await ShopifyConfig.findOne({ isActive: true });
    if (!config) {
      throw new Error("No active Shopify configuration found");
    }

    const response = await axios.post(
      `https://${config.storeUrl}/admin/api/${config.apiVersion}/graphql.json`,
      {
        query,
        variables,
      },
      {
        headers: {
          "X-Shopify-Access-Token": config.accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data;
  } catch (error) {
    console.error("Shopify GraphQL Error:", error);
    throw error;
  }
};

// ****************GraphQL Queries**************** //

const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          productType
          tags
          status
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                inventoryQuantity
                weight
                weightUnit
              }
            }
          }
          options {
            name
            values
          }
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ****************ROUTES**************** //

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
  logoUpload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const logoUrl = `http://localhost:5000/uploads/${req.file.filename}`;

      try {
        await Logo.deleteMany({});
        const logoRecord = new Logo({
          filename: req.file.filename,
          originalName: req.file.originalname,
        });
        await logoRecord.save();
      } catch (dbError) {
        console.error("Database error:", dbError);
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

// Bulk product upload route
app.post(
  "/api/upload/bulk-products",
  authenticateToken,
  csvUpload.single("csvFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      // Process CSV file here
      // Add your CSV processing logic

      res.status(200).json({
        message: "CSV file uploaded successfully",
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ message: "Error uploading CSV file" });
    }
  }
);

// Get current logo route
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

// ****************METAL PRICES ROUTES**************** //

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

// Update metal prices
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

// Get metal prices history
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

// ****************DIAMOND PRICES ROUTES**************** //

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

// ****************STONE PRICES ROUTES**************** //

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

// ****************MM TO CT CONVERSION ROUTES**************** //

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

// ****************MAKING CHARGES ROUTES**************** //

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

// ****************SHOPIFY API ROUTES**************** //

// Shopify configuration route
app.post("/api/shopify/config", authenticateToken, async (req, res) => {
  try {
    const { storeUrl, accessToken, apiVersion } = req.body;

    // Validation
    if (!storeUrl || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Store URL and Access Token are required",
      });
    }

    // Clean store URL (remove https:// if present)
    const cleanStoreUrl = storeUrl.replace(/^https?:\/\//, "");

    // Validate store URL format
    if (!cleanStoreUrl.includes(".myshopify.com")) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid store URL format. Should be like: store-name.myshopify.com",
      });
    }

    // Test the connection first
    try {
      const testResponse = await axios.post(
        `https://${cleanStoreUrl}/admin/api/${
          apiVersion || "2024-01"
        }/graphql.json`,
        {
          query: `query { shop { name } }`,
        },
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (testResponse.data.errors) {
        return res.status(400).json({
          success: false,
          message: "Invalid access token or insufficient permissions",
        });
      }
    } catch (testError) {
      console.error("Shopify connection test failed:", testError.message);
      return res.status(400).json({
        success: false,
        message:
          "Failed to connect to Shopify. Please check your store URL and access token.",
      });
    }

    // Save or update configuration
    const config = await ShopifyConfig.findOneAndUpdate(
      { isActive: true },
      {
        storeUrl: cleanStoreUrl,
        accessToken,
        apiVersion: apiVersion || "2024-01",
        isActive: true,
        updatedBy: req.user.id,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Shopify configuration saved successfully",
      config: {
        storeUrl: config.storeUrl,
        apiVersion: config.apiVersion,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
      },
    });
  } catch (error) {
    console.error("Error saving Shopify config:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while saving configuration",
    });
  }
});

// Get product analytics
app.get("/api/shopify/analytics", authenticateToken, async (req, res) => {
  try {
    const totalProducts = await ShopifyProduct.countDocuments();
    const activeProducts = await ShopifyProduct.countDocuments({
      status: "active",
    });
    const draftProducts = await ShopifyProduct.countDocuments({
      status: "draft",
    });
    const archivedProducts = await ShopifyProduct.countDocuments({
      status: "archived",
    });

    const topVendors = await ShopifyProduct.aggregate([
      { $match: { vendor: { $exists: true, $ne: "" } } },
      { $group: { _id: "$vendor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const config = await ShopifyConfig.findOne({ isActive: true });

    res.json({
      success: true,
      analytics: {
        totalProducts,
        activeProducts,
        draftProducts,
        archivedProducts,
        topVendors,
        lastSync: config?.lastSync,
        isConfigured: !!config,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
});

// Get current Shopify configuration
app.get("/api/shopify/config", authenticateToken, async (req, res) => {
  try {
    const config = await ShopifyConfig.findOne({ isActive: true })
      .populate("updatedBy", "name email")
      .select("-accessToken"); // Don't send access token

    if (!config) {
      return res.json({
        success: true,
        config: null,
      });
    }

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("Error fetching Shopify config:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Shopify configuration",
    });
  }
});

// Sync products from Shopify
app.post("/api/shopify/sync-products", authenticateToken, async (req, res) => {
  try {
    const { fullSync = false } = req.body;
    let allProducts = [];
    let hasNextPage = true;
    let cursor = null;
    let productsProcessed = 0;

    console.log("Starting product sync from Shopify...");

    while (hasNextPage) {
      const variables = {
        first: 50, // Shopify's max per request
        ...(cursor && { after: cursor }),
      };

      const data = await shopifyGraphQL(GET_PRODUCTS_QUERY, variables);

      if (!data || !data.products) {
        break;
      }

      const products = data.products.edges.map((edge) => edge.node);
      allProducts = allProducts.concat(products);

      hasNextPage = data.products.pageInfo.hasNextPage;
      cursor = data.products.pageInfo.endCursor;

      productsProcessed += products.length;
      console.log(`Fetched ${productsProcessed} products so far...`);
    }

    console.log(`Total products fetched: ${allProducts.length}`);

    // Clear existing products if full sync
    if (fullSync) {
      await ShopifyProduct.deleteMany({});
    }

    // Process and save products
    const savedProducts = [];

    for (const shopifyProduct of allProducts) {
      try {
        const productData = {
          shopifyId: shopifyProduct.id.replace("gid://shopify/Product/", ""),
          title: shopifyProduct.title,
          handle: shopifyProduct.handle,
          description: shopifyProduct.description || "",
          vendor: shopifyProduct.vendor || "",
          productType: shopifyProduct.productType || "",
          tags: shopifyProduct.tags || [],
          status: shopifyProduct.status.toLowerCase(),
          images: shopifyProduct.images.edges.map((edge) => ({
            url: edge.node.url,
            altText: edge.node.altText || "",
          })),
          variants: shopifyProduct.variants.edges.map((edge) => ({
            shopifyVariantId: edge.node.id.replace(
              "gid://shopify/ProductVariant/",
              ""
            ),
            title: edge.node.title,
            price: parseFloat(edge.node.price) || 0,
            compareAtPrice: edge.node.compareAtPrice
              ? parseFloat(edge.node.compareAtPrice)
              : null,
            sku: edge.node.sku || "",
            inventory: edge.node.inventoryQuantity || 0,
            weight: edge.node.weight || 0,
            weightUnit: edge.node.weightUnit || "kg",
          })),
          options: shopifyProduct.options || [],
          lastSynced: new Date(),
        };

        const existingProduct = await ShopifyProduct.findOne({
          shopifyId: productData.shopifyId,
        });

        if (existingProduct) {
          await ShopifyProduct.findOneAndUpdate(
            { shopifyId: productData.shopifyId },
            productData,
            { new: true }
          );
        } else {
          const newProduct = new ShopifyProduct(productData);
          await newProduct.save();
        }

        savedProducts.push(productData);
      } catch (error) {
        console.error(`Error processing product ${shopifyProduct.id}:`, error);
      }
    }

    // Update sync timestamp
    await ShopifyConfig.findOneAndUpdate(
      { isActive: true },
      { lastSync: new Date() }
    );

    res.json({
      success: true,
      message: `Successfully synced ${savedProducts.length} products`,
      totalProducts: savedProducts.length,
      syncType: fullSync ? "full" : "incremental",
    });
  } catch (error) {
    console.error("Error syncing products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync products from Shopify",
      error: error.message,
    });
  }
});

// ADD PRODUCT TO SHOPIFY
// This route allows authenticated users to add a new product to Shopify
// *****************************************************************************************************

app.post(
  "/api/shopify/add-product",
  authenticateToken,
  productMediaUpload.array("media", 5), // Use productMediaUpload instead of upload
  async (req, res) => {
    try {
      console.log("Received product creation request");
      console.log("Body:", req.body);
      console.log("Files:", req.files);

      const {
        title,
        description,
        productType,
        vendor,
        tags,
        inventory,
        weight,
        seo,
        metalConfig,
        diamondConfig,
        stoneConfig,
        mediaUrls,
      } = req.body;

      // Validation
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product title is required",
        });
      }

      // Parse JSON strings safely
      let inventoryData = {};
      let weightData = {};
      let seoData = {};
      let metalConfigData = {};
      let diamondConfigData = [];
      let stoneConfigData = [];

      try {
        inventoryData = inventory ? JSON.parse(inventory) : {};
        weightData = weight ? JSON.parse(weight) : {};
        seoData = seo ? JSON.parse(seo) : {};
        metalConfigData = metalConfig ? JSON.parse(metalConfig) : {};
        diamondConfigData = diamondConfig ? JSON.parse(diamondConfig) : [];
        stoneConfigData = stoneConfig ? JSON.parse(stoneConfig) : [];
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid JSON data in request",
          details: parseError.message
        });
      }

      // Get Shopify configuration
      const config = await ShopifyConfig.findOne({ isActive: true });
      if (!config) {
        return res.status(400).json({
          success: false,
          message: "Shopify configuration not found. Please configure Shopify first.",
        });
      }

      // Process media
      const mediaArray = [];

      // Add media URLs
      if (mediaUrls) {
        try {
          const mediaUrlsArray = JSON.parse(mediaUrls);
          mediaUrlsArray.forEach((mediaItem) => {
            if (mediaItem.url && mediaItem.url.trim()) {
              if (mediaItem.type === "image") {
                mediaArray.push({
                  src: mediaItem.url.trim(),
                  alt: title,
                });
              }
              // Note: Shopify REST API doesn't support videos in product images
              // Videos would need to be handled separately or stored as metafields
            }
          });
        } catch (mediaParseError) {
          console.error("Error parsing mediaUrls:", mediaParseError);
        }
      }

      // Process uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          if (file.mimetype.startsWith("image/")) {
            // Use the actual uploaded file URL
            const fileUrl = `http://localhost:5000/uploads/products/${file.filename}`;
            mediaArray.push({
              src: fileUrl,
              alt: title,
            });
          } else if (file.mimetype.startsWith("video/")) {
            // Store video file info for later use (maybe in metafields)
            console.log("Video file uploaded:", file.filename);
            // You can store video URLs in metafields or handle them separately
          }
        });
      }

      // Prepare tags array
      const tagsArray = tags
        ? tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
        : [];

      // Generate handle from title
      const handle = (seoData.urlHandle || title)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Convert weight unit to Shopify REST API format
      const weightUnitMap = {
        kg: "kg",
        g: "g",
        oz: "oz",
        lb: "lb",
      };

      const shopifyWeightUnit = weightUnitMap[weightData.unit] || "kg";

      // Calculate price based on configurations
      let calculatedPrice = 0;

      if (metalConfigData && metalConfigData.type && metalConfigData.netWeight) {
  const netWeight = parseFloat(metalConfigData.netWeight) || 0;
  if (netWeight > 0) {
    // Fetch current metal prices from database
    try {
      const metalPricesDoc = await MetalPrices.findOne().sort({ createdAt: -1 });
      if (metalPricesDoc) {
        let pricePerGram = 0;
        
        if (metalConfigData.type === 'Gold' && metalConfigData.purity) {
          switch (metalConfigData.purity) {
            case '24k':
              pricePerGram = metalPricesDoc.gold24K;
              break;
            case '22k':
              pricePerGram = metalPricesDoc.gold22K;
              break;
            case '18k':
              pricePerGram = metalPricesDoc.gold18K;
              break;
            case '14k':
              pricePerGram = metalPricesDoc.gold14K;
              break;
            default:
              pricePerGram = 0;
          }
        } else if (metalConfigData.type === 'Silver') {
          pricePerGram = metalPricesDoc.silver;
        }
        
        const metalPrice = pricePerGram * netWeight;
        calculatedPrice += metalPrice;
        console.log(`Metal price calculation: ${pricePerGram} × ${netWeight} = ${metalPrice}`);
      }
    } catch (metalPriceError) {
      console.error('Error fetching metal prices for calculation:', metalPriceError);
    }
  }
}
      
      if (diamondConfigData && diamondConfigData.length > 0) {
  diamondConfigData.forEach(diamond => {
    const diamondValue = parseFloat(diamond.diamondValue) || 0;
    calculatedPrice += diamondValue;
  });
}

if (stoneConfigData && stoneConfigData.length > 0) {
  stoneConfigData.forEach(stone => {
    const stoneValue = parseFloat(stone.stoneValue) || 0;
    calculatedPrice += stoneValue;
  });
}

calculatedPrice = isNaN(calculatedPrice) ? 0 : calculatedPrice;

console.log("Calculated price:", calculatedPrice, "Type:", typeof calculatedPrice);

      // Create product using Shopify REST API
      const productData = {
        product: {
          title: title.trim(),
          body_html: description || "",
          product_type: productType || "",
          vendor: vendor || "",
          tags: tagsArray.join(", "),
          handle: handle,
          status: "active",
          published: true,
          variants: [
            {
              title: "Default Title",
              price: calculatedPrice.toFixed(2),
              inventory_quantity: parseInt(inventoryData.quantity) || 0,
              sku: inventoryData.sku || "",
              barcode: inventoryData.barcode || "",
              weight: parseFloat(weightData.value) || 0,
              weight_unit: shopifyWeightUnit,
              inventory_management: "shopify",
              inventory_policy: "deny",
            },
          ],
          options: [
            {
              name: "Title",
              values: ["Default Title"],
            },
          ],
        },
      };

      // Add images if any
      if (mediaArray.length > 0) {
        productData.product.images = mediaArray;
      }

      console.log("Sending to Shopify REST API:", JSON.stringify(productData, null, 2));

      const response = await axios.post(
        `https://${config.storeUrl}/admin/api/${config.apiVersion || "2024-01"}/products.json`,
        productData,
        {
          headers: {
            "X-Shopify-Access-Token": config.accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      const createdProduct = response.data.product;
      console.log("Product created successfully:", createdProduct.id);

      // Store additional configuration data as metafields
      try {
        const metafields = [];

        if (metalConfigData && Object.keys(metalConfigData).length > 0) {
          metafields.push({
            namespace: "custom",
            key: "metal_config",
            value: JSON.stringify(metalConfigData),
            type: "json",
          });
        }

        if (diamondConfigData && diamondConfigData.length > 0) {
          metafields.push({
            namespace: "custom",
            key: "diamond_config",
            value: JSON.stringify(diamondConfigData),
            type: "json",
          });
        }

        if (stoneConfigData && stoneConfigData.length > 0) {
          metafields.push({
            namespace: "custom",
            key: "stone_config",
            value: JSON.stringify(stoneConfigData),
            type: "json",
          });
        }

        // Create metafields
        for (const metafield of metafields) {
          await axios.post(
            `https://${config.storeUrl}/admin/api/${config.apiVersion || "2024-01"}/products/${createdProduct.id}/metafields.json`,
            { metafield },
            {
              headers: {
                "X-Shopify-Access-Token": config.accessToken,
                "Content-Type": "application/json",
              },
            }
          );
        }
      } catch (metafieldError) {
        console.error("Error creating metafields:", metafieldError);
      }

      // Update SEO if provided
      if (seoData.pageTitle || seoData.metaDescription) {
        try {
          const seoMetafields = [];

          if (seoData.pageTitle) {
            seoMetafields.push({
              namespace: "seo",
              key: "title_tag",
              value: seoData.pageTitle,
              type: "single_line_text_field",
            });
          }

          if (seoData.metaDescription) {
            seoMetafields.push({
              namespace: "seo",
              key: "description_tag",
              value: seoData.metaDescription,
              type: "multi_line_text_field",
            });
          }

          for (const metafield of seoMetafields) {
            await axios.post(
              `https://${config.storeUrl}/admin/api/${config.apiVersion || "2024-01"}/products/${createdProduct.id}/metafields.json`,
              { metafield },
              {
                headers: {
                  "X-Shopify-Access-Token": config.accessToken,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        } catch (seoError) {
          console.error("Error updating SEO data:", seoError);
        }
      }

      res.json({
        success: true,
        message: "Product created successfully in Shopify",
        product: {
          id: createdProduct.id,
          title: createdProduct.title,
          handle: createdProduct.handle,
          status: createdProduct.status,
          price: calculatedPrice.toFixed(2),
        },
                shopifyUrl: `https://${config.storeUrl.replace(
          ".myshopify.com",
          ""
        )}.myshopify.com/admin/products/${createdProduct.id}`,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      console.error("Error response:", error.response?.data);

      // Handle specific Shopify API errors
      let errorMessage = "Failed to create product";
      if (error.response?.data?.errors) {
        const shopifyErrors = error.response.data.errors;
        if (typeof shopifyErrors === "object") {
          errorMessage = Object.entries(shopifyErrors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
        } else {
          errorMessage = shopifyErrors;
        }
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: error.message,
        details: error.response?.data || "No additional details",
      });
    }
  }
);


app.use('/uploads/products', express.static('uploads/products'));


// ****************GET PRODUCTS (WITH PAGINATION AND FILTERING)**************** //

app.get("/api/shopify/products", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      vendor = "",
      productType = "",
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { handle: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (status) query.status = status;
    if (vendor) query.vendor = vendor;
    if (productType) query.productType = productType;

    const products = await ShopifyProduct.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ShopifyProduct.countDocuments(query);

    // Get filter options
    const vendors = await ShopifyProduct.distinct("vendor");
    const productTypes = await ShopifyProduct.distinct("productType");
    const statuses = await ShopifyProduct.distinct("status");

    res.json({
      success: true,
      products,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: page > 1,
      },
      filters: {
        vendors: vendors.filter(Boolean),
        productTypes: productTypes.filter(Boolean),
        statuses,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// GET SINGLE PRODUCT
app.get("/api/shopify/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ShopifyProduct.findOne({
      $or: [{ _id: id }, { shopifyId: id }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// UPDATE PRODUCT IN SHOPIFY
app.put("/api/shopify/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find local product
    const local = await ShopifyProduct.findOne({
      $or: [{ _id: id }, { shopifyId: id }],
    });

    if (!local) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update in Shopify
    const shopifyInput = {
      id: `gid://shopify/Product/${local.shopifyId}`,
      title: updateData.title,
      description: updateData.description,
      vendor: updateData.vendor,
      productType: updateData.productType,
      tags: updateData.tags,
      status: updateData.status?.toUpperCase(),
    };

    const result = await shopifyGraphQL(UPDATE_PRODUCT_MUTATION, {
      input: shopifyInput,
    });

    if (result.productUpdate.userErrors?.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to update product in Shopify",
        errors: result.productUpdate.userErrors,
      });
    }

    // Update local database
    const updated = await ShopifyProduct.findOneAndUpdate(
      { _id: local._id },
      {
        ...updateData,
        lastSynced: new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
});


// DELETE SINGLE PRODUCT
app.delete("/api/shopify/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get Shopify configuration
    const config = await ShopifyConfig.findOne({ isActive: true });
    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Shopify configuration not found",
      });
    }

    // Find the product in database
    const product = await ShopifyProduct.findOne({
      $or: [{ _id: id }, { shopifyId: id }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete from Shopify first
    try {
      await axios.delete(
        `https://${config.storeUrl}/admin/api/${
          config.apiVersion || "2024-01"
        }/products/${product.shopifyId}.json`,
        {
          headers: {
            "X-Shopify-Access-Token": config.accessToken,
          },
        }
      );
    } catch (shopifyError) {
      console.error("Error deleting from Shopify:", shopifyError);
      // If product doesn't exist in Shopify, continue with local deletion
      if (shopifyError.response?.status !== 404) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete product from Shopify",
          error: shopifyError.response?.data || shopifyError.message,
        });
      }
    }

    // Delete from local database
    await ShopifyProduct.findByIdAndDelete(product._id);

    res.json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct: {
        id: product._id,
        shopifyId: product.shopifyId,
        title: product.title,
      },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

// BULK DELETE PRODUCTS
app.delete("/api/shopify/products", authenticateToken, async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs array is required",
      });
    }

    // Get Shopify configuration
    const config = await ShopifyConfig.findOne({ isActive: true });
    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Shopify configuration not found",
      });
    }

    // Find products in database
    const products = await ShopifyProduct.find({
      $or: [
        { _id: { $in: productIds } },
        { shopifyId: { $in: productIds } },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    const deletionResults = {
      successful: [],
      failed: [],
      total: products.length,
    };

    // Delete each product from Shopify and database
    for (const product of products) {
      try {
        // Delete from Shopify
        try {
          await axios.delete(
            `https://${config.storeUrl}/admin/api/${
              config.apiVersion || "2024-01"
            }/products/${product.shopifyId}.json`,
            {
              headers: {
                "X-Shopify-Access-Token": config.accessToken,
              },
            }
          );
        } catch (shopifyError) {
          // If product doesn't exist in Shopify (404), continue with local deletion
          if (shopifyError.response?.status !== 404) {
            throw shopifyError;
          }
        }

        // Delete from local database
        await ShopifyProduct.findByIdAndDelete(product._id);

        deletionResults.successful.push({
          id: product._id,
          shopifyId: product.shopifyId,
          title: product.title,
        });
      } catch (error) {
        console.error(`Error deleting product ${product.title}:`, error);
        deletionResults.failed.push({
          id: product._id,
          shopifyId: product.shopifyId,
          title: product.title,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk deletion completed. ${deletionResults.successful.length} products deleted successfully, ${deletionResults.failed.length} failed.`,
      results: deletionResults,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete products",
      error: error.message,
    });
  }
});


// GET SYNC STATUS
app.get("/api/shopify/sync-status", authenticateToken, async (req, res) => {
  try {
    const config = await ShopifyConfig.findOne({ isActive: true });
    const productCount = await ShopifyProduct.countDocuments();

    res.json({
      success: true,
      status: {
        isConfigured: !!config,
        lastSync: config?.lastSync,
        productCount,
        storeUrl: config?.storeUrl,
      },
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sync status",
    });
  }
});

// ****************MONGODB CONNECTION AND SERVER SETUP**************** //
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
