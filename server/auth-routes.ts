import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./auth-storage";
import { loginSchema, registerSchema } from "@shared/schema";
import { nanoid } from "nanoid";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    email?: string;
    sessionId?: string;
    lastActivity?: number;
  }
}

// Session configuration
export function setupSession(app: Express) {
  const sessionTtl = 30 * 60 * 1000; // 30 minutes
  const PgSession = connectPg(session);
  
  const sessionStore = new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl / 1000, // Convert to seconds
    tableName: "sessions",
  });

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "your-super-secret-key-change-this-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset session expiry on each request
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  }));
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Update last activity
  req.session.lastActivity = Date.now();
  next();
}

// Session activity middleware
export function updateSessionActivity(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId && req.session.sessionId) {
    // Update session activity in database
    storage.updateSessionActivity(req.session.sessionId).catch(console.error);
    req.session.lastActivity = Date.now();
  }
  next();
}

// Authentication routes
export function setupAuthRoutes(app: Express) {
  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Create user
      const user = await storage.createUser(validatedData);
      
      // Create session
      const sessionId = nanoid(32);
      await storage.createUserSession(
        user.id,
        sessionId,
        req.ip,
        req.get("User-Agent")
      );

      // Set session data
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.sessionId = sessionId;
      req.session.lastActivity = Date.now();

      // Update last login
      await storage.updateUserLastLogin(user.id);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Registration failed" 
      });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Create session
      const sessionId = nanoid(32);
      await storage.createUserSession(
        user.id,
        sessionId,
        req.ip,
        req.get("User-Agent")
      );

      // Set session data
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.sessionId = sessionId;
      req.session.lastActivity = Date.now();

      // Update last login
      await storage.updateUserLastLogin(user.id);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Login failed" 
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.sessionId) {
        await storage.invalidateSession(req.session.sessionId);
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Current user endpoint
  app.get("/api/auth/user", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        address: user.address,
        lastLoginAt: user.lastLoginAt,
      });
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { firstName, lastName, profilePicture, phoneNumber, address } = req.body;

      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        profilePicture,
        phoneNumber,
        address,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profilePicture: updatedUser.profilePicture,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        lastLoginAt: updatedUser.lastLoginAt,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Session check endpoint (for idle timeout)
  app.get("/api/auth/session-check", (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ authenticated: false });
    }

    const lastActivity = req.session.lastActivity || 0;
    const now = Date.now();
    const idleTime = now - lastActivity;
    const maxIdleTime = 30 * 60 * 1000; // 30 minutes

    res.json({
      authenticated: true,
      idleTime,
      maxIdleTime,
      timeRemaining: maxIdleTime - idleTime,
    });
  });

  // Refresh session endpoint (for extending session)
  app.post("/api/auth/refresh-session", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.sessionId) {
        await storage.updateSessionActivity(req.session.sessionId);
      }
      
      req.session.lastActivity = Date.now();
      
      res.json({ 
        success: true,
        lastActivity: req.session.lastActivity,
      });
    } catch (error) {
      console.error("Session refresh error:", error);
      res.status(500).json({ error: "Failed to refresh session" });
    }
  });

  // Cleanup expired sessions (can be called periodically)
  app.post("/api/auth/cleanup-sessions", async (req: Request, res: Response) => {
    try {
      await storage.cleanupExpiredSessions();
      res.json({ success: true });
    } catch (error) {
      console.error("Session cleanup error:", error);
      res.status(500).json({ error: "Failed to cleanup sessions" });
    }
  });
}