const calculateStoneValue = (updatedStone) => {
      try {
        const pieces = parseInt(updatedStone.pieces) || 0;
        const weightPerStone = parseFloat(updatedStone.weightPerStone) || 0;
        const totalWeight = pieces * weightPerStone;

        if (totalWeight === 0 || !updatedStone.stoneType) {
          return {
            ...updatedStone,
            totalWeight: totalWeight.toFixed(3),
            stoneValue: "0.00",
            calculationError: null,
          };
        }

        // Get rate per gram from database based on weight range and stone type
        const ratePerGram = getRatePerGram(totalWeight, updatedStone.stoneType);
        const stoneValue = totalWeight * ratePerGram;

        return {
          ...updatedStone,
          totalWeight: totalWeight.toFixed(3),
          stoneValue: stoneValue.toFixed(2),
          calculationError: null,
          ratePerGram: ratePerGram.toFixed(2), // Optional: show the rate used
        };
      } catch (error) {
        return {
          ...updatedStone,
          totalWeight: updatedStone.totalWeight || "0.000",
          stoneValue: updatedStone.stoneValue || "0.00",
          calculationError: error.message,
        };
      }
    };