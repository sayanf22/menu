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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b glass-effect animate-slide-up">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-3xl font-bold gradient-text">
              {profile?.restaurant_name || "MenuQR Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            {profile?.restaurant_description && (
              <p className="text-sm text-muted-foreground mt-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {profile.restaurant_description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="transition-bounce hover:scale-105 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 animate-slide-up glass-effect" style={{ animationDelay: '0.3s' }}>
            <TabsTrigger value="profile" className="transition-smooth">Profile</TabsTrigger>
            <TabsTrigger value="menu" className="transition-smooth">Menu</TabsTrigger>
            <TabsTrigger value="qr" className="transition-smooth">QR Code</TabsTrigger>
            <TabsTrigger value="analytics" className="transition-smooth">Analytics</TabsTrigger>
            <TabsTrigger value="social" className="transition-smooth">Social</TabsTrigger>
            <TabsTrigger value="feedback" className="relative transition-smooth">
              Feedback
              {newFeedbackCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs animate-bounce-gentle"
                >
                  {newFeedbackCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

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
