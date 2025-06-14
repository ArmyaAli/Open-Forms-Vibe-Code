import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull().$type<FormField[]>(),
  rows: jsonb("rows").notNull().$type<FormRow[]>(),
  themeColor: text("theme_color").default("#6366F1"),
  isPublished: boolean("is_published").default(false),
  shareId: text("share_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull(),
  responses: jsonb("responses").notNull().$type<Record<string, any>>(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
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
  "checkbox",
  "phone",
  "date",
  "time",
  "rating",
  "file",
  "address",
  "range",
  "toggle"
]);

export const FormFieldSchema = z.object({
  id: z.string(),
  type: FormFieldType,
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for select, radio, checkbox
  rowId: z.string().optional(), // ID of the row this field belongs to
  columnIndex: z.number().min(0).max(3).optional(), // 0-3 for positions within the row
  width: z.number().min(1).max(4).optional().default(1), // how many columns this field spans
});

export const FormRowSchema = z.object({
  id: z.string(),
  order: z.number(), // order of rows in the form
  columns: z.number().min(1).max(4).default(1), // number of columns in this row
});

export const insertFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  rows: z.array(FormRowSchema),
  themeColor: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const insertFormResponseSchema = z.object({
  formId: z.number(),
  responses: z.record(z.any()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type FormField = z.infer<typeof FormFieldSchema>;
export type FormRow = z.infer<typeof FormRowSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type FormResponse = typeof formResponses.$inferSelect;
export type InsertFormResponse = z.infer<typeof insertFormResponseSchema>;

// Form serialization schemas
export const SerializableFormSchema = z.object({
  version: z.string().default("1.0.0"),
  exportedAt: z.string(),
  formData: z.object({
    title: z.string(),
    description: z.string().optional(),
    fields: z.array(FormFieldSchema),
    rows: z.array(FormRowSchema),
    themeColor: z.string(),
    metadata: z.object({
      fieldCount: z.number(),
      rowCount: z.number(),
      complexity: z.enum(["simple", "moderate", "complex"]),
    }),
  }),
});

export const ImportFormSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  rows: z.array(FormRowSchema),
  themeColor: z.string().optional(),
});

export type SerializableForm = z.infer<typeof SerializableFormSchema>;
export type ImportForm = z.infer<typeof ImportFormSchema>;

// Session storage table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profilePicture: text("profile_picture"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: text("address"),
  isEmailVerified: boolean("is_email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User sessions table for tracking active sessions
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  profilePicture: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
