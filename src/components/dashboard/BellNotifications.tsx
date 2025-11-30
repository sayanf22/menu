/**
 * Bell Notifications Component
 * Shows real-time bell notifications in restaurant dashboard
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, X, Check, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
}

export const BellNotifications = ({ restaurantId }: BellNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stopSound, setStopSound] = useState<(() => void) | null>(null);

  // Fetch existing notifications
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

  // Handle new notification
  const handleNewNotification = useCallback(
    (payload: any) => {
      const newNotification = payload.new as Notification;
      
      setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]);
      setPendingCount((prev) => prev + 1);

      // Play sound if enabled
      if (soundEnabled && isListening) {
        // Stop any existing sound
        if (stopSound) stopSound();
        
        // Play bell sound for 15 seconds
        const stop = playBellSound(15000);
        setStopSound(() => stop);
        
        // Auto-stop after 15 seconds
        setTimeout(() => {
          stop();
          setStopSound(null);
        }, 15000);

        // Show toast
        toast.info(`Table ${newNotification.table_number} is calling!`, {
          duration: 15000,
          icon: <BellRing className="w-5 h-5 text-primary animate-bounce" />,
        });
      }
    },
    [soundEnabled, isListening, stopSound]
  );

  // Start/stop realtime subscription
  useEffect(() => {
    if (!isListening) return;

    fetchNotifications();

    const channel = supabase
      .channel(`bell_${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bell_notifications",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, isListening, handleNewNotification, fetchNotifications]);

  // Toggle listening
  const toggleListening = async () => {
    if (!isListening) {
      // Request audio permission first
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        toast.error("Please allow audio to receive notifications");
        return;
      }
      playNotificationDing(); // Test sound
      setIsListening(true);
      setIsOpen(true);
      toast.success("Bell notifications enabled");
    } else {
      setIsListening(false);
      if (stopSound) {
        stopSound();
        setStopSound(null);
      }
      toast.info("Bell notifications disabled");
    }
  };

  // Acknowledge notification
  const acknowledgeNotification = async (id: string) => {
    // Stop sound when acknowledging
    if (stopSound) {
      stopSound();
      setStopSound(null);
    }

    const { error } = await supabase
      .from("bell_notifications")
      .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "acknowledged" } : n))
      );
      setPendingCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Dismiss notification
  const dismissNotification = async (id: string) => {
    const { error } = await supabase
      .from("bell_notifications")
      .update({ status: "dismissed" })
      .eq("id", id);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setPendingCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="icon"
        className="relative"
        onClick={toggleListening}
      >
        {isListening ? (
          <BellRing className="h-5 w-5 animate-pulse" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
            {pendingCount}
          </span>
        )}
      </Button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 sm:w-96 z-50"
          >
            <Card className="shadow-xl border-2">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Table Calls</span>
                    {pendingCount > 0 && (
                      <Badge variant="destructive">{pendingCount} new</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                      {soundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No notifications yet</p>
                      <p className="text-xs mt-1">
                        Customers can call you from the menu
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 flex items-center justify-between ${
                            notification.status === "pending"
                              ? "bg-primary/5"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                notification.status === "pending"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {notification.table_number}
                            </div>
                            <div>
                              <p className="font-medium">
                                Table {notification.table_number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(notification.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {notification.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() =>
                                  acknowledgeNotification(notification.id)
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                dismissNotification(notification.id)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">
                    {isListening ? (
                      <span className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Listening for calls...
                      </span>
                    ) : (
                      "Click bell to start listening"
                    )}
                  </p>
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