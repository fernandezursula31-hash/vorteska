import React, { useState, useRef, useEffect } from 'react';
import { Mail, X, Check, Tag, ChevronDown, CheckSquare, Square, Flame } from 'lucide-react';
import { formatCurrencyPEN } from '../../utils/formatters';

// ============================================================================
// CONFIGURACIÓN DE CONTACTO - MODIFICA AQUÍ TUS DATOS FÁCILMENTE
// ============================================================================
// 1. WhatsApp: Escribe tu número internacional sin signos '+' ni espacios ni guiones.
//    Ejemplos: "51931978990" (Perú), "5491123456789" (Argentina), "5215512345678" (México).
const WHATSAPP_PHONE_NUMBER = '51931978990';

// 2. Correo electrónico: Escribe la dirección donde recibirás los pedidos y consultas.
//    Ejemplo: "fernandezursula31@gmail.com" o "ventas@vorteksa.com".
const CONTACT_EMAIL_ADDRESS = 'fernandezursula31@gmail.com';

// 3. Enlace oficial de la página web que saldrá en los mensajes de WhatsApp y Correo
const CUSTOM_WEBSITE_URL = 'https://vorteksa.netlify.app/';
// ============================================================================

export interface PromotionItem {
  id: string;
  name: string;
  includes: string;
  originalPrice: number;
  discountPrice: number;
  savingsAmount: number;
  discountPercentage: number;
}

// Datos oficiales de promociones vigentes
const PROMOTIONS_DATA: PromotionItem[] = [
  {
    id: 'promo-1',
    name: 'Combo Frenado Extremo Track-Spec',
    includes: 'Kit de discos perforados y ranurados PowerStop + Pastillas de freno cerámicas Street & Track.',
    originalPrice: 479.98,
    discountPrice: 394.99,
    savingsAmount: 84.99,
    discountPercentage: 18,
  },
  {
    id: 'promo-2',
    name: 'Pack Mantenimiento Deportivo Pro',
    includes: 'Aceite sintético Motul 300V 0W-40 (5L) + Filtro de aire cónico K&N 3.0".',
    originalPrice: 166.50,
    discountPrice: 132.99,
    savingsAmount: 33.51,
    discountPercentage: 20,
  },
  {
    id: 'promo-3',
    name: 'Kit Stage 1 Turbo Power Boost',
    includes: 'Turbocompresor Garrett G25-660 Twin-Scroll + Filtro de aire cónico K&N.',
    originalPrice: 1494.50,
    discountPrice: 1314.50,
    savingsAmount: 180.00,
    discountPercentage: 12,
  },
  {
    id: 'promo-4',
    name: 'Pack Manejo & Control Deportivo',
    includes: 'Kit de suspensión Coilover regulable RS Performance Track-Spec + Volante deportivo forrado en alcántara con costura roja 350mm.',
    originalPrice: 839.50,
    discountPrice: 713.50,
    savingsAmount: 126.00,
    discountPercentage: 15,
  },
];

