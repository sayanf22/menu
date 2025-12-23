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
      className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-[60] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center"
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Call restaurant"
    >
      <Phone className="w-6 h-6 sm:w-7 sm:h-7" />
      
      {/* Ice frost border */}
      <span className="absolute -inset-0.5 rounded-full border-2 border-white/40 pointer-events-none" />
      
      {/* Ice crystal on top */}
      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-cyan-300 drop-shadow-sm">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </span>
    </motion.button>
  );
});

CallButton.displayName = "CallButton";

export default CallButton;
