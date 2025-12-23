/**
 * Call Button Component - Christmas Theme
 * Allows customers to call the restaurant directly
 */

import { memo } from "react";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";

interface CallButtonProps {
  phoneNumber: string;
}

export const CallButton = memo(({ phoneNumber }: CallButtonProps) => {
  // Clean phone number - remove spaces and ensure proper format
  const cleanNumber = phoneNumber.replace(/\s/g, '');
  
  const handleCall = () => {
    // Use tel: protocol to initiate call
    window.location.href = `tel:${cleanNumber}`;
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
      onClick={handleCall}
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center justify-center group"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Call restaurant"
    >
      <Phone className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
      
      {/* Christmas glow effect */}
      <span className="absolute inset-0 rounded-full bg-emerald-500/30 blur-md -z-10" />
      
      {/* Decorative Christmas tree */}
      <span className="absolute -top-1 -left-1 text-white/80 text-xs">🎄</span>
    </motion.button>
  );
});

CallButton.displayName = "CallButton";

export default CallButton;
