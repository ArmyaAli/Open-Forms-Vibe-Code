import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./auth-storage";
import { insertFormSchema, insertFormResponseSchema, FormFieldSchema } from "@shared/schema";
import { setupSession, setupAuthRoutes, updateSessionActivity, requireAuth } from "./auth-routes";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session and authentication
  setupSession(app);
  setupAuthRoutes(app);
  
  // Add session activity middleware to all routes
  app.use(updateSessionActivity);

  // Form routes (protected)
  app.post("/api/forms", requireAuth, async (req, res) => {
    try {
      const validatedData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(validatedData);
      res.json(form);
    } catch (error) {
      console.error("Form creation error:", error);
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.get("/api/forms", requireAuth, async (req, res) => {
    try {
      const forms = await storage.getAllForms();
      res.json(forms);
    } catch (error) {
      console.error("Forms fetch error:", error);
      res.status(500).json({ error: "Failed to fetch forms" });
    }
  });

  app.get("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const form = await storage.getForm(id);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  app.get("/api/forms/share/:shareId", async (req, res) => {
    try {
      const shareId = req.params.shareId;
      const form = await storage.getFormByShareId(shareId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  app.put("/api/forms/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateForm(id, validatedData);
      if (!updatedForm) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(updatedForm);
    } catch (error) {
      console.error("Form update error:", error);
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.delete("/api/forms/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteForm(id);
      if (!deleted) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Form deletion error:", error);
      res.status(500).json({ error: "Failed to delete form" });
    }
  });

  // Form response routes
  app.post("/api/forms/:id/responses", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      const validatedData = insertFormResponseSchema.parse({
        formId,
        responses: req.body.responses,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const response = await storage.createFormResponse(validatedData);
      res.json(response);
    } catch (error) {
      res.status(400).json({ error: "Invalid response data" });
    }
  });

  app.get("/api/forms/:id/responses", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const responses = await storage.getFormResponses(formId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.get("/api/responses", async (req, res) => {
    try {
      const responses = await storage.getAllFormResponses();
      const forms = await storage.getAllForms();
      
      // Enrich responses with form data
      const enrichedResponses = responses.map(response => {
        const form = forms.find(f => f.id === response.formId);
        return {
          ...response,
          formTitle: form?.title || "Unknown Form",
          formDescription: form?.description || "",
        };
      });

      res.json(enrichedResponses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.get("/api/responses/stats", async (req, res) => {
    try {
      const responses = await storage.getAllFormResponses();
      const today = new Date().toISOString().split('T')[0];
      const todayResponses = responses.filter(r => 
        r.submittedAt.toISOString().split('T')[0] === today
      );
      
      const stats = {
        totalResponses: responses.length,
        todayResponses: todayResponses.length,
        completionRate: 87,
        averageTime: "2:34"
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Stats endpoint error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
