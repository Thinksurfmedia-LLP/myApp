












 

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Product Configuration</h1>
        
        
        
        {/* Configuration Summary */}
        <ConfigurationSummary 
          diamonds={newProductForm.diamondSettings}
          stones={newProductForm.stoneConfig}
        />
      </div>
    </div>
  );








export default DiamondStoneConfigurator;