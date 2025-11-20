import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b glass-effect animate-slide-up backdrop-blur-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text truncate">
                {profile?.restaurant_name || "MenuQR"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{user?.email}</p>
              {profile?.restaurant_description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  {profile.restaurant_description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="transition-bounce hover:scale-105 animate-slide-up h-8 sm:h-9"
                style={{ animationDelay: '0.2s' }}
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
          <div className="sticky top-[72px] sm:top-[80px] z-30 bg-background/95 backdrop-blur-sm pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4">
            <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:-mx-4 sm:px-4">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-6 animate-slide-up glass-effect h-auto p-1" style={{ animationDelay: '0.3s' }}>
                <TabsTrigger value="profile" className="transition-smooth whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2">Profile</TabsTrigger>
                <TabsTrigger value="menu" className="transition-smooth whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2">Menu</TabsTrigger>
                <TabsTrigger value="qr" className="transition-smooth whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2">QR Code</TabsTrigger>
                <TabsTrigger value="analytics" className="transition-smooth whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2">Analytics</TabsTrigger>
                <TabsTrigger value="social" className="transition-smooth whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2">Social</TabsTrigger>
                <TabsTrigger value="feedback" className="relative transition-smooth whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2">
                  Feedback
                  {newFeedbackCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-1 sm:ml-2 h-4 sm:h-5 min-w-4 sm:min-w-5 rounded-full px-1 sm:px-1.5 text-[10px] sm:text-xs animate-bounce-gentle"
                    >
                      {newFeedbackCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
              <RestaurantProfile
                restaurantId={user?.id}
                onProfileUpdate={(updatedProfile: any) => {
                  setProfile((prev: any) => ({ ...prev, ...updatedProfile }));
                }}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6 animate-fade-in">
            <Card className="glass-effect transition-smooth hover:shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text">Menu Images</CardTitle>
                <CardDescription>Upload and manage your restaurant menu images</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <MenuUpload restaurantId={user?.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-6 animate-fade-in">
            <Card className="glass-effect transition-smooth hover:shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text">Your QR Code</CardTitle>
                <CardDescription>Download and print your menu QR code</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <QRCodeDisplay restaurantId={user?.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
              <Analytics restaurantId={user?.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 animate-fade-in">
            <Card className="glass-effect transition-smooth hover:shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text">Social Media Links</CardTitle>
                <CardDescription>Add your social media profiles to your menu</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <SocialLinks restaurantId={user?.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6 animate-fade-in">
            <Card className="glass-effect transition-smooth hover:shadow-lg">
              <CardHeader>
                <CardTitle className="gradient-text">Customer Feedback</CardTitle>
                <CardDescription>See what your customers are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                  <FeedbackList restaurantId={user?.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
