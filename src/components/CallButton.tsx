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
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
      onClick={handleCall}
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Call restaurant"
    >
      <Phone className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
    </motion.button>
  );
});

CallButton.displayName = "CallButton";

export default CallButton;
