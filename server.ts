import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// CONFIGURACIÓN DE SEGURIDAD Y HASHING CRIPTOGRÁFICO
// ============================================================================
interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  passwordHash: string;
  salt: string;
  createdAt: string;
  createdBy: string;
}

interface AdminSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  createdAt: number;
  expiresAt: number; // Milisegundos
}

interface FailedAttemptTracker {
  attempts: number;
  lockedUntil: number | null; // Timestamp
  lastAttemptAt: number;
}

// Genera un hash con salt usando PBKDF2 de Node.js crypto
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculated, 'hex'));
}

// Almacenamiento en memoria de administradores autorizados (No registro público)
// Cuenta inicial de superadmin preconfigurada
const defaultAdminHash = hashPassword('VorteksaAdmin2026!');

const authorizedAdmins: AdminUserRecord[] = [
  {
    id: 'admin-super-1',
    username: 'admin',
    email: 'fernandezursula31@gmail.com',
    name: 'Ursula Fernandez (Dirección VORTEKSA)',
    role: 'superadmin',
    passwordHash: defaultAdminHash.hash,
    salt: defaultAdminHash.salt,
    createdAt: new Date().toISOString(),
    createdBy: 'Sistema Inicial'
  }
];

// Sesiones activas en memoria
const activeSessions: Map<string, AdminSession> = new Map();

// Rastreador de intentos fallidos por clave (IP o Usuario)
// Regla: 5 intentos fallidos -> Bloqueo temporal por 15 minutos (900,000 ms)
const failedAttemptsMap: Map<string, FailedAttemptTracker> = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas

// Helper para limpiar sesiones expiradas cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}, 10 * 60 * 1000);

// Middleware para verificar sesión de administrador
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso no autorizado. Debe iniciar sesión en el panel administrativo.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    res.status(401).json({ error: 'Sesión no válida o expirada. Por favor inicie sesión nuevamente.' });
    return;
  }

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    res.status(401).json({ error: 'La sesión ha expirado por inactividad. Inicie sesión nuevamente.' });
    return;
  }

  // Renovar sliding expiration si está activo
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  (req as any).adminSession = session;
  next();
}

// ============================================================================
// RUTAS DE LA API ADMINISTRATIVA
// ============================================================================

// 1. Iniciar Sesión de Administrador con Protección Antibrute-force y Bloqueo Temporal
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const trackerKey = `${clientIp}_${(usernameOrEmail || '').toLowerCase().trim()}`;
  const now = Date.now();

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Usuario o correo y contraseña son obligatorios.' });
  }

  // Verificar si está bloqueado temporalmente
  const tracker = failedAttemptsMap.get(trackerKey);
  if (tracker && tracker.lockedUntil && tracker.lockedUntil > now) {
    const minutesRemaining = Math.ceil((tracker.lockedUntil - now) / (60 * 1000));
    return res.status(429).json({
      error: `Acceso bloqueado temporalmente por seguridad tras ${MAX_ATTEMPTS} intentos fallidos. Intente de nuevo en ${minutesRemaining} minuto(s).`,
      isLocked: true,
      remainingMinutes: minutesRemaining
    });
  }

  const normalizedInput = usernameOrEmail.toLowerCase().trim();
  const user = authorizedAdmins.find(
    u => u.username.toLowerCase() === normalizedInput || u.email.toLowerCase() === normalizedInput
  );

  const isValidPassword = user ? verifyPassword(password, user.passwordHash, user.salt) : false;

  if (!user || !isValidPassword) {
    // Registrar intento fallido
    const currentTracker: FailedAttemptTracker = tracker || {
      attempts: 0,
      lockedUntil: null,
      lastAttemptAt: now
    };

    currentTracker.attempts += 1;
    currentTracker.lastAttemptAt = now;

    if (currentTracker.attempts >= MAX_ATTEMPTS) {
      currentTracker.lockedUntil = now + LOCKOUT_DURATION_MS;
      failedAttemptsMap.set(trackerKey, currentTracker);
      return res.status(429).json({
        error: `Acceso temporalmente bloqueado por 15 minutos debido a ${MAX_ATTEMPTS} intentos erróneos.`,
        isLocked: true,
        remainingMinutes: 15
      });
    } else {
      failedAttemptsMap.set(trackerKey, currentTracker);
      const remainingAttempts = MAX_ATTEMPTS - currentTracker.attempts;
      return res.status(401).json({
        error: `Credenciales incorrectas. Te quedan ${remainingAttempts} intento(s) antes del bloqueo de seguridad temporal.`,
        remainingAttempts
      });
    }
  }

  // Éxito: limpiar intentos fallidos
  failedAttemptsMap.delete(trackerKey);

  // Crear token de sesión criptográfico seguro
  const token = crypto.randomBytes(32).toString('hex');
  const session: AdminSession = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS
  };

  activeSessions.set(token, session);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      expiresAt: session.expiresAt
    }
  });
});

// 2. Verificar estado de la sesión activa
app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false, error: 'Sin sesión activa' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ authenticated: false, error: 'Sesión expirada' });
  }

  res.json({
    authenticated: true,
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      expiresAt: session.expiresAt
    }
  });
});

// 3. Cerrar Sesión
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Sesión cerrada correctamente en el servidor.' });
});

// 4. Listar personal administrativo autorizado (Protegido en Servidor)
app.get('/api/admin/users', requireAdminAuth, (req: Request, res: Response) => {
  const sanitizedUsers = authorizedAdmins.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    createdBy: u.createdBy
  }));

  res.json({ users: sanitizedUsers });
});

// 5. Crear nuevo personal autorizado (Solo administradores desde el panel, NO registro público)
app.post('/api/admin/users', requireAdminAuth, (req: Request, res: Response) => {
  const session = (req as any).adminSession as AdminSession;
  const { username, email, name, password, role } = req.body;

  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Nombre, usuario, correo y contraseña son obligatorios.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres por seguridad.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  const exists = authorizedAdmins.some(
    u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
  );

  if (exists) {
    return res.status(409).json({ error: 'Ya existe un administrador registrado con ese usuario o correo.' });
  }

  // Hash de la contraseña con salt
  const { hash, salt } = hashPassword(password);

  const newUser: AdminUserRecord = {
    id: `admin-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    username: cleanUsername,
    email: cleanEmail,
    name: name.trim(),
    role: role === 'superadmin' && session.role === 'superadmin' ? 'superadmin' : 'admin',
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    createdBy: session.name
  };

  authorizedAdmins.push(newUser);

  res.status(201).json({
    success: true,
    message: `Personal autorizado "${newUser.name}" creado con éxito.`,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt
    }
  });
});

// 6. Eliminar personal autorizado (Protegiendo al superadmin)
app.delete('/api/admin/users/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const userToDelete = authorizedAdmins.find(u => u.id === id);

  if (!userToDelete) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  if (userToDelete.role === 'superadmin') {
    return res.status(403).json({ error: 'No es posible eliminar la cuenta principal de Superadministrador.' });
  }

  const index = authorizedAdmins.findIndex(u => u.id === id);
  if (index !== -1) {
    authorizedAdmins.splice(index, 1);
  }

  res.json({ success: true, message: `Usuario ${userToDelete.name} revocado exitosamente.` });
});

// ============================================================================
// INTEGRACIÓN CON VITE (DEV Y PRODUCCIÓN)
// ============================================================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Servir archivos estáticos en producción
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[VORTEKSA Server] Servidor activo en http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[VORTEKSA Server] Error al iniciar el servidor:', err);
});
