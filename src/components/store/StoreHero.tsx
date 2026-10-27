import React from 'react';
import { Search, ShieldCheck, Award, Wrench, Tag, ChevronRight, PhoneCall, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ============================================================================
// CONFIGURACIÓN DE VIDEO HERO - REEMPLAZA AQUÍ LA URL DE TU VIDEO
// ============================================================================
// Puedes cambiar esta URL por tu propio video (archivo local en /public o link directo en la nube)
export const VIDEO_URL = '/assets/aistudio/eeste_3561141c.mp4';

// Imagen de respaldo (poster) que se muestra mientras el video carga
export const POSTER_IMAGE_URL = '/assets/images/hero_automotive_parts_1792689415906.webp';
// ============================================================================

interface StoreHeroProps {
  onOpenRegister?: () => void;
  onOpenBrandModal?: () => void;
}

export const StoreHero: React.FC<StoreHeroProps> = ({ onOpenRegister, onOpenBrandModal }) => {
  const { searchQuery, setSearchQuery, vehicleFilter } = useApp();

  return (
    <section className="relative overflow-hidden min-h-[620px] flex flex-col justify-center border-b border-white/10">
      {/* ==================================================================== */}
      {/* 2. VIDEO EN LA PARTE SUPERIOR (HERO) CON POSTER DE RESPALDO */}
      {/* ==================================================================== */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={POSTER_IMAGE_URL}
          className="w-full h-full object-cover scale-105 transition-transform duration-1000"
        >
          <source src={VIDEO_URL} type="video/mp4" />
          Tu navegador no soporta reproducción de video.
        </video>

        {/* Capa oscura semitransparente con degradado para lectura óptima */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95 backdrop-blur-[2px]" />
        
        {/* Reflejos de luz ambiental estilo Liquid Glass */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* ==================================================================== */}
      {/* CONTENIDO PRINCIPAL SOBRE EL VIDEO */}
      {/* ==================================================================== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full flex flex-col">
        {/* Barra superior de beneficios */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={onOpenRegister}
            className="inline-flex items-center gap-1.5 px-3 py-1 liquid-glass text-amber-300 text-xs font-semibold rounded-full hover:border-amber-400/50 transition-all cursor-pointer group shadow-lg"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>🎁 10% DE DESCUENTO ACTIVO: Cupón BIENVENIDO10</span>
            <span className="text-amber-400 font-mono text-[10px] group-hover:underline">
              (Aplicado en soles S/ ✓)
            </span>
          </button>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            · Inventario en Tiempo Real
          </span>
        </div>

        {/* Lema Oficial de Marca */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <div
            onClick={onOpenBrandModal}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass text-xs transition-all ${
              onOpenBrandModal ? 'cursor-pointer hover:border-amber-400/60' : ''
            }`}
            title="Conoce la paleta de colores, logo y manual de marca"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              Lema Oficial:
            </span>
            <span className="text-slate-100 italic font-medium text-xs sm:text-[13px]">
              “Potencia, precisión y confianza para cada kilómetro”
            </span>
          </div>
        </div>

        {/* Título y Descripción Hero */}
        <div className="max-w-3xl mb-6">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-display mb-3 drop-shadow-md"
            style={{ textWrap: 'balance' }}
          >
            Repuestos y accesorios de ingeniería para tu auto
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed drop-shadow">
            Kits de frenos cerámicos, suspensión regulable Coilover, turbocompresores y consumibles de alto rendimiento con validación de calce exacto y precios oficiales en Soles (S/).
          </p>
        </div>

        {/* ================================================================== */}
        {/* SECCIÓN DE BÚSQUEDA "BUSCAR POR REPUESTOS" */}
        {/* ================================================================== */}
        <div id="buscar-repuestos" className="max-w-2xl mb-8 scroll-mt-24">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 font-mono">
            Buscar por repuestos
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/80 transition-colors group-focus-within:text-amber-400" />
            <input
              type="text"
              placeholder="Buscar por repuestos, código SKU, marca o número de parte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 liquid-glass-input rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white px-2.5 py-1 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Limpiar
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700/60">
                  Enter ↵
                </span>
              </div>
            )}
          </div>

          {/* Botones de acción rápida sobre el video */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs">
            <button
              onClick={() => {
                const el = document.getElementById('catalogo-repuestos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 liquid-glass-button text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <span>Explorar Catálogo</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('promociones');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 liquid-glass hover:bg-white/10 text-amber-300 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/30"
            >
              <span>🔥 Ver Promociones en S/</span>
            </button>

            <a
              href="tel:931978990"
              className="px-3.5 py-2 liquid-glass hover:bg-white/10 text-emerald-300 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pedidos: 931978990</span>
            </a>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. LOS TRES BLOQUES DE CONFIANZA UBICADOS DEBAJO DE LA BÚSQUEDA */}
        {/* 1 fila en computadoras, 1 columna en celulares con Liquid Glass */}
        {/* ================================================================== */}
        <div className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta 1: Tolerancia & Certificación OEM */}
            <div className="liquid-glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-display font-bold text-base text-white mb-1.5">
                  Tolerancia & Certificación OEM
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cada componente es calibrado bajo estrictos estándares automotrices internacionales con pruebas de esfuerzo y tolerancia milimétrica garantizada.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-amber-400/90 font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Calidad OEM verificada</span>
              </div>
            </div>

            {/* Tarjeta 2: Garantía de Calce 100% Exacto */}
            <div className="liquid-glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-display font-bold text-base text-white mb-1.5">
                  Garantía de Calce 100% Exacto
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Si adquieres una pieza para el modelo y año de tu vehículo y no calza a la perfección, gestionamos cambio o reembolso inmediato sin demoras.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>100% Respaldo directo</span>
              </div>
            </div>

            {/* Tarjeta 3: Asesoría Técnica Especializada */}
            <div className="liquid-glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-display font-bold text-base text-white mb-1.5">
                  Asesoría Técnica Especializada
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ingenieros y técnicos automotrices te orientan por chat o WhatsApp en medidas, compatibilidad VIN y especificaciones de instalación de tu auto.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-blue-400/90 font-semibold">
                <Wrench className="w-3 h-3 text-blue-400" />
                <span>Atención técnica directa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de filtro de vehículo activo */}
        {vehicleFilter.make !== 'Todas las Marcas' && (
          <div className="mt-6 p-3 liquid-glass rounded-xl flex items-center justify-between text-xs text-amber-300 border border-amber-500/40">
            <span>
              Filtrando repuestos compatibles con: <strong>{vehicleFilter.make} {vehicleFilter.model} {vehicleFilter.year}</strong>
            </span>
            <button
              onClick={() => useApp().setVehicleFilter({ make: 'Todas las Marcas', model: '', year: '' })}
              className="underline text-amber-200 hover:text-white cursor-pointer ml-3 font-semibold"
            >
              Restablecer filtro
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
