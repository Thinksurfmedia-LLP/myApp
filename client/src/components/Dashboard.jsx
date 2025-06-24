import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  Edit,
  LogOut,
  Upload,
  X,
  RefreshCw,
  Settings,
  Eye,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import axios from "axios";

// ****************ACCORDION SECTION COMPONENT**************** //
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

// ****************PRODUCT MODAL COMPONENT**************** //

const ProductModal = ({
  product,
  isOpen,
  onClose,
  onSave,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vendor: "",
    productType: "",
    status: "active",
    tags: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        vendor: product.vendor || "",
        productType: product.productType || "",
        status: product.status || "active",
        tags: product.tags || [],
      });
    }
  }, [product, isOpen]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(product._id, formData);
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  const mainImage =
    product.images?.[0]?.url ||
    "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Product" : "Product Details"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Image */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={image.url}
                        alt={`${product.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{product.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">
                    {product.description || "No description"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vendor: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {product.vendor || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.productType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          productType: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {product.productType || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      product.status === "active"
                        ? "bg-green-100 text-green-800"
                        : product.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.status}
                  </span>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variants ({product.variants.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {product.variants.map((variant, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{variant.title}</p>
                        <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-1">
                          <span>Price: ₹{variant.price}</span>
                          <span>SKU: {variant.sku || "N/A"}</span>
                          <span>Inventory: {variant.inventory}</span>
                          <span>
                            Weight: {variant.weight} {variant.weightUnit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {(product.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Shopify Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Shopify Information
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Shopify ID: {product.shopifyId}</p>
                  <p>Handle: {product.handle}</p>
                  <p>
                    Last Synced: {new Date(product.lastSynced).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isEditing ? "Cancel" : "Close"}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const DiamondConfigCard = memo(
  ({ diamond, index, onUpdate, onRemove, mmToCtData, diamondPricesData }) => {
    const convertMmToCt = (mmValue, shape) => {
      if (!mmValue || !mmToCtData.length) return "";

      const numericMmValue = parseFloat(mmValue);
      const shapeType = shape.toLowerCase();

      // Filter conversions for the specific shape
      const shapeConversions = mmToCtData.filter(
        (item) => item.type.toLowerCase() === shapeType
      );

      if (shapeConversions.length === 0) {
        throw new Error(`No conversion data found for ${shape} diamonds`);
      }

      // Try to find exact match first
      const exactMatch = shapeConversions.find(
        (item) => item.size === numericMmValue
      );

      if (exactMatch) {
        return exactMatch.carat.toString();
      }

      // If no exact match, try interpolation between closest values
      const sortedConversions = shapeConversions.sort(
        (a, b) => a.size - b.size
      );

      // Find the two closest values for interpolation
      let lower = null;
      let upper = null;

      for (let i = 0; i < sortedConversions.length; i++) {
        if (sortedConversions[i].size < numericMmValue) {
          lower = sortedConversions[i];
        } else if (sortedConversions[i].size > numericMmValue) {
          upper = sortedConversions[i];
          break;
        }
      }

      // If we have both lower and upper bounds, interpolate
      if (lower && upper) {
        const ratio = (numericMmValue - lower.size) / (upper.size - lower.size);
        const interpolatedCarat =
          lower.carat + ratio * (upper.carat - lower.carat);
        return interpolatedCarat.toFixed(3);
      }

      // If only lower bound exists (entered value is larger than all in DB)
      if (lower && !upper) {
        throw new Error(
          `MM value ${mmValue} is larger than available data. Maximum available: ${lower.size}mm`
        );
      }

      // If only upper bound exists (entered value is smaller than all in DB)
      if (!lower && upper) {
        throw new Error(
          `MM value ${mmValue} is smaller than available data. Minimum available: ${upper.size}mm`
        );
      }

      throw new Error(
        `CT value not found for ${mmValue}mm ${shape} diamond in database`
      );
    };

    const getPricePerCarat = (totalWeight, shape) => {
      if (!totalWeight || !diamondPricesData.length) return 0;

      const numericWeight = parseFloat(totalWeight);
      const shapeType = shape.toLowerCase();

      // Filter prices for the specific shape
      const shapePrices = diamondPricesData.filter(
        (item) => item.shape.toLowerCase() === shapeType
      );

      if (shapePrices.length === 0) {
        throw new Error(`No price data found for ${shape} diamonds`);
      }

      // Find the weight range that contains our total weight
      const priceEntry = shapePrices.find(
        (item) =>
          numericWeight >= item.weightFrom && numericWeight <= item.weightTo
      );

      if (!priceEntry) {
        // Provide helpful error message with available ranges
        const ranges = shapePrices
          .map((p) => `${p.weightFrom}-${p.weightTo}ct`)
          .join(", ");
        throw new Error(
          `Weight ${totalWeight}ct falls outside available price ranges for ${shape} diamonds. Available ranges: ${ranges}`
        );
      }

      return priceEntry.pricePerCarat;
    };

    // Calculate total weight and diamond value
    const calculateValues = (updatedDiamond) => {
      try {
        const pieces = parseInt(updatedDiamond.pieces) || 0;
        const ctValue = parseFloat(updatedDiamond.ctValue) || 0;
        const totalWeight = pieces * ctValue;

        if (totalWeight === 0 || !updatedDiamond.shape) {
          return {
            ...updatedDiamond,
            totalWeight: "0.000",
            diamondValue: "0.00",
            calculationError: null,
          };
        }

        // Get price per carat from database based on weight range
        const pricePerCarat = getPricePerCarat(
          totalWeight,
          updatedDiamond.shape
        );
        const diamondValue = totalWeight * pricePerCarat;

        return {
          ...updatedDiamond,
          totalWeight: totalWeight.toFixed(3),
          diamondValue: diamondValue.toFixed(2),
          calculationError: null,
          pricePerCarat: pricePerCarat.toFixed(2), // Optional: show the rate used
        };
      } catch (error) {
        return {
          ...updatedDiamond,
          totalWeight: updatedDiamond.totalWeight || "0.000",
          diamondValue: updatedDiamond.diamondValue || "0.00",
          calculationError: error.message,
        };
      }
    };

    const handleFieldChange = (field, value) => {
      let updatedDiamond = { ...diamond, [field]: value };

      try {
        // Handle MM to CT conversion
        if (field === "mmValue" && diamond.weightType === "mm") {
          if (value && diamond.shape) {
            const ctValue = convertMmToCt(value, diamond.shape);
            updatedDiamond.ctValue = ctValue;
            updatedDiamond.calculationError = null;
          } else {
            updatedDiamond.ctValue = "";
            updatedDiamond.calculationError = null;
          }
        }

        // Clear CT value if shape changes and we're in MM mode
        if (
          field === "shape" &&
          diamond.weightType === "mm" &&
          diamond.mmValue
        ) {
          try {
            const ctValue = convertMmToCt(diamond.mmValue, value);
            updatedDiamond.ctValue = ctValue;
            updatedDiamond.calculationError = null;
          } catch (error) {
            updatedDiamond.ctValue = "";
            updatedDiamond.calculationError = error.message;
          }
        }

        // Recalculate values when pieces, ctValue, mmValue, or shape changes
        if (["pieces", "ctValue", "mmValue", "shape"].includes(field)) {
          updatedDiamond = calculateValues(updatedDiamond);
        }
      } catch (error) {
        updatedDiamond.calculationError = error.message;
      }

      onUpdate(updatedDiamond);
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Diamond {index + 1}
          </span>
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </div>

        {/* Show calculation error if any */}
        {diamond.calculationError && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {diamond.calculationError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Diamond Shape */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shape
            </label>
            <select
              value={diamond.shape}
              onChange={(e) => handleFieldChange("shape", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Shape</option>
              <option value="Round">Round</option>
              <option value="Fancy">Fancy</option>
            </select>
          </div>

          {/* Diamond Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <select
              value={diamond.color}
              onChange={(e) => handleFieldChange("color", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Color</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="H">H</option>
              <option value="I">I</option>
              <option value="J">J</option>
            </select>
          </div>

          {/* Diamond Clarity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clarity
            </label>
            <select
              value={diamond.clarity}
              onChange={(e) => handleFieldChange("clarity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Clarity</option>
              <option value="FL">FL</option>
              <option value="IF">IF</option>
              <option value="VVS1">VVS1</option>
              <option value="VVS2">VVS2</option>
              <option value="VS1">VS1</option>
              <option value="VS2">VS2</option>
              <option value="SI1">SI1</option>
              <option value="SI2">SI2</option>
            </select>
          </div>

          {/* Number of Pieces */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. of Pieces
            </label>
            <input
              type="number"
              value={diamond.pieces}
              onChange={(e) => handleFieldChange("pieces", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          {/* Weight Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight Type
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleFieldChange("weightType", "mm")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  diamond.weightType === "mm"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                MM
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange("weightType", "ct")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  diamond.weightType === "ct"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                CT
              </button>
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight ({diamond.weightType.toUpperCase()})
            </label>
            <input
              type="number"
              step="0.001"
              value={
                diamond.weightType === "mm" ? diamond.mmValue : diamond.ctValue
              }
              onChange={(e) =>
                handleFieldChange(
                  diamond.weightType === "mm" ? "mmValue" : "ctValue",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.000"
            />
          </div>

          {/* Show CT value when MM is selected */}
          {diamond.weightType === "mm" && diamond.ctValue && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Converted CT Value
              </label>
              <input
                type="number"
                step="0.001"
                value={diamond.ctValue}
                onChange={(e) => handleFieldChange("ctValue", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.000"
              />
            </div>
          )}

          {/* Total Weight (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Weight (CT)
            </label>
            <input
              type="text"
              value={diamond.totalWeight || "0.000"}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Diamond Value (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diamond Value (₹)
            </label>
            <input
              type="text"
              value={diamond.diamondValue || "0.00"}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
        </div>
      </div>
    );
  }
);

const StoneConfigCard = memo(({ stone, index, onUpdate, onRemove, stonePricesData = [] }) => {
  
  // Function to get rate per gram from database
  const getRatePerGram = (totalWeight, stoneType) => {
    if (!totalWeight || !stonePricesData.length) return 0;
    
    const numericWeight = parseFloat(totalWeight);
    if (isNaN(numericWeight)) return 0;
    
    const stoneTypeLower = stoneType.toLowerCase();
    
    // Filter prices for the specific stone type
    const typePrices = stonePricesData.filter(
      (item) => item.stoneType && item.stoneType.toLowerCase() === stoneTypeLower
    );
    
    if (typePrices.length === 0) {
      throw new Error(`No price data found for ${stoneType} stones`);
    }
    
    // Find the weight range that contains our total weight
    const priceEntry = typePrices.find(
      (item) => 
        numericWeight >= (item.weightFrom || 0) && 
        numericWeight <= (item.weightTo || 0)
    );
    
    if (!priceEntry) {
      const ranges = typePrices.map(p => `${p.weightFrom || 0}-${p.weightTo || 0}gm`).join(', ');
      throw new Error(
        `Weight ${totalWeight}gm falls outside available price ranges for ${stoneType} stones. Available ranges: ${ranges}`
      );
    }
    
    return priceEntry.rate || 0;
  };

  // Calculate stone value with proper null checking
  const calculateStoneValue = (updatedStone) => {
    try {
      // Safely parse numbers with fallbacks
      const pieces = parseInt(updatedStone.pieces || 0) || 0;
      const weightPerStone = parseFloat(updatedStone.weightPerStone || 0) || 0;
      const totalWeight = pieces * weightPerStone;

      const baseUpdate = {
        ...updatedStone,
        totalWeight: isNaN(totalWeight) ? "0.000" : totalWeight.toFixed(3),
      };

      // If no total weight or no stone type, return with zero values
      if (totalWeight === 0 || !updatedStone.stoneType || !updatedStone.stoneType.trim()) {
        return {
          ...baseUpdate,
          stoneValue: "0.00",
          calculationError: null,
          rate: "0.00",
        };
      }

      // Check if we have stone prices data
      if (!stonePricesData || stonePricesData.length === 0) {
        return {
          ...baseUpdate,
          stoneValue: "0.00",
          calculationError: "Stone price data not available",
          rate: "0.00",
        };
      }

      // Get rate per gram from database
      const rate = getRatePerGram(totalWeight, updatedStone.stoneType);
      const stoneValue = totalWeight * rate;

      return {
        ...baseUpdate,
        stoneValue: isNaN(stoneValue) ? "0.00" : stoneValue.toFixed(2),
        calculationError: null,
        rate: isNaN(rate) ? "0.00" : rate.toFixed(2),
      };
    } catch (error) {
      // Safe fallback calculation
      const pieces = parseInt(updatedStone.pieces || 0) || 0;
      const weightPerStone = parseFloat(updatedStone.weightPerStone || 0) || 0;
      const totalWeight = pieces * weightPerStone;

      return {
        ...updatedStone,
        totalWeight: isNaN(totalWeight) ? "0.000" : totalWeight.toFixed(3),
        stoneValue: "0.00",
        calculationError: error.message,
        rate: "0.00",
      };
    }
  };

  const handleFieldChange = (field, value) => {
    console.log(`Field ${field} changed to:`, value);
    
    let updatedStone = { ...stone, [field]: value };

    // Always recalculate when pieces or weightPerStone changes
    if (field === "pieces" || field === "weightPerStone") {
      const pieces = parseInt(field === "pieces" ? (value || 0) : (stone.pieces || 0)) || 0;
      const weightPerStone = parseFloat(field === "weightPerStone" ? (value || 0) : (stone.weightPerStone || 0)) || 0;
      const totalWeight = pieces * weightPerStone;
      
      updatedStone.totalWeight = isNaN(totalWeight) ? "0.000" : totalWeight.toFixed(3);
      console.log(`Calculated total weight: ${totalWeight}`);
    }

    // Recalculate stone value when relevant fields change
    if (["pieces", "weightPerStone", "stoneType"].includes(field)) {
      updatedStone = calculateStoneValue(updatedStone);
      console.log(`Updated stone:`, updatedStone);
    }

    onUpdate(updatedStone);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Stone {index + 1}
        </span>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>

      {/* Show calculation error if any */}
      {stone.calculationError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {stone.calculationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Stone Type - Updated with your available types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stone Type *
          </label>
          <select
            value={stone.stoneType || ""}
            onChange={(e) => handleFieldChange("stoneType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Stone Type</option>
            <option value="Gemstone">Gemstone</option>
            <option value="Moissanite">Moissanite</option>
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <input
            type="text"
            value={stone.color || ""}
            onChange={(e) => handleFieldChange("color", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter color"
          />
        </div>

        {/* Clarity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clarity
          </label>
          <select
            value={stone.clarity || ""}
            onChange={(e) => handleFieldChange("clarity", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Clarity</option>
            <option value="VS">VS</option>
            <option value="VVS">VVS</option>
            <option value="SI">SI</option>
            <option value="I">I</option>
          </select>
        </div>

        {/* Pieces */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Pieces *
          </label>
          <input
            type="number"
            min="1"
            value={stone.pieces || ""}
            onChange={(e) => handleFieldChange("pieces", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            required
          />
        </div>

        {/* Weight Per Stone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight Per Stone (gm) *
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={stone.weightPerStone || ""}
            onChange={(e) => handleFieldChange("weightPerStone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.000"
            required
          />
        </div>

        {/* Total Weight (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Weight (gm)
          </label>
          <input
            type="text"
            value={stone.totalWeight || "0.000"}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Rate Per Gram (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate Per Gram (₹)
          </label>
          <input
            type="text"
            value={stone.rate || "0.00"}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Stone Value (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stone Value (₹)
          </label>
          <input
            type="text"
            value={stone.stoneValue || "0.00"}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>
      </div>
    </div>
  );
});


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
    return localStorage.getItem("activeConfigTab") || "shopify-config";
  });

  // ****************************************** SHOPIFY STATES **************************************** //
  const [shopifyConfig, setShopifyConfig] = useState(null);
  const [isShopifyConfigured, setIsShopifyConfigured] = useState(false);

  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [productFilters, setProductFilters] = useState({
    vendors: [],
    productTypes: [],
    statuses: ["active", "draft", "archived"],
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [syncStatus, setSyncStatus] = useState({
    isConfigured: false,
    lastSync: null,
    productCount: 0,
    storeUrl: "",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productAnalytics, setProductAnalytics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    archivedProducts: 0,
    topVendors: [],
    lastSync: null,
    isConfigured: false,
  });

  // Shopify Configuration States
  const [shopifyConfigForm, setShopifyConfigForm] = useState({
    storeUrl: "",
    accessToken: "",
    apiVersion: "2024-01",
  });
  const [isConfiguringShopify, setIsConfiguringShopify] = useState(false);

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

  //********  ********** ADD PRODUCT MODAL STATES ********** ********//

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    title: "",
    description: "",
    productType: "",
    vendor: "",
    tags: "",
    media: [
      { type: "upload", file: null, url: "", preview: "", mediaType: "image" },
    ],
    inventory: {
      quantity: "",
      sku: "",
      barcode: "",
    },
    weight: {
      value: "",
      unit: "kg",
    },
    seo: {
      pageTitle: "",
      metaDescription: "",
      urlHandle: "",
    },
    metalConfig: {},
    diamondConfig: [],
    stoneConfig: [],
  });

  const [isUrlManuallyEdited, setIsUrlManuallyEdited] = useState(false);

  // FOR DIAMOND PRICE CALCULATION //

  const [mmToCtConversions, setMmToCtConversions] = useState([]);
  const [diamondPricesForCalc, setDiamondPricesForCalc] = useState([]);

  // FOR STONE PRICE CALCULATION //

  const [stonePricesData, setStonePricesData] = useState([]);

  // *******************************INITIAL DATA LOADING******************************* //
  useEffect(() => {
    fetchMetalPrices();
    fetchMmToCtData();
    fetchCurrentLogo();
    fetchMakingCharges();
    fetchMinimumMakingCharge();
    fetchDiamondPrices();
    fetchStonePrices();
    loadLivePricesFromStorage();

    fetchShopifyConfig();
    fetchSyncStatus();

    fetchMmToCtConversions();
    fetchDiamondPricesForCalc();
    fetchStonePricesForCalc();
  }, []);

  // ****************SAVE ACTIVE TABS TO LOCALSTORAGE**************** //

  useEffect(() => {
    localStorage.setItem("activeMainTab", activeMainTab);
  }, [activeMainTab]);

  useEffect(() => {
    localStorage.setItem("activeConfigTab", activeConfigTab);
  }, [activeConfigTab]);

  // *************LOAD PRODUCTS WHEN MAIN TAB CHANGES TO PRODUCTS************* //

  useEffect(() => {
    if (activeMainTab === "products") {
      if (isShopifyConfigured) {
        fetchShopifyProducts();
        fetchProductAnalytics();
      } else {
        setProductAnalytics({
          totalProducts: 0,
          activeProducts: 0,
          draftProducts: 0,
          archivedProducts: 0,
          topVendors: [],
          lastSync: null,
          isConfigured: false,
        });
      }
    }
  }, [
    activeMainTab,
    isShopifyConfigured,
    searchTerm,
    selectedStatus,
    selectedVendor,
    selectedProductType,
    pagination.current,
  ]);

  // *************ALSO FETCH ANALYTICS AFTER SUCCESSFUL SYNC************* //
  const syncShopifyProducts = async (fullSync = false) => {
    if (!isShopifyConfigured) {
      alert("Please configure Shopify first");
      return;
    }

    try {
      setIsSyncing(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/shopify/sync-products",
        { fullSync },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert(`Successfully synced ${response.data.totalProducts} products!`);
        await fetchShopifyProducts();
        await fetchSyncStatus();
        await fetchProductAnalytics(); // Add this line
      }
    } catch (error) {
      console.error("Error syncing products:", error);
      alert(error.response?.data?.message || "Failed to sync products");
    } finally {
      setIsSyncing(false);
    }
  };

  // *********************SHOPIFY API FUNCTIONS********************* //

  // Add this function to calculate making charges
const calculateMakingCharges = () => {
  const { metalConfig } = newProductForm;
  
  // Return 0 if no metal configuration
  if (!metalConfig.type) {
    return 0;
  }
  
  // Return minimum making charge if it's Silver
  if (metalConfig.type === 'Silver') {
    return parseFloat(minimumMakingCharge);
  }
  
  // Return 0 if no net weight or invalid weight
  const netWeight = parseFloat(metalConfig.netWeight);
  if (!netWeight || netWeight <= 0) {
    return 0;
  }
  
  // Get the purity in the format stored in database (uppercase with 'K')
  const purity = metalConfig.purity ? metalConfig.purity.toUpperCase() : '';
  
  // Return minimum making charge if no purity is selected
  if (!purity) {
    return parseFloat(minimumMakingCharge);
  }
  
  // Find matching making charge based on purity and weight range
  const matchingCharge = makingCharges.find(charge => {
    return (
      charge.purity === purity &&
      netWeight >= charge.weightFrom &&
      netWeight <= charge.weightTo
    );
  });
  
  // If matching charge found, calculate the making charge
  if (matchingCharge) {
    const calculatedCharge = netWeight * matchingCharge.rate;
    const minCharge = parseFloat(minimumMakingCharge);
    
    // Return the higher value between calculated charge and minimum charge
    return Math.max(calculatedCharge, minCharge);
  }
  
  // If no matching charge found, return minimum making charge
  return parseFloat(minimumMakingCharge);
};


  // **************FETCH SHOPIFY CONFIGURATION************** //

  const fetchShopifyConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/shopify/config",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.config) {
        setShopifyConfig(response.data.config);
        setIsShopifyConfigured(true);
        setShopifyConfigForm({
          storeUrl: response.data.config.storeUrl,
          accessToken: "", // Don't populate for security
          apiVersion: response.data.config.apiVersion,
        });
      }
    } catch (error) {
      console.error("Error fetching Shopify config:", error);
    }
  };

  // **************SAVE SHOPIFY CONFIGURATION************** //

  const saveShopifyConfig = async () => {
    if (!shopifyConfigForm.storeUrl || !shopifyConfigForm.accessToken) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsConfiguringShopify(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/shopify/config",
        shopifyConfigForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Shopify configuration saved successfully!");
        await fetchShopifyConfig();
        await fetchSyncStatus();

        // Clear access token from form for security
        setShopifyConfigForm((prev) => ({ ...prev, accessToken: "" }));
      }
    } catch (error) {
      console.error("Error saving Shopify config:", error);

      // Debug: Log more detailed error info
      if (error.response) {
        console.log("Error status:", error.response.status);
        console.log("Error data:", error.response.data);
        console.log("Error headers:", error.response.headers);
      }

      alert(
        error.response?.data?.message || "Failed to configure Shopify store"
      );
    } finally {
      setIsConfiguringShopify(false);
    }
  };

  // **************FETCH SYNC STATUS************** //

  const fetchSyncStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/shopify/sync-status",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSyncStatus(response.data.status);
      }
    } catch (error) {
      console.error("Error fetching sync status:", error);
    }
  };

  // **************FETCH SHOPIFY PRODUCTS WITH FILTERS AND PAGINATION************** //

  const fetchShopifyProducts = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedVendor && { vendor: selectedVendor }),
        ...(selectedProductType && { productType: selectedProductType }),
      });

      const response = await axios.get(
        `http://localhost:5000/api/shopify/products?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setShopifyProducts(response.data.products);
        setPagination(response.data.pagination);
        setProductFilters(response.data.filters);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (
        error.response?.status === 404 ||
        error.response?.data?.message?.includes(
          "No active Shopify configuration"
        )
      ) {
        setShopifyProducts([]);
        setPagination({
          current: 1,
          total: 1,
          totalProducts: 0,
          hasNext: false,
          hasPrev: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // **************FETCH SHOPIFY PRODUCTS ANALYTICS************** //

  const fetchProductAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/shopify/analytics",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setProductAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set default values if API call fails
      setProductAnalytics({
        totalProducts: 0,
        activeProducts: 0,
        draftProducts: 0,
        archivedProducts: 0,
        topVendors: [],
        lastSync: null,
        isConfigured: false,
      });
    }
  };

  // **************PRODUCT HANDLERS************** //

  
const handleDeleteProduct = async (productId, productTitle) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${productTitle}"?\n\nThis action cannot be undone and will remove the product from both your local database and Shopify store.`
  );

  if (!confirmDelete) return;

  try {
    setIsDeleting(true);
    const token = localStorage.getItem("token");

    const response = await axios.delete(
      `http://localhost:5000/api/shopify/products/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      alert(`Product "${productTitle}" deleted successfully!`);
      
      // Remove from selected products if it was selected
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      
      // Refresh the product list
      await fetchShopifyProducts(pagination.current);
      await fetchProductAnalytics();
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    alert(
      error.response?.data?.message || 
      `Failed to delete product "${productTitle}". Please try again.`
    );
  } finally {
    setIsDeleting(false);
  }
};

// Bulk delete function
const handleBulkDelete = async () => {
  if (selectedProducts.length === 0) {
    alert("Please select products to delete");
    return;
  }

  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${selectedProducts.length} selected product(s)?\n\nThis action cannot be undone and will remove the products from both your local database and Shopify store.`
  );

  if (!confirmDelete) return;

  try {
    setIsBulkDeleting(true);
    const token = localStorage.getItem("token");

    const response = await axios.delete(
      "http://localhost:5000/api/shopify/products",
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { productIds: selectedProducts },
      }
    );

    if (response.data.success) {
      const { results } = response.data;
      
      let message = `Bulk deletion completed!\n\n`;
      message += `✅ Successfully deleted: ${results.successful.length} products\n`;
      
      if (results.failed.length > 0) {
        message += `❌ Failed to delete: ${results.failed.length} products\n\n`;
        message += `Failed products:\n`;
        results.failed.forEach(product => {
          message += `• ${product.title}\n`;
        });
      }
      
      alert(message);
      
      // Clear selected products
      setSelectedProducts([]);
      
      // Refresh the product list
      await fetchShopifyProducts(pagination.current);
      await fetchProductAnalytics();
    }
  } catch (error) {
    console.error("Error in bulk delete:", error);
    alert(
      error.response?.data?.message || 
      "Failed to delete selected products. Please try again."
    );
  } finally {
    setIsBulkDeleting(false);
  }
};

  const handleProductView = (product) => {
    setCurrentProduct(product);
    setIsEditingProduct(false);
    setShowProductModal(true);
  };

  const handleProductEdit = (product) => {
    setCurrentProduct(product);
    setIsEditingProduct(true);
    setShowProductModal(true);
  };

  const handleProductSave = async (productId, formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/shopify/products/${productId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Product updated successfully!");
        await fetchShopifyProducts(pagination.current);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAllProducts = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(shopifyProducts.map((product) => product._id));
    }
    setSelectAll(!selectAll);
  };

  // **************SEARCH FUNCTIONALITY************** //

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Search debounce
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500),
    []
  );

  // ********************FUNCTIONS FOR METAL PRICE MANAGEMENT******************** //
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

  // Function to calculate metal price
  const calculateMetalPrice = () => {
  const { type, purity, netWeight } = newProductForm.metalConfig;
  
  if (!type || !netWeight || parseFloat(netWeight) <= 0) {
    return 0;
  }

  let pricePerGram = 0;
  
  if (type === 'Gold') {
    if (!purity) return 0;
    
    switch (purity) {
      case '24k':
        pricePerGram = metalPrices.gold24K || 0;
        break;
      case '22k':
        pricePerGram = metalPrices.gold22K || 0;
        break;
      case '18k':
        pricePerGram = metalPrices.gold18K || 0;
        break;
      case '14k':
        pricePerGram = metalPrices.gold14K || 0;
        break;
      default:
        pricePerGram = 0;
    }
  } else if (type === 'Silver') {
    pricePerGram = metalPrices.silver || 0;
  }

  const totalMetalPrice = pricePerGram * parseFloat(netWeight);
  return isNaN(totalMetalPrice) ? 0 : totalMetalPrice;
};


  const handlePriceChange = useCallback((metal, value) => {
    setMetalPrices((prev) => ({
      ...prev,
      [metal]: parseFloat(value) || 0,
    }));
  }, []);

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
        fetchMetalPrices();

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
        setLivePrices(data.livePrices);
        setLastUpdated(data.lastUpdated);
        setLiveDataSource(data.source);

        saveLivePricesToStorage(data.livePrices, data.lastUpdated, data.source);

        alert("Live prices fetched successfully!");
      } else {
        alert(data.message || "Failed to fetch live prices");
      }
    } catch (error) {
      console.error("Error fetching live prices:", error);
      alert("Failed to fetch live prices. Please try again.");
    } finally {
      setIsFetchingLive(false);
    }
  };

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
        setMetalPrices({
          gold24K: data.metalPrices.gold24K,
          gold22K: data.metalPrices.gold22K,
          gold18K: data.metalPrices.gold18K,
          gold14K: data.metalPrices.gold14K,
          silver: data.metalPrices.silver,
        });

        setLivePrices(data.livePrices);
        setLastUpdated(data.syncedAt);
        setLiveDataSource("GoldAPI.io (Synced)");

        saveLivePricesToStorage(
          data.livePrices,
          data.syncedAt,
          "GoldAPI.io (Synced)"
        );

        alert("Prices synced successfully from live market data!");
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

  const saveLivePricesToStorage = (prices, timestamp, source) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIVE_PRICES, JSON.stringify(prices));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, timestamp);
      localStorage.setItem(STORAGE_KEYS.LIVE_DATA_SOURCE, source);
    } catch (error) {
      console.error("Error saving live prices to localStorage:", error);
    }
  };

  const loadLivePricesFromStorage = () => {
    try {
      const savedPrices = localStorage.getItem(STORAGE_KEYS.LIVE_PRICES);
      const savedTimestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
      const savedSource = localStorage.getItem(STORAGE_KEYS.LIVE_DATA_SOURCE);

      if (savedPrices) {
        const parsedPrices = JSON.parse(savedPrices);

        if (
          parsedPrices &&
          typeof parsedPrices === "object" &&
          (parsedPrices.gold24K || parsedPrices.silver)
        ) {
          setLivePrices(parsedPrices);
        } else {
          localStorage.removeItem(STORAGE_KEYS.LIVE_PRICES);
        }
      }

      if (savedTimestamp) {
        const timestamp = new Date(savedTimestamp);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (timestamp >= oneWeekAgo && timestamp <= now) {
          setLastUpdated(savedTimestamp);
        } else {
          localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
        }
      }

      if (savedSource) {
        setLiveDataSource(savedSource);
      }
    } catch (error) {
      console.error("Error loading live prices from localStorage:", error);
      localStorage.removeItem(STORAGE_KEYS.LIVE_PRICES);
      localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
      localStorage.removeItem(STORAGE_KEYS.LIVE_DATA_SOURCE);
    }
  };

  // ********************FUNCTION FOR LOGO MANAGEMENT******************** //

  // Fetch current logo from the server
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

  // Handle logo edit button click
  const handleLogoEdit = () => {
    setShowLogoModal(true);
  };

  // Handle file selection for logo upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        if (file.size <= 5 * 1024 * 1024) {
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

  // Handle logo upload
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

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowLogoModal(false);
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ***************HANDLE LOGOUT CONFIRMATION*************** //

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  // FUNCTION TO TOGGLE ACCORDION SECTIONS
  // THIS FUNCTION WILL SET THE ACTIVE ACCORDION SECTION OR CLOSE IT IF IT'S ALREADY ACTIVE

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  // ********************FUNCTIONS FOR FETCHING THE MM TO CT CONVERSIONS******************** //

  const fetchMmToCtConversions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/mm-to-ct");
      if (response.data.success) {
        setMmToCtConversions(response.data.conversions);
      }
    } catch (error) {
      console.error("Error fetching MM to CT conversions:", error);
    }
  };

  // ********************FUNCTIONS FOR FETCHING THE PRICE PER CARAT BASED ON THE TOTAL WEIGHT OF THE DIAMOND******************** //

  const fetchDiamondPricesForCalc = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/diamond-prices"
      );
      if (response.data.success) {
        setDiamondPricesForCalc(response.data.diamondPrices);
      }
    } catch (error) {
      console.error("Error fetching diamond prices:", error);
    }
  };

  // ********************FUNCTIONS FOR DIAMOND PRICE MANAGEMENT******************** //

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

    if (parseFloat(newDiamondPrice.pricePerCarat) <= 0) {
      alert("Price per carat must be greater than 0.");
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

  // ********************FUNCTIONS FOR FETCHING THE PRICE PER CARAT BASED ON THE TOTAL WEIGHT OF THE STONE******************** //

  const fetchStonePricesForCalc = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/stone-prices"
      );
      if (response.data.success) {
        setStonePricesData(response.data.stonePrices);
      }
    } catch (error) {
      console.error("Error fetching stone prices:", error);
    }
  };

  // ********************FUNCTIONS FOR STONE PRICE MANAGEMENT******************** //

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

    if (parseFloat(newStonePrice.rate) <= 0) {
      alert("Rate must be greater than 0.");
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

  // ***********************FORMAT CURRENCY FOR DISPLAY*********************** //

  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ***********************FORMAT LAST UPDATED TIME*********************** //

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return "Never";

    try {
      const date = new Date(timestamp);

      if (isNaN(date.getTime())) {
        console.error("Invalid timestamp:", timestamp);
        return "Invalid Date";
      }

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

  // ***********************CALCULATE PRICE CHANGE*********************** //

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

  // ***********************FUNCTIONS FOR Mm to Ct CONVERSION*********************** //

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

  // ********************FUNCTIONS FOR MAKING CHARGES MANAGEMENT******************** //

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

  // Function to handle making charge selection
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

  // HELPER FUNCTIONS FOR THE ADD PRODUCT FORM
  const resetNewProductForm = () => {
    setNewProductForm({
      title: "",
      description: "",
      productType: "",
      vendor: "",
      tags: "",
      media: [
        {
          type: "upload",
          file: null,
          url: "",
          preview: "",
          mediaType: "image",
        },
      ],
      inventory: {
        quantity: "",
        sku: "",
        barcode: "",
      },
      weight: {
        value: "",
        unit: "kg",
      },
      seo: {
        pageTitle: "",
        metaDescription: "",
        urlHandle: "",
      },
      metalConfig: {},
      diamondConfig: [],
      stoneConfig: [],
      pricingConfig: {
      wastagePercentage: "",
      miscCharges: "",
      shippingChargesPercentage: "",
      taxPercentage: "",
      markupPercentage: "",
      compareAtMarginPercentage: "",
    }, // Changed from {} to []
    });
  };

  const handleMediaAdd = () => {
    if (newProductForm.media.length < 5) {
      // Changed limit to 5
      setNewProductForm((prev) => ({
        ...prev,
        media: [
          ...prev.media,
          {
            type: "upload",
            file: null,
            url: "",
            preview: "",
            mediaType: "image",
          },
        ],
      }));
    }
  };

  const handleMediaRemove = (index) => {
    if (newProductForm.media.length > 1) {
      setNewProductForm((prev) => ({
        ...prev,
        media: prev.media.filter((_, i) => i !== index),
      }));
    }
  };

  const handleMediaChange = (index, field, value) => {
    setNewProductForm((prev) => ({
      ...prev,
      media: prev.media.map((media, i) =>
        i === index ? { ...media, [field]: value } : media
      ),
    }));
  };

  const handleMediaFileChange = (index, file) => {
    if (file) {
      // Validate file type and size
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const validVideoTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/mov",
        "video/avi",
      ];
      const maxImageSize = 10 * 1024 * 1024; // 10MB for images
      const maxVideoSize = 100 * 1024 * 1024; // 100MB for videos

      const isImage = validImageTypes.includes(file.type);
      const isVideo = validVideoTypes.includes(file.type);

      if (!isImage && !isVideo) {
        alert(
          "Please select a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG, MOV, AVI) file."
        );
        return;
      }

      if (isImage && file.size > maxImageSize) {
        alert("Image file size must be less than 10MB.");
        return;
      }

      if (isVideo && file.size > maxVideoSize) {
        alert("Video file size must be less than 100MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProductForm((prev) => ({
          ...prev,
          media: prev.media.map((media, i) =>
            i === index
              ? {
                  ...media,
                  file,
                  preview: e.target.result,
                  mediaType: isImage ? "image" : "video",
                }
              : media
          ),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // HELPER FUNCTION TO DETECT MEDIA TYPE FROM URL //
  // This function checks the URL for common image and video file extensions

  const detectMediaTypeFromUrl = (url) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];

    const lowerUrl = url.toLowerCase();

    if (imageExtensions.some((ext) => lowerUrl.includes(ext))) {
      return "image";
    } else if (videoExtensions.some((ext) => lowerUrl.includes(ext))) {
      return "video";
    }
    return "image"; // default to image
  };

  const generateUrlHandle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // ******************FUNCTION TO HANDLE ADDING A NEW PRODUCT****************** //
  const handleAddProduct = async () => {
  if (!newProductForm.title.trim()) {
    alert("Product title is required");
    return;
  }

  try {
    setIsAddingProduct(true);
    const token = localStorage.getItem("token");

    // Prepare form data for file uploads
    const formData = new FormData();
    formData.append("title", newProductForm.title);
    formData.append("description", newProductForm.description);
    formData.append("productType", newProductForm.productType);
    formData.append("vendor", newProductForm.vendor);
    formData.append("tags", newProductForm.tags);
    formData.append("inventory", JSON.stringify(newProductForm.inventory));
    formData.append("weight", JSON.stringify(newProductForm.weight));
    formData.append("seo", JSON.stringify(newProductForm.seo));
    formData.append(
      "metalConfig",
      JSON.stringify(newProductForm.metalConfig)
    );
    formData.append(
      "diamondConfig",
      JSON.stringify(newProductForm.diamondConfig)
    );
    formData.append(
      "stoneConfig",
      JSON.stringify(newProductForm.stoneConfig)
    );

    // Add media - separate files and URLs
    const mediaUrls = [];
    newProductForm.media.forEach((media, index) => {
      if (media.file) {
        formData.append("media", media.file);
      } else if (media.url && media.url.trim()) {
        mediaUrls.push({
          url: media.url.trim(),
          type: media.mediaType,
        });
      }
    });

    // Add media URLs as a JSON string
    if (mediaUrls.length > 0) {
      formData.append("mediaUrls", JSON.stringify(mediaUrls));
    }

    console.log("Sending product data to backend...");

    const response = await axios.post(
      "http://localhost:5000/api/shopify/add-product",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success) {
      alert("Product added successfully to Shopify!");
      setShowAddProductModal(false);
      resetNewProductForm();
      
      // Sync products from Shopify to get the latest data including the newly created product
      console.log("Syncing products from Shopify...");
      try {
        // Call the same sync function that the sync button uses
        await syncShopifyProducts(false); // false for incremental sync, true for full sync
      } catch (syncError) {
        console.error("Error syncing products after creation:", syncError);
        // Even if sync fails, show a message but don't fail the whole operation
        alert("Product created successfully, but failed to sync product list. Please click the sync button manually.");
      }
    }
  } catch (error) {
    console.error("Error adding product:", error);
    console.error("Error details:", error.response?.data);
    
    // Show more specific error messages
    let errorMessage = "Failed to add product";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message.includes("Only image and video files are allowed")) {
      errorMessage = "Please upload only image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG, MOV, AVI) files";
    }
    
    alert(errorMessage);
  } finally {
    setIsAddingProduct(false);
  }
};



  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setNewProductForm((prev) => ({
      ...prev,
      title: newTitle,
      seo: {
        ...prev.seo,
        urlHandle: isUrlManuallyEdited
          ? prev.seo.urlHandle
          : newTitle.trim().toLowerCase().replace(/\s+/g, "-"),
      },
    }));
  };

  const handleUrlChange = (e) => {
    setIsUrlManuallyEdited(true); // stop auto sync
    const value = e.target.value;
    setNewProductForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        urlHandle: value,
      },
    }));
  };

  /// ****************** ///////HELPER FUNCTIONS TO CALCULATE TOTAL PRICES/////// ****************** //

  const calculateTotalDiamondPrice = () => {
    return newProductForm.diamondConfig.reduce((total, diamond) => {
      return total + (parseFloat(diamond.diamondValue) || 0);
    }, 0);
  };
  const calculateTotalStonePrice = () => {
    return newProductForm.stoneConfig.reduce((total, stone) => {
      return total + (parseFloat(stone.stoneValue) || 0);
    }, 0);
  };

  // ****************** ///////RENDER FUNCTIONS/////// ****************** //

  const renderProductsContent = () => (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-100">Total Products</h4>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📦</span>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {productAnalytics.totalProducts.toLocaleString()}
            </p>
            <p className="text-sm text-blue-200 mt-1">
              {syncStatus.isConfigured ? "Synced from store" : "Not synced"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-green-100">Active Products</h4>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {productAnalytics.activeProducts.toLocaleString()}
            </p>
            <p className="text-sm text-green-200 mt-1">
              {productAnalytics.totalProducts > 0
                ? `${(
                    (productAnalytics.activeProducts /
                      productAnalytics.totalProducts) *
                    100
                  ).toFixed(1)}% of total`
                : "No products"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-yellow-100">Draft Products</h4>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {productAnalytics.draftProducts.toLocaleString()}
            </p>
            <p className="text-sm text-yellow-200 mt-1">
              {productAnalytics.totalProducts > 0
                ? `${(
                    (productAnalytics.draftProducts /
                      productAnalytics.totalProducts) *
                    100
                  ).toFixed(1)}% of total`
                : "No products"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-100">Archived Products</h4>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🗃️</span>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {productAnalytics.archivedProducts.toLocaleString()}
            </p>
            <p className="text-sm text-gray-200 mt-1">
              {productAnalytics.totalProducts > 0
                ? `${(
                    (productAnalytics.archivedProducts /
                      productAnalytics.totalProducts) *
                    100
                  ).toFixed(1)}% of total`
                : "No products"}
            </p>
          </div>
        </div>
      </div>

      {/* Top Vendors Section - Add this after the main analytics cards */}
      {/* {productAnalytics.topVendors &&
        productAnalytics.topVendors.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Vendors
              </h3>
              <span className="text-sm text-gray-600">
                Last updated:{" "}
                {syncStatus.lastSync
                  ? new Date(syncStatus.lastSync).toLocaleString()
                  : "Never"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {productAnalytics.topVendors.slice(0, 5).map((vendor, index) => (
                <div
                  key={vendor._id || index}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-indigo-900 truncate">
                      {vendor._id || "Unknown Vendor"}
                    </h4>
                    <p className="text-2xl font-bold text-indigo-700 mt-2">
                      {vendor.count}
                    </p>
                    <p className="text-sm text-indigo-600">products</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

      {/* Sync Status and Controls */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Shopify Integration
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Status:</span>{" "}
                {syncStatus.isConfigured ? "✅ Connected" : "❌ Not Configured"}
              </p>
              {syncStatus.storeUrl && (
                <p>
                  <span className="font-medium">Store:</span>{" "}
                  {syncStatus.storeUrl}
                </p>
              )}
              {syncStatus.lastSync && (
                <p>
                  <span className="font-medium">Last Sync:</span>{" "}
                  {new Date(syncStatus.lastSync).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isShopifyConfigured && (
              <>
                <button
                  onClick={() => syncShopifyProducts(true)}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw
                    size={16}
                    className={isSyncing ? "animate-spin" : ""}
                  />
                  {isSyncing ? "Syncing..." : "Sync"}
                </button>
              </>
            )}

            

            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add New Product
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {productFilters.statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedVendor}
              onChange={(e) => {
                setSelectedVendor(e.target.value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Vendors</option>
              {productFilters.vendors.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>

            <select
              value={selectedProductType}
              onChange={(e) => {
                setSelectedProductType(e.target.value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {productFilters.productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {selectedProducts.length} product
                {selectedProducts.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                {selectedProducts.length > 0 && (
    <button
      onClick={handleBulkDelete}
      disabled={isBulkDeleting}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
    >
      {isBulkDeleting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Deleting...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete Selected ({selectedProducts.length})</span>
        </>
      )}
    </button>
  )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {/* Products List - Replace the existing Products Grid section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden">
        {!isShopifyConfigured ? (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Shopify Not Configured
            </h3>
            <p className="text-gray-600 mb-4">
              Please configure your Shopify store connection in the
              Configuration tab to start managing products.
            </p>
            <button
              onClick={() => {
                setActiveMainTab("configuration");
                setActiveConfigTab("shopify-config");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Configure Shopify
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : shopifyProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m8-8V4.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ||
              selectedStatus ||
              selectedVendor ||
              selectedProductType
                ? "No products match your current filters. Try adjusting your search criteria."
                : 'No products have been synced yet. Click "Sync" to fetch products from your Shopify store.'}
            </p>
            {!(
              searchTerm ||
              selectedStatus ||
              selectedVendor ||
              selectedProductType
            ) && (
              <button
                onClick={() => syncShopifyProducts(false)}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
              >
                {isSyncing ? "Syncing..." : "Sync Products Now"}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllProducts}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({shopifyProducts.length} products on this page)
                </span>
              </label>
            </div>

            {/* Products List Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shopifyProducts.map((product) => {
                    const mainImage =
                      product.images?.[0]?.url ||
                      "https://placehold.co/80x80?text=No+Image";
                    const mainVariant = product.variants?.[0] || {};
                    const isSelected = selectedProducts.includes(product._id);

                    return (
                      <tr
                        key={product._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        {/* Product Info with Image */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleProductSelect(product._id)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                            />
                            <div className="flex-shrink-0 h-16 w-16">
                              <img
                                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                src={mainImage}
                                alt={product.title}
                              />
                            </div>
                            <div className="ml-4 min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {product.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {product.shopifyId}
                              </div>
                              {product.handle && (
                                <div className="text-xs text-gray-400">
                                  Handle: {product.handle}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {product.vendor && (
                              <div className="flex items-center mb-1">
                                <span className="font-medium">Vendor:</span>
                                <span className="ml-1">{product.vendor}</span>
                              </div>
                            )}
                            {product.productType && (
                              <div className="flex items-center mb-1">
                                <span className="font-medium">Type:</span>
                                <span className="ml-1">
                                  {product.productType}
                                </span>
                              </div>
                            )}
                            {product.variants &&
                              product.variants.length > 1 && (
                                <div className="text-xs text-blue-600">
                                  {product.variants.length} variants
                                </div>
                              )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.status === "active"
                                ? "bg-green-100 text-green-800"
                                : product.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          {mainVariant.price ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                ₹{mainVariant.price.toLocaleString()}
                              </div>
                              {mainVariant.compareAtPrice &&
                                mainVariant.compareAtPrice >
                                  mainVariant.price && (
                                  <div className="text-xs text-gray-500 line-through">
                                    ₹
                                    {mainVariant.compareAtPrice.toLocaleString()}
                                  </div>
                                )}
                              {mainVariant.sku && (
                                <div className="text-xs text-gray-400">
                                  SKU: {mainVariant.sku}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No price
                            </span>
                          )}
                        </td>

                        {/* Tags */}
                        <td className="px-6 py-4">
                          {product.tags && product.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {product.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                  +{product.tags.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No tags
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* <button
                              onClick={() => handleProductView(product)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <Eye size={14} className="mr-1" />
                              View
                            </button> */}
                            <button
                              onClick={() => handleProductEdit(product)}
                              className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </button>
                            <button
        onClick={() => handleDeleteProduct(product._id, product.title)}
        disabled={isDeleting}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Delete Product"
      >
        {isDeleting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.current} of {pagination.total}
                    <span className="ml-1">
                      ({pagination.totalProducts} total products)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        fetchShopifyProducts(pagination.current - 1)
                      }
                      disabled={!pagination.hasPrev || isLoading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                      {pagination.current} / {pagination.total}
                    </span>
                    <button
                      onClick={() =>
                        fetchShopifyProducts(pagination.current + 1)
                      }
                      disabled={!pagination.hasNext || isLoading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderShopifyConfigContent = () => (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Shopify Store Configuration
        </h3>

        {/* Current Configuration Status */}
        {isShopifyConfigured && shopifyConfig && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">
              ✅ Currently Connected
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>
                <span className="font-medium">Store URL:</span>{" "}
                {shopifyConfig.storeUrl}
              </p>
              <p>
                <span className="font-medium">API Version:</span>{" "}
                {shopifyConfig.apiVersion}
              </p>
              {/* <p>
                <span className="font-medium">Connected By:</span>{" "}
                {shopifyConfig.updatedBy?.name || "Admin"}
              </p> */}
              <p>
                <span className="font-medium">Connected At:</span>{" "}
                {new Date(shopifyConfig.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Sync Status */}
        {/* <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">🔄 Sync Status</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-medium">Products Synced:</span>{" "}
              {syncStatus.productCount.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Last Sync:</span>{" "}
              {syncStatus.lastSync
                ? new Date(syncStatus.lastSync).toLocaleString()
                : "Never"}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              {syncStatus.isConfigured ? "✅ Ready" : "❌ Not Configured"}
            </p>
          </div>
        </div> */}

        {/* Configuration Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="your-store.myshopify.com"
              value={shopifyConfigForm.storeUrl}
              onChange={(e) =>
                setShopifyConfigForm((prev) => ({
                  ...prev,
                  storeUrl: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your Shopify store URL without https:// (e.g.,
              mystore.myshopify.com)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder={
                isShopifyConfigured
                  ? "Enter new token to update"
                  : "Enter your private app access token"
              }
              value={shopifyConfigForm.accessToken}
              onChange={(e) =>
                setShopifyConfigForm((prev) => ({
                  ...prev,
                  accessToken: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your private app access token with read/write permissions for
              products
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Version
            </label>
            <select
              value={shopifyConfigForm.apiVersion}
              onChange={(e) =>
                setShopifyConfigForm((prev) => ({
                  ...prev,
                  apiVersion: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2024-01">2024-01 (Recommended)</option>
              <option value="2023-10">2023-10</option>
              <option value="2023-07">2023-07</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={saveShopifyConfig}
              disabled={
                isConfiguringShopify ||
                !shopifyConfigForm.storeUrl ||
                !shopifyConfigForm.accessToken
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
            >
              {isConfiguringShopify
                ? "Configuring..."
                : isShopifyConfigured
                ? "Update Configuration"
                : "Save Configuration"}
            </button>

            {isShopifyConfigured && (
              <button
                onClick={() => {
                  setShopifyConfigForm({
                    storeUrl: shopifyConfig.storeUrl,
                    accessToken: "",
                    apiVersion: shopifyConfig.apiVersion,
                  });
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Reset Form
              </button>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        {/* <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            📖 Setup Instructions
          </h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>1.</strong> Go to your Shopify Admin → Apps → App and
              sales channel settings
            </p>
            <p>
              <strong>2.</strong> Click "Develop apps" → "Create an app"
            </p>
            <p>
              <strong>3.</strong> Configure Admin API access scopes:{" "}
              <code className="bg-white px-1 rounded">
                read_products, write_products
              </code>
            </p>
            <p>
              <strong>4.</strong> Install the app and copy the Admin API access
              token
            </p>
            <p>
              <strong>5.</strong> Enter your store URL and access token above
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );

  const renderRateChartsContent = () => (
    <div className="space-y-6">
      {lastUpdate && (
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
      )}

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
            {selectedMmToCtIds.length > 0 && (
              <button
                onClick={bulkDeleteSelected}
                disabled={isMmToCtLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Selected ({selectedMmToCtIds.length})
              </button>
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
            <div className="text-4xl text-gray-300 mb-4">📏</div>
            <p className="text-lg mb-2">No MM to CT conversions found</p>
            <p className="text-sm">Add your first conversion above</p>
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
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMmToCt(null)}
                                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded flex items-center gap-1"
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
                                <Edit size={12} />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteMmToCtEntry(item._id)}
                                disabled={isMmToCtLoading}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs rounded flex items-center gap-1"
                              >
                                <Trash2 size={12} />
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
            <div className="text-4xl text-gray-300 mb-4">💰</div>
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
                        <input
                          type="checkbox"
                          checked={selectedMakingChargeIds.includes(item._id)}
                          onChange={() => handleMakingChargeSelection(item._id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
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
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMakingChargeIds.includes(item._id)}
                          onChange={() => handleMakingChargeSelection(item._id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
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
          </div>
        )}
      </div>

      {/* Minimum Making Charge Configuration */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 max-w-sm">
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
          If calculated making charge is below this minimum, the minimum charge
          will be applied automatically.
        </p>
      </div>
    </div>
  );

  const renderConfigurationContent = () => (
    <div className="space-y-4">
      {/* Configuration Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "shopify-config", name: "Shopify Configuration" },
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
        {activeConfigTab === "shopify-config" && renderShopifyConfigContent()}
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

      {/* Product Modal */}
      <ProductModal
        product={currentProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setCurrentProduct(null);
          setIsEditingProduct(false);
        }}
        onSave={handleProductSave}
        isEditing={isEditingProduct}
      />

      {/* Add New Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Product
              </h2>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  resetNewProductForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={newProductForm.title}
                      onChange={handleTitleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProductForm.description}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type
                    </label>
                    <input
                      type="text"
                      value={newProductForm.productType}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          productType: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Ring, Necklace, Earrings"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor
                    </label>
                    <input
                      type="text"
                      value={newProductForm.vendor}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          vendor: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter vendor name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newProductForm.tags}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., jewelry, gold, diamond, luxury"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Product Media
                  </h3>
                  {newProductForm.media.length < 5 && (
                    <button
                      onClick={handleMediaAdd}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Add Media (Max 5)
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {newProductForm.media.map((media, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Media {index + 1}
                        </span>
                        {newProductForm.media.length > 1 && (
                          <button
                            onClick={() => handleMediaRemove(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Method
                          </label>
                          <select
                            value={media.type}
                            onChange={(e) =>
                              handleMediaChange(index, "type", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="upload">Upload File</option>
                            <option value="url">Media URL</option>
                          </select>
                        </div>

                        <div>
                          {media.type === "upload" ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Choose File
                              </label>
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg,video/mov,video/avi"
                                onChange={(e) =>
                                  handleMediaFileChange(
                                    index,
                                    e.target.files[0]
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Images: JPEG, PNG, GIF, WebP (max 10MB)
                                <br />
                                Videos: MP4, WebM, OGG, MOV, AVI (max 100MB)
                              </p>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Media URL
                              </label>
                              <input
                                type="url"
                                value={media.url}
                                onChange={(e) => {
                                  const url = e.target.value;
                                  handleMediaChange(index, "url", url);
                                  if (url) {
                                    handleMediaChange(
                                      index,
                                      "mediaType",
                                      detectMediaTypeFromUrl(url)
                                    );
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://example.com/media.jpg or .mp4"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Paste a direct link to an image or video file
                              </p>
                            </div>
                          )}
                        </div>
                      </div>*/}

                      
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Media URL
  </label>
  <input
    type="url"
    value={media.url}
    onChange={(e) => {
      const url = e.target.value;
      handleMediaChange(index, "url", url);
      if (url) {
        handleMediaChange(
          index,
          "mediaType",
          detectMediaTypeFromUrl(url)
        );
      }
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="https://example.com/media.jpg or .mp4"
  />
  <p className="text-xs text-gray-500 mt-1">
    Paste a direct link to an image or video file
  </p>
</div>

                      {/* Media Type Indicator */}
                      {(media.file || media.url) && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              media.mediaType === "video"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {media.mediaType === "video"
                              ? "🎥 Video"
                              : "🖼️ Image"}
                          </span>
                        </div>
                      )}

                      {/* Media Preview */}
                      {(media.preview || media.url) && (
                        <div className="mt-3">
                          {media.mediaType === "video" ? (
                            <video
                              src={media.preview || media.url}
                              className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                              controls
                              muted
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <img
                              src={media.preview || media.url}
                              alt={`Preview ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Inventory Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={newProductForm.inventory.quantity}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          inventory: {
                            ...prev.inventory,
                            quantity: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={newProductForm.inventory.sku}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          inventory: { ...prev.inventory, sku: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={newProductForm.inventory.barcode}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          inventory: {
                            ...prev.inventory,
                            barcode: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter barcode"
                    />
                  </div>
                </div>
              </div>

              {/* Weight Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Weight Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProductForm.weight.value}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          weight: { ...prev.weight, value: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={newProductForm.weight.unit}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          weight: { ...prev.weight, unit: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="lb">Pounds (lb)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEO Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  SEO Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={newProductForm.seo.pageTitle}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, pageTitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SEO page title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={newProductForm.seo.metaDescription}
                      onChange={(e) =>
                        setNewProductForm((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, metaDescription: e.target.value },
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SEO meta description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Handle
                    </label>
                    <input
                      type="text"
                      value={newProductForm.seo.urlHandle}
                      onChange={handleUrlChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="product-url-handle"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated from title, but you can customize it
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Pricing Configuration
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Product price will be calculated automatically based on metal,
                  diamond, and stone configurations.
                </p>

                {/* Metal Configuration */}
                {/* Metal Configuration */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Metal Configuration
                  </h4>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Metal Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Metal Type *
                        </label>
                        <select
                          value={newProductForm.metalConfig.type || ""}
                          onChange={(e) =>
                            setNewProductForm((prev) => ({
                              ...prev,
                              metalConfig: {
                                ...prev.metalConfig,
                                type: e.target.value,
                                purity:
                                  e.target.value === "Silver"
                                    ? ""
                                    : prev.metalConfig.purity, // Clear purity if Silver
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Metal</option>
                          <option value="Gold">Gold</option>
                          <option value="Silver">Silver</option>
                        </select>
                      </div>

                      {/* Purity - Only show if Gold is selected */}
                      {newProductForm.metalConfig.type === "Gold" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purity *
                          </label>
                          <select
                            value={newProductForm.metalConfig.purity || ""}
                            onChange={(e) =>
                              setNewProductForm((prev) => ({
                                ...prev,
                                metalConfig: {
                                  ...prev.metalConfig,
                                  purity: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Purity</option>
                            <option value="24k">24K</option>
                            <option value="22k">22K</option>
                            <option value="18k">18K</option>
                            <option value="14k">14K</option>
                          </select>
                        </div>
                      )}

                      {/* Gross Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gross Weight (g)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProductForm.metalConfig.grossWeight || ""}
                          onChange={(e) =>
                            setNewProductForm((prev) => ({
                              ...prev,
                              metalConfig: {
                                ...prev.metalConfig,
                                grossWeight: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Net Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Net Weight (g)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProductForm.metalConfig.netWeight || ""}
                          onChange={(e) =>
                            setNewProductForm((prev) => ({
                              ...prev,
                              metalConfig: {
                                ...prev.metalConfig,
                                netWeight: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {newProductForm.metalConfig.type && newProductForm.metalConfig.netWeight && parseFloat(newProductForm.metalConfig.netWeight) > 0 && (
  <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mt-4">
    <h4 className="text-md font-medium text-amber-900 mb-3">
      Metal Price Calculation
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-1">
          Metal Type
        </label>
        <div className="text-sm text-amber-900 font-medium">
          {newProductForm.metalConfig.type}
          {newProductForm.metalConfig.type === 'Gold' && newProductForm.metalConfig.purity && (
            <span className="ml-1">({newProductForm.metalConfig.purity.toUpperCase()})</span>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-1">
          Price per Gram
        </label>
        <div className="text-sm text-amber-900 font-medium">
          ₹{(() => {
            const { type, purity } = newProductForm.metalConfig;
            if (type === 'Gold' && purity) {
              switch (purity) {
                case '24k': return (metalPrices.gold24K || 0).toFixed(2);
                case '22k': return (metalPrices.gold22K || 0).toFixed(2);
                case '18k': return (metalPrices.gold18K || 0).toFixed(2);
                case '14k': return (metalPrices.gold14K || 0).toFixed(2);
                default: return '0.00';
              }
            } else if (type === 'Silver') {
              return (metalPrices.silver || 0).toFixed(2);
            }
            return '0.00';
          })()}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-1">
          Net Weight
        </label>
        <div className="text-sm text-amber-900 font-medium">
          {parseFloat(newProductForm.metalConfig.netWeight).toFixed(2)}g
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-amber-800 mb-1">
          Total Metal Price
        </label>
        <div className="text-lg text-amber-900 font-bold">
          ₹{calculateMetalPrice().toFixed(2)}
        </div>
      </div>
    </div>
    
    <div className="mt-3 p-3 bg-amber-100 rounded-lg">
      <div className="text-sm text-amber-800">
        <strong>Calculation:</strong> ₹{(() => {
          const { type, purity } = newProductForm.metalConfig;
          if (type === 'Gold' && purity) {
            switch (purity) {
              case '24k': return (metalPrices.gold24K || 0).toFixed(2);
              case '22k': return (metalPrices.gold22K || 0).toFixed(2);
              case '18k': return (metalPrices.gold18K || 0).toFixed(2);
              case '14k': return (metalPrices.gold14K || 0).toFixed(2);
              default: return '0.00';
            }
          } else if (type === 'Silver') {
            return (metalPrices.silver || 0).toFixed(2);
          }
          return '0.00';
        })()} (per gram) × {parseFloat(newProductForm.metalConfig.netWeight).toFixed(2)}g = ₹{calculateMetalPrice().toFixed(2)}
      </div>
    </div>
  </div>
)}

                {/* Diamond Configuration */}
                {/* Diamond Configuration */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-800">
                      Diamond Configuration
                    </h4>
                    <button
                      onClick={() => {
                        if (newProductForm.diamondConfig.length < 4) {
                          setNewProductForm((prev) => ({
                            ...prev,
                            diamondConfig: [
                              ...prev.diamondConfig,
                              {
                                id: Date.now(),
                                shape: "",
                                color: "",
                                clarity: "",
                                pieces: "",
                                weightType: "mm", // 'mm' or 'ct'
                                mmValue: "",
                                ctValue: "",
                                totalWeight: 0,
                                diamondValue: 0,
                              },
                            ],
                          }));
                        }
                      }}
                      disabled={newProductForm.diamondConfig.length >= 4}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-sm rounded-lg transition-colors"
                    >
                      Add Diamond (Max 4)
                    </button>
                  </div>

                  <div className="space-y-4">
                    {newProductForm.diamondConfig.length === 0 ? (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 italic">
                          No diamonds added. Click "Add Diamond" to add diamond
                          configuration.
                        </p>
                      </div>
                    ) : (
                      newProductForm.diamondConfig.map((diamond, index) => (
                        <DiamondConfigCard
                          key={diamond.id}
                          diamond={diamond}
                          index={index}
                          mmToCtData={mmToCtConversions}
                          diamondPricesData={diamondPricesForCalc}
                          onUpdate={(updatedDiamond) => {
                            setNewProductForm((prev) => ({
                              ...prev,
                              diamondConfig: prev.diamondConfig.map((d) =>
                                d.id === diamond.id ? updatedDiamond : d
                              ),
                            }));
                          }}
                          onRemove={() => {
                            setNewProductForm((prev) => ({
                              ...prev,
                              diamondConfig: prev.diamondConfig.filter(
                                (d) => d.id !== diamond.id
                              ),
                            }));
                          }}
                        />
                      ))
                    )}
                  </div>

                  {newProductForm.diamondConfig.length > 1 && (
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <h5 className="text-md font-medium text-blue-900">
                          Total Diamond Price
                        </h5>
                        <span className="text-lg font-bold text-blue-900">
                          ₹{calculateTotalDiamondPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stone Configuration */}
                {/* Stone Configuration */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-800">
                      Stone Configuration
                    </h4>
                    <button
                      onClick={() => {
                        setNewProductForm((prev) => ({
                          ...prev,
                          stoneConfig: [
                            ...(prev.stoneConfig || []),
                            {
                              id: Date.now(),
                              stoneType: "",
                              stoneColor: "",
                              pieces: "",
                              weight: "", // Weight per stone in gm
                              totalWeight: 0, // Total weight in gm
                              stoneValue: 0, // Total value
                            },
                          ],
                        }));
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Add Stone
                    </button>
                  </div>

                  <div className="space-y-4">
                    {!newProductForm.stoneConfig ||
                    newProductForm.stoneConfig.length === 0 ? (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 italic">
                          No stones added. Click "Add Stone" to add stone
                          configuration.
                        </p>
                      </div>
                    ) : (
                      newProductForm.stoneConfig.map((stone, index) => (
                        <StoneConfigCard
                          key={stone.id}
                          stone={stone}
                          index={index}
                          stonePricesData={stonePricesData}
                          onUpdate={(updatedStone) => {
                            setNewProductForm((prev) => ({
                              ...prev,
                              stoneConfig: prev.stoneConfig.map((s) =>
                                s.id === stone.id ? updatedStone : s
                              ),
                            }));
                          }}
                          onRemove={() => {
                            setNewProductForm((prev) => ({
                              ...prev,
                              stoneConfig: prev.stoneConfig.filter(
                                (s) => s.id !== stone.id
                              ),
                            }));
                          }}
                        />
                      ))
                    )}
                  </div>
                  {newProductForm.stoneConfig.length > 1 && (
  <div className="bg-green-50 rounded-lg border border-green-200 p-4 mt-4">
    <div className="flex justify-between items-center">
      <h5 className="text-md font-medium text-green-900">Total Stone Price</h5>
      <span className="text-lg font-bold text-green-900">
        ₹{calculateTotalStonePrice().toFixed(2)}
      </span>
    </div>
  </div>
)}
                </div>

               

{/* Additional Pricing Configuration */}
<div className="bg-gray-50 rounded-lg p-4">
  <h3 className="text-lg font-medium text-gray-900 mb-4">
    Additional Pricing Configuration
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Wastage % */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Wastage (%)
      </label>
      <input
        type="number"
        step="0.01"
        value={newProductForm.pricingConfig?.wastagePercentage || ""}
        onChange={(e) =>
          setNewProductForm((prev) => ({
            ...prev,
            pricingConfig: {
              ...prev.pricingConfig,
              wastagePercentage: e.target.value,
            },
          }))
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="0.00"
      />
    </div>

    {/* Misc. Charges */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Misc. Charges (₹)
      </label>
      <input
        type="number"
        step="0.01"
        value={newProductForm.pricingConfig?.miscCharges || ""}
        onChange={(e) =>
          setNewProductForm((prev) => ({
            ...prev,
            pricingConfig: {
              ...prev.pricingConfig,
              miscCharges: e.target.value,
            },
          }))
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="0.00"
      />
    </div>

    {/* Shipping Charges % */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Shipping Charges (%)
      </label>
      <input
        type="number"
        step="0.01"
        value={newProductForm.pricingConfig?.shippingChargesPercentage || ""}
        onChange={(e) =>
          setNewProductForm((prev) => ({
            ...prev,
            pricingConfig: {
              ...prev.pricingConfig,
              shippingChargesPercentage: e.target.value,
            },
          }))
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="0.00"
      />
    </div>

    {/* Tax % */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tax (%)
      </label>
      <input
        type="number"
        step="0.01"
        value={newProductForm.pricingConfig?.taxPercentage || ""}
        onChange={(e) =>
          setNewProductForm((prev) => ({
            ...prev,
            pricingConfig: {
              ...prev.pricingConfig,
              taxPercentage: e.target.value,
            },
          }))
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="0.00"
      />
    </div>

    {/* Markup % */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Markup (%)
      </label>
      <input
        type="number"
        step="0.01"
        value={newProductForm.pricingConfig?.markupPercentage || ""}
        onChange={(e) =>
          setNewProductForm((prev) => ({
            ...prev,
            pricingConfig: {
              ...prev.pricingConfig,
              markupPercentage: e.target.value,
            },
          }))
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="0.00"
      />
    </div>

    {/* Compare At Price Margin % */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Compare At Price Margin (%)
      </label>
      <input
        type="number"
        step="0.01"
        value={newProductForm.pricingConfig?.compareAtMarginPercentage || ""}
        onChange={(e) =>
          setNewProductForm((prev) => ({
            ...prev,
            pricingConfig: {
              ...prev.pricingConfig,
              compareAtMarginPercentage: e.target.value,
            },
          }))
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="0.00"
      />
    </div>
  </div>

  {/* Making Charges - Read Only */}
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Making Charges (₹) - Auto Calculated
    </label>
    <input
      type="number"
      value={calculateMakingCharges().toFixed(2)}
      readOnly
      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
      placeholder="0.00"
    />
    <p className="text-xs text-gray-500 mt-1">
      Calculated based on metal type, purity, and weight range
    </p>
  </div>
</div>
              </div>
            </div>


            {/* {(newProductForm.metalConfig.type && newProductForm.metalConfig.netWeight && parseFloat(newProductForm.metalConfig.netWeight) > 0) || 
 newProductForm.diamondConfig.length > 0 || 
 newProductForm.stoneConfig.length > 0 ? (
  <div className="bg-gray-100 rounded-lg border border-gray-300 p-6 mt-6">
    <h4 className="text-lg font-semibold text-gray-800 mb-4">Price Summary</h4>
    <div className="space-y-2">
      {newProductForm.metalConfig.type && newProductForm.metalConfig.netWeight && parseFloat(newProductForm.metalConfig.netWeight) > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">
            Metal Price ({newProductForm.metalConfig.type}
            {newProductForm.metalConfig.type === 'Gold' && newProductForm.metalConfig.purity && (
              <span> - {newProductForm.metalConfig.purity.toUpperCase()}</span>
            )}):
          </span>
          <span className="font-medium">₹{calculateMetalPrice().toFixed(2)}</span>
        </div>
      )}
      {newProductForm.diamondConfig.length > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Total Diamond Price:</span>
          <span className="font-medium">₹{calculateTotalDiamondPrice().toFixed(2)}</span>
        </div>
      )}
      {newProductForm.stoneConfig.length > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">Total Stone Price:</span>
          <span className="font-medium">₹{calculateTotalStonePrice().toFixed(2)}</span>
        </div>
      )}
      <hr className="my-2" />
      <div className="flex justify-between text-lg font-bold">
        <span>Grand Total:</span>
        <span>₹{(
          calculateMetalPrice() + 
          calculateTotalDiamondPrice() + 
          calculateTotalStonePrice()
        ).toFixed(2)}</span>
      </div>
    </div>
  </div>
) : null} */}


{/* Calculate all values */}
{(() => {
  const metalCost = calculateMetalPrice();
  const diamondPrice = calculateTotalDiamondPrice();
  const stonePrice = calculateTotalStonePrice();
  const makingCharges = calculateMakingCharges();
  
  const pricingConfig = newProductForm.pricingConfig || {};
  const wastagePercentage = parseFloat(pricingConfig.wastagePercentage || 0);
  const miscCharges = parseFloat(pricingConfig.miscCharges || 0);
  const shippingChargesPercentage = parseFloat(pricingConfig.shippingChargesPercentage || 0);
  const taxPercentage = parseFloat(pricingConfig.taxPercentage || 0);
  const markupPercentage = parseFloat(pricingConfig.markupPercentage || 0);
  const compareAtMarginPercentage = parseFloat(pricingConfig.compareAtMarginPercentage || 0);

  const wastageCost = (metalCost * wastagePercentage) / 100;
  const subtotal = metalCost + wastageCost + makingCharges + diamondPrice + stonePrice + miscCharges;
  const shippingCharges = (subtotal * shippingChargesPercentage) / 100;
  const markupAmount = ((subtotal + shippingCharges) * markupPercentage) / 100;
  const taxAmount = ((subtotal + shippingCharges + markupAmount) * taxPercentage) / 100;
  const finalPrice = subtotal + shippingCharges + markupAmount + taxAmount;
  const comparePrice = finalPrice + (finalPrice * compareAtMarginPercentage) / 100;

  // Only show if there's something to calculate
  const hasAnyData = (
    (newProductForm.metalConfig.type && newProductForm.metalConfig.netWeight && parseFloat(newProductForm.metalConfig.netWeight) > 0) || 
    newProductForm.diamondConfig.length > 0 || 
    newProductForm.stoneConfig.length > 0 ||
    Object.values(pricingConfig).some(val => val && parseFloat(val) > 0)
  );

  if (!hasAnyData) return null;

  return (
    <div className="bg-gray-100 rounded-lg border border-gray-300 p-6 mt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Comprehensive Price Summary</h4>
      
      {/* Base Components */}
      <div className="space-y-2 mb-4">
        <h5 className="font-medium text-gray-700 mb-2">Base Components:</h5>
        {metalCost > 0 && (
          <div className="flex justify-between pl-4">
            <span className="text-gray-600">
              Metal Cost ({newProductForm.metalConfig.type}
              {newProductForm.metalConfig.type === 'Gold' && newProductForm.metalConfig.purity && (
                <span> - {newProductForm.metalConfig.purity.toUpperCase()}</span>
              )}):
            </span>
            <span>₹{metalCost.toFixed(2)}</span>
          </div>
        )}
        {wastageCost > 0 && (
          <div className="flex justify-between pl-4">
            <span className="text-gray-600">Wastage ({wastagePercentage}%):</span>
            <span>₹{wastageCost.toFixed(2)}</span>
          </div>
        )}
        {makingCharges > 0 && (
          <div className="flex justify-between pl-4">
            <span className="text-gray-600">Making Charges:</span>
            <span>₹{makingCharges.toFixed(2)}</span>
          </div>
        )}
        {diamondPrice > 0 && (
          <div className="flex justify-between pl-4">
            <span className="text-gray-600">Diamond Cost:</span>
            <span>₹{diamondPrice.toFixed(2)}</span>
          </div>
        )}
        {stonePrice > 0 && (
          <div className="flex justify-between pl-4">
            <span className="text-gray-600">Stone Cost:</span>
            <span>₹{stonePrice.toFixed(2)}</span>
          </div>
        )}
        {miscCharges > 0 && (
          <div className="flex justify-between pl-4">
            <span className="text-gray-600">Misc. Charges:</span>
            <span>₹{miscCharges.toFixed(2)}</span>
          </div>
        )}
      </div>

      <hr className="my-3" />
      
      {/* Subtotal */}
      <div className="flex justify-between font-medium text-gray-800 mb-3">
        <span>Subtotal:</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      {/* Additional Charges */}
      {(shippingCharges > 0 || markupAmount > 0 || taxAmount > 0) && (
        <>
          <div className="space-y-2 mb-4">
            <h5 className="font-medium text-gray-700 mb-2">Additional Charges:</h5>
            {shippingCharges > 0 && (
              <div className="flex justify-between pl-4">
                <span className="text-gray-600">Shipping ({shippingChargesPercentage}%):</span>
                <span>₹{shippingCharges.toFixed(2)}</span>
              </div>
            )}
            {markupAmount > 0 && (
              <div className="flex justify-between pl-4">
                <span className="text-gray-600">Markup ({markupPercentage}%):</span>
                <span>₹{markupAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between pl-4">
                <span className="text-gray-600">Tax ({taxPercentage}%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
          <hr className="my-3" />
        </>
      )}

      {/* Final Prices */}
      <div className="space-y-2">
        <div className="flex justify-between text-lg font-bold text-green-700">
          <span>Final Selling Price:</span>
          <span>₹{finalPrice.toFixed(2)}</span>
        </div>
        {comparePrice > finalPrice && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Compare At Price ({compareAtMarginPercentage}% margin):</span>
            <span>₹{comparePrice.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      {/* Price Breakdown Note */}
      {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Price Calculation:</strong> Base Components → Subtotal → + Shipping → + Markup → + Tax → Final Price
        </p>
      </div> */}
    </div>
  );
})()}

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  resetNewProductForm();
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={isAddingProduct || !newProductForm.title.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
              >
                {isAddingProduct
                  ? "Adding Product..."
                  : "Add Product to Shopify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
