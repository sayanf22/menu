/**
 * Bell Button Component - Christmas Theme
 * Allows customers to call waiter from menu view
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";

interface BellButtonProps {
  restaurantId: string;
}

export const BellButton = ({ restaurantId }: BellButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleCallWaiter = async () => {
    if (!tableNumber.trim()) {
      toast.error("Please enter your table number");
      return;
    }

    if (cooldown) {
      toast.error("Please wait before calling again");
      return;
    }

    setSending(true);

    try {
      const fingerprint = generateDeviceFingerprint();

      // Check rate limit
      const { data: canCall } = await supabase.rpc("check_bell_rate_limit", {
        p_restaurant_id: restaurantId,
        p_device_fingerprint: fingerprint,
      });

      if (!canCall) {
        toast.error("Please wait 1 minute before calling again");
        setSending(false);
        return;
      }

      // Insert notification
      const { error } = await supabase.from("bell_notifications").insert({
        restaurant_id: restaurantId,
        table_number: tableNumber.trim(),
        device_fingerprint: fingerprint,
      });

      if (error) throw error;

      setSent(true);
      setCooldown(true);
      toast.success("Waiter has been notified!");

      // Reset after 3 seconds
      setTimeout(() => {
        setSent(false);
        setIsOpen(false);
        setTableNumber("");
      }, 3000);

      // Cooldown for 60 seconds
      setTimeout(() => setCooldown(false), 60000);
    } catch (error) {
      console.error("Error calling waiter:", error);
      toast.error("Failed to call waiter. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Bell Button - Christmas Theme */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.5)] flex items-center justify-center transition-all duration-300"
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Bell className="w-6 h-6 sm:w-7 sm:h-7" />
        {/* Christmas glow effect */}
        <span className="absolute inset-0 rounded-full bg-red-500/30 blur-md -z-10" />
        {/* Decorative snowflake */}
        <span className="absolute -top-1 -right-1 text-white/80 text-xs">❄</span>
      </motion.button>

      {/* Modal - Christmas Theme */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => !sending && setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl border border-sky-200/50 dark:border-sky-800/30"
              onClick={(e) => e.stopPropagation()}
            >
              {sent ? (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Waiter Notified! 🎄</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Someone will be with you shortly
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-green-500/20 flex items-center justify-center border border-red-200/50 dark:border-red-800/30">
                        <Bell className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Call Waiter 🔔</h3>
                        <p className="text-xs text-muted-foreground">
                          Enter your table number
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-sky-100/50 dark:hover:bg-sky-900/30"
                      onClick={() => setIsOpen(false)}
                      disabled={sending}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="table" className="text-slate-700 dark:text-sky-200/80">Table Number</Label>
                      <Input
                        id="table"
                        placeholder="e.g., 5, A1, Window"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="text-lg h-12 text-center font-medium border-sky-200/50 dark:border-sky-800/40 bg-white/60 dark:bg-slate-800/40 focus:border-red-400 dark:focus:border-red-600"
                        maxLength={10}
                        disabled={sending}
                      />
                    </div>

                    <Button
                      onClick={handleCallWaiter}
                      className="w-full h-12 text-base bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md shadow-red-200/50 dark:shadow-red-900/30"
                      disabled={sending || cooldown || !tableNumber.trim()}
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Send className="w-5 h-5 mr-2" />
                      )}
                      {cooldown ? "Please wait..." : "Call Waiter"}
                    </Button>

                    {cooldown && (
                      <p className="text-xs text-center text-muted-foreground">
                        You can call again in 1 minute ❄️
                      </p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BellButton;
