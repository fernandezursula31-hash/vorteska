import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldCheck, Key, Trash2, AlertCircle, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';

interface StaffUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
  createdBy: string;
}

export const AdminStaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('vorteksa_admin_token') || '';

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.users || []);
      } else {
        setError('No se pudo sincronizar la lista de personal del servidor.');
      }
    } catch {
      setError('Error al consultar el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          role: 'admin'
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(`Usuario autorizado "${name}" creado exitosamente.`);
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setShowAddForm(false);
        fetchStaff();
      } else {
        setError(data.error || 'Error al crear usuario.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (!window.confirm(`¿Estás seguro de revocar el acceso administrativo a ${userName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Acceso revocado para ${userName}.`);
        fetchStaff();
      } else {
        setError(data.error || 'Error al eliminar usuario.');
      }
    } catch {
      setError('Error al procesar la solicitud.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-mono font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Seguridad & Control de Accesos</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Personal Autorizado al Panel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Las cuentas no se pueden crear de forma pública. Solo administradores autorizados pueden dar de alta a nuevos colaboradores.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'Cerrar Formulario' : 'Dar de Alta Colaborador'}</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700/80 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form to Add New Admin */}
      {showAddForm && (
        <div className="p-6 bg-slate-900 border border-amber-500/30 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Alta de Nuevo Administrador</span>
          </h3>

          <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                placeholder="ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                required
                placeholder="ej. jperez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="ej. jperez@vorteksa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contraseña Temporal (mínimo 8 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Guardando...' : 'Crear y Otorgar Acceso'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Alta Por</th>
                <th className="px-4 py-3">Fecha de Creación</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffList.map((user) => (
                <tr key={user.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-amber-400">
                    @{user.username}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'superadmin'
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                        : 'bg-blue-500/15 border border-blue-500/40 text-blue-300'
                    }`}>
                      {user.role === 'superadmin' ? 'Superadmin' : 'Administrador'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {user.createdBy}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== 'superadmin' ? (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                        title="Revocar acceso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Principal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
