import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull().$type<FormField[]>(),
  themeColor: text("theme_color").default("#6366F1"),
  isPublished: boolean("is_published").default(false),
  shareId: text("share_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull(),
  responses: jsonb("responses").notNull().$type<Record<string, any>>(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const FormFieldType = z.enum([
  "text",
  "email", 
  "number",
  "textarea",
  "select",
  "radio",
  "checkbox"
]);

export const FormFieldSchema = z.object({
  id: z.string(),
  type: FormFieldType,
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for select, radio, checkbox
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormResponseSchema = createInsertSchema(formResponses).omit({
  id: true,
  submittedAt: true,
});

export type FormField = z.infer<typeof FormFieldSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type FormResponse = typeof formResponses.$inferSelect;
export type InsertFormResponse = z.infer<typeof insertFormResponseSchema>;

// User schema (existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
