import { useState, useRef, useEffect, useCallback } from "react";
import { Edit, LogOut, Upload, X } from "lucide-react";
import axios from "axios";

const AccordionSection = ({
  id,
  title,
  isOpen,
  onToggle,
  children,
  icon,
  color = "blue",
}) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden">
    <button
      onClick={() => onToggle(id)}
      className={`w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors border-l-4 border-${color}-500`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-r from-${color}-500 to-${color}-600 flex items-center justify-center text-white font-bold text-lg`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">
            {isOpen ? "Click to collapse" : "Click to expand"}
          </p>
        </div>
      </div>
      <div
        className={`transform transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>

    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="px-6 pb-6">{children}</div>
    </div>
  </div>
);

const Dashboard = ({ user, onLogout }) => {
  const [logoUrl, setLogoUrl] = useState(
    "https://www.shutterstock.com/image-vector/vector-icon-demo-600nw-1148418773.jpg"
  );
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState("metal");
  const [metalPrices, setMetalPrices] = useState({
    gold24K: 0,
    gold22K: 0,
    gold18K: 0,
    gold14K: 0,
    silver: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [activeMainTab, setActiveMainTab] = useState(() => {
    return localStorage.getItem("activeMainTab") || "products";
  });
  const [activeConfigTab, setActiveConfigTab] = useState(() => {
    return localStorage.getItem("activeConfigTab") || "rate-charts";
  });

  const [diamondPrices, setDiamondPrices] = useState([]);
  const [newDiamondPrice, setNewDiamondPrice] = useState({
    shape: "Round",
    weightFrom: "",
    weightTo: "",
    pricePerCarat: "",
  });
  const [editingDiamond, setEditingDiamond] = useState(null);
  const [isDiamondLoading, setIsDiamondLoading] = useState(false);

  const [stonePrices, setStonePrices] = useState([]);
  const [newStonePrice, setNewStonePrice] = useState({
    stoneType: "Gemstone",
    weightFrom: "",
    weightTo: "",
    rate: "",
  });
  const [editingStone, setEditingStone] = useState(null);
  const [isStoneLoading, setIsStoneLoading] = useState(false);

  const [livePrices, setLivePrices] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [liveDataSource, setLiveDataSource] = useState("");

  const STORAGE_KEYS = {
    LIVE_PRICES: "livePrices",
    LAST_UPDATED: "lastUpdated",
    LIVE_DATA_SOURCE: "liveDataSource",
  };

  // MM to CT conversion states
  const [mmToCtData, setMmToCtData] = useState([]);
  const [newMmToCt, setNewMmToCt] = useState({
    type: "round",
    size: "",
    carat: "",
  });
  const [editingMmToCt, setEditingMmToCt] = useState(null);
  const [isMmToCtLoading, setIsMmToCtLoading] = useState(false);
  const [selectedMmToCtIds, setSelectedMmToCtIds] = useState([]);
  const [selectAllMmToCt, setSelectAllMmToCt] = useState(false);
  const csvFileInputRef = useRef(null);

  // Making Charges state
  const [makingCharges, setMakingCharges] = useState([]);
  const [newMakingCharge, setNewMakingCharge] = useState({
    purity: "14K",
    weightFrom: "",
    weightTo: "",
    rate: "",
  });
  const [editingMakingCharge, setEditingMakingCharge] = useState(null);
  const [isMakingChargesLoading, setIsMakingChargesLoading] = useState(false);

  const [minimumMakingCharge, setMinimumMakingCharge] = useState("");
  const [isMinChargeLoading, setIsMinChargeLoading] = useState(false);

  const [selectedMakingChargeIds, setSelectedMakingChargeIds] = useState([]);
  const [selectAllMakingCharges, setSelectAllMakingCharges] = useState(false);
  const [isBulkDeletingMakingCharges, setIsBulkDeletingMakingCharges] =
    useState(false);

  useEffect(() => {
    fetchMetalPrices();
  }, []);

  useEffect(() => {
    fetchMmToCtData();
  }, []);

  useEffect(() => {
    fetchCurrentLogo();
  }, []);

  useEffect(() => {
    localStorage.setItem("activeMainTab", activeMainTab);
  }, [activeMainTab]);
  useEffect(() => {
    localStorage.setItem("activeConfigTab", activeConfigTab);
  }, [activeConfigTab]);

  useEffect(() => {
    fetchMakingCharges();
  }, []);

  useEffect(() => {
    fetchMinimumMakingCharge();
  }, []);

  useEffect(() => {
    const fetchLastUpdate = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/metal-prices"
        );
        if (response.data.success && response.data.metalPrices) {
          setLastUpdate({
            updatedBy: response.data.metalPrices.updatedBy?.name || "Admin",
            updatedAt: response.data.metalPrices.updatedAt,
          });
        }
      } catch (error) {
        console.error("Error fetching last update info:", error);
      }
    };

    fetchLastUpdate();
  }, []);

  useEffect(() => {
    fetchDiamondPrices();
  }, []);

  useEffect(() => {
    fetchStonePrices();
  }, []);

  useEffect(() => {
    // Load live prices from localStorage on component mount
    loadLivePricesFromStorage();
  }, []);

  const fetchDiamondPrices = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/diamond-prices"
      );
      if (response.data.success) {
        setDiamondPrices(response.data.diamondPrices);
      }
    } catch (error) {
      console.error("Error fetching diamond prices:", error);
    }
  };

  const handleNewDiamondPriceChange = useCallback((field, value) => {
    setNewDiamondPrice((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleEditDiamondPriceChange = useCallback((field, value) => {
    setEditingDiamond((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const addDiamondPrice = async () => {
    if (
      !newDiamondPrice.shape ||
      !newDiamondPrice.weightFrom ||
      !newDiamondPrice.weightTo ||
      !newDiamondPrice.pricePerCarat
    ) {
      alert("Please fill all fields");
      return;
    }

    if (
      parseFloat(newDiamondPrice.weightFrom) >=
      parseFloat(newDiamondPrice.weightTo)
    ) {
      alert("Weight 'From' must be less than weight 'To'");
      return;
    }

    try {
      setIsDiamondLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/diamond-prices",
        newDiamondPrice,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDiamondPrices((prev) => [...prev, response.data.diamondPrice]);
        setNewDiamondPrice({
          shape: "Round",
          weightFrom: "",
          weightTo: "",
          pricePerCarat: "",
        });
        alert("Diamond price added successfully!");
      }
    } catch (error) {
      console.error("Error adding diamond price:", error);
      alert("Error adding diamond price. Please try again.");
    } finally {
      setIsDiamondLoading(false);
    }
  };

  const updateDiamondPrice = async (id) => {
    if (
      !editingDiamond.shape ||
      !editingDiamond.weightFrom ||
      !editingDiamond.weightTo ||
      !editingDiamond.pricePerCarat
    ) {
      alert("Please fill all fields");
      return;
    }

    if (
      parseFloat(editingDiamond.weightFrom) >=
      parseFloat(editingDiamond.weightTo)
    ) {
      alert("Weight 'From' must be less than weight 'To'");
      return;
    }

    try {
      setIsDiamondLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/diamond-prices/${id}`,
        editingDiamond,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDiamondPrices((prev) =>
          prev.map((diamond) =>
            diamond._id === id ? response.data.diamondPrice : diamond
          )
        );
        setEditingDiamond(null);
        alert("Diamond price updated successfully!");
      }
    } catch (error) {
      console.error("Error updating diamond price:", error);
      alert("Error updating diamond price. Please try again.");
    } finally {
      setIsDiamondLoading(false);
    }
  };

  const deleteDiamondPrice = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this diamond price entry?"
      )
    ) {
      return;
    }

    try {
      setIsDiamondLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/diamond-prices/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDiamondPrices((prev) =>
          prev.filter((diamond) => diamond._id !== id)
        );
        alert("Diamond price deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting diamond price:", error);
      alert("Error deleting diamond price. Please try again.");
    } finally {
      setIsDiamondLoading(false);
    }
  };

  const loadLivePricesFromStorage = () => {
    try {
      const savedPrices = localStorage.getItem(STORAGE_KEYS.LIVE_PRICES);
      const savedTimestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
      const savedSource = localStorage.getItem(STORAGE_KEYS.LIVE_DATA_SOURCE);

      if (savedPrices) {
        const parsedPrices = JSON.parse(savedPrices);

        // Validate that prices object has expected properties
        if (
          parsedPrices &&
          typeof parsedPrices === "object" &&
          (parsedPrices.gold24K || parsedPrices.silver)
        ) {
          setLivePrices(parsedPrices);

          // console.log("Valid live prices loaded from storage");
        } else {
          console.warn("Invalid price data found in storage, clearing...");
          localStorage.removeItem(STORAGE_KEYS.LIVE_PRICES);
        }
      }

      if (savedTimestamp) {
        // Validate timestamp is reasonable (not too old, not in future)
        const timestamp = new Date(savedTimestamp);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (timestamp >= oneWeekAgo && timestamp <= now) {
          setLastUpdated(savedTimestamp);
        } else {
          console.warn("Timestamp too old or invalid, clearing...");
          localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
        }
      }

      if (savedSource) {
        setLiveDataSource(savedSource);
      }
    } catch (error) {
      console.error("Error loading live prices from localStorage:", error);
      // Clear potentially corrupted data
      localStorage.removeItem(STORAGE_KEYS.LIVE_PRICES);
      localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
      localStorage.removeItem(STORAGE_KEYS.LIVE_DATA_SOURCE);
    }
  };

  const fetchMetalPrices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/metal-prices"
      );
      if (response.data.success) {
        setMetalPrices(response.data.metalPrices);
      }
    } catch (error) {
      console.error("Error fetching metal prices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = useCallback((metal, value) => {
    setMetalPrices((prev) => ({
      ...prev,
      [metal]: parseFloat(value) || 0,
    }));
  }, []);

  // In your savePrices function, after successful save:
  const savePrices = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/metal-prices",
        metalPrices,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Prices updated successfully!");
        fetchMetalPrices(); // Refresh the data

        // Update last update info
        setLastUpdate({
          updatedBy: user?.name || "Admin",
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating prices:", error);
      alert("Error updating prices. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch live prices

  const fetchLivePrices = async () => {
    setIsFetchingLive(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/metal-prices/live",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update state
        setLivePrices(data.livePrices);
        setLastUpdated(data.lastUpdated);
        setLiveDataSource(data.source);

        // Save to localStorage
        saveLivePricesToStorage(data.livePrices, data.lastUpdated, data.source);

        alert("Live prices fetched successfully!");

        console.log("Live prices fetched and saved:", {
          prices: data.livePrices,
          timestamp: data.lastUpdated,
          source: data.source,
        });
      } else {
        alert(data.message || "Failed to fetch live prices");
        console.error("Error fetching live prices:", data.message);
      }
    } catch (error) {
      console.error("Error fetching live prices:", error);
      alert("Failed to fetch live prices. Please try again.");
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Function to sync live prices
  const syncLivePrices = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/metal-prices/sync-live",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state with synced prices
        setMetalPrices({
          gold24K: data.metalPrices.gold24K,
          gold22K: data.metalPrices.gold22K,
          gold18K: data.metalPrices.gold18K,
          gold14K: data.metalPrices.gold14K,
          silver: data.metalPrices.silver,
        });

        // Update live prices display
        setLivePrices(data.livePrices);
        setLastUpdated(data.syncedAt);
        setLiveDataSource("GoldAPI.io (Synced)");

        // Save to localStorage
        saveLivePricesToStorage(
          data.livePrices,
          data.syncedAt,
          "GoldAPI.io (Synced)"
        );

        alert("Prices synced successfully from live market data!");

        console.log("Live prices synced and saved:", {
          prices: data.livePrices,
          timestamp: data.syncedAt,
        });
      } else {
        alert(data.message || "Failed to sync live prices");
      }
    } catch (error) {
      console.error("Error syncing live prices:", error);
      alert("Failed to sync live prices. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Function to save live prices to localStorage
  const saveLivePricesToStorage = (prices, timestamp, source) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIVE_PRICES, JSON.stringify(prices));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, timestamp);
      localStorage.setItem(STORAGE_KEYS.LIVE_DATA_SOURCE, source);
    } catch (error) {
      console.error("Error saving live prices to localStorage:", error);
    }
  };

  const fetchCurrentLogo = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/logo");
      if (response.data.logoUrl) {
        setLogoUrl(response.data.logoUrl);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  const handleLogoEdit = () => {
    setShowLogoModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        if (file.size <= 5 * 1024 * 1024) {
          // 5MB limit
          setSelectedImage(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviewUrl(e.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          alert("File size must be less than 5MB");
        }
      } else {
        alert("Please select an image file");
      }
    }
  };

  const handleLogoUpload = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("logo", selectedImage);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/upload/logo",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.logoUrl) {
          setLogoUrl(response.data.logoUrl);
          setShowLogoModal(false);
          setSelectedImage(null);
          setPreviewUrl(null);
          alert("Logo updated successfully!");
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        alert("Error uploading logo. Please try again.");
      }
    }
  };

  const handleModalClose = () => {
    setShowLogoModal(false);
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const fetchStonePrices = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/stone-prices"
      );
      if (response.data.success) {
        setStonePrices(response.data.stonePrices);
      }
    } catch (error) {
      console.error("Error fetching stone prices:", error);
    }
  };

  const handleNewStonePriceChange = useCallback((field, value) => {
    setNewStonePrice((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleEditStonePriceChange = useCallback((field, value) => {
    setEditingStone((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const addStonePrice = async () => {
    if (
      !newStonePrice.stoneType ||
      !newStonePrice.weightFrom ||
      !newStonePrice.weightTo ||
      !newStonePrice.rate
    ) {
      alert("Please fill all fields");
      return;
    }

    if (
      parseFloat(newStonePrice.weightFrom) >= parseFloat(newStonePrice.weightTo)
    ) {
      alert("Weight 'From' must be less than weight 'To'");
      return;
    }

    try {
      setIsStoneLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/stone-prices",
        newStonePrice,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStonePrices((prev) => [...prev, response.data.stonePrice]);
        setNewStonePrice({
          stoneType: "Gemstone",
          weightFrom: "",
          weightTo: "",
          rate: "",
        });
        alert("Stone price added successfully!");
      }
    } catch (error) {
      console.error("Error adding stone price:", error);
      alert("Error adding stone price. Please try again.");
    } finally {
      setIsStoneLoading(false);
    }
  };

  const updateStonePrice = async (id) => {
    if (
      !editingStone.stoneType ||
      !editingStone.weightFrom ||
      !editingStone.weightTo ||
      !editingStone.rate
    ) {
      alert("Please fill all fields");
      return;
    }

    if (
      parseFloat(editingStone.weightFrom) >= parseFloat(editingStone.weightTo)
    ) {
      alert("Weight 'From' must be less than weight 'To'");
      return;
    }

    try {
      setIsStoneLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/stone-prices/${id}`,
        editingStone,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStonePrices((prev) =>
          prev.map((stone) =>
            stone._id === id ? response.data.stonePrice : stone
          )
        );
        setEditingStone(null);
        alert("Stone price updated successfully!");
      }
    } catch (error) {
      console.error("Error updating stone price:", error);
      alert("Error updating stone price. Please try again.");
    } finally {
      setIsStoneLoading(false);
    }
  };

  const deleteStonePrice = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this stone price entry?")
    ) {
      return;
    }

    try {
      setIsStoneLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/stone-prices/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStonePrices((prev) => prev.filter((stone) => stone._id !== id));
        alert("Stone price deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting stone price:", error);
      alert("Error deleting stone price. Please try again.");
    } finally {
      setIsStoneLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format last updated time
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return "Never";

    try {
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid timestamp:", timestamp);
        return "Invalid Date";
      }

      // Check if date is too old (before 2020) - likely a timestamp issue
      if (date.getFullYear() < 2020) {
        console.error("Timestamp seems to be in wrong format:", timestamp);
        return "Date Error";
      }

      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Kolkata",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date Error";
    }
  };

  // Calculate price change (you can enhance this with historical data)
  const calculatePriceChange = (currentPrice, previousPrice) => {
    if (!previousPrice || !currentPrice)
      return { change: 0, percentage: 0, isPositive: true };

    const change = currentPrice - previousPrice;
    const percentage = (change / previousPrice) * 100;

    return {
      change: Math.abs(change),
      percentage: Math.abs(percentage),
      isPositive: change >= 0,
    };
  };

  // MM to CT Conversion Functions
  const fetchMmToCtData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/mm-to-ct");
      if (response.data.success) {
        setMmToCtData(response.data.conversions);
      }
    } catch (error) {
      console.error("Error fetching MM to CT data:", error);
    }
  };

  const handleNewMmToCtChange = useCallback((field, value) => {
    setNewMmToCt((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleEditMmToCtChange = useCallback((field, value) => {
    setEditingMmToCt((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const addMmToCtEntry = async () => {
    if (!newMmToCt.type || !newMmToCt.size || !newMmToCt.carat) {
      alert("Please fill all fields");
      return;
    }

    // Uncomment this if you want to enforce size and carat to be greater than 0
    // if (parseFloat(newMmToCt.size) <= 0 || parseFloat(newMmToCt.carat) <= 0) {
    //   alert("Size and carat must be greater than 0");
    //   return;
    // }

    try {
      setIsMmToCtLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/mm-to-ct",
        newMmToCt,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMmToCtData((prev) => [...prev, response.data.conversion]);
        setNewMmToCt({
          type: "round",
          size: "",
          carat: "",
        });
        alert("MM to CT conversion added successfully!");
      }
    } catch (error) {
      console.error("Error adding MM to CT conversion:", error);
      alert(
        error.response?.data?.message ||
          "Error adding MM to CT conversion. Please try again."
      );
    } finally {
      setIsMmToCtLoading(false);
    }
  };

  const updateMmToCtEntry = async (id) => {
    if (!editingMmToCt.type || !editingMmToCt.size || !editingMmToCt.carat) {
      alert("Please fill all fields");
      return;
    }

    // Uncomment this if you want to enforce size and carat to be greater than 0
    // if (
    //   parseFloat(editingMmToCt.size) <= 0 ||
    //   parseFloat(editingMmToCt.carat) <= 0
    // ) {
    //   alert("Size and carat must be greater than 0");
    //   return;
    // }

    try {
      setIsMmToCtLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/mm-to-ct/${id}`,
        editingMmToCt,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMmToCtData((prev) =>
          prev.map((item) =>
            item._id === id ? response.data.conversion : item
          )
        );
        setEditingMmToCt(null);
        alert("MM to CT conversion updated successfully!");
      }
    } catch (error) {
      console.error("Error updating MM to CT conversion:", error);
      alert(
        error.response?.data?.message ||
          "Error updating MM to CT conversion. Please try again."
      );
    } finally {
      setIsMmToCtLoading(false);
    }
  };

  const deleteMmToCtEntry = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this MM to CT conversion entry?"
      )
    ) {
      return;
    }

    try {
      setIsMmToCtLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/mm-to-ct/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMmToCtData((prev) => prev.filter((item) => item._id !== id));
        alert("MM to CT conversion deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting MM to CT conversion:", error);
      alert("Error deleting MM to CT conversion. Please try again.");
    } finally {
      setIsMmToCtLoading(false);
    }
  };

  const handleMmToCtSelection = (id) => {
    setSelectedMmToCtIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllMmToCt = () => {
    if (selectAllMmToCt) {
      setSelectedMmToCtIds([]);
    } else {
      setSelectedMmToCtIds(mmToCtData.map((item) => item._id));
    }
    setSelectAllMmToCt(!selectAllMmToCt);
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "http://localhost:5000/api/mm-to-ct/template";
    link.download = "mm-to-ct-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSelectedData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/mm-to-ct/download",
        { ids: selectedMmToCtIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "mm-to-ct-data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Error downloading CSV. Please try again.");
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file);

    uploadCSV(formData);
  };

  const uploadCSV = async (formData) => {
    try {
      setIsMmToCtLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/mm-to-ct/bulk-upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        await fetchMmToCtData(); // Refresh data
        alert(
          `Bulk upload completed successfully!\n${
            response.data.results.length
          } entries processed.\n${
            response.data.errors.length > 0
              ? `Errors: ${response.data.errors.length}`
              : "No errors."
          }`
        );

        if (response.data.errors.length > 0) {
          console.log("Upload errors:", response.data.errors);
        }
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert(
        error.response?.data?.message ||
          "Error uploading CSV. Please try again."
      );
    } finally {
      setIsMmToCtLoading(false);
      // Reset file input
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = "";
      }
    }
  };

  const bulkDeleteSelected = async () => {
    if (selectedMmToCtIds.length === 0) {
      alert("Please select entries to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedMmToCtIds.length} selected entries?`
      )
    ) {
      return;
    }

    try {
      setIsMmToCtLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        "http://localhost:5000/api/mm-to-ct/bulk-delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { ids: selectedMmToCtIds },
        }
      );

      if (response.data.success) {
        await fetchMmToCtData(); // Refresh data
        setSelectedMmToCtIds([]);
        setSelectAllMmToCt(false);
        alert(`${response.data.deletedCount} entries deleted successfully!`);
      }
    } catch (error) {
      console.error("Error bulk deleting entries:", error);
      alert("Error deleting entries. Please try again.");
    } finally {
      setIsMmToCtLoading(false);
    }
  };

  const fetchMakingCharges = async () => {
    try {
      setIsMakingChargesLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/making-charges"
      );
      if (response.data.success) {
        setMakingCharges(response.data.makingCharges);
      }
    } catch (error) {
      console.error("Error fetching making charges:", error);
    } finally {
      setIsMakingChargesLoading(false);
    }
  };

  const handleNewMakingChargeChange = (field, value) => {
    setNewMakingCharge((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditMakingChargeChange = (field, value) => {
    setEditingMakingCharge((prev) => ({ ...prev, [field]: value }));
  };

  const addMakingCharge = async () => {
    if (
      !newMakingCharge.purity ||
      !newMakingCharge.weightFrom ||
      !newMakingCharge.weightTo ||
      !newMakingCharge.rate
    ) {
      alert("Please fill all fields");
      return;
    }
    if (
      parseFloat(newMakingCharge.weightFrom) >=
      parseFloat(newMakingCharge.weightTo)
    ) {
      alert("'From Weight' must be less than 'To Weight'");
      return;
    }
    if (parseFloat(newMakingCharge.rate) <= 0) {
      alert("Rate must be greater than 0");
      return;
    }
    try {
      setIsMakingChargesLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/making-charges",
        newMakingCharge,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMakingCharges((prev) => [...prev, response.data.makingCharge]);
        setNewMakingCharge({
          purity: "14K",
          weightFrom: "",
          weightTo: "",
          rate: "",
        });
        alert("Making charge added successfully!");
      }
    } catch (error) {
      console.error("Error adding making charge:", error);
      alert(error.response?.data?.message || "Failed to add making charge");
    } finally {
      setIsMakingChargesLoading(false);
    }
  };

  const updateMakingCharge = async (id) => {
    if (
      !editingMakingCharge.purity ||
      !editingMakingCharge.weightFrom ||
      !editingMakingCharge.weightTo ||
      !editingMakingCharge.rate
    ) {
      alert("Please fill all fields");
      return;
    }
    if (
      parseFloat(editingMakingCharge.weightFrom) >=
      parseFloat(editingMakingCharge.weightTo)
    ) {
      alert("'From Weight' must be less than 'To Weight'");
      return;
    }
    if (parseFloat(editingMakingCharge.rate) <= 0) {
      alert("Rate must be greater than 0");
      return;
    }
    try {
      setIsMakingChargesLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/making-charges/${id}`,
        editingMakingCharge,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMakingCharges((prev) =>
          prev.map((item) =>
            item._id === id ? response.data.makingCharge : item
          )
        );
        setEditingMakingCharge(null);
        alert("Making charge updated successfully!");
      }
    } catch (error) {
      console.error("Error updating making charge:", error);
      alert(error.response?.data?.message || "Failed to update making charge");
    } finally {
      setIsMakingChargesLoading(false);
    }
  };

  const deleteMakingCharge = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this making charge entry?"
      )
    )
      return;
    try {
      setIsMakingChargesLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/making-charges/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMakingCharges((prev) => prev.filter((item) => item._id !== id));
        alert("Making charge deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting making charge:", error);
      alert("Failed to delete making charge");
    } finally {
      setIsMakingChargesLoading(false);
    }
  };

  // Function to fetch minimum making charge
  const fetchMinimumMakingCharge = async () => {
    try {
      setIsMinChargeLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/settings/minimum-making-charge",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setMinimumMakingCharge(response.data.minimumMakingCharge.toString());
      }
    } catch (error) {
      console.error("Error fetching minimum making charge:", error);
    } finally {
      setIsMinChargeLoading(false);
    }
  };

  // Function to update minimum making charge

  const updateMinimumMakingCharge = async () => {
    if (
      minimumMakingCharge === "" ||
      isNaN(parseFloat(minimumMakingCharge)) ||
      parseFloat(minimumMakingCharge) < 0
    ) {
      alert("Please enter a valid non-negative number");
      return;
    }
    try {
      setIsMinChargeLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/settings/minimum-making-charge",
        { minimumMakingCharge: parseFloat(minimumMakingCharge) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert("Minimum making charge updated successfully!");
      }
    } catch (error) {
      console.error("Error updating minimum making charge:", error);
      alert("Failed to update minimum making charge.");
    } finally {
      setIsMinChargeLoading(false);
    }
  };

  const bulkDeleteMakingCharges = async () => {
    if (selectedMakingChargeIds.length === 0) {
      alert("Please select at least one entry to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedMakingChargeIds.length} selected entries?`
      )
    ) {
      return;
    }

    try {
      setIsBulkDeletingMakingCharges(true);
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        "http://localhost:5000/api/making-charges/bulk-delete",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { ids: selectedMakingChargeIds },
        }
      );
      if (response.data.success) {
        // Refresh list after deletion
        await fetchMakingCharges();
        setSelectedMakingChargeIds([]);
        setSelectAllMakingCharges(false);
        alert(`${response.data.deletedCount} entries deleted successfully!`);
      }
    } catch (error) {
      console.error("Error bulk deleting making charges:", error);
      alert("Failed to delete selected entries. Please try again.");
    } finally {
      setIsBulkDeletingMakingCharges(false);
    }
  };

  const handleMakingChargeSelection = (id) => {
    setSelectedMakingChargeIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllMakingCharges = () => {
    if (selectAllMakingCharges) {
      setSelectedMakingChargeIds([]);
    } else {
      setSelectedMakingChargeIds(makingCharges.map((item) => item._id));
    }
    setSelectAllMakingCharges(!selectAllMakingCharges);
  };

  // Rendering the main dashboard content

  const renderProductsContent = () => (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Products Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Total Products</h4>
            <p className="text-2xl font-bold text-blue-700">1,247</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Active Products</h4>
            <p className="text-2xl font-bold text-green-700">1,156</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-900 mb-2">Categories</h4>
            <p className="text-2xl font-bold text-orange-700">37</p>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Products
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg"></div>
                <div>
                  <p className="font-medium text-gray-900">Product {item}</p>
                  <p className="text-sm text-gray-600">
                    Category • SKU-000{item}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₹{(item * 1000).toLocaleString()}
                </p>
                <p className="text-sm text-green-600">In Stock</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRateChartsContent = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <span className="font-medium">
            Last updated by {lastUpdate?.updatedBy}
          </span>{" "}
          •{" "}
          {lastUpdate?.updatedAt
            ? new Date(lastUpdate.updatedAt).toLocaleDateString() +
              " at " +
              new Date(lastUpdate.updatedAt).toLocaleTimeString()
            : "No updates yet"}
        </p>
      </div>

      <div className="space-y-4">
        {/* Metal Prices Accordion */}
        <AccordionSection
          id="metal"
          title="Metal Price Management"
          icon="⚡"
          color="blue"
          isOpen={activeAccordion === "metal"}
          onToggle={toggleAccordion}
        >
          {renderMetalPricesAccordionContent()}
        </AccordionSection>

        {/* Diamond Prices Accordion */}
        <AccordionSection
          id="diamond"
          title="Diamond Price Management"
          icon="💎"
          color="purple"
          isOpen={activeAccordion === "diamond"}
          onToggle={toggleAccordion}
        >
          {renderDiamondPricesAccordionContent()}
        </AccordionSection>

        {/* Stone Prices Accordion */}
        <AccordionSection
          id="stone"
          title="Stone Price Management"
          icon="🌟"
          color="emerald"
          isOpen={activeAccordion === "stone"}
          onToggle={toggleAccordion}
        >
          {renderStonePricesAccordionContent()}
        </AccordionSection>
      </div>
    </div>
  );

  const renderMetalPricesAccordionContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold text-gray-800">
          Metal Price Management
        </h4>
        <div className="flex space-x-3">
          <button
            onClick={savePrices}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? "Saving..." : "Save Prices"}
          </button>
          <button
            onClick={fetchLivePrices}
            disabled={isFetchingLive}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
          >
            {isFetchingLive ? "Fetching..." : "Fetch Live Prices"}
          </button>
          <button
            onClick={syncLivePrices}
            disabled={isSyncing}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors"
          >
            {isSyncing ? "Syncing..." : "Sync Live Prices"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Manual Price Editing Section - 3/4 width */}
        <div className="lg:col-span-3">
          <h5 className="text-sm font-semibold text-gray-700 mb-4">
            Store Metal Price
          </h5>
          <div className="space-y-4">
            {[
              {
                key: "gold24K",
                label: "Gold 24K",
                color: "yellow",
                unit: "/gram",
              },
              {
                key: "gold22K",
                label: "Gold 22K",
                color: "yellow",
                unit: "/gram",
              },
              {
                key: "gold18K",
                label: "Gold 18K",
                color: "yellow",
                unit: "/gram",
              },
              {
                key: "gold14K",
                label: "Gold 14K",
                color: "yellow",
                unit: "/gram",
              },
              { key: "silver", label: "Silver", color: "gray", unit: "/gram" },
            ].map((metal) => (
              <div
                key={metal.key}
                className={`bg-gradient-to-r from-${metal.color}-50 to-${metal.color}-100 rounded-lg p-4 border border-${metal.color}-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label
                      className={`block text-sm font-medium text-${metal.color}-900 mb-2`}
                    >
                      {metal.label} Price {metal.unit}
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-700">₹</span>
                      <input
                        type="number"
                        value={metalPrices[metal.key] || ""}
                        onChange={(e) =>
                          handlePriceChange(metal.key, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className={`text-xs text-${metal.color}-600 mb-1`}>
                      Current Value
                    </p>
                    <p className={`text-xl font-bold text-${metal.color}-700`}>
                      {formatCurrency(metalPrices[metal.key] || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Prices Section - 1/4 width */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-semibold text-gray-700">
              Live Metal Prices
            </h5>
            <div className="flex items-center space-x-2">
              {liveDataSource && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {liveDataSource}
                </span>
              )}
              {Object.keys(livePrices).length > 0 && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  Cached
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: "gold24K", label: "Gold 24K", color: "yellow" },
              { key: "gold22K", label: "Gold 22K", color: "yellow" },
              { key: "gold18K", label: "Gold 18K", color: "yellow" },
              { key: "gold14K", label: "Gold 14K", color: "yellow" },
              { key: "silver", label: "Silver", color: "gray" },
            ].map((metal) => {
              const priceChange = calculatePriceChange(
                livePrices[metal.key],
                metalPrices[metal.key]
              );

              return (
                <div
                  key={metal.key}
                  className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {metal.label}
                    </p>
                    <p className={`text-lg font-bold text-${metal.color}-700`}>
                      {livePrices[metal.key]
                        ? formatCurrency(livePrices[metal.key])
                        : "₹0.00"}
                    </p>
                    {livePrices[metal.key] && metalPrices[metal.key] && (
                      <p
                        className={`text-xs mt-1 ${
                          priceChange.isPositive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {priceChange.isPositive ? "+" : "-"}₹
                        {priceChange.change.toFixed(2)} (
                        {priceChange.percentage.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 text-center mb-2">
                {Object.keys(livePrices).length > 0
                  ? "Last Fetched"
                  : "No Data Available"}
              </p>
              <p className="text-xs font-medium text-blue-900 text-center">
                {formatLastUpdated(lastUpdated)}
              </p>
              {Object.keys(livePrices).length === 0 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Click "Fetch Live Prices" to get current rates
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDiamondPricesAccordionContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold text-gray-800">
          Diamond Price Management
        </h4>
        <button
          onClick={addDiamondPrice}
          disabled={isDiamondLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium rounded-lg transition-colors"
        >
          {isDiamondLoading ? "Adding..." : "Add Diamond Price"}
        </button>
      </div>

      {/* Add New Diamond Price Form */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <h5 className="text-sm font-semibold text-purple-900 mb-4">
          Add New Diamond Price Entry
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              Diamond Shape
            </label>
            <select
              value={newDiamondPrice.shape}
              onChange={(e) =>
                handleNewDiamondPriceChange("shape", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="Round">Round</option>
              <option value="Fancy">Fancy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              Weight From (ct)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newDiamondPrice.weightFrom}
              onChange={(e) =>
                handleNewDiamondPriceChange("weightFrom", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              Weight To (ct)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newDiamondPrice.weightTo}
              onChange={(e) =>
                handleNewDiamondPriceChange("weightTo", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              Price per Carat (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newDiamondPrice.pricePerCarat}
              onChange={(e) =>
                handleNewDiamondPriceChange("pricePerCarat", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Diamond Prices List */}
      <div className="space-y-4">
        <h5 className="text-sm font-semibold text-gray-700">
          Current Diamond Prices
        </h5>

        {diamondPrices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>
              No diamond prices added yet. Add your first diamond price above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Shape
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Weight Range (ct)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Price per Carat (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Updated By
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Updated At
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {diamondPrices.map((diamond) => (
                  <tr key={diamond._id} className="hover:bg-gray-50">
                    {editingDiamond && editingDiamond._id === diamond._id ? (
                      // Edit mode
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={editingDiamond.shape}
                            onChange={(e) =>
                              handleEditDiamondPriceChange(
                                "shape",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Round">Round</option>
                            <option value="Fancy">Fancy</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1 items-center">
                            <input
                              type="number"
                              step="0.01"
                              value={editingDiamond.weightFrom}
                              onChange={(e) =>
                                handleEditDiamondPriceChange(
                                  "weightFrom",
                                  e.target.value
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editingDiamond.weightTo}
                              onChange={(e) =>
                                handleEditDiamondPriceChange(
                                  "weightTo",
                                  e.target.value
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={editingDiamond.pricePerCarat}
                            onChange={(e) =>
                              handleEditDiamondPriceChange(
                                "pricePerCarat",
                                e.target.value
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {diamond.updatedBy?.name || "Admin"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(diamond.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateDiamondPrice(diamond._id)}
                              disabled={isDiamondLoading}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingDiamond(null)}
                              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              diamond.shape === "Round"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {diamond.shape}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {diamond.weightFrom} - {diamond.weightTo} ct
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                          ₹ {diamond.pricePerCarat.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {diamond.updatedBy?.name || "Admin"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(diamond.updatedAt).toLocaleDateString()} at{" "}
                          {new Date(diamond.updatedAt).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingDiamond(diamond)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteDiamondPrice(diamond._id)}
                              disabled={isDiamondLoading}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderStonePricesAccordionContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold text-gray-800">
          Stone Price Management
        </h4>
        <button
          onClick={addStonePrice}
          disabled={isStoneLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium rounded-lg transition-colors"
        >
          {isStoneLoading ? "Adding..." : "Add Stone Price"}
        </button>
      </div>

      {/* Add New Stone Price Form */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border border-emerald-200">
        <h5 className="text-sm font-semibold text-emerald-900 mb-4">
          Add New Stone Price Entry
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-2">
              Stone Type
            </label>
            <select
              value={newStonePrice.stoneType}
              onChange={(e) =>
                handleNewStonePriceChange("stoneType", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Gemstone">Gemstone</option>
              <option value="Moissanite">Moissanite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-2">
              Weight From (gm)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newStonePrice.weightFrom}
              onChange={(e) =>
                handleNewStonePriceChange("weightFrom", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-2">
              Weight To (gm)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newStonePrice.weightTo}
              onChange={(e) =>
                handleNewStonePriceChange("weightTo", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-2">
              Rate (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newStonePrice.rate}
              onChange={(e) =>
                handleNewStonePriceChange("rate", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Stone Prices List */}
      <div className="space-y-4">
        <h5 className="text-sm font-semibold text-gray-700">
          Current Stone Prices
        </h5>

        {stonePrices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No stone prices added yet. Add your first stone price above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Stone Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Weight Range (gm)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Rate (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Updated By
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Updated At
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stonePrices.map((stone) => (
                  <tr key={stone._id} className="hover:bg-gray-50">
                    {editingStone && editingStone._id === stone._id ? (
                      // Edit mode
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={editingStone.stoneType}
                            onChange={(e) =>
                              handleEditStonePriceChange(
                                "stoneType",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Gemstone">Gemstone</option>
                            <option value="Moissanite">Moissanite</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1 items-center">
                            <input
                              type="number"
                              step="0.01"
                              value={editingStone.weightFrom}
                              onChange={(e) =>
                                handleEditStonePriceChange(
                                  "weightFrom",
                                  e.target.value
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editingStone.weightTo}
                              onChange={(e) =>
                                handleEditStonePriceChange(
                                  "weightTo",
                                  e.target.value
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={editingStone.rate}
                            onChange={(e) =>
                              handleEditStonePriceChange("rate", e.target.value)
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {stone.updatedBy?.name || "Admin"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(stone.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateStonePrice(stone._id)}
                              disabled={isStoneLoading}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStone(null)}
                              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              stone.stoneType === "Gemstone"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {stone.stoneType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {stone.weightFrom} - {stone.weightTo} gm
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                          ₹ {stone.rate.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {stone.updatedBy?.name || "Admin"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(stone.updatedAt).toLocaleDateString()} at{" "}
                          {new Date(stone.updatedAt).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingStone(stone)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteStonePrice(stone._id)}
                              disabled={isStoneLoading}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderMmToCtContent = () => (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            MM to CT Conversion Management
          </h3>

          <div className="flex flex-wrap gap-3">
            {/* <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="material-icons text-sm">download</span>
              Download Template
            </button> */}

            {/* <div className="relative">
              <input
                ref={csvFileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <button
                onClick={() => csvFileInputRef.current?.click()}
                disabled={isMmToCtLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-icons text-sm">upload</span>
                {isMmToCtLoading ? "Uploading..." : "Upload CSV"}
              </button>
            </div> */}

            {selectedMmToCtIds.length > 0 && (
              <>
                {/* <button
                  onClick={downloadSelectedData}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="material-icons text-sm">file_download</span>
                  Download Selected
                </button> */}

                <button
                  onClick={bulkDeleteSelected}
                  disabled={isMmToCtLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="material-icons text-sm">delete</span>
                  Delete Selected ({selectedMmToCtIds.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Add new entry form */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200 mb-6">
          <h5 className="text-sm font-semibold text-indigo-900 mb-4">
            Add New MM to CT Conversion
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-indigo-900 mb-2">
                Diamond Type
              </label>
              <select
                value={newMmToCt.type}
                onChange={(e) => handleNewMmToCtChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="round">Round</option>
                <option value="fancy">Fancy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-900 mb-2">
                Size (MM)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newMmToCt.size}
                onChange={(e) => handleNewMmToCtChange("size", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.86"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-900 mb-2">
                Carat Value
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={newMmToCt.carat}
                onChange={(e) => handleNewMmToCtChange("carat", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.119"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={addMmToCtEntry}
                disabled={isMmToCtLoading}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors"
              >
                {isMmToCtLoading ? "Adding..." : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden">
        {mmToCtData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="material-icons text-4xl text-gray-300 mb-4">
              table_view
            </span>
            <p className="text-lg mb-2">No MM to CT conversions found</p>
            <p className="text-sm">
              Add your first conversion above or upload a CSV file
            </p>
          </div>
        ) : (
          <>
            {/* Selection summary */}
            {selectedMmToCtIds.length > 0 && (
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">
                    {selectedMmToCtIds.length}
                  </span>{" "}
                  entries selected
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAllMmToCt}
                        onChange={handleSelectAllMmToCt}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Size (MM)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Carat Value
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Updated By
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Updated At
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {mmToCtData.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMmToCtIds.includes(item._id)}
                          onChange={() => handleMmToCtSelection(item._id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>

                      {editingMmToCt && editingMmToCt._id === item._id ? (
                        // Edit mode
                        <>
                          <td className="px-4 py-3">
                            <select
                              value={editingMmToCt.type}
                              onChange={(e) =>
                                handleEditMmToCtChange("type", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="round">Round</option>
                              <option value="fancy">Fancy</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={editingMmToCt.size}
                              onChange={(e) =>
                                handleEditMmToCtChange("size", e.target.value)
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.001"
                              value={editingMmToCt.carat}
                              onChange={(e) =>
                                handleEditMmToCtChange("carat", e.target.value)
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.updatedBy?.name || "Admin"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateMmToCtEntry(item._id)}
                                disabled={isMmToCtLoading}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-xs rounded flex items-center gap-1"
                              >
                                <span className="material-icons text-xs">
                                  save
                                </span>
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMmToCt(null)}
                                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded flex items-center gap-1"
                              >
                                <span className="material-icons text-xs">
                                  cancel
                                </span>
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.type === "round"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {item.type.charAt(0).toUpperCase() +
                                item.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {item.size} mm
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono font-semibold">
                            {item.carat} ct
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.updatedBy?.name || "Admin"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div>
                              <div>
                                {new Date(item.updatedAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(item.updatedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingMmToCt(item)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center gap-1"
                              >
                                <span className="material-icons text-xs">
                                  edit
                                </span>
                                Edit
                              </button>
                              <button
                                onClick={() => deleteMmToCtEntry(item._id)}
                                disabled={isMmToCtLoading}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs rounded flex items-center gap-1"
                              >
                                <span className="material-icons text-xs">
                                  delete
                                </span>
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Quick Converter - Keep existing functionality */}
      {/* <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Converter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Diamond Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="round">Round</option>
              <option value="fancy">Fancy</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Size (MM)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter size in MM"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Weight (CT)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="Calculated weight"
              readOnly
            />
          </div>
        </div>
      </div> */}
    </div>
  );

  const renderMakingChargesContent = () => (
    <div className="space-y-6">
      {/* Add New Making Charge Form */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        {/* Bulk actions and selection summary */}
        {selectedMakingChargeIds.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded p-3 text-blue-700 text-sm">
            <span>{selectedMakingChargeIds.length} entries selected</span>
            <button
              onClick={bulkDeleteMakingCharges}
              disabled={isBulkDeletingMakingCharges}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded transition-colors"
            >
              {isBulkDeletingMakingCharges ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Making Charges Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* Purity Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purity
            </label>
            <select
              value={newMakingCharge.purity}
              onChange={(e) =>
                handleNewMakingChargeChange("purity", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="14K">14K</option>
              <option value="18K">18K</option>
              <option value="22K">22K</option>
              <option value="24K">24K</option>
            </select>
          </div>

          {/* From Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Weight (gm)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newMakingCharge.weightFrom}
              onChange={(e) =>
                handleNewMakingChargeChange("weightFrom", e.target.value)
              }
              placeholder="From"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* To Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Weight (gm)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newMakingCharge.weightTo}
              onChange={(e) =>
                handleNewMakingChargeChange("weightTo", e.target.value)
              }
              placeholder="To"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newMakingCharge.rate}
              onChange={(e) =>
                handleNewMakingChargeChange("rate", e.target.value)
              }
              placeholder="Rate"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              onClick={addMakingCharge}
              disabled={isMakingChargesLoading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
            >
              {isMakingChargesLoading ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {/* Making Charges List Table */}
        {makingCharges.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="material-icons text-4xl text-gray-300 mb-4">
              list_alt
            </span>
            <p className="text-lg mb-2">No making charges found</p>
            <p className="text-sm">Add making charges using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full rounded-lg border border-gray-200 shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAllMakingCharges}
                      onChange={handleSelectAllMakingCharges}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label="Select all making charges"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Purity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    From Weight (gm)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    To Weight (gm)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Rate (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Updated By
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Updated At
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {makingCharges.map((item) =>
                  editingMakingCharge &&
                  editingMakingCharge._id === item._id ? (
                    <tr key={item._id} className="bg-blue-50">
                      <td className="px-4 py-3">
                        <select
                          value={editingMakingCharge.purity}
                          onChange={(e) =>
                            handleEditMakingChargeChange(
                              "purity",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="14K">14K</option>
                          <option value="18K">18K</option>
                          <option value="22K">22K</option>
                          <option value="24K">24K</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={editingMakingCharge.weightFrom}
                          onChange={(e) =>
                            handleEditMakingChargeChange(
                              "weightFrom",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={editingMakingCharge.weightTo}
                          onChange={(e) =>
                            handleEditMakingChargeChange(
                              "weightTo",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={editingMakingCharge.rate}
                          onChange={(e) =>
                            handleEditMakingChargeChange("rate", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.updatedBy?.name || "Admin"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(item.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateMakingCharge(item._id)}
                            disabled={isMakingChargesLoading}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-xs rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMakingCharge(null)}
                            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">{item.purity}</td>
                      <td className="px-4 py-3 text-sm">{item.weightFrom}</td>
                      <td className="px-4 py-3 text-sm">{item.weightTo}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        ₹ {item.rate.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.updatedBy?.name || "Admin"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(item.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingMakingCharge(item)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMakingCharge(item._id)}
                            disabled={isMakingChargesLoading}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 mt-8 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Minimum Making Charge Configuration
              </h3>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumMakingCharge}
                  onChange={(e) => setMinimumMakingCharge(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter minimum making charge"
                  disabled={isMinChargeLoading}
                />
                <button
                  onClick={updateMinimumMakingCharge}
                  disabled={isMinChargeLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
                >
                  {isMinChargeLoading ? "Saving..." : "Save"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                If calculated making charge is below this minimum, the minimum
                charge will be applied automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfigurationContent = () => (
    <div className="space-y-4">
      {/* Configuration Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "rate-charts", name: "Rate Charts" },
            { id: "mm-to-ct", name: "MM to CT Conversion" },
            { id: "making-charges", name: "Making Charges" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveConfigTab(tab.id)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeConfigTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Configuration Sub-tab Content */}
      <div className="mt-6">
        {activeConfigTab === "rate-charts" && renderRateChartsContent()}
        {activeConfigTab === "mm-to-ct" && renderMmToCtContent()}
        {activeConfigTab === "making-charges" && renderMakingChargesContent()}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 h-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left side - Logo section */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="w-10 h-10 rounded-lg object-cover shadow-sm transition-all duration-300 group-hover:shadow-md"
                />
                <button
                  onClick={handleLogoEdit}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                  title="Edit logo"
                >
                  <Edit size={12} />
                </button>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              </div>
            </div>

            {/* Right side - Welcome message and logout */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden sm:flex items-center space-x-3">
                  <span className="text-gray-600 font-medium">Welcome,</span>
                  <span className="text-gray-900 font-semibold">
                    {user.name}
                  </span>
                </div>
              )}

              {/* Mobile welcome - abbreviated */}
              {user && (
                <div className="sm:hidden flex items-center">
                  <span className="text-gray-900 font-semibold text-sm truncate max-w-20">
                    {user.name}
                  </span>
                </div>
              )}

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-300 hover:shadow-md transform hover:scale-105 active:scale-95"
              >
                <LogOut size={16} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden text-xs">Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area with tabs */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: "products", name: "Products" },
                  { id: "configuration", name: "Configuration" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-lg transition-colors ${
                      activeMainTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeMainTab === "products" && renderProductsContent()}
            {activeMainTab === "configuration" && renderConfigurationContent()}
          </div>
        </div>
      </main>

      {/* Logo Upload Modal */}
      {showLogoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Update Logo</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Logo Preview */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Logo
                </p>
                <img
                  src={logoUrl}
                  alt="Current logo"
                  className="w-20 h-20 rounded-lg object-cover shadow-md mx-auto"
                />
              </div>

              {/* File Input */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={triggerFileInput}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-600">Choose New Logo</span>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
                </p>
              </div>

              {/* New Logo Preview */}
              {previewUrl && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    New Logo Preview
                  </p>
                  <img
                    src={previewUrl}
                    alt="New logo preview"
                    className="w-20 h-20 rounded-lg object-cover shadow-md mx-auto"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoUpload}
                  disabled={!selectedImage}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  Update Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
