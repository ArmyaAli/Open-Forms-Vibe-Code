import { forms, formResponses, type Form, type InsertForm, type FormResponse, type InsertFormResponse, users, type User, type InsertUser } from "@shared/schema";
import { nanoid } from "nanoid";
import { SQLiteStorage } from "./database";

export interface IStorage {
  // User methods (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  
  // Form methods
  createForm(form: any): Promise<Form>;
  getForm(id: number): Promise<Form | undefined>;
  getFormByShareId(shareId: string): Promise<Form | undefined>;
  getAllForms(): Promise<Form[]>;
  updateForm(id: number, form: any): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  
  // Form response methods
  createFormResponse(response: any): Promise<FormResponse>;
  getFormResponses(formId: number): Promise<FormResponse[]>;
  getAllFormResponses(): Promise<FormResponse[]>;
  getFormResponseStats(): Promise<{
    totalResponses: number;
    todayResponses: number;
    completionRate: number;
    averageTime: string;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private forms: Map<number, Form>;
  private formResponses: Map<number, FormResponse>;
  private currentUserId: number;
  private currentFormId: number;
  private currentResponseId: number;

  constructor() {
    this.users = new Map();
    this.forms = new Map();
    this.formResponses = new Map();
    this.currentUserId = 1;
    this.currentFormId = 1;
    this.currentResponseId = 1;
  }

  // User methods (existing)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      username: insertUser.username || 'user',
      password: insertUser.password || 'password'
    };
    this.users.set(id, user);
    return user;
  }

  // Form methods
  async createForm(form: any): Promise<Form> {
    const id = this.currentFormId++;
    const shareId = nanoid(12);
    const now = new Date();
    const newForm: Form = {
      id,
      title: form.title || "Untitled Form",
      description: form.description || null,
      fields: form.fields || [],
      themeColor: form.themeColor || "#6366F1",
      isPublished: form.isPublished || false,
      shareId,
      createdAt: now,
      updatedAt: now,
    };
    this.forms.set(id, newForm);
    return newForm;
  }

  async getForm(id: number): Promise<Form | undefined> {
    return this.forms.get(id);
  }

  async getFormByShareId(shareId: string): Promise<Form | undefined> {
    return Array.from(this.forms.values()).find(
      (form) => form.shareId === shareId,
    );
  }

  async getAllForms(): Promise<Form[]> {
    return Array.from(this.forms.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async updateForm(id: number, updateData: any): Promise<Form | undefined> {
    const existingForm = this.forms.get(id);
    if (!existingForm) return undefined;

    const updatedForm: Form = {
      ...existingForm,
      ...updateData,
      fields: updateData.fields || existingForm.fields,
      updatedAt: new Date(),
    };
    this.forms.set(id, updatedForm);
    return updatedForm;
  }

  async deleteForm(id: number): Promise<boolean> {
    const deleted = this.forms.delete(id);
    // Also delete associated responses
    Array.from(this.formResponses.entries()).forEach(([responseId, response]) => {
      if (response.formId === id) {
        this.formResponses.delete(responseId);
      }
    });
    return deleted;
  }

  // Form response methods
  async createFormResponse(response: any): Promise<FormResponse> {
    const id = this.currentResponseId++;
    const newResponse: FormResponse = {
      id,
      formId: response.formId || 0,
      responses: response.responses || {},
      submittedAt: new Date(),
      ipAddress: response.ipAddress || null,
      userAgent: response.userAgent || null,
    };
    this.formResponses.set(id, newResponse);
    return newResponse;
  }

  async getFormResponses(formId: number): Promise<FormResponse[]> {
    return Array.from(this.formResponses.values())
      .filter((response) => response.formId === formId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async getAllFormResponses(): Promise<FormResponse[]> {
    return Array.from(this.formResponses.values()).sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
  }

  async getFormResponseStats(): Promise<{
    totalResponses: number;
    todayResponses: number;
    completionRate: number;
    averageTime: string;
  }> {
    const responses = await this.getAllFormResponses();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayResponses = responses.filter(
      (response) => response.submittedAt >= today
    ).length;

    return {
      totalResponses: responses.length,
      todayResponses,
      completionRate: 87, // Mock completion rate
      averageTime: "2:34", // Mock average time
    };
  }
}

// Use SQLite database for persistent storage
export const storage = new SQLiteStorage();

// Keep MemStorage class for reference but use SQLite by default
// export const storage = new MemStorage();
