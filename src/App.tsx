import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StoreHero } from './components/store/StoreHero';
import { StoreCatalog } from './components/store/StoreCatalog';
import { CompanyProfileSection } from './components/store/CompanyProfileSection';
import { ProductModal } from './components/store/ProductModal';
import { CartDrawer } from './components/store/CartDrawer';
import { CheckoutModal } from './components/store/CheckoutModal';
import { RegistrationOfferModal } from './components/store/RegistrationOfferModal';
import { LoginModal } from './components/auth/LoginModal';
import { CustomerChatWidget } from './components/chat/CustomerChatWidget';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { VideoBackground } from './components/common/VideoBackground';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { BrandIdentityModal } from './components/store/BrandIdentityModal';
import { PromotionsSection } from './components/store/PromotionsSection';
import { TechnicianShowcaseSection } from './components/store/TechnicianShowcaseSection';
import { CatalogVideoShowcase } from './components/store/CatalogVideoShowcase';
import { SocialHashtagsBar } from './components/common/SocialHashtagsBar';
import { FloatingContactBubble } from './components/common/FloatingContactBubble';
import { Product } from './types';

const MainLayout: React.FC = () => {
  const { activeMode } = useApp();
  
  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background Automotive Video */}
      <VideoBackground />

      {/* Top Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenBrandModal={() => setIsBrandModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="relative z-10 flex-1">
        {activeMode === 'store' ? (
          <>
            <StoreHero 
              onOpenRegister={() => setIsRegisterOpen(true)} 
              onOpenBrandModal={() => setIsBrandModalOpen(true)}
            />
            <PromotionsSection onOpenDetails={(prod) => setSelectedProduct(prod)} />
            <TechnicianShowcaseSection onOpenDetails={(prod) => setSelectedProduct(prod)} />
            <CatalogVideoShowcase onOpenDetails={(prod) => setSelectedProduct(prod)} />
            <StoreCatalog onOpenDetails={(prod) => setSelectedProduct(prod)} />
            <CompanyProfileSection 
              onOpenChat={() => setIsChatOpen(true)} 
              onOpenBrandModal={() => setIsBrandModalOpen(true)}
            />
            <SocialHashtagsBar />
          </>
        ) : (
          <AdminDashboard />
        )}
      </main>

      {/* Global Footer with business hours and store info */}
      <div className="relative z-10">
        <Footer onOpenBrandModal={() => setIsBrandModalOpen(true)} />
      </div>

      {/* Modals & Slide-overs */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* 10% Discount Registration Offer Modal */}
      <RegistrationOfferModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      {/* Login Modal specifically for fernandezursula31@gmail.com */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Customer Chat Widget */}
      <CustomerChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Brand Identity & Color Palette Modal */}
      <BrandIdentityModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />

      {/* Floating Contact & Promotions Bubble (WhatsApp + Mail) */}
      <FloatingContactBubble />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
