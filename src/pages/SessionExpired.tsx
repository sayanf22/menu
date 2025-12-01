/**
 * Session Expired Page
 * Shown when menu session has expired or is invalid
 */

import { motion } from "framer-motion";
import { Clock, QrCode, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SessionExpiredProps {
  reason?: "expired" | "idle" | "invalid" | "not_found";
  message?: string;
}

const SessionExpired = ({ reason = "expired", message }: SessionExpiredProps) => {
  const getContent = () => {
    switch (reason) {
      case "idle":
        return {
          icon: Clock,
          title: "Session Timed Out",
          description: message || "Your session expired due to inactivity.",
        };
      case "invalid":
      case "not_found":
        return {
          icon: QrCode,
          title: "Invalid Session",
          description: message || "This session is no longer valid.",
        };
      default:
        return {
          icon: Clock,
          title: "Session Expired",
          description: message || "Your menu session has ended.",
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 18 }}
        className="w-full max-w-sm"
      >
        <Card className="text-center border-border/40 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
              className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center"
            >
              <Icon className="w-10 h-10 text-muted-foreground" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold">{content.title}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {content.description}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <QrCode className="w-4 h-4" />
                <span>Please scan the QR code at the restaurant again</span>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Powered by <a href="https://addmenu.in" className="hover:text-foreground transition-colors">AddMenu</a>
        </p>
      </motion.div>
    </div>
  );
};

export default SessionExpired;
