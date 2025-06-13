import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFormSchema, insertFormResponseSchema, FormFieldSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Form routes
  app.post("/api/forms", async (req, res) => {
    try {
      const validatedData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(validatedData);
      res.json(form);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.get("/api/forms", async (req, res) => {
    try {
      const forms = await storage.getAllForms();
      res.json(forms);
    } catch (error) {
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

  app.put("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateForm(id, validatedData);
      if (!updatedForm) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(updatedForm);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteForm(id);
      if (!deleted) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json({ success: true });
    } catch (error) {
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
      const stats = await storage.getFormResponseStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
