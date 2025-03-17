import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMerchStore } from '../store/merchStore';
import ProductPage from './ProductPage';

const MerchPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts, clearProducts } = useMerchStore();

  const handleProductClick = (productSlug: string) => {
    navigate(`/shop/merch/${productSlug}`);
  };

  return (
    <ProductPage
      title="Official Merchandise"
      description="Show your support with our premium quality apparel and accessories"
      categorySlug="merch"
      products={products}
      loading={loading}
      error={error}
      fetchProducts={fetchProducts}
      clearProducts={clearProducts}
      onProductClick={handleProductClick}
    />
  );
};

export default MerchPage;