import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerInfo, PaymentMethod, Order } from '../../types';
import { 
  X, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  Building2, 
  Printer, 
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatCurrencyPEN } from '../../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, checkout, discountApplied, discountCode, applyDiscountCode, registeredUser, currentUser } = useApp();
  
  // Checkout Steps: 'form' -> 'processing' -> 'success'
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Customer Form State pre-populated specifically with Ursula Fernandez
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: currentUser?.name || registeredUser?.name || 'Ursula Fernandez',
    email: currentUser?.email || registeredUser?.email || 'fernandezursula31@gmail.com',
    phone: currentUser?.phone || registeredUser?.phone || '+52 55 4192 8831',
    address: 'Av. Paseo de las Palmas 405, Lomas',
    city: 'Ciudad de México',
    postalCode: '11000',
    vehicleMake: (currentUser?.vehicle || registeredUser?.vehicle)?.split(' ')[0] || 'Toyota',
    vehicleModel: (currentUser?.vehicle || registeredUser?.vehicle)?.split(' ')[1] || 'Supra GR',
    vehicleYear: (currentUser?.vehicle || registeredUser?.vehicle)?.split(' ')[2] || '2024'
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');

  // Card details state
  const [cardNumber, setCardNumber] = useState('4532 8910 2488 9201');
  const [cardHolder, setCardHolder] = useState(currentUser?.name.toUpperCase() || 'URSULA FERNANDEZ');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('482');
  const [cardErrors, setCardErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discount = discountApplied ? +(subtotal * 0.10).toFixed(2) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = +(discountedSubtotal * 0.16).toFixed(2);
  const shipping = discountedSubtotal > 150 ? 0 : 15;
  const total = +(discountedSubtotal + tax + shipping).toFixed(2);

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const errors: { [key: string]: string } = {};
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (cardNumber.replace(/\s/g, '').length < 15) {
        errors.card = 'Número de tarjeta inválido (16 dígitos requeridos).';
      }
      if (cardExpiry.length < 5) {
        errors.expiry = 'Fecha de expiración inválida (MM/AA).';
      }
      if (cardCvv.length < 3) {
        errors.cvv = 'CVV inválido (3 o 4 dígitos).';
      }
    }

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }

    setCardErrors({});
    setStep('processing');

    // Simulate 1.6s secure authorization with PCI bank gateway
    setTimeout(() => {
      const order = checkout(customer, paymentMethod);
      if (order) {
        setCompletedOrder(order);
        setStep('success');
      } else {
        setStep('form');
      }
    }, 1600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="font-display font-bold text-base sm:text-lg text-white">
              {step === 'success' ? 'Comprobante de Compra' : 'Pasarela de Pagos Segura'}
            </h2>
          </div>

          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Cerrar pasarela"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Processing State */}
        {step === 'processing' && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="relative w-16 h-16 mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-amber-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                <Lock className="w-6 h-6" />
              </div>
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">
              Procesando transacción segura...
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Comunicando con la red bancaria y verificando el inventario en tiempo real. Por favor no cierres esta ventana.
            </p>
          </div>
        )}

        {/* Success State */}
        {step === 'success' && completedOrder && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                ¡Pago Aprobado y Orden Confirmada!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Número de Orden: <strong className="text-amber-400 font-mono text-sm">{completedOrder.orderNumber}</strong>
              </p>
            </div>

            {/* Receipt Details Card */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Cliente:</span>
                  <span className="font-semibold text-white">{completedOrder.customer.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Fecha y Hora:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(completedOrder.createdAt).toLocaleDateString()} {new Date(completedOrder.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider block">
                  Repuestos Facturados & Descontados de Inventario:
                </span>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-slate-200">
                      {item.quantity}x {item.name} ({item.sku})
                    </span>
                    <span className="font-mono tabular-nums text-white font-medium">
                      {formatCurrencyPEN(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="pt-3 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">{formatCurrencyPEN(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discount && completedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Descuento de Registro (10%):</span>
                    <span className="font-mono tabular-nums">-{formatCurrencyPEN(completedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>IGV / Impuestos (18%):</span>
                  <span className="font-mono tabular-nums">{formatCurrencyPEN(completedOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Envío Express:</span>
                  <span className="font-mono tabular-nums">
                    {completedOrder.shipping === 0 ? 'GRATIS' : formatCurrencyPEN(completedOrder.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Pagado:</span>
                  <span className="font-mono text-amber-400 text-base tabular-nums">
                    {formatCurrencyPEN(completedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Shipping & Tracking Status */}
              <div className="p-3 bg-slate-900 rounded-lg flex items-center gap-3 text-slate-300">
                <Truck className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Destino de Entrega:</span>
                  <span className="text-slate-400">
                    {completedOrder.customer.address}, {completedOrder.customer.city} (CP: {completedOrder.customer.postalCode})
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Recibo</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
              >
                Finalizar y Volver a la Tienda
              </button>
            </div>
          </div>
        )}

        {/* Form State */}
        {step === 'form' && (
          <form onSubmit={handleProcessPayment} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Customer & Shipping Address */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Truck className="w-4 h-4 text-amber-500" />
                  <span>1. Datos del Cliente & Envío</span>
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Ciudad / Estado</label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Código Postal</label>
                    <input
                      type="text"
                      required
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Optional Vehicle info for workshop reference */}
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Vehículo donde se instalarán los repuestos:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Marca"
                      value={customer.vehicleMake}
                      onChange={(e) => setCustomer({ ...customer, vehicleMake: e.target.value })}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Modelo"
                      value={customer.vehicleModel}
                      onChange={(e) => setCustomer({ ...customer, vehicleModel: e.target.value })}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Año"
                      value={customer.vehicleYear}
                      onChange={(e) => setCustomer({ ...customer, vehicleYear: e.target.value })}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Gateway Selector & Card inputs */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>2. Método de Pago Seguro</span>
                </h3>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                      paymentMethod === 'credit_card'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                      paymentMethod === 'paypal'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold tracking-tight text-blue-400">PayPal</span>
                    <span>Express</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Transferencia</span>
                  </button>
                </div>

                {/* Card Fields */}
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Número de Tarjeta (Visa, Mastercard, Amex)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="4532 0000 0000 0000"
                          className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      </div>
                      {cardErrors.card && <p className="text-[11px] text-red-400 mt-1">{cardErrors.card}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Nombre del Titular
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs uppercase text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Vencimiento (MM/AA)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                        />
                        {cardErrors.expiry && <p className="text-[11px] text-red-400 mt-1">{cardErrors.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Código de Seguridad (CVV)
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                        />
                        {cardErrors.cvv && <p className="text-[11px] text-red-400 mt-1">{cardErrors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal view */}
                {paymentMethod === 'paypal' && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                    <p>Serás redirigido a la pasarela segura de PayPal para autorizar tu pago de forma instantánea.</p>
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-300">
                      Protección al Comprador PayPal activada para repuestos automotrices.
                    </div>
                  </div>
                )}

                {/* Bank transfer view */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                    <p className="font-semibold text-white font-sans">Datos de Cuenta Concentradora:</p>
                    <p>Banco: BBVA Bancomer / Santander</p>
                    <p>CLABE: 0121 8000 4492 8192 10</p>
                    <p>Beneficiario: VORTEKSA S.A. de C.V.</p>
                    <p className="text-amber-400 font-sans text-[11px] pt-1">
                      El inventario se reserva por 2 horas en espera de tu comprobante.
                    </p>
                  </div>
                )}

                {/* Security trust badges */}
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Encriptación 256-bit SSL</span>
                  </div>
                  <span className="font-mono">PCI-DSS Nivel 1</span>
                </div>
              </div>
            </div>

            {/* Total and Submit CTA */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-slate-400">Total a Pagar (Incluye IGV y Envío):</span>
                  {discountApplied && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded font-bold">
                      10% OFF (-{formatCurrencyPEN(discount)})
                    </span>
                  )}
                </div>
                <span className="font-display font-extrabold text-2xl text-amber-400 font-mono tabular-nums">
                  {formatCurrencyPEN(total)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Confirmar y Pagar {formatCurrencyPEN(total)}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
