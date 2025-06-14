import { User, SUBSCRIPTION_LIMITS, SubscriptionTierType } from "@shared/schema";
import { storage } from "./storage";

export class SubscriptionService {
  static getSubscriptionLimits(tier: SubscriptionTierType) {
    return SUBSCRIPTION_LIMITS[tier];
  }

  static async checkFormLimit(userId: number): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
    const user = await storage.getUserById(userId);
    if (!user) throw new Error("User not found");

    const limits = this.getSubscriptionLimits(user.subscriptionTier as SubscriptionTierType);
    const forms = await storage.getAllForms();
    const userForms = forms.filter(form => form.userId === userId);
    
    return {
      canCreate: limits.maxForms === -1 || userForms.length < limits.maxForms,
      currentCount: userForms.length,
      limit: limits.maxForms
    };
  }

  static async checkResponseLimit(userId: number): Promise<{ canSubmit: boolean; currentCount: number; limit: number }> {
    const user = await storage.getUserById(userId);
    if (!user) throw new Error("User not found");

    const limits = this.getSubscriptionLimits(user.subscriptionTier as SubscriptionTierType);
    const responses = await storage.getAllFormResponses();
    const userResponses = responses.filter(response => {
      // We need to check if the response belongs to a form owned by this user
      // This requires getting the form to check ownership
      return true; // For now, we'll implement this check in the routes
    });
    
    return {
      canSubmit: limits.maxResponses === -1 || userResponses.length < limits.maxResponses,
      currentCount: userResponses.length,
      limit: limits.maxResponses
    };
  }

  static async checkApiAccess(userId: number): Promise<boolean> {
    const user = await storage.getUserById(userId);
    if (!user) return false;

    const limits = this.getSubscriptionLimits(user.subscriptionTier as SubscriptionTierType);
    return limits.hasApiAccess;
  }

  static async upgradeUserToPremium(userId: number): Promise<User | undefined> {
    return await storage.updateUserSubscription(userId, {
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      subscriptionEndsAt: null // Premium has no end date for manual upgrades
    });
  }

  static getSubscriptionInfo(tier: SubscriptionTierType) {
    const limits = this.getSubscriptionLimits(tier);
    return {
      tier,
      name: limits.name,
      description: limits.description,
      price: limits.price,
      features: {
        forms: limits.maxForms === -1 ? 'Unlimited' : `${limits.maxForms} forms`,
        responses: limits.maxResponses === -1 ? 'Unlimited' : `${limits.maxResponses} responses`,
        apiAccess: limits.hasApiAccess ? 'Full API access' : 'No API access'
      }
    };
  }
}