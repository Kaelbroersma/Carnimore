import React, { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { optionService } from '../../services/optionService';
import type { Product } from '../../types/database';
import type { ProductOption } from '../../types/options';

interface OptionSelectorProps {
  categorySlug?: string;
  product: Product;
  // Carnimore Models props
  selectedCaliber: string | null;
  carnimoreOptions: Record<string, any>;
  carnimoreColors: number;
  onCaliberSelect: (caliber: string) => void;
  onOptionChange: (key: string, value: any) => void;
  onCarnimoreColorsChange: (count: number) => void;
  // Duracoat props
  duracoatColors: number;
  isDirty: boolean;
  onDuracoatColorsChange: (count: number) => void;
  onDirtyChange: (isDirty: boolean) => void;
  // Merch props
  selectedSize: string | null;
  selectedColor: string | null;
  onSizeSelect: (size: string) => void;
  onColorSelect: (color: string) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  categorySlug,
  product,
  // Carnimore Models props
  selectedCaliber,
  carnimoreOptions,
  carnimoreColors,
  onCaliberSelect,
  onOptionChange,
  onCarnimoreColorsChange,
  // Duracoat props
  duracoatColors,
  isDirty,
  onDuracoatColorsChange,
  onDirtyChange,
  // Merch props
  selectedSize,
  selectedColor,
  onSizeSelect,
  onColorSelect
}) => {
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!product?.product_id) return;

      setLoading(true);
      const result = await optionService.getProductOptions(product.product_id);
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setProductOptions(result.data || []);
      }
      
      setLoading(false);
    };

    fetchOptions();
  }, [product?.product_id]);

  // Render Carnimore Models options
  const renderCarnimoreOptions = () => {
    const { availableCalibers = [] } = product.options || {};

    // Check if this model has the Deluxe Version option enabled
    const hasDeluxeVersion = productOptions.some(po => 
      po.option_name === 'Deluxe Version' && 
      po.is_enabled && 
      po.override_values?.value === true
    );
    
    return (
      <div className="space-y-6">
        {/* Caliber Selection */}
        <div>
          <h3 className="font-heading text-xl font-bold mb-4">
            Select Caliber <span className="text-tan">*</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableCalibers.map((caliber) => (
              <button
                key={caliber}
                onClick={() => onCaliberSelect(caliber)}
                className={`px-4 py-3 rounded-sm transition-colors ${
                  selectedCaliber === caliber
                    ? 'bg-tan text-black'
                    : 'bg-dark-gray hover:bg-tan/10'
                }`}
              >
                {caliber}
              </button>
            ))}
          </div>
          {!selectedCaliber && (
            <p className="text-red-400 text-sm mt-2">Please select a caliber</p>
          )}
        </div>

        {/* Additional Options */}
        <div className="bg-gunmetal p-6 rounded-sm space-y-4">
          <h3 className="font-heading text-xl font-bold mb-4">Additional Options</h3>
          
          {/* Long Action Option */}
          {productOptions.some(po => po.option_name === 'Long Action' && po.is_enabled) && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={carnimoreOptions.longAction || false}
                onChange={(e) => onOptionChange('longAction', e.target.checked)}
                className="form-checkbox text-tan rounded-sm"
              />
              <span className="text-gray-300">Long Action (+$150)</span>
            </label>
          )}
          
          {/* Deluxe Version Option - Only show if enabled for this model */}
          {hasDeluxeVersion && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={carnimoreOptions.deluxeVersion || false}
                onChange={(e) => onOptionChange('deluxeVersion', e.target.checked)}
                className="form-checkbox text-tan rounded-sm"
              />
              <span className="text-gray-300">Deluxe Version: Fluted Bolt & Barrel (+$300)</span>
            </label>
          )}

          {/* Duracoat Colors Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duracoat Colors (Included) <span className="text-tan">*</span>
            </label>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => onCarnimoreColorsChange(carnimoreColors - 1)}
                className="bg-dark-gray p-2 rounded-sm hover:bg-tan/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={carnimoreColors <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold">{carnimoreColors}</span>
              <button
                onClick={() => onCarnimoreColorsChange(carnimoreColors + 1)}
                className="bg-dark-gray p-2 rounded-sm hover:bg-tan/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={carnimoreColors >= 5}
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              Select between 1 and 5 colors for your custom Duracoat finish
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render Duracoat options
  const renderDuracoatOptions = () => {
    const {
      additionalColorCost = 30,
      maxColors = 5,
      basePrepCharge = 50,
      additionalPrepCharge = 50
    } = product.options || {};

    const calculateTotal = () => {
      return (
        product.price +
        ((duracoatColors - 1) * additionalColorCost) +
        basePrepCharge +
        (isDirty ? additionalPrepCharge : 0)
      );
    };

    return (
      <div className="space-y-6">
        {/* Colors Selection */}
        <div className="bg-gunmetal p-6 rounded-sm">
          <h3 className="font-heading text-xl font-bold mb-4">
            Duracoat Colors <span className="text-tan">*</span>
          </h3>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First color included
          </label>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => onDuracoatColorsChange(duracoatColors - 1)}
              className="bg-dark-gray p-2 rounded-sm hover:bg-tan/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={duracoatColors <= 1}
            >
              <Minus size={20} />
            </button>
            <span className="text-2xl font-bold">{duracoatColors}</span>
            <button
              onClick={() => onDuracoatColorsChange(duracoatColors + 1)}
              className="bg-dark-gray p-2 rounded-sm hover:bg-tan/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={duracoatColors >= maxColors}
            >
              <Plus size={20} />
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Select between 1 and {maxColors} colors for your custom finish
          </p>
        </div>

        {/* Prep Charge */}
        <div className="bg-gunmetal p-6 rounded-sm">
          <h3 className="font-heading text-xl font-bold mb-4">Prep Charge</h3>
          <p className="text-gray-400 mb-4">
            A prep charge of ${basePrepCharge} is applied to all orders. For excessively dirty/oily firearms, 
            an additional ${additionalPrepCharge} prep charge will be applied.
          </p>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDirty}
              onChange={(e) => onDirtyChange(e.target.checked)}
              className="form-checkbox text-tan rounded-sm"
            />
            <span className="text-gray-300">Firearm requires additional cleaning (+${additionalPrepCharge})</span>
          </label>
        </div>

        {/* Price Calculation */}
        <div className="bg-gunmetal p-6 rounded-sm">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Base Cost (Includes First Color):</span>
              <span>${product.price}</span>
            </div>
            {duracoatColors > 1 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Additional Colors ({duracoatColors - 1}):</span>
                <span>${(duracoatColors - 1) * additionalColorCost}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Prep Charge:</span>
              <span>${isDirty ? basePrepCharge + additionalPrepCharge : basePrepCharge}</span>
            </div>
            <div className="border-t border-gunmetal-light pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total:</span>
                <span className="text-tan text-2xl font-bold">${calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Merch options
  const renderMerchOptions = () => {
    const { sizes = [], colors = [] } = product.options || {};

    return (
      <div className="space-y-8">
        {/* Size Selection */}
        {sizes.length > 0 && (
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">
              Select Size <span className="text-tan">*</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onSizeSelect(size)}
                  className={`px-4 py-3 rounded-sm transition-colors ${
                    selectedSize === size
                      ? 'bg-tan text-black'
                      : 'bg-dark-gray hover:bg-tan/10'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-red-400 text-sm mt-2">Please select a size</p>
            )}
          </div>
        )}

        {/* Color Selection */}
        {colors.length > 0 && (
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">
              Select Color <span className="text-tan">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => onColorSelect(color.name)}
                  className={`flex items-center p-4 rounded-sm transition-colors ${
                    selectedColor === color.name
                      ? 'bg-tan text-black'
                      : 'bg-dark-gray hover:bg-tan/10'
                  }`}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 border-2"
                      style={{ 
                        backgroundColor: color.value,
                        borderColor: selectedColor === color.name ? 'currentColor' : 'transparent'
                      }}
                    />
                    <div className="flex-grow">
                      <span className="block">{color.name}</span>
                      {color.hasRedLogo && (
                        <span className="text-sm opacity-75 block">(Red Logo)</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {!selectedColor && (
              <p className="text-red-400 text-sm mt-2">Please select a color</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render options based on category
  switch (categorySlug) {
    case 'carnimore-models':
      return renderCarnimoreOptions();
    case 'duracoat':
      return renderDuracoatOptions();
    case 'merch':
      return renderMerchOptions();
    default:
      return null;
  }
};

export default OptionSelector;