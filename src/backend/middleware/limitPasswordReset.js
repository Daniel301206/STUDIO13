const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_ADDRESSES = 10_000;

const getAddress = (req) => req.ip || req.socket.remoteAddress || "desconocida";

const createLimiter = (maxAttempts, mensaje) => {
  const attemptsByAddress = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const address = getAddress(req);
    let attempts = attemptsByAddress.get(address);

    if (!attempts || attempts.resetAt <= now) {
      if (attemptsByAddress.size >= MAX_TRACKED_ADDRESSES) {
        const oldestAddress = attemptsByAddress.keys().next().value;
        if (oldestAddress !== undefined) attemptsByAddress.delete(oldestAddress);
      }
      attempts = { count: 0, resetAt: now + WINDOW_MS };
      attemptsByAddress.set(address, attempts);
    }

    if (attempts.count >= maxAttempts) {
      res.setHeader("Retry-After", Math.ceil((attempts.resetAt - now) / 1000));
      return res.status(429).json({ error: mensaje });
    }

    attempts.count += 1;
    return next();
  };
};

const limitPasswordResetRequests = createLimiter(
  3,
  "Demasiadas solicitudes de recuperación. Inténtalo más tarde.",
);

export const limitPasswordResetSubmit = createLimiter(
  10,
  "Demasiados intentos para restablecer la contraseña. Inténtalo más tarde.",
);

export default limitPasswordResetRequests;
