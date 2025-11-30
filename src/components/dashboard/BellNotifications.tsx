/**
 * Bell Notifications Component
 * Shows real-time bell notifications in restaurant dashboard
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, X, Check, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playBellSound, playNotificationDing, requestAudioPermission } from "@/lib/bell-sound";

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
    (payload: any) => {
      const newNotification = payload.new as Notification;
      setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]);
      setPendingCount((prev) => prev + 1);

      if (isListening) {
        if (stopSound) stopSound();
        const stop = playBellSound(15000);
        setStopSound(() => stop);
        setTimeout(() => { stop(); setStopSound(null); }, 15000);
        toast.info(`🔔 Table ${newNotification.table_number} is calling!`, {
          duration: 15000,
          className: "bg-primary text-primary-foreground",
        });
      }
    },
    [isListening, stopSound]
  );

  useEffect(() => {
    if (!isListening) return;
    fetchNotifications();
    const channel = supabase
      .channel(`bell_${restaurantId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bell_notifications", filter: `restaurant_id=eq.${restaurantId}` }, handleNewNotification)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, isListening, handleNewNotification, fetchNotifications]);

  const toggleListening = async () => {
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

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Card variant - Big bell for dashboard settings
  if (variant === "card") {
    const handleBellClick = () => {
      if (stopSound) {
        // If sound is playing, stop it
        stopCurrentSound();
      } else {
        // Toggle listening state
        toggleListening();
      }
    };

    return (
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
          {/* Giant Bell Button - Main Control */}
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
            
            {/* Status Text */}
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

          {/* Sound Info */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              🔊 Sound is always active when listening. Click the bell to stop ringing.
            </p>
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
                        <p className="font-semibold">Table {notification.table_number}</p>
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
    );
  }


  // Header variant - Small icon for header
  return (
    <div className="relative">
      <Button
        variant={isListening ? "default" : "outline"}
        size="icon"
        className="relative"
        onClick={stopSound ? stopCurrentSound : toggleListening}
      >
        {isListening ? (
          <BellRing className={`h-5 w-5 ${stopSound ? "animate-bounce" : "animate-pulse"}`} />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
            {pendingCount}
          </span>
        )}
      </Button>

      {/* Dropdown for notifications when listening */}
      <AnimatePresence>
        {isListening && pendingCount > 0 && (
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
                        <span className="text-sm">Table {notification.table_number}</span>
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
    </div>
  );
};

export default BellNotifications;