export const FloatingContactBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Por defecto todas las promociones están seleccionadas para facilitar la consulta
  const [selectedPromoIds, setSelectedPromoIds] = useState<string[]>(
    PROMOTIONS_DATA.map((p) => p.id)
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Alternar selección de una promoción
  const togglePromo = (id: string) => {
    setSelectedPromoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Seleccionar o deseleccionar todas
  const toggleSelectAll = () => {
    if (selectedPromoIds.length === PROMOTIONS_DATA.length) {
      setSelectedPromoIds([]);
    } else {
      setSelectedPromoIds(PROMOTIONS_DATA.map((p) => p.id));
    }
  };

  // Promociones filtradas según la selección
  const activeSelectedPromos = PROMOTIONS_DATA.filter((p) =>
    selectedPromoIds.includes(p.id)
  );

  // Totales de la selección
  const totalOriginal = activeSelectedPromos.reduce((acc, p) => acc + p.originalPrice, 0);
  const totalDiscount = activeSelectedPromos.reduce((acc, p) => acc + p.discountPrice, 0);
  const totalSavings = activeSelectedPromos.reduce((acc, p) => acc + p.savingsAmount, 0);

  // Construcción del mensaje formateado para WhatsApp y Correo
  const buildPromotionsMessage = () => {
    // Obtener la URL de la página web (personalizada o la URL activa del navegador)
    const currentSiteUrl =
      CUSTOM_WEBSITE_URL.trim() ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://vorteksa.com');

    if (activeSelectedPromos.length === 0) {
      return {
        subject: 'Consulta sobre Promociones y Repuestos VORTEKSA',
        body: `¡Hola equipo de VORTEKSA!\n\nDeseo consultar sobre sus promociones y repuestos disponibles.\n\n🌐 Enlace a la página web:\n${currentSiteUrl}\n\nPor favor, contáctenme para más detalles.\n¡Muchas gracias!`,
      };
    }

    const itemsText = activeSelectedPromos
      .map(
        (p, index) =>
          `${index + 1}. *${p.name}*\n` +
          `   • Incluye: ${p.includes}\n` +
          `   • Precio Original: ${formatCurrencyPEN(p.originalPrice)}\n` +
          `   • Precio con Descuento (-${p.discountPercentage}%): ${formatCurrencyPEN(p.discountPrice)}\n` +
          `   • Ahorro: ${formatCurrencyPEN(p.savingsAmount)}`
      )
      .join('\n\n');

    const summaryText =
      `\n\n📊 *RESUMEN DE COTIZACIÓN (EN SOLES):*\n` +
      `• Total Regular: ${formatCurrencyPEN(totalOriginal)}\n` +
      `• Total con Promoción: ${formatCurrencyPEN(totalDiscount)}\n` +
      `• Ahorro Total: ${formatCurrencyPEN(totalSavings)}`;

    const subject = `Cotización VORTEKSA: ${activeSelectedPromos.length} Promoción(es) Seleccionada(s)`;
    const body =
      `¡Hola equipo VORTEKSA!\n\n` +
      `Me interesa aprovechar las siguientes promociones vigentes de su catálogo:\n\n` +
      `${itemsText}` +
      `${summaryText}\n\n` +
      `🌐 Ver productos en la página web:\n${currentSiteUrl}\n\n` +
      `¿Podrían confirmarme disponibilidad inmediata, métodos de pago y tiempo de despacho a mi dirección?\n\n` +
      `¡Muchas gracias!`;

    return { subject, body };
  };

  // Acción para WhatsApp (wa.me)
  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { body } = buildPromotionsMessage();
    const encodedText = encodeURIComponent(body);
    const cleanNumber = WHATSAPP_PHONE_NUMBER.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Acción para Correo electrónico (mailto:)
  const handleOpenMail = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { subject, body } = buildPromotionsMessage();
    const mailtoUrl = `mailto:${CONTACT_EMAIL_ADDRESS}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 font-sans">
      {/* ==================================================================== */}
      {/* PANEL FLOTANTE DE PROMOCIONES VIGENTES */}
      {/* ==================================================================== */}
      <div
        ref={panelRef}
        aria-hidden={!isOpen}
        className={`fixed sm:absolute bottom-0 right-0 sm:bottom-16 sm:right-0 w-[95vw] sm:w-[460px] max-w-[480px] bg-[#0d1020] border border-[#232b45] shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-2xl flex flex-col max-h-[85vh] sm:max-h-[620px] overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 25px rgba(245, 166, 35, 0.15)',
        }}
      >
        {/* Cabecera del Panel */}
        <div className="px-5 py-4 bg-[#090c17] border-b border-[#1f2640] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f5a623]/15 border border-[#f5a623]/40 flex items-center justify-center text-[#f5a623] shadow-inner">
              <Flame className="w-5 h-5 text-[#f5a623] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white tracking-wide">
                  Promociones Vigentes
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5a623] text-slate-950 uppercase tracking-wider">
                  Ofertas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Selecciona las opciones que deseas cotizar al instante
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-[#141a2e] hover:bg-[#1c243f] border border-[#263152] transition-colors focus:outline-none"
            aria-label="Cerrar promociones"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de utilidades: Seleccionar / Deseleccionar todas */}
        <div className="px-5 py-2.5 bg-[#0e1326] border-b border-[#1c243d] flex items-center justify-between text-xs shrink-0">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-slate-300 hover:text-[#f5a623] transition-colors font-medium cursor-pointer"
          >
            {selectedPromoIds.length === PROMOTIONS_DATA.length ? (
              <>
                <CheckSquare className="w-4 h-4 text-[#f5a623]" />
                <span>Deseleccionar todas</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-slate-400" />
                <span>Seleccionar todas ({PROMOTIONS_DATA.length})</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            {activeSelectedPromos.length} seleccionada(s)
          </span>
        </div>

        {/* Lista de promociones con scroll interno */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#0d1020] to-[#090b16] custom-scroll">
          {PROMOTIONS_DATA.map((promo) => {
            const isSelected = selectedPromoIds.includes(promo.id);

            return (
              <div
                key={promo.id}
                onClick={() => togglePromo(promo.id)}
                className={`relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#13192f] border-[#f5a623]/60 shadow-[0_4px_20px_rgba(245,166,35,0.08)]'
                    : 'bg-[#101426]/80 border-[#1c233c] hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Checkbox y Título */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-[#f5a623] border-[#f5a623] text-slate-950 font-bold'
                        : 'border-slate-600 bg-slate-900/60 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-100 leading-snug">
                        {promo.name}
                      </h4>
                      {/* Badge de porcentaje de descuento */}
                      <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/40 text-xs font-bold font-mono">
                        -{promo.discountPercentage}% OFF
                      </span>
                    </div>

                    {/* Productos incluidos */}
                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed bg-[#0a0d1a]/60 p-2 rounded-lg border border-[#1b223a]">
                      <span className="text-slate-400 font-medium">Incluye: </span>
                      {promo.includes}
                    </p>

                    {/* Precios y Ahorro */}
                    <div className="mt-2.5 pt-2 border-t border-[#1a2139] flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-baseline gap-2">
                        {/* Precio final en negrita color naranja */}
                        <span className="text-lg font-bold text-[#f5a623] tracking-tight">
                          {formatCurrencyPEN(promo.discountPrice)}
                        </span>
                        {/* Precio original tachado en gris */}
                        <span className="text-xs text-slate-400 line-through decoration-slate-500 font-mono">
                          {formatCurrencyPEN(promo.originalPrice)}
                        </span>
                      </div>

                      {/* Monto ahorrado */}
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold font-mono">
                        Ahorras {formatCurrencyPEN(promo.savingsAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen y Botones de Acción (Correo y WhatsApp) */}
        <div className="p-4 bg-[#090c17] border-t border-[#1f2640] shrink-0 space-y-3">
          {/* Subtotal seleccionado */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-400">
              Total {activeSelectedPromos.length} oferta(s):
            </span>
            <div className="text-right">
              <span className="text-base font-bold text-[#f5a623]">
                {formatCurrencyPEN(totalDiscount)}
              </span>
              {totalSavings > 0 && (
                <span className="block text-[10px] text-emerald-400 font-mono">
                  (Ahorras {formatCurrencyPEN(totalSavings)} en total)
                </span>
              )}
            </div>
          </div>

          {/* Dos botones principales de contacto */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Botón de Correo Electrónico */}
            <button
              onClick={handleOpenMail}
              className="w-full py-2.5 px-3 bg-[#151c33] hover:bg-[#1d2646] active:scale-[0.98] text-white border border-[#29355a] hover:border-[#f5a623]/60 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md group cursor-pointer"
              title={`Enviar consulta a ${CONTACT_EMAIL_ADDRESS}`}
            >
              <div className="p-1 rounded-md bg-[#f5a623]/20 text-[#f5a623] group-hover:scale-110 transition-transform">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Enviar por Correo</span>
            </button>

            {/* Botón de WhatsApp Oficial (#25D366) */}
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 cursor-pointer"
              title={`Cotizar por WhatsApp al +${WHATSAPP_PHONE_NUMBER}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current shrink-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="truncate">Pedir por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BURBUJA FLOTANTE FIJA (TRIGGER BAR) */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0d1020]/95 backdrop-blur-md border border-[#222b46] rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.7)] hover:border-[#f5a623]/50 transition-all duration-300">
        {/* Botón 1: Correo electrónico (ícono de sobre) */}
        <button
          onClick={handleOpenMail}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#141b31] hover:bg-[#1b2544] active:scale-95 text-[#f5a623] hover:text-white border border-[#2b375b] flex items-center justify-center transition-all duration-200 shadow-md group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
          title={`Enviar correo con promociones a ${CONTACT_EMAIL_ADDRESS}`}
          aria-label="Contactar por correo electrónico"
        >
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Botón 2: WhatsApp (ícono verde #25D366) */}
        <button
          onClick={handleOpenWhatsApp}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-slate-950 flex items-center justify-center transition-all duration-200 shadow-md shadow-[#25D366]/30 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
          title={`Escribir por WhatsApp a ${WHATSAPP_PHONE_NUMBER}`}
          aria-label="Contactar por WhatsApp"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 sm:w-5 sm:h-5 fill-current group-hover:scale-110 transition-transform"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>

        {/* Botón Central: Abre el panel de promociones */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full font-bold text-xs transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none ${
            isOpen
              ? 'bg-[#1b233e] text-slate-200 border border-[#2f3b64]'
              : 'bg-gradient-to-r from-[#f5a623] to-amber-500 text-slate-950 shadow-md shadow-[#f5a623]/25 hover:brightness-105'
          }`}
          aria-expanded={isOpen}
          aria-label="Ver lista de promociones vigentes"
        >
          <div className="flex items-center gap-1.5">
            <Tag className={`w-3.5 h-3.5 ${isOpen ? 'text-[#f5a623]' : 'text-slate-950'}`} />
            <span className="tracking-tight hidden xs:inline sm:inline">
              {isOpen ? 'Ocultar Ofertas' : 'Promociones'}
            </span>
          </div>

          <span
            className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono font-black ${
              isOpen
                ? 'bg-[#f5a623] text-slate-950'
                : 'bg-slate-950 text-[#f5a623]'
            }`}
          >
            {PROMOTIONS_DATA.length}
          </span>

          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};
