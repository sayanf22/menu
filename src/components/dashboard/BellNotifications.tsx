/**
 * Bell Notifications Component
 * Shows real-time bell notifications in restaurant dashboard
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, X, Check, Power, PowerOff, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playBellSound, playNotificationDing, requestAudioPermission } from "@/lib/bell-sound";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRazorpay } from "@/hooks/useRazorpay";

interface Notification {
  id: string;
  table_number: string;
  status: string;
  created_at: string;
}

interface BellNotificationsProps {
  restaurantId: string;
  variant?: "header" | "card";
}

export const BellNotifications = ({ restaurantId, variant = "header" }: BellNotificationsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [stopSound, setStopSound] = useState<(() => void) | null>(null);
  const [hasBellAccess, setHasBellAccess] = useState<boolean | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [businessType, setBusinessType] = useState<"hotel" | "restaurant">("restaurant");
  const [standardPlan, setStandardPlan] = useState<{
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
  } | null>(null);
  const { initiatePayment, loading: paymentLoading } = useRazorpay();

  const locationLabel = businessType === "hotel" ? "Room" : "Table";

  // Check bell feature access and fetch business type
  useEffect(() => {
    const checkAccess = async () => {
      const { data, error } = await supabase.rpc("check_bell_feature_access", {
        p_user_id: restaurantId
      });
      setHasBellAccess(error ? false : data === true);
    };
    
    const fetchBusinessType = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("business_type")
        .eq("id", restaurantId)
        .single();
      if (data?.business_type) {
        setBusinessType(data.business_type as "hotel" | "restaurant");
      }
    };
    
    checkAccess();
    fetchBusinessType();
  }, [restaurantId]);

  // Fetch Standard plan for upgrade
  useEffect(() => {
    const fetchPlan = async () => {
      const { data } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("bell_feature_enabled", true)
        .eq("is_active", true)
        .single();
      if (data) setStandardPlan(data);
    };
    fetchPlan();
  }, []);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("bell_notifications")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .in("status", ["pending", "acknowledged"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
      setPendingCount(data.filter((n) => n.status === "pending").length);
    }
  }, [restaurantId]);

  const handleNewNotification = useCallback(
    (payload: { new: Notification }) => {
      const newNotification = payload.new;
      setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]);
      setPendingCount((prev) => prev + 1);

      if (isListening) {
        if (stopSound) stopSound();
        const stop = playBellSound(15000);
        setStopSound(() => stop);
        setTimeout(() => { stop(); setStopSound(null); }, 15000);
        toast.info(`🔔 ${locationLabel} ${newNotification.table_number} is calling!`, {
          duration: 15000,
          className: "bg-primary text-primary-foreground",
        });
      }
    },
    [isListening, stopSound]
  );

  useEffect(() => {
    if (!isListening || !hasBellAccess) return;
    fetchNotifications();
    const channel = supabase
      .channel(`bell_${restaurantId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bell_notifications", filter: `restaurant_id=eq.${restaurantId}` }, handleNewNotification)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, isListening, hasBellAccess, handleNewNotification, fetchNotifications]);

  const toggleListening = async () => {
    if (!hasBellAccess) {
      setShowUpgradeDialog(true);
      return;
    }
    
    if (!isListening) {
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) { toast.error("Please allow audio"); return; }
      playNotificationDing();
      setIsListening(true);
      toast.success("Bell notifications activated!");
    } else {
      setIsListening(false);
      if (stopSound) { stopSound(); setStopSound(null); }
      toast.info("Bell notifications deactivated");
    }
  };

  const stopCurrentSound = () => {
    if (stopSound) { stopSound(); setStopSound(null); }
  };

  const acknowledgeNotification = async (id: string) => {
    stopCurrentSound();
    const { error } = await supabase.from("bell_notifications").update({ status: "acknowledged", acknowledged_at: new Date().toISOString() }).eq("id", id);
    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "acknowledged" } : n)));
      setPendingCount((prev) => Math.max(0, prev - 1));
    }
  };

  const dismissNotification = async (id: string) => {
    const { error } = await supabase.from("bell_notifications").update({ status: "dismissed" }).eq("id", id);
    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setPendingCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleUpgrade = async (billingCycle: 'monthly' | 'yearly') => {
    if (!standardPlan) return;
    await initiatePayment(
      { planId: standardPlan.id, billingCycle },
      () => {
        setShowUpgradeDialog(false);
        setHasBellAccess(true);
        toast.success("Upgraded to Standard! Bell feature is now available.");
      },
      () => toast.error("Payment failed. Please try again.")
    );
  };

  const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(0)}`;
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Upgrade Dialog
  const UpgradeDialog = () => (
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Upgrade to Standard
          </DialogTitle>
          <DialogDescription>
            Unlock the Bell Calling feature to let customers call for service directly from their {businessType === "hotel" ? "room" : "table"}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">Bell Calling Feature</h4>
                <p className="text-sm text-muted-foreground">Real-time customer notifications</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Customers can call from their {businessType === "hotel" ? "room" : "table"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Real-time sound notifications
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                15 menu images (vs 5 in Basic)
              </li>
            </ul>
          </div>

          {standardPlan && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleUpgrade('monthly')}
                disabled={paymentLoading}
                variant="outline"
                className="h-auto py-3 flex-col"
              >
                <span className="text-lg font-bold">{formatPrice(standardPlan.price_monthly)}</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </Button>
              <Button
                onClick={() => handleUpgrade('yearly')}
                disabled={paymentLoading}
                className="h-auto py-3 flex-col bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <span className="text-lg font-bold">{formatPrice(standardPlan.price_yearly)}</span>
                <span className="text-xs opacity-90">/year (Save 17%)</span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Card variant - Big bell for dashboard settings
  if (variant === "card") {
    // If no bell access, show upgrade card
    if (!hasBellAccess) {
      return (
        <>
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-xl text-muted-foreground">
                <Lock className="h-5 w-5" />
                Bell Service
              </CardTitle>
              <CardDescription>
                Upgrade to Standard to unlock this feature
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6">
                <Bell className="w-16 h-16 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-xs">
                Let customers call for service directly from their {businessType === "hotel" ? "room" : "table"} with real-time notifications.
              </p>
              <Button 
                onClick={() => setShowUpgradeDialog(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Standard
              </Button>
            </CardContent>
          </Card>
          <UpgradeDialog />
        </>
      );
    }

    const handleBellClick = () => {
      if (stopSound) {
        stopCurrentSound();
      } else {
        toggleListening();
      }
    };

    return (
      <>
        <Card className={`transition-all duration-300 ${isListening ? "border-primary border-2 shadow-xl shadow-primary/30" : ""} ${stopSound ? "border-destructive border-2 animate-pulse" : ""}`}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Bell className="h-6 w-6" />
              Bell Service Control
            </CardTitle>
            <CardDescription className="text-base">
              {isListening ? "Service is ACTIVE - Customers can call you" : "Activate to receive customer calls"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Giant Bell Button */}
            <div className="flex flex-col items-center py-8">
              <motion.button
                onClick={handleBellClick}
                className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${
                  stopSound
                    ? "bg-destructive text-destructive-foreground shadow-2xl shadow-destructive/50 ring-4 ring-destructive/30"
                    : isListening 
                      ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/40 ring-4 ring-primary/30" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:shadow-lg"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                animate={stopSound ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
                transition={stopSound ? { repeat: Infinity, duration: 0.5 } : {}}
              >
                {stopSound ? (
                  <BellRing className="w-20 h-20" />
                ) : isListening ? (
                  <BellRing className="w-20 h-20 animate-pulse" />
                ) : (
                  <Bell className="w-20 h-20" />
                )}
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-10 h-10 bg-destructive text-destructive-foreground text-xl font-bold rounded-full flex items-center justify-center animate-bounce">
                    {pendingCount}
                  </span>
                )}
              </motion.button>
              
              <div className="mt-6 text-center">
                {stopSound ? (
                  <p className="text-lg font-bold text-destructive animate-pulse">
                    🔔 RINGING - Click to Stop
                  </p>
                ) : isListening ? (
                  <>
                    <p className="text-lg font-semibold text-primary">Listening for calls...</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                  </>
                ) : (
                  <p className="text-lg text-muted-foreground">Click to Activate</p>
                )}
              </div>
            </div>

            {/* Quick Toggle Switch */}
            <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${
              isListening ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
            }`}>
              <div className="flex items-center gap-3">
                {isListening ? (
                  <Power className="h-6 w-6 text-green-600" />
                ) : (
                  <PowerOff className="h-6 w-6 text-muted-foreground" />
                )}
                <div>
                  <Label className="font-semibold text-base">Bell Service</Label>
                  <p className="text-sm text-muted-foreground">
                    {isListening ? "Customers can call you" : "Service is currently off"}
                  </p>
                </div>
              </div>
              <Switch 
                checked={isListening} 
                onCheckedChange={toggleListening}
                className="scale-125"
              />
            </div>

            {/* Recent Notifications */}
            {notifications.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Recent Calls ({notifications.length})
                </h4>
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {notifications.slice(0, 5).map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        notification.status === "pending" 
                          ? "bg-primary/10 border-2 border-primary/30" 
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base ${
                          notification.status === "pending" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {notification.table_number}
                        </div>
                        <div>
                          <p className="font-semibold">{locationLabel} {notification.table_number}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(notification.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {notification.status === "pending" && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => acknowledgeNotification(notification.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Done
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                          onClick={() => dismissNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <UpgradeDialog />
      </>
    );
  }

  // Header variant - Small icon for header
  // Don't show bell button if user doesn't have bell access (cleaner UI)
  if (!hasBellAccess) {
    return null;
  }

  return (
    <>
      <Button
        variant={isListening ? "default" : "outline"}
        size="icon"
        className={`relative transition-all duration-200 ${
          isListening 
            ? "bg-primary hover:bg-primary/90 shadow-md" 
            : "hover:border-primary/50"
        } ${stopSound ? "animate-pulse ring-2 ring-destructive ring-offset-2" : ""}`}
        onClick={stopSound ? stopCurrentSound : toggleListening}
        title={isListening ? (stopSound ? "Click to stop ringing" : "Bell Active - Listening") : "Activate Bell Service"}
      >
        {isListening ? (
          <BellRing className={`h-5 w-5 ${stopSound ? "animate-bounce" : ""}`} />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {pendingCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
        {isListening && !stopSound && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
        )}
      </Button>

      {/* Dropdown for notifications when listening */}
      <AnimatePresence>
        {hasBellAccess && isListening && pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-72 z-50"
          >
            <Card className="shadow-xl border-2 border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-primary" />
                    Active Calls
                  </span>
                  <Badge variant="destructive">{pendingCount}</Badge>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {notifications.filter(n => n.status === "pending").slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {notification.table_number}
                        </div>
                        <span className="text-sm">{locationLabel} {notification.table_number}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => acknowledgeNotification(notification.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <UpgradeDialog />
    </>
  );
};

export default BellNotifications;
