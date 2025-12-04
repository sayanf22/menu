import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import {
  Loader2,
  LogOut,
  Home,
  Upload,
  QrCode as QrCodeIcon,
  BarChart3,
  Share2,
  MessageSquare,
  User,
  CreditCard,
  AlertTriangle
} from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Lazy load dashboard components for better performance
const MenuUpload = lazy(() => import("@/components/dashboard/MenuUpload"));
const QRCodeDisplay = lazy(() => import("@/components/dashboard/QRCodeDisplay"));
const Analytics = lazy(() => import("@/components/dashboard/Analytics"));
const SocialLinks = lazy(() => import("@/components/dashboard/SocialLinks"));
const BellNotifications = lazy(() => import("@/components/dashboard/BellNotifications"));
const FeedbackList = lazy(() => import("@/components/dashboard/FeedbackList"));
const RestaurantProfile = lazy(() => import("@/components/dashboard/RestaurantProfile"));
const SubscriptionStatus = lazy(() => import("@/components/dashboard/SubscriptionStatus"));
const SubscriptionPlans = lazy(() => import("@/components/SubscriptionPlans"));

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");
  const { initiatePayment, loading: paymentLoading } = useRazorpay();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile(data);
      checkNewFeedback(userId);
      fetchSubscription(userId);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchSubscription = async (userId: string) => {
    setSubscriptionLoading(true);
    try {
      // Use secure backend function to get subscription status
      // This bypasses RLS and ensures accurate data
      const { data, error } = await supabase.rpc('get_user_subscription_status', {
        p_user_id: userId
      });

      if (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null);
        return;
      }
      
      // Type the response properly
      const response = data as {
        has_subscription: boolean;
        is_active: boolean;
        subscription: Record<string, unknown> | null;
        plan: Record<string, unknown> | null;
      } | null;
      
      // Transform the response to match expected format
      if (response && response.has_subscription && response.subscription) {
        const subscriptionData = {
          ...response.subscription,
          subscription_plans: response.plan,
          // Add computed is_active from backend
          _is_active: response.is_active
        };
        setSubscription(subscriptionData);
        console.log("Subscription fetched from backend:", response.is_active, (response.plan as any)?.name);
      } else {
        setSubscription(null);
        console.log("No subscription found");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setSubscription(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (!subscription?.plan_id) {
      toast.error("No subscription plan found");
      return;
    }

    await initiatePayment(
      { 
        planId: subscription.plan_id, 
        billingCycle: subscription.billing_cycle || 'monthly' 
      },
      () => {
        toast.success("Subscription renewed successfully!");
        if (user?.id) fetchSubscription(user.id);
      },
      () => {
        toast.error("Payment failed. Please try again.");
      }
    );
  };

  const isSubscriptionActive = () => {
    if (!subscription) {
      console.log("No subscription found");
      return false;
    }
    // Use backend-computed is_active value for accuracy
    // Falls back to status check if _is_active not available
    const isActive = subscription._is_active ?? (subscription.status === 'active');
    console.log("Subscription status check:", subscription.status, "_is_active:", subscription._is_active, "final:", isActive);
    return isActive;
  };

  const isSubscriptionExpired = () => {
    if (!subscription) return true;
    // If backend says active, it's not expired
    if (subscription._is_active) return false;
    if (subscription.status === 'cancelled' || subscription.status === 'halted') return true;
    if (subscription.current_period_end) {
      const expired = new Date(subscription.current_period_end) < new Date();
      console.log("Period end:", subscription.current_period_end, "expired:", expired);
      return expired;
    }
    return false;
  };

  const checkNewFeedback = async (userId: string) => {
    try {
      const lastViewedKey = `feedback_last_viewed_${userId}`;
      const lastViewed = localStorage.getItem(lastViewedKey);

      const { data, error } = await supabase
        .from("feedback")
        .select("created_at")
        .eq("restaurant_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        if (lastViewed) {
          const lastViewedDate = new Date(lastViewed);
          const newFeedbacks = data.filter(
            (fb) => new Date(fb.created_at) > lastViewedDate
          );
          setNewFeedbackCount(newFeedbacks.length);
        } else {
          setNewFeedbackCount(data.length);
        }
      }
    } catch (error) {
      console.error("Error checking feedback:", error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "feedback" && user?.id) {
      setNewFeedbackCount(0);
      localStorage.setItem(`feedback_last_viewed_${user.id}`, new Date().toISOString());
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show subscription renewal page if account is disabled OR no active subscription
  const needsSubscription = profile?.is_disabled || !isSubscriptionActive();
  
  if (needsSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">{profile?.restaurant_name || "AddMenu"}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
              variant="outline"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Subscription Required Message */}
          <div className="max-w-4xl mx-auto">
            <Card className={`mb-8 ${profile?.is_disabled ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800' : 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800'}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${profile?.is_disabled ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                    <CreditCard className={`h-6 w-6 ${profile?.is_disabled ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold mb-1 ${profile?.is_disabled ? 'text-orange-900 dark:text-orange-100' : 'text-blue-900 dark:text-blue-100'}`}>
                      {profile?.is_disabled ? 'Subscription Expired' : 'Subscribe to Get Started'}
                    </h2>
                    <p className={profile?.is_disabled ? 'text-orange-800 dark:text-orange-200' : 'text-blue-800 dark:text-blue-200'}>
                      {profile?.is_disabled 
                        ? 'Your subscription has expired. Please choose a plan below to reactivate your account.'
                        : 'Choose a plan below to start using AddMenu and create your digital menu.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Plans */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h2>
              <p className="text-center text-muted-foreground mb-8">
                Select a plan to reactivate your account and continue using all features.
              </p>
              <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                <SubscriptionPlans
                  onSubscriptionSuccess={() => {
                    toast.success("Subscription activated! Refreshing...");
                    window.location.reload();
                  }}
                />
              </Suspense>
            </div>

            {/* Help Section */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Need Help?</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email Support</p>
                    <a href="mailto:support@addmenu.in" className="text-primary hover:underline">support@addmenu.in</a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">WhatsApp</p>
                    <a href="https://wa.me/917005832798" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+91 7005832798</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "menu", label: "Menu", icon: Upload },
    { id: "qr", label: "QR Code", icon: QrCodeIcon },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "social", label: "Social", icon: Share2 },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-4 w-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold">{profile?.restaurant_name || "MenuQR"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleTabChange(item.id)}
                        isActive={activeTab === item.id}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.label}</span>
                        {item.id === "feedback" && newFeedbackCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 min-w-5 rounded-full px-1 text-xs">
                            {newFeedbackCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}</h1>
            </div>
            <Suspense fallback={null}>
              <BellNotifications restaurantId={user?.id} />
            </Suspense>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {/* Payment Required Banner */}
            {(isSubscriptionExpired() || !isSubscriptionActive()) && subscription && (
              <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                          {subscription.status === 'cancelled' ? 'Subscription Cancelled' : 'Payment Required'}
                        </h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          {subscription.status === 'cancelled' 
                            ? 'Your subscription has been cancelled. Renew to continue using all features.'
                            : 'Your subscription payment is due. Please renew to continue using all features.'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleRenewSubscription}
                      disabled={paymentLoading}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {paymentLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      Renew Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Subscription Banner */}
            {!subscription && (
              <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">No Active Subscription</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Subscribe to a plan to unlock all features and make your menu visible to customers.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate('/pricing')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6 animate-fade-in">
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <RestaurantProfile
                    restaurantId={user?.id}
                    onProfileUpdate={(updatedProfile: any) => {
                      setProfile((prev: any) => ({ ...prev, ...updatedProfile }));
                    }}
                  />
                </Suspense>
              </div>
            )}

            {activeTab === "subscription" && (
              <div className="animate-fade-in">
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <SubscriptionStatus userId={user?.id} />
                </Suspense>
              </div>
            )}

            {activeTab === "menu" && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Menu Images</CardTitle>
                  <CardDescription>Upload and manage your restaurant menu images</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <MenuUpload restaurantId={user?.id} />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {activeTab === "qr" && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Your QR Code</CardTitle>
                  <CardDescription>Download and print your menu QR code</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <QRCodeDisplay restaurantId={user?.id} />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {activeTab === "analytics" && (
              <div className="animate-fade-in">
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <Analytics restaurantId={user?.id} />
                </Suspense>
              </div>
            )}

            {activeTab === "social" && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>Add your social media profiles to your menu</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <SocialLinks restaurantId={user?.id} />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {activeTab === "feedback" && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Customer Feedback</CardTitle>
                  <CardDescription>See what your customers are saying</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <FeedbackList restaurantId={user?.id} />
                  </Suspense>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
