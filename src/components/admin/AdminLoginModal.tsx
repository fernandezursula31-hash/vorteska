import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowLeft, AlertCircle, CheckCircle2, UserCheck, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onReturnToStore: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onReturnToStore }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMinutes, setLockMinutes] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Por favor ingresa usuario/correo y contraseña autorizados.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: usernameOrEmail.trim(),
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('vorteksa_admin_token', data.token);
        localStorage.setItem('vorteksa_admin_user', JSON.stringify(data.user));
        onSuccess();
      } else {
        if (response.status === 429) {
          setIsLocked(true);
          setLockMinutes(data.remainingMinutes || 15);
        }
        setErrorMessage(data.error || 'Credenciales no autorizadas.');
      }
    } catch (err) {
      // Si el backend no está disponible en este momento, permitir fallback seguro con la cuenta inicial
      setErrorMessage('Error de conexión con el servidor de autenticación. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaultCredentials = () => {
    setUsernameOrEmail('admin');
    setPassword('VorteksaAdmin2026!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-slate-950 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top security banner */}
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/60 p-6 border-b border-slate-800 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
            Área de Acceso Restringido
          </span>
          <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
            Personal Autorizado
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Panel administrativo y control de inventario VORTEKSA.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Information box: No public registration */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Políticas de Seguridad Corporativa</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No existe registro público. Las credenciales de acceso solo son otorgadas internamente por la administración.
            </p>
          </div>

          {/* Lockout alert */}
          {isLocked && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-700/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Acceso bloqueado temporalmente</p>
                <p className="text-[11px] text-red-300 mt-0.5">
                  Por seguridad, esta terminal ha sido bloqueada tras 5 intentos erróneos. Tiempo de espera: {lockMinutes} min.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !isLocked && (
            <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/50 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Usuario o Correo Institucional
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isLocked || isLoading}
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="ej. admin o fernandezursula31@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Contraseña de Administrador
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Hash SHA-512</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked || isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Verificando con Servidor...' : 'Ingresar al Panel Administrativo'}</span>
            </button>
          </form>

          {/* Quick Credential Pre-fill for Authorized Superadmin */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleUseDefaultCredentials}
              className="text-[11px] text-slate-400 hover:text-amber-400 font-mono transition-colors underline"
            >
              Cargar credenciales maestras iniciales (admin / VorteksaAdmin2026!)
            </button>
          </div>

          {/* Back to Public Store */}
          <button
            type="button"
            onClick={onReturnToStore}
            className="w-full py-2.5 px-3 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Tienda Pública</span>
          </button>
        </div>
      </div>
    </div>
  );
};
