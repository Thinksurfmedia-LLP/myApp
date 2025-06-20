// **************************************** DASHBOARD.JSX **************************************** //

const ProductCard = ({ product, onEdit, onView, onSelect, isSelected }) => {
  const mainImage =
    product.images?.[0]?.url ||
    "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=";
  const mainVariant = product.variants?.[0] || {};

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="p-4">
        {/* Header with checkbox and status */}
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(product._id)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              product.status === "active"
                ? "bg-green-100 text-green-800"
                : product.status === "draft"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {product.status}
          </span>
        </div>

        {/* Product Image */}
        <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>

          <div className="text-sm text-gray-600">
            {product.vendor && (
              <p>
                <span className="font-medium">Vendor:</span> {product.vendor}
              </p>
            )}
            {product.productType && (
              <p>
                <span className="font-medium">Type:</span> {product.productType}
              </p>
            )}
          </div>

          {/* Price */}
          {mainVariant.price && (
            <div className="text-lg font-bold text-gray-900">
              ₹{mainVariant.price.toLocaleString()}
              {mainVariant.compareAtPrice &&
                mainVariant.compareAtPrice > mainVariant.price && (
                  <span className="text-sm font-normal text-gray-500 line-through ml-2">
                    ₹{mainVariant.compareAtPrice.toLocaleString()}
                  </span>
                )}
            </div>
          )}

          {/* Variants count */}
          {product.variants && product.variants.length > 1 && (
            <p className="text-sm text-blue-600">
              {product.variants.length} variants
            </p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{product.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onView(product)}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Eye size={14} />
              View
            </button>
            <button
              onClick={() => onEdit(product)}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              <Edit size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// *************LOAD PRODUCTS WHEN MAIN TAB CHANGES TO PRODUCTS (Around Line 600)************* //


  useEffect(() => {
    if (activeMainTab === "products") {
      fetchShopifyProducts();
      fetchProductAnalytics();
    }
  }, [
    activeMainTab,
    searchTerm,
    selectedStatus,
    selectedVendor,
    selectedProductType,
    pagination.current,
  ]);


  useEffect(() => {
    if (activeMainTab === "products" && isShopifyConfigured) {
      fetchShopifyProducts();
      fetchProductAnalytics();
    } else if (activeMainTab === "products" && !isShopifyConfigured) {
      // Set empty analytics if not configured
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
  }, [activeMainTab, isShopifyConfigured]);




  //// AROUND LINE 5705 /////

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
                </div>