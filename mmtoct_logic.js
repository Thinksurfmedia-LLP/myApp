const DiamondConfigCard = memo(({ diamond, index, onUpdate, onRemove, mmToCtData, diamondPricesData }) => {
  
  // Enhanced MM to CT conversion with interpolation for missing values
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
    const sortedConversions = shapeConversions.sort((a, b) => a.size - b.size);
    
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
      const interpolatedCarat = lower.carat + (ratio * (upper.carat - lower.carat));
      return interpolatedCarat.toFixed(3);
    }
    
    // If only lower bound exists (entered value is larger than all in DB)
    if (lower && !upper) {
      throw new Error(`MM value ${mmValue} is larger than available data. Maximum available: ${lower.size}mm`);
    }
    
    // If only upper bound exists (entered value is smaller than all in DB)
    if (!lower && upper) {
      throw new Error(`MM value ${mmValue} is smaller than available data. Minimum available: ${upper.size}mm`);
    }
    
    throw new Error(`CT value not found for ${mmValue}mm ${shape} diamond in database`);
  };

  // Enhanced price lookup with better error messages
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
        numericWeight >= item.weightFrom && 
        numericWeight <= item.weightTo
    );
    
    if (!priceEntry) {
      // Provide helpful error message with available ranges
      const ranges = shapePrices.map(p => `${p.weightFrom}-${p.weightTo}ct`).join(', ');
      throw new Error(
        `Weight ${totalWeight}ct falls outside available price ranges for ${shape} diamonds. Available ranges: ${ranges}`
      );
    }
    
    return priceEntry.pricePerCarat;
  };

  // Rest of the component remains the same...
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
      const pricePerCarat = getPricePerCarat(totalWeight, updatedDiamond.shape);
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

  // Rest of the component...
});
