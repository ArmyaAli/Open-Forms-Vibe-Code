import { db } from "./db";
import { users, userSessions, forms, formResponses, type User, type Form, type FormResponse, type UserSession } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export interface IStorage {
  // User authentication methods
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: any): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  
  // Session methods
  createUserSession(userId: number, sessionId: string, ipAddress?: string, userAgent?: string): Promise<void>;
  getUserSession(sessionId: string): Promise<UserSession | undefined>;
  updateSessionActivity(sessionId: string): Promise<void>;
  invalidateSession(sessionId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User authentication methods
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isEmailVerified: false,
      })
      .returning();
    
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserProfile(id: number, updates: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        firstName: updates.firstName,
        lastName: updates.lastName,
        profilePicture: updates.profilePicture,
        phoneNumber: updates.phoneNumber,
        address: updates.address,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  async updateUserSubscription(id: number, subscriptionData: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionTier: subscriptionData.subscriptionTier,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        subscriptionStatus: subscriptionData.subscriptionStatus,
        subscriptionEndsAt: subscriptionData.subscriptionEndsAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  // Session methods
  async createUserSession(userId: number, sessionId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes from now

    await db.insert(userSessions).values({
      userId,
      sessionId,
      ipAddress,
      userAgent,
      isActive: true,
      lastActivityAt: new Date(),
      expiresAt,
    });
  }

  async getUserSession(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(and(
        eq(userSessions.sessionId, sessionId),
        eq(userSessions.isActive, true)
      ));
    
    return session;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const newExpiresAt = new Date();
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 30);

    await db
      .update(userSessions)
      .set({ 
        lastActivityAt: new Date(),
        expiresAt: newExpiresAt 
      })
      .where(eq(userSessions.sessionId, sessionId));
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.sessionId, sessionId));
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.expiresAt, new Date()));
  }

  // Form methods
  async createForm(formData: any): Promise<Form> {
    const shareId = nanoid(12);
    
    const [form] = await db
      .insert(forms)
      .values({
        title: formData.title || "Untitled Form",
        description: formData.description || null,
        fields: formData.fields || [],
        rows: formData.rows || [{ id: nanoid(), order: 0, columns: 1 }],
        themeColor: formData.themeColor || "#6366F1",
        isPublished: formData.isPublished || false,
        shareId,
      })
      .returning();
    
    return form;
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async getFormByShareId(shareId: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.shareId, shareId));
    return form;
  }

  async getAllForms(): Promise<Form[]> {
    return await db.select().from(forms);
  }

  async updateForm(id: number, updateData: any): Promise<Form | undefined> {
    const [form] = await db
      .update(forms)
      .set({
        title: updateData.title,
        description: updateData.description,
        fields: updateData.fields,
        rows: updateData.rows,
        themeColor: updateData.themeColor,
        isPublished: updateData.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(forms.id, id))
      .returning();
    
    return form;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return result.rowCount > 0;
  }

  // Form response methods
  async createFormResponse(responseData: any): Promise<FormResponse> {
    const [response] = await db
      .insert(formResponses)
      .values({
        formId: responseData.formId,
        responses: responseData.responses,
        ipAddress: responseData.ipAddress,
        userAgent: responseData.userAgent,
      })
      .returning();
    
    return response;
  }

  async getFormResponses(formId: number): Promise<FormResponse[]> {
    return await db
      .select()
      .from(formResponses)
      .where(eq(formResponses.formId, formId));
  }

  async getAllFormResponses(): Promise<FormResponse[]> {
    return await db.select().from(formResponses);
  }
}

export const storage = new DatabaseStorage();