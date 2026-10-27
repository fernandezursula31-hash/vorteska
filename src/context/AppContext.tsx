import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  LowStockAlert, 
  ChatMessage, 
  CustomerInfo, 
  PaymentMethod,
  OrderStatus,
  VehicleFilterState,
  AuthUser
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ALERTS, 
  INITIAL_ORDERS, 
  INITIAL_CHAT_MESSAGES 
} from '../data/initialData';

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  alerts: LowStockAlert[];
  chatMessages: ChatMessage[];
  activeMode: 'store' | 'admin';
  adminTab: 'inventory' | 'alerts' | 'analytics' | 'orders' | 'chat' | 'staff';
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  vehicleFilter: VehicleFilterState;
  searchQuery: string;
  selectedCategory: string;
  toastMessage: { text: string; type: 'success' | 'warning' | 'info' } | null;
  
  // Actions
  setActiveMode: (mode: 'store' | 'admin') => void;
  setAdminTab: (tab: 'inventory' | 'alerts' | 'analytics' | 'orders' | 'chat') => void;
  setVehicleFilter: (filter: VehicleFilterState) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  
  // Cart & Checkout
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (customer: CustomerInfo, paymentMethod: PaymentMethod) => Order | null;
  
  // User Authentication & Roles
  currentUser: AuthUser | null;
  loginWithEmail: (email: string, password?: string, name?: string) => boolean;
  logout: () => void;

  // Registration & 10% Discount
  isRegistered: boolean;
  registeredUser: { name: string; email: string; phone?: string; vehicle?: string } | null;
  discountApplied: boolean;
  discountCode: string;
  registerUser: (userData: { name: string; email: string; phone?: string; vehicle?: string }) => void;
  applyDiscountCode: (code: string) => boolean;
  removeDiscount: () => void;

  // Video Background
  videoBgActive: boolean;
  setVideoBgActive: (active: boolean) => void;

  // Inventory Management
  updateProductStock: (productId: string, newStock: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  restockProduct: (productId: string, additionalUnits: number, details?: { costPrice?: number; locationWarehouse?: string; notes?: string }) => void;
  dismissAlert: (alertId: string) => void;
  
  // Orders
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  
  // Chat
  sendCustomerMessage: (text: string) => void;
  sendAgentMessage: (text: string) => void;
  markChatRead: () => void;
  clearToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent states
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('arp_products');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed: Product[] = JSON.parse(saved);
      // Ensure image paths match latest authentic assets
      return parsed.map(p => {
        const initial = INITIAL_PRODUCTS.find(i => i.id === p.id);
        if (initial) {
          // Upgrade to modern compressed webp asset if image was uncompressed, legacy path, or external
          if (!p.image || p.image.startsWith('http') || p.image.includes('hero_automotive_parts') || p.image.startsWith('/src/assets/images') || p.image.endsWith('.jpg')) {
            return { ...p, image: initial.image };
          }
        }
        return p;
      });
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('arp_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('arp_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [alerts, setAlerts] = useState<LowStockAlert[]>(() => {
    const saved = localStorage.getItem('arp_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('arp_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  // User Authentication - specifically configured for fernandezursula31@gmail.com
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('arp_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default logged in specifically as Ursula Fernandez (fernandezursula31@gmail.com)
    return {
      email: 'fernandezursula31@gmail.com',
      name: 'Ursula Fernandez',
      role: 'admin',
      phone: '+52 55 4192 8831',
      vehicle: 'Toyota Supra GR 2024 / Mazda RX-7'
    };
  });

  // User Registration & 10% Offer State - ACTIVATED BY DEFAULT ON PAGE OPEN
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return localStorage.getItem('arp_is_registered') === 'true' || true;
  });

  const [registeredUser, setRegisteredUser] = useState<{ name: string; email: string; phone?: string; vehicle?: string } | null>(() => {
    const saved = localStorage.getItem('arp_user');
    return saved ? JSON.parse(saved) : {
      name: 'Ursula Fernandez',
      email: 'fernandezursula31@gmail.com',
      phone: '+52 55 4192 8831',
      vehicle: 'Toyota Supra GR 2024 / Mazda RX-7'
    };
  });

  // Automatically active upon opening the webpage!
  const [discountApplied, setDiscountApplied] = useState<boolean>(() => {
    const saved = localStorage.getItem('arp_discount_applied');
    return saved !== 'false';
  });

  const [discountCode, setDiscountCode] = useState<string>(() => {
    return localStorage.getItem('arp_discount_code') || 'BIENVENIDO10';
  });

  // Video Background State
  const [videoBgActive, setVideoBgActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('arp_video_bg');
    return saved !== null ? saved === 'true' : true;
  });

  const [activeMode, setActiveMode] = useState<'store' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    return 'store';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'inventory' | 'alerts' | 'analytics' | 'orders' | 'chat' | 'staff'>('inventory');

  // Verify server session on mount
  useEffect(() => {
    const token = localStorage.getItem('vorteksa_admin_token');
    if (token) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.authenticated) {
            setIsAdminAuthenticated(true);
          } else {
            setIsAdminAuthenticated(false);
            localStorage.removeItem('vorteksa_admin_token');
            localStorage.removeItem('vorteksa_admin_user');
          }
        })
        .catch(() => {
          // If offline or network issue, maintain token for retry
        });
    }
  }, []);

  // Sync browser path with activeMode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeMode === 'admin' && window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      } else if (activeMode === 'store' && window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activeMode]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilterState>({
    make: 'Todas las Marcas',
    model: '',
    year: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('arp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('arp_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('arp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('arp_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('arp_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('arp_video_bg', videoBgActive ? 'true' : 'false');
  }, [videoBgActive]);

  // Welcome user with active 10% discount notification upon opening the webpage
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('arp_discount_welcomed');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        showToast('🎉 ¡10% de DESCUENTO activado automáticamente en tu visita! Código: BIENVENIDO10', 'success');
        sessionStorage.setItem('arp_discount_welcomed', 'true');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const loginWithEmail = (email: string, _password?: string, name?: string): boolean => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@') || normalized.indexOf('.') === -1) {
      showToast('Por favor introduce un correo electrónico válido (ejemplo: usuario@correo.com)', 'warning');
      return false;
    }

    if (normalized === 'fernandezursula31@gmail.com') {
      const user: AuthUser = {
        email: 'fernandezursula31@gmail.com',
        name: name?.trim() || 'Ursula Fernandez',
        role: 'admin',
        phone: '+52 55 4192 8831',
        vehicle: 'Toyota Supra GR 2024 / Mazda RX-7'
      };
      setCurrentUser(user);
      setIsRegistered(true);
      setRegisteredUser({
        name: user.name,
        email: user.email,
        phone: user.phone,
        vehicle: user.vehicle
      });
      setDiscountApplied(true);
      setDiscountCode('BIENVENIDO10');
      localStorage.setItem('arp_auth_user', JSON.stringify(user));
      localStorage.setItem('arp_is_registered', 'true');
      showToast(`¡Bienvenida Administradora, Ursula Fernandez (${user.email})!`, 'success');
      return true;
    } else {
      const rawName = name?.trim();
      const namePart = rawName || normalized.split('@')[0];
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const user: AuthUser = {
        email: normalized,
        name: formattedName,
        role: 'customer',
        vehicle: 'Auto Registrado'
      };
      setCurrentUser(user);
      setIsRegistered(true);
      setRegisteredUser({
        name: user.name,
        email: user.email,
        vehicle: user.vehicle
      });
      setDiscountApplied(true);
      setDiscountCode('BIENVENIDO10');
      localStorage.setItem('arp_auth_user', JSON.stringify(user));
      localStorage.setItem('arp_is_registered', 'true');
      showToast(`¡Sesión iniciada con éxito! Bienvenido(a) ${formattedName} (10% OFF activo)`, 'success');
      return true;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('arp_auth_user');
    showToast('Has cerrado sesión correctamente.', 'info');
  };

  const registerUser = (userData: { name: string; email: string; phone?: string; vehicle?: string }) => {
    setIsRegistered(true);
    setRegisteredUser(userData);
    setDiscountApplied(true);
    setDiscountCode('BIENVENIDO10');
    localStorage.setItem('arp_is_registered', 'true');
    localStorage.setItem('arp_user', JSON.stringify(userData));
    localStorage.setItem('arp_discount_applied', 'true');
    localStorage.setItem('arp_discount_code', 'BIENVENIDO10');
    showToast(`¡Bienvenido ${userData.name}! Tu 10% de descuento ha sido activado en toda la tienda.`, 'success');
  };

  const applyDiscountCode = (code: string): boolean => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === 'BIENVENIDO10' || cleaned === 'AUTO10' || cleaned === 'PRO10') {
      setDiscountApplied(true);
      setDiscountCode(cleaned);
      localStorage.setItem('arp_discount_applied', 'true');
      localStorage.setItem('arp_discount_code', cleaned);
      showToast('¡Cupón activado! 10% de descuento aplicado en tu orden.', 'success');
      return true;
    }
    showToast('Código no válido. Usa BIENVENIDO10 al registrarte.', 'warning');
    return false;
  };

  const removeDiscount = () => {
    setDiscountApplied(false);
    setDiscountCode('');
    localStorage.removeItem('arp_discount_applied');
    localStorage.removeItem('arp_discount_code');
    showToast('Cupón de descuento removido.', 'info');
  };

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => prev?.text === text ? null : prev);
    }, 4000);
  };

  const clearToast = () => setToastMessage(null);

  // Helper to re-evaluate low stock alerts
  const checkStockAlertForProduct = (prod: Product, currentAlerts: LowStockAlert[]): LowStockAlert[] => {
    const existingIndex = currentAlerts.findIndex(a => a.productId === prod.id && a.status === 'pending');
    
    if (prod.stock <= prod.minStockThreshold) {
      const severity: 'critical' | 'warning' = prod.stock === 0 ? 'critical' : 'warning';
      const newAlert: LowStockAlert = {
        id: existingIndex >= 0 ? currentAlerts[existingIndex].id : `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        category: prod.category,
        currentStock: prod.stock,
        minStockThreshold: prod.minStockThreshold,
        severity,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      if (existingIndex >= 0) {
        const updated = [...currentAlerts];
        updated[existingIndex] = newAlert;
        return updated;
      } else {
        return [newAlert, ...currentAlerts];
      }
    } else {
      // Stock is healthy, remove pending alerts
      return currentAlerts.filter(a => !(a.productId === prod.id && a.status === 'pending'));
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1): boolean => {
    const existing = cart.find(item => item.product.id === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;
    
    if (currentQtyInCart + quantity > product.stock) {
      showToast(`Stock insuficiente. Solo quedan ${product.stock} unidades de ${product.name}.`, 'warning');
      return false;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity }]);
    }

    showToast(`Se agregó "${product.name.slice(0, 32)}..." al carrito`, 'success');
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > item.product.stock) {
      showToast(`Stock máximo disponible: ${item.product.stock} unidades`, 'warning');
      return;
    }

    setCart(cart.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  // Checkout and stock deduction
  const checkout = (customer: CustomerInfo, paymentMethod: PaymentMethod): Order | null => {
    if (cart.length === 0) return null;

    // Verify stock availability
    for (const item of cart) {
      const liveProd = products.find(p => p.id === item.product.id);
      if (!liveProd || liveProd.stock < item.quantity) {
        showToast(`El producto "${item.product.name}" ya no cuenta con suficiente stock disponible.`, 'warning');
        return null;
      }
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const discount = discountApplied ? +(subtotal * 0.10).toFixed(2) : 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = +(discountedSubtotal * 0.16).toFixed(2); // 16% IVA
    const shipping = discountedSubtotal > 150 ? 0 : 15; // Envío gratis sobre $150
    const total = +(discountedSubtotal + tax + shipping).toFixed(2);

    const orderNumber = `#ARP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer,
      items: cart.map(i => ({
        productId: i.product.id,
        sku: i.product.sku,
        name: i.product.name,
        brand: i.product.brand,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image
      })),
      subtotal: +subtotal.toFixed(2),
      discount,
      tax,
      shipping,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'procesando'
    };

    // Deduct stock in real time
    let updatedAlerts = [...alerts];
    const updatedProducts = products.map(prod => {
      const inCart = cart.find(c => c.product.id === prod.id);
      if (inCart) {
        const newStock = Math.max(0, prod.stock - inCart.quantity);
        const updatedProd = { ...prod, stock: newStock };
        updatedAlerts = checkStockAlertForProduct(updatedProd, updatedAlerts);
        return updatedProd;
      }
      return prod;
    });

    setProducts(updatedProducts);
    setAlerts(updatedAlerts);
    setOrders([newOrder, ...orders]);
    clearCart();

    showToast(`¡Pago confirmado con éxito! Orden ${orderNumber} generada.`, 'success');
    return newOrder;
  };

  // Stock management from Admin
  const updateProductStock = (productId: string, newStock: number) => {
    const validStock = Math.max(0, newStock);
    let updatedAlerts = [...alerts];

    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const updated = { ...p, stock: validStock };
        updatedAlerts = checkStockAlertForProduct(updated, updatedAlerts);
        return updated;
      }
      return p;
    });

    setProducts(updatedProducts);
    setAlerts(updatedAlerts);
    showToast(`Stock actualizado a ${validStock} unidades`, 'info');
  };

  const restockProduct = (
    productId: string, 
    additionalUnits: number,
    details?: { costPrice?: number; locationWarehouse?: string; notes?: string }
  ) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const newStock = prod.stock + additionalUnits;
    let updatedAlerts = alerts.map(a => 
      a.productId === productId ? { ...a, status: 'reordered' as const } : a
    );

    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const updated: Product = { 
          ...p, 
          stock: newStock,
          ...(details?.costPrice ? { costPrice: details.costPrice } : {}),
          ...(details?.locationWarehouse ? { locationWarehouse: details.locationWarehouse } : {})
        };
        updatedAlerts = checkStockAlertForProduct(updated, updatedAlerts);
        return updated;
      }
      return p;
    });

    setProducts(updatedProducts);
    setAlerts(updatedAlerts);
    showToast(`Entrada confirmada: +${additionalUnits} unidades a ${prod.name.slice(0, 24)}... (Total: ${newStock} uds)`, 'success');
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };

    const newProducts = [newProduct, ...products];
    const newAlerts = checkStockAlertForProduct(newProduct, alerts);

    setProducts(newProducts);
    setAlerts(newAlerts);
    showToast(`Nuevo producto "${newProduct.name}" registrado en inventario.`, 'success');
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    let updatedAlerts = [...alerts];
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const updated = { ...p, ...updates };
        updatedAlerts = checkStockAlertForProduct(updated, updatedAlerts);
        return updated;
      }
      return p;
    });

    setProducts(updatedProducts);
    setAlerts(updatedAlerts);
    showToast('Producto actualizado correctamente.', 'info');
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    setAlerts(alerts.filter(a => a.productId !== productId));
    showToast('Producto eliminado del catálogo.', 'info');
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Estado del pedido actualizado a "${status.toUpperCase()}".`, 'info');
  };

  // Chat handling
  const sendCustomerMessage = (text: string) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Automated smart assistant response if no agent answers in 1.2s
    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = 'Gracias por escribir a VORTEKSA. Un especialista técnico ha recibido tu consulta y te responderá en breve.';
      
      if (lower.includes('compatible') || lower.includes('queda') || lower.includes('modelo') || lower.includes('año') || lower.includes('vin')) {
        responseText = '¡Con gusto verificamos compatibilidad! Por favor facilítanos la Marca, Modelo, Año y Cilindrada de tu vehículo o tu número de chasis (VIN) para asegurarte el calce exacto.';
      } else if (lower.includes('envio') || lower.includes('entrega') || lower.includes('llega') || lower.includes('costo')) {
        responseText = 'Hacemos envíos express a todo el país. Los pedidos superiores a $150 tienen ENVÍO GRATIS garantizado. Entregas en 24-48 horas hábiles.';
      } else if (lower.includes('garantia') || lower.includes('devolucion') || lower.includes('cambio')) {
        responseText = 'Todos nuestros repuestos y accesorios cuentan con garantía directa de 12 a 24 meses por defecto de fábrica y 30 días para cambios sin costo.';
      } else if (lower.includes('stock') || lower.includes('tienen') || lower.includes('disponible')) {
        responseText = 'Nuestro inventario en la página web está conectado en tiempo real a nuestra bodega central. Si el producto marca stock disponible, está listo para despacho inmediato.';
      } else if (lower.includes('horario') || lower.includes('hora') || lower.includes('abierto') || lower.includes('atienden') || lower.includes('abren') || lower.includes('cierran') || lower.includes('atencion')) {
        responseText = 'Nuestros horarios de atención son:\n• Lunes a viernes: 8:30 a.m. – 6:00 p.m.\n• Sábado: 8:30 a.m. – 1:30 p.m.\n• Domingo: Cerrado\n\n¡La tienda en línea y el sistema de pedidos están habilitados las 24 horas!';
      }

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toISOString(),
        read: false
      };
      setChatMessages(prev => [...prev, botReply]);
    }, 1200);
  };

  const sendAgentMessage = (text: string) => {
    if (!text.trim()) return;

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: true
    };

    setChatMessages(prev => [...prev, agentMsg]);
  };

  const markChatRead = () => {
    setChatMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        orders,
        alerts,
        chatMessages,
        activeMode,
        adminTab,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        vehicleFilter,
        searchQuery,
        selectedCategory,
        toastMessage,
        currentUser,
        loginWithEmail,
        logout,
        isRegistered,
        registeredUser,
        discountApplied,
        discountCode,
        videoBgActive,
        setVideoBgActive,
        registerUser,
        applyDiscountCode,
        removeDiscount,
        setActiveMode,
        setAdminTab,
        setVehicleFilter,
        setSearchQuery,
        setSelectedCategory,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkout,
        updateProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        dismissAlert,
        updateOrderStatus,
        sendCustomerMessage,
        sendAgentMessage,
        markChatRead,
        clearToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
