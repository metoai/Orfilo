import { Request, Response, NextFunction } from 'express';
import { authenticateServerRequest } from './server.ts';

/**
 * Express middleware to enforce Supabase authentication on API routes.
 * Derives authenticated user strictly from verified Supabase session token.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  }

  const user = await authenticateServerRequest(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired Supabase session' });
  }

  // Attach verified user to request
  (req as any).user = user;
  next();
}

/**
 * Optional authentication helper: extracts user if token is valid, proceeds if not.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const user = await authenticateServerRequest(authHeader);
    if (user) {
      (req as any).user = user;
    }
  }
  next();
}
