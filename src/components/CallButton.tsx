/**
 * Call Button Component - Winter Theme with Ice Effect
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
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_6px_25px_rgba(249,115,22,0.5)] transition-all duration-300 flex items-center justify-center group relative overflow-visible"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Call restaurant"
    >
      <Phone className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform relative z-10" />
      
      {/* Orange glow effect */}
      <span className="absolute inset-0 rounded-full bg-orange-500/30 blur-md -z-10" />
      
      {/* Ice/Frost ring effect */}
      <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-sky-200/60 via-white/40 to-cyan-200/60 dark:from-sky-400/30 dark:via-white/20 dark:to-cyan-400/30 -z-20" />
      
      {/* Ice crystals on top */}
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sky-300 dark:text-sky-400 opacity-80">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
        </svg>
      </span>
      
      {/* Frost sparkle */}
      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-white to-sky-200 dark:from-sky-200 dark:to-sky-400 rounded-full opacity-70" />
    </motion.button>
  );
});

CallButton.displayName = "CallButton";

export default CallButton;
