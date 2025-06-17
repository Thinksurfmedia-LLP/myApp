import React, { useState, useRef, useEffect } from "react";
import { Edit, LogOut, Upload, X } from "lucide-react";
import axios from "axios";

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
  const [livePrices, setLivePrices] = useState({
    gold24K: 6847,
    gold22K: 6280,
    gold18K: 5135,
    gold14K: 3995,
    silver: 84.5,
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

  // Add this useEffect to fetch metal prices when component mounts
  useEffect(() => {
    fetchMetalPrices();
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

  // Fetch diamond prices on component mount
  useEffect(() => {
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

    fetchDiamondPrices();
  }, []);

  useEffect(() => {
    fetchDiamondPrices();
  }, []);

  // Add these functions after your existing functions

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

  const handleNewDiamondPriceChange = (field, value) => {
    setNewDiamondPrice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditDiamondPriceChange = (field, value) => {
    setEditingDiamond((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const handlePriceChange = (metal, value) => {
    setMetalPrices((prev) => ({
      ...prev,
      [metal]: parseFloat(value) || 0,
    }));
  };

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

  const syncLivePrices = async () => {
    try {
      setIsSyncing(true);
      // Simulate fetching live prices (replace with actual API call)
      const updatedLivePrices = {
        gold24K: Math.round((6847 + (Math.random() - 0.5) * 100) * 100) / 100,
        gold22K: Math.round((6280 + (Math.random() - 0.5) * 100) * 100) / 100,
        gold18K: Math.round((5135 + (Math.random() - 0.5) * 100) * 100) / 100,
        gold14K: Math.round((3995 + (Math.random() - 0.5) * 100) * 100) / 100,
        silver: Math.round((84.5 + (Math.random() - 0.5) * 5) * 100) / 100,
      };

      setLivePrices(updatedLivePrices);
      setMetalPrices(updatedLivePrices);

      // Save to database
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/metal-prices",
        updatedLivePrices,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Live prices synced successfully!");
    } catch (error) {
      console.error("Error syncing live prices:", error);
      alert("Error syncing live prices. Please try again.");
    } finally {
      setIsSyncing(false);
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

  // Handle input changes for new diamond price
  const handleDiamondPriceChange = (e) => {
    const { name, value } = e.target;
    setNewDiamondPrice((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  // Save new diamond price
  const saveDiamondPrice = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/diamond-prices",
        newDiamondPrice
      );
      if (response.data.success) {
        alert("Diamond price added successfully!");
        setDiamondPrices((prev) => [...prev, response.data.diamondPrice]);
        setNewDiamondPrice({
          shape: "Round",
          weightRange: { min: 0, max: 0 },
          price: 0,
        });
      }
    } catch (error) {
      console.error("Error saving diamond price:", error);
      alert("Error saving diamond price. Please try again.");
    }
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

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
                      ₹{metalPrices[metal.key]?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Prices Section - 1/4 width */}
        <div className="lg:col-span-1">
          <h5 className="text-sm font-semibold text-gray-700 mb-4">
            Live Metal Price
          </h5>
          <div className="space-y-3">
            {[
              { key: "gold24K", label: "Gold 24K", color: "yellow" },
              { key: "gold22K", label: "Gold 22K", color: "yellow" },
              { key: "gold18K", label: "Gold 18K", color: "yellow" },
              { key: "gold14K", label: "Gold 14K", color: "yellow" },
              { key: "silver", label: "Silver", color: "gray" },
            ].map((metal) => (
              <div
                key={metal.key}
                className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
              >
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {metal.label}
                  </p>
                  <p className={`text-lg font-bold text-${metal.color}-700`}>
                    ₹{livePrices[metal.key]?.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {Math.random() > 0.5 ? "+" : "-"}₹
                    {Math.floor(Math.random() * 50)} today
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 text-center mb-2">
                Last Updated
              </p>
              <p className="text-xs font-medium text-blue-900 text-center">
                {new Date().toLocaleTimeString()}
              </p>
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
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">💎</span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Stone Price Management
        </h4>
        <p className="text-gray-600">
          Stone pricing functionality will be implemented here.
        </p>
      </div>
    </div>
  );

  const renderMmToCtContent = () => (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          MM to CT Conversion Chart
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Round Stones</h4>
            <div className="space-y-2">
              {[
                { mm: "1.0", ct: "0.005" },
                { mm: "1.5", ct: "0.015" },
                { mm: "2.0", ct: "0.030" },
                { mm: "2.5", ct: "0.060" },
                { mm: "3.0", ct: "0.100" },
                { mm: "4.0", ct: "0.250" },
                { mm: "5.0", ct: "0.500" },
              ].map((item) => (
                <div
                  key={item.mm}
                  className="flex justify-between p-2 bg-gray-50/50 rounded"
                >
                  <span className="font-medium">{item.mm} mm</span>
                  <span className="text-gray-600">{item.ct} ct</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Square Stones</h4>
            <div className="space-y-2">
              {[
                { mm: "1.0x1.0", ct: "0.004" },
                { mm: "1.5x1.5", ct: "0.014" },
                { mm: "2.0x2.0", ct: "0.028" },
                { mm: "2.5x2.5", ct: "0.055" },
                { mm: "3.0x3.0", ct: "0.095" },
                { mm: "4.0x4.0", ct: "0.240" },
                { mm: "5.0x5.0", ct: "0.480" },
              ].map((item) => (
                <div
                  key={item.mm}
                  className="flex justify-between p-2 bg-gray-50/50 rounded"
                >
                  <span className="font-medium">{item.mm} mm</span>
                  <span className="text-gray-600">{item.ct} ct</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Converter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Size (MM)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter size in MM"
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
      </div>
    </div>
  );

  const renderMakingChargesContent = () => (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Making Charges Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { category: "Rings", percentage: "12%", fixed: "₹500" },
            { category: "Necklaces", percentage: "15%", fixed: "₹1,200" },
            { category: "Earrings", percentage: "10%", fixed: "₹300" },
            { category: "Bracelets", percentage: "14%", fixed: "₹800" },
            { category: "Pendants", percentage: "13%", fixed: "₹600" },
            { category: "Chains", percentage: "11%", fixed: "₹400" },
          ].map((item) => (
            <div
              key={item.category}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
            >
              <h4 className="font-medium text-indigo-900 mb-3">
                {item.category}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-700">Percentage:</span>
                  <span className="font-medium text-indigo-900">
                    {item.percentage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-700">Fixed:</span>
                  <span className="font-medium text-indigo-900">
                    {item.fixed}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add New Making Charge
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Select Category</option>
              <option>Rings</option>
              <option>Necklaces</option>
              <option>Earrings</option>
              <option>Bracelets</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Percentage (%)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter percentage"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fixed Amount (₹)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter fixed amount"
            />
          </div>
        </div>
        <div className="mt-4">
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Add Making Charge
          </button>
        </div>
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
