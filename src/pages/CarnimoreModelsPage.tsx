import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import ProductPage from './ProductPage';

const CarnimoreModelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts, clearProducts } = useProductStore();

  const handleProductClick = (productSlug: string) => {
    navigate(`/shop/carnimore-models/${productSlug}`);
  };

  return (
    <ProductPage
      title="Carnimore Models"
      description="Premium custom rifles crafted with precision and excellence"
      categorySlug="carnimore-models"
      products={products}
      loading={loading}
      error={error}
      fetchProducts={fetchProducts}
      clearProducts={clearProducts}
      onProductClick={handleProductClick}
    />
  );
};

export default CarnimoreModelsPage;