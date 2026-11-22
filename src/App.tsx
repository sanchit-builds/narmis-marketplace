import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoPersonaSwitcher } from './components/common/DemoPersonaSwitcher';
import { AiChatBot } from './components/common/AiChatBot';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { RentPage } from './pages/RentPage';
import { TradePage } from './pages/TradePage';
import { PurchasePage } from './pages/PurchasePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { MessagesPage } from './pages/MessagesPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AboutPage } from './pages/AboutPage';

// Scroll to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MarketplaceProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen bg-narmis-bg text-narmis-cream font-sans selection:bg-narmis-gold selection:text-narmis-charcoal">
              <ScrollToTop />
              <Navbar />
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/rent" element={<RentPage />} />
                  <Route path="/trade" element={<TradePage />} />
                  <Route path="/purchase" element={<PurchasePage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/create-listing" element={<CreateListingPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile/:id" element={<ProfilePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  {/* Fallback */}
                  <Route path="*" element={<ExplorePage />} />
                </Routes>
              </main>

              <Footer />
              <DemoPersonaSwitcher />
              <AiChatBot />
            </div>
          </ToastProvider>
        </MarketplaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
