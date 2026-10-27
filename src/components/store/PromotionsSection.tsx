import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Flame, 
  Clock, 
  Percent, 
  Check, 
  Copy, 
  ShoppingCart, 
  PhoneCall, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Gift
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  PROMO_COMBOS, 
  PROMO_COUPONS, 
  OFFICIAL_PHONE, 
  OFFICIAL_WHATSAPP_URL, 
  PromoCombo 
} from '../../data/promotionsData';
import { Product } from '../../types';
import { formatCurrencyPEN } from '../../utils/formatters';

interface PromotionsSectionProps {
  onOpenDetails?: (product: Product) => void;
}

export const PromotionsSection: React.FC<PromotionsSectionProps> = ({ onOpenDetails }) => {
  const { products, addToCart, applyDiscountCode } = useApp();
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Dynamic countdown timer for promotional urgency
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 36,
    seconds: 48
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleApplyCoupon = (code: string) => {
    const ok = applyDiscountCode(code);
    if (ok) {
      setAppliedCoupon(code);
      setTimeout(() => setAppliedCoupon(null), 3000);
    }
  };

  const handleAddComboToCart = (combo: PromoCombo) => {
    // Add all constituent products of the combo to cart
    combo.productIds.forEach((pid) => {
      const prod = products.find(p => p.id === pid);
      if (prod) {
        addToCart(prod, 1);
      }
    });
  };

  return (
    <section 
      id="promociones" 
      aria-label="Promociones y Ofertas Especiales"
      className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Decorative Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full" />
      </div>

      {/* Top Banner: Urgency & Phone Contact */}
      <div className="mb-10 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-2xl p-4 sm:p-6 text-slate-950 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider bg-slate-950/20 px-2 py-0.5 rounded">
                VENTA ESPECIAL DE TEMPORADA
              </span>
              <span className="text-xs font-bold font-mono">10% a 20% OFF</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-extrabold text-slate-950 mt-0.5">
              Promociones Exclusivas en Repuestos de Rendimiento
            </h3>
          </div>
        </div>

        {/* Live Countdown & Hotline */}
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {/* Countdown Clock */}
          <div className="bg-slate-950/90 text-white px-3.5 py-2 rounded-xl flex items-center gap-2 border border-slate-900 shadow">
            <Clock className="w-4 h-4 text-amber-400" />
            <div className="font-mono font-bold text-xs flex items-center gap-1">
              <span>{String(timeLeft.days).padStart(2, '0')}d</span>:
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
              <span className="text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          {/* Direct Phone Callout */}
          <a
            href={`tel:${OFFICIAL_PHONE}`}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-400 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            title="Llama directamente al 931978990"
          >
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>Pedidos: {OFFICIAL_PHONE}</span>
          </a>
        </div>
      </div>

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Tag className="w-3.5 h-3.5" />
          <span>Kits & Combos con Descuento</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
          Packs Promocionales de Rendimiento
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Combina piezas complementarias y ahorra hasta $180 en comparación al precio individual. Todas las piezas cuentan con stock sincronizado en bodega.
        </p>
      </div>

      {/* Promo Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {PROMO_COMBOS.map((combo) => {
          const savings = combo.regularPrice - combo.promoPrice;
          return (
            <div
              key={combo.id}
              className="relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {combo.badge}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  -{combo.discountPercent}% OFF COMBO
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-display font-bold text-white group-hover:text-amber-400 transition-colors">
                  {combo.title}
                </h3>
                <span className="text-xs font-mono text-slate-400 block font-semibold">
                  {combo.subtitle}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {combo.description}
                </p>
              </div>

              {/* Products included list */}
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-5 space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                  Incluye en este combo:
                </span>
                {combo.productNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-200">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{name}</span>
                  </div>
                ))}
              </div>

              {/* Pricing & Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="line-through font-mono">{formatCurrencyPEN(combo.regularPrice)}</span>
                    <span className="text-emerald-400 font-mono font-bold">Ahorras {formatCurrencyPEN(savings)}</span>
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400">
                    {formatCurrencyPEN(combo.promoPrice)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`${OFFICIAL_WHATSAPP_URL}&text=Deseo%20el%20combo%20${encodeURIComponent(combo.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                    title="Pedir por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleAddComboToCart(combo)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Añadir Combo al Carrito</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Discount Coupons Strip */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h4 className="font-display font-bold text-sm sm:text-base text-white">
              Cupones de Descuento Activos
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Aplica el código en el carrito o menciónalo al llamar al <strong className="text-amber-400">{OFFICIAL_PHONE}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROMO_COUPONS.map((cpn) => {
            const isCopied = copiedCoupon === cpn.code;
            return (
              <div 
                key={cpn.code}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {cpn.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {cpn.discount}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white block mb-0.5">{cpn.label}</span>
                  <p className="text-[11px] text-slate-400 leading-tight mb-3">
                    {cpn.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900">
                  <button
                    onClick={() => handleCopyCoupon(cpn.code)}
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-semibold rounded-lg border border-slate-800 flex items-center justify-center gap-1 transition-colors"
                    title="Copiar código"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={() => handleApplyCoupon(cpn.code)}
                    className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                    title="Aplicar a la compra"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
