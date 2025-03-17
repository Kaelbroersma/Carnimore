import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CarnimoreModelsPage from './pages/CarnimoreModelsPage';
import DuracoatPage from './pages/DuracoatPage';
import MerchPage from './pages/MerchPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import TrainingPage from './pages/TrainingPage';
import InfoPage from './pages/InfoPage';
import LegalPage from './pages/LegalPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentDeclinedPage from './pages/PaymentDeclinedPage';
import PaymentErrorPage from './pages/PaymentErrorPage';
import LoadingScreen from './components/LoadingScreen';
import AgeVerification from './components/AgeVerification';
import ScrollToTop from './components/ScrollToTop';
import CartDrawer from './components/Cart/CartDrawer';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsLoading(false);
    } else {
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };
  
  const handleAgeVerificationAccept = () => {
    setIsVerified(true);
  };
  
  const handleAgeVerificationDecline = () => {
    window.location.href = 'https://shop.hasbro.com/en-us/nerf';
  };

  return (
    <div className="layout-container">
      <ScrollToTop />
      
      {!isVerified && (
        <AgeVerification 
          onAccept={handleAgeVerificationAccept} 
          onDecline={handleAgeVerificationDecline} 
        />
      )}
      
      {isVerified && (
        <>
          <LoadingScreen isLoading={isLoading} onLoadingComplete={handleLoadingComplete} />
          
          <div className={`flex-grow flex flex-col ${isLoading ? 'hidden' : ''}`}>
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                
                {/* Category listing pages */}
                <Route path="/shop/carnimore-models" element={<CarnimoreModelsPage />} />
                <Route path="/shop/duracoat" element={<DuracoatPage />} />
                <Route path="/shop/merch" element={<MerchPage />} />
                
                {/* Unified product details route */}
                <Route path="/shop/:categorySlug/:productSlug" element={<ProductDetailsPage />} />
                
                <Route path="/about" element={<AboutPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/info" element={<InfoPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/payment/declined" element={<PaymentDeclinedPage />} />
                <Route path="/payment/error" element={<PaymentErrorPage />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/payment/declined" element={<PaymentDeclinedPage />} />
                <Route path="/payment/error" element={<PaymentErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </>
      )}
    </div>
  );
}

export default App;