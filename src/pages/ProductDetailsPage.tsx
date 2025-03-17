import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { useDuracoatStore } from '../store/duracoatStore';
import { useMerchStore } from '../store/merchStore';
import { useCartStore } from '../store/cartStore';
import { useMobileDetection } from '../components/MobileDetection';
import { getImageUrl } from '../utils/imageUtils';
import Button from '../components/Button';
import Breadcrumbs from '../components/Breadcrumbs';
import OptionSelector from '../components/ProductOptions/OptionSelector';

const ProductDetailsPage: React.FC = () => {
  const { categorySlug, productSlug } = useParams();
  const navigate = useNavigate();
  const isMobile = useMobileDetection();
  
  // Store states based on category
  const {
    selectedProduct: carnimoreProduct,
    selectedCaliber,
    selectedOptions: carnimoreOptions,
    colors: carnimoreColors,
    loading: carnimoreLoading,
    error: carnimoreError,
    fetchProduct: fetchCarnimoreProduct,
    setSelectedCaliber,
    setSelectedOption,
    setColors: setCarnimoreColors,
    calculateTotalPrice: calculateCarnimorePrice,
    clearSelections: clearCarnimoreSelections
  } = useProductStore();

  const {
    selectedService: duracoatProduct,
    colors: duracoatColors,
    isDirty,
    loading: duracoatLoading,
    error: duracoatError,
    fetchService: fetchDuracoatProduct,
    setColors: setDuracoatColors,
    setIsDirty,
    calculateTotal: calculateDuracoatPrice,
    clearSelections: clearDuracoatSelections
  } = useDuracoatStore();

  const {
    selectedProduct: merchProduct,
    selectedSize,
    selectedColor,
    loading: merchLoading,
    error: merchError,
    fetchProduct: fetchMerchProduct,
    setSelectedSize,
    setSelectedColor,
    clearSelections: clearMerchSelections
  } = useMerchStore();

  const { addItem } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  // Get the appropriate product based on category
  const product = categorySlug === 'carnimore-models' ? carnimoreProduct :
                 categorySlug === 'duracoat' ? duracoatProduct :
                 categorySlug === 'merch' ? merchProduct : null;

  const loading = categorySlug === 'carnimore-models' ? carnimoreLoading :
                 categorySlug === 'duracoat' ? duracoatLoading :
                 categorySlug === 'merch' ? merchLoading : false;

  const error = categorySlug === 'carnimore-models' ? carnimoreError :
                categorySlug === 'duracoat' ? duracoatError :
                categorySlug === 'merch' ? merchError : null;

  useEffect(() => {
    if (!categorySlug || !productSlug) return;

    // Clear any existing selections
    clearCarnimoreSelections();
    clearDuracoatSelections();
    clearMerchSelections();

    // Fetch product based on category
    switch (categorySlug) {
      case 'carnimore-models':
        fetchCarnimoreProduct(productSlug);
        break;
      case 'duracoat':
        fetchDuracoatProduct(productSlug);
        break;
      case 'merch':
        fetchMerchProduct(productSlug);
        break;
    }
  }, [categorySlug, productSlug]);

  const handleBack = () => {
    if (!categorySlug) return;
    navigate(`/shop/${categorySlug}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      switch (categorySlug) {
        case 'carnimore-models':
          if (!selectedCaliber) return;
          await addItem({
            id: product.product_id,
            name: product.name,
            price: calculateCarnimorePrice(),
            quantity: 1,
            image: product.images?.[0]?.image_url || '/img/Logo-Main.webp',
            options: {
              caliber: selectedCaliber,
              colors: carnimoreColors,
              ...carnimoreOptions
            }
          });
          break;

        case 'duracoat':
          await addItem({
            id: product.product_id,
            name: product.name,
            price: calculateDuracoatPrice(),
            quantity: 1,
            image: product.images?.[0]?.image_url || '/img/Logo-Main.webp',
            options: {
              colors: duracoatColors,
              isDirty
            }
          });
          break;

        case 'merch':
          if (!selectedSize || !selectedColor) return;
          await addItem({
            id: product.product_id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images?.[0]?.image_url || '/img/Logo-Main.webp',
            options: {
              size: selectedSize,
              color: selectedColor
            }
          });
          break;
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!product || loading) return null;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button and Breadcrumbs */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-400 hover:text-tan transition-colors mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            { 
              label: categorySlug === 'carnimore-models' 
                ? 'Carnimore Models'
                : categorySlug === 'duracoat'
                ? 'Duracoat Services'
                : 'Merchandise',
              href: `/shop/${categorySlug}`
            },
            { label: product.name }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className={`${!isMobile && 'lg:sticky lg:top-24'}`}>
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div 
                className="relative aspect-w-4 aspect-h-3 bg-gunmetal rounded-sm overflow-hidden cursor-pointer"
                onClick={() => setShowLightbox(true)}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[selectedImageIndex].image_url)}
                    alt={`${product.name} - View ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-gray flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Grid */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.image_id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-w-1 aspect-h-1 rounded-sm overflow-hidden ${
                        index === selectedImageIndex 
                          ? 'ring-2 ring-tan' 
                          : 'ring-1 ring-gunmetal hover:ring-tan/50'
                      }`}
                    >
                      <img
                        src={getImageUrl(image.image_url)}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {product.name}
            </h1>
            <p className="text-gray-400 mb-6">{product.description}</p>

            <div className="flex justify-between items-center mb-8">
              <span className="text-tan text-3xl font-bold">
                ${product.price.toLocaleString()}
              </span>
              {product.weight && (
                <span className="text-gray-400">
                  Weight: {product.weight}
                </span>
              )}
            </div>

            {/* Product Options */}
            <OptionSelector
              categorySlug={categorySlug}
              product={product}
              selectedCaliber={selectedCaliber}
              carnimoreOptions={carnimoreOptions}
              carnimoreColors={carnimoreColors}
              duracoatColors={duracoatColors}
              isDirty={isDirty}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              onCaliberSelect={setSelectedCaliber}
              onOptionChange={setSelectedOption}
              onCarnimoreColorsChange={setCarnimoreColors}
              onDuracoatColorsChange={setDuracoatColors}
              onDirtyChange={setIsDirty}
              onSizeSelect={setSelectedSize}
              onColorSelect={setSelectedColor}
            />

            {/* Add to Cart Button */}
            <div className="mt-8">
              <Button
                variant="primary"
                fullWidth
                disabled={
                  isAddingToCart ||
                  (categorySlug === 'carnimore-models' && !selectedCaliber) ||
                  (categorySlug === 'merch' && (!selectedSize || !selectedColor))
                }
                onClick={handleAddToCart}
              >
                {isAddingToCart
                  ? 'Adding to Cart...'
                  : categorySlug === 'carnimore-models' && !selectedCaliber
                  ? 'Select Caliber to Continue'
                  : categorySlug === 'merch' && (!selectedSize || !selectedColor)
                  ? 'Select Size and Color to Continue'
                  : 'Add to Cart'
                }
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && product.images && product.images.length > 0 && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-tan transition-colors"
          >
            <X size={24} />
          </button>

          <button
            onClick={() => setSelectedImageIndex((prev) => 
              prev === 0 ? product.images!.length - 1 : prev - 1
            )}
            className="absolute left-4 text-white hover:text-tan transition-colors"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={() => setSelectedImageIndex((prev) => 
              prev === product.images!.length - 1 ? 0 : prev + 1
            )}
            className="absolute right-4 text-white hover:text-tan transition-colors"
          >
            <ChevronRight size={32} />
          </button>

          <img
            src={getImageUrl(product.images[selectedImageIndex].image_url)}
            alt={`${product.name} - Full View`}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </motion.div>
      )}
    </div>
  );
};

export default ProductDetailsPage;