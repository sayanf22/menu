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
  User
} from "lucide-react";
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
const FeedbackList = lazy(() => import("@/components/dashboard/FeedbackList"));
const RestaurantProfile = lazy(() => import("@/components/dashboard/RestaurantProfile"));

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");

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
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show payment message if account is disabled
  if (profile?.is_disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Account Suspended</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-700">
              Your account has been temporarily suspended. This usually happens when there's a pending payment or subscription renewal.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="font-semibold text-blue-900 mb-2">To reactivate your account:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Complete your pending payment</li>
                <li>• Contact our support team</li>
                <li>• We'll reactivate your account immediately</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="font-semibold text-gray-900 mb-2">Contact Support:</p>
              <p className="text-sm text-gray-700">Email: support@addmenu.com</p>
              <p className="text-sm text-gray-700">Phone: +91-XXXXXXXXXX</p>
              <p className="text-sm text-gray-700 mt-2">WhatsApp: +91-XXXXXXXXXX</p>
            </div>
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/auth");
              }}
              variant="outline"
              className="w-full mt-4"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
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
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
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
