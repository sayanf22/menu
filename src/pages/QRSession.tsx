/**
 * QR Session Start Page
 * Creates a new session when QR code is scanned and redirects to menu
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, QrCode, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";
import { motion } from "framer-motion";

const QRSession = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      createSession();
    }
  }, [restaurantId]);

  const createSession = async () => {
    try {
      setCreating(true);
      setError(null);

      // Verify restaurant exists and is active
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, restaurant_name, is_disabled")
        .eq("id", restaurantId)
        .single();

      if (profileError || !profile) {
        setError("Restaurant not found. Please check the QR code.");
        setCreating(false);
        return;
      }

      if (profile.is_disabled) {
        setError("This restaurant's menu is currently unavailable.");
        setCreating(false);
        return;
      }

      // Create new session
      const fingerprint = generateDeviceFingerprint();
      const { data, error: sessionError } = await supabase.rpc("create_menu_session", {
        p_restaurant_id: restaurantId,
        p_device_fingerprint: fingerprint,
        p_session_duration_minutes: 90,
      });

      if (sessionError || !data?.success) {
        console.error("Session creation error:", sessionError);
        setError("Failed to start menu session. Please try again.");
        setCreating(false);
        return;
      }

      // Redirect to menu with session token
      navigate(`/menu?session=${data.session_token}`, { replace: true });
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Something went wrong. Please scan the QR code again.");
      setCreating(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
        >
          <Card className="max-w-sm w-full text-center p-6 sm:p-8 border-destructive/30">
            <CardContent className="p-0 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">Unable to Load Menu</h2>
              <p className="text-muted-foreground text-sm">{error}</p>
              <Button onClick={createSession} className="w-full mt-4">
                <QrCode className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <QrCode className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Starting your menu session...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default QRSession;
