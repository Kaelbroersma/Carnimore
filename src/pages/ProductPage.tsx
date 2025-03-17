import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Loader } from 'lucide-react';
import { useMobileDetection } from '../components/MobileDetection';
import { getImageUrl } from '../utils/imageUtils';

interface ProductPageProps {
  title: string;
  description: string;
  categorySlug: string;
  products: any[];
  loading: boolean;
  error: string | null;
  fetchProducts: (categorySlug: string) => Promise<void>;
  clearProducts: () => void;
  onProductClick: (productSlug: string) => void;
  renderProductInfo?: (product: any) => React.ReactNode;
}

const ProductPage: React.FC<ProductPageProps> = ({
  title,
  description,
  categorySlug,
  products,
  loading,
  error,
  fetchProducts,
  clearProducts,
  onProductClick,
  renderProductInfo
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobileDetection();

  useEffect(() => {
    // Clear existing products and fetch new ones
    clearProducts();
    fetchProducts(categorySlug);
  }, [categorySlug]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("/.netlify/images?url=/img/gallery/DSC_0331.jpg")',
            filter: 'brightness(0.4)'
          }}
        />
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            className="font-heading text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {description}
          </motion.p>
        </div>
      </section>

      {/* Product Grid */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-tan animate-spin mb-4" />
              <p className="text-gray-400">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-start bg-red-900/30 border border-red-700 rounded-sm p-4 mb-8">
              <AlertCircle className="text-red-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-red-400">Error loading products</h3>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  className="bg-gunmetal rounded-sm shadow-luxury overflow-hidden cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => onProductClick(product.slug)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-w-4 aspect-h-3 overflow-hidden">
                    <img
                      src={getImageUrl(product.images?.[0]?.image_url || '/img/Logo-Main.webp')}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
                  </div>

                  {/* Product Info */}
                  <div className={`p-4 ${isMobile ? 'space-y-1' : 'p-6 space-y-2'}`}>
                    <h2 className={`font-heading font-bold group-hover:text-tan transition-colors ${isMobile ? 'text-base' : 'text-xl'}`}>
                      {product.name}
                    </h2>
                    {!isMobile && (
                      <p className="text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className={`text-tan font-bold ${isMobile ? 'text-sm' : 'text-xl'}`}>
                        ${product.price.toLocaleString()}
                      </span>
                      {renderProductInfo && renderProductInfo(product)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;