import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Save, Box, List, BarChart, Crown, Zap, Check } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { updateUserProfileSchema, UpdateUserProfile, User } from "@shared/schema";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscription"],
    enabled: !!user,
  });

  const upgradeMutation = useMutation({
    mutationFn: async () => await apiRequest("POST", "/api/subscription/upgrade-premium", {}),
    onSuccess: () => {
      toast({
        title: "Upgraded to Premium!",
        description: "You now have access to all Premium features.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      profilePicture: user?.profilePicture || "",
      phoneNumber: user?.phoneNumber || "",
      address: user?.address || "",
    },
  });

  // Update form when user data loads
  if (user && !form.getValues().firstName) {
    form.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      profilePicture: user.profilePicture || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    });
    setProfileImageUrl(user.profilePicture || "");
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      return await apiRequest("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUserProfile) => {
    updateProfileMutation.mutate({
      ...data,
      profilePicture: profileImageUrl,
    });
  };

  const handleImageUrlChange = (url: string) => {
    setProfileImageUrl(url);
    form.setValue("profilePicture", url);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-slate-200 dark:border-slate-600 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center">
                <Box className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Open Forms</h1>
            </button>
            <nav className="hidden md:flex space-x-6 border-l border-slate-200 dark:border-slate-600 pl-6">
              <button
                onClick={() => setLocation("/builder")}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pb-2 flex items-center gap-2"
              >
                <BarChart size={16} />
                Builder
              </button>
              <button
                onClick={() => setLocation("/forms")}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pb-2 flex items-center gap-2"
              >
                <List size={16} />
                My Forms
              </button>
              <button
                onClick={() => setLocation("/responses")}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pb-2 flex items-center gap-2"
              >
                <BarChart size={16} />
                Responses
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button onClick={() => setLocation("/forms")} variant="outline" size="sm" className="rounded-sm">
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>
            {user && <UserProfileMenu user={user} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your account settings and profile information.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="space-y-4">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profileImageUrl} alt="Profile" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {getInitials(form.watch("firstName"), form.watch("lastName"))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Enter image URL"
                          value={profileImageUrl}
                          onChange={(e) => handleImageUrlChange(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Enter a URL to an image file (JPG, PNG, etc.)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Email address cannot be changed
                    </p>
                  </div>

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your address"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="rounded-sm"
                    >
                      <Save className="mr-2" size={16} />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Subscription Plan
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </div>
                {subscription && (
                  <Badge 
                    variant={subscription.tier === 'premium' ? 'default' : subscription.tier === 'core' ? 'secondary' : 'outline'}
                    className="capitalize"
                  >
                    {subscription.tier}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {subscriptionLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              ) : subscription ? (
                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg capitalize">{subscription.name}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{subscription.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${subscription.price}
                          <span className="text-sm font-normal text-slate-500">/month</span>
                        </div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Forms Used</span>
                          <span>
                            {subscription.usage?.forms?.current || 0} / {subscription.usage?.forms?.limit === -1 ? '∞' : subscription.usage?.forms?.limit || 0}
                          </span>
                        </div>
                        <Progress 
                          value={
                            subscription.usage?.forms?.limit === -1 
                              ? 0 
                              : ((subscription.usage?.forms?.current || 0) / (subscription.usage?.forms?.limit || 1)) * 100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="font-medium mb-3">Plan Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {subscription.features?.forms}
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {subscription.features?.responses}
                        </div>
                        {subscription.features?.apiAccess !== 'No API access' && (
                          <div className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            {subscription.features?.apiAccess}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Options */}
                  {subscription.tier !== 'premium' && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Upgrade Your Plan</h4>
                      
                      {subscription.tier === 'free' && (
                        <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Core Plan</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                500 forms, 10k responses/month
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">$20/month</div>
                              <Button size="sm" variant="outline">
                                Coming Soon
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium flex items-center gap-2">
                              <Crown className="h-4 w-4 text-purple-500" />
                              Premium Plan
                            </h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Unlimited forms, unlimited responses, full API access
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">$50/month</div>
                            <Button 
                              size="sm" 
                              onClick={() => upgradeMutation.mutate()}
                              disabled={upgradeMutation.isPending}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {upgradeMutation.isPending ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                  Upgrading...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-1" />
                                  Upgrade Now
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Premium Benefits */}
                  {subscription.tier === 'premium' && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-purple-500" />
                        <h4 className="font-medium">Premium Active</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        You have access to all Premium features including unlimited forms, responses, and full API access.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">
                    Unable to load subscription information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}