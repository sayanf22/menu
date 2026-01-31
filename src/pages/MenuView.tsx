import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import { Star, Loader2, X, ChevronDown, Send, MessageSquare, UtensilsCrossed } from "lucide-react";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { BellButton } from "@/components/BellButton";
import { CallButton } from "@/components/CallButton";
import SessionExpired from "./SessionExpired";

// Food Icon SVG Component
const FoodIcon = memo(({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity="0.2"/>
    <circle cx="12" cy="9" r="3" fill="currentColor"/>
    <path d="M8 9h8M12 6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
));
FoodIcon.displayName = "FoodIcon";

// Restaurant/Food Plate Icon
const PlateIcon = memo(({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.2"/>
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
));
PlateIcon.displayName = "PlateIcon";

// Chef Hat Icon
const ChefHatIcon = memo(({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 20h12v2H6v-2z" fill="currentColor"/>
    <path d="M19 8c0-1.1-.9-2-2-2-.18 0-.35.03-.51.08C15.85 4.84 14.05 4 12 4s-3.85.84-4.49 2.08C7.35 6.03 7.18 6 7 6c-1.1 0-2 .9-2 2 0 .76.43 1.42 1.05 1.76V18h11.9V9.76c.62-.34 1.05-1 1.05-1.76z" fill="currentColor" opacity="0.8"/>
    <path d="M8 10h8v6H8v-6z" fill="currentColor" opacity="0.3"/>
  </svg>
));
ChefHatIcon.displayName = "ChefHatIcon";

// Simple Logo Component with food-themed fallback
const SimpleLogo = memo(({ src, alt, size = "lg" }: { src: string; alt: string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 sm:w-9 sm:h-9",
    md: "w-16 h-16 sm:w-20 sm:h-20",
    lg: "w-28 h-28 sm:w-32 sm:h-32"
  };
  
  return (
    <div className="relative inline-block">
      <img 
        src={src} 
        alt={alt} 
        className={`${sizeClasses[size]} object-cover rounded-full border-2 border-primary/20 shadow-lg ring-2 ring-primary/10`}
        loading="eager"
      />
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
        <UtensilsCrossed className="w-3 h-3 text-primary-foreground" />
      </div>
    </div>
  );
});
SimpleLogo.displayName = "SimpleLogo";

// Lazy loaded image component with blur placeholder
const LazyImage = memo(({ src, alt, className, onClick }: { src: string; alt: string; className?: string; onClick?: () => void }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          imgRef.current.src = src;
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className="relative overflow-hidden bg-muted/30">
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        ref={imgRef}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        onClick={onClick}
        loading="lazy"
        decoding="async"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <p className="text-sm text-muted-foreground">Failed to load</p>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

// Scroll reveal section with smooth animation
const ScrollRevealSection = memo(({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
});
ScrollRevealSection.displayName = "ScrollRevealSection";

// Simple social icon
const SocialIcon = memo(({ href, children, label }: { href: string; children: React.ReactNode; label: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-background border border-border text-foreground hover:text-primary hover:border-primary transition-all duration-300 shadow-sm"
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.a>
));
SocialIcon.displayName = "SocialIcon";

// Type definitions for menu data
interface RestaurantProfile {
  restaurant_name: string;
  restaurant_description?: string;
  logo_url?: string;
  is_disabled?: boolean;
  bell_service_enabled?: boolean;
  call_service_enabled?: boolean;
  call_phone_number?: string;
  disabled?: boolean;
  subscriptionExpired?: boolean;
  subscriptionReason?: string;
}

interface MenuImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface SocialLinksData {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
  website?: string;
}

const MenuView = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionToken = searchParams.get("session");
  
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [menuImages, setMenuImages] = useState<MenuImage[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinksData | null>(null);
  const [feedback, setFeedback] = useState({ rating: 0, name: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number>(0);
  const [clientIp, setClientIp] = useState<string>("");
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [canSubmitFeedback, setCanSubmitFeedback] = useState(true);
  const [sessionExpired, setSessionExpired] = useState<{ expired: boolean; reason?: string; message?: string }>({ expired: false });
  const [sessionRestaurantId, setSessionRestaurantId] = useState<string | null>(null);
  const [bellFeatureEnabled, setBellFeatureEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.03], [0, 1]);
  
  // Activity tracking interval ref
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // Handle zoom modal keyboard navigation
  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setZoomedImage(null);
        if (e.key === "ArrowRight" && zoomedIndex < menuImages.length - 1) {
          setZoomedIndex(zoomedIndex + 1);
          setZoomedImage(menuImages[zoomedIndex + 1].image_url);
        }
        if (e.key === "ArrowLeft" && zoomedIndex > 0) {
          setZoomedIndex(zoomedIndex - 1);
          setZoomedImage(menuImages[zoomedIndex - 1].image_url);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => { document.body.style.overflow = "unset"; window.removeEventListener("keydown", handleKeyDown); };
    } else { document.body.style.overflow = "unset"; }
  }, [zoomedImage, zoomedIndex, menuImages]);

  // Validate session and load data
  useEffect(() => {
    const initializeMenu = async () => {
      // If session token is provided, validate it first
      if (sessionToken) {
        const { data, error } = await supabase.rpc("validate_menu_session", {
          p_session_token: sessionToken,
          p_idle_timeout_minutes: 20,
        });
        
        const sessionData = data as { valid?: boolean; reason?: string; message?: string; restaurant_id?: string } | null;
        
        if (error || !sessionData?.valid) {
          setSessionExpired({
            expired: true,
            reason: sessionData?.reason || "invalid",
            message: sessionData?.message || "Session is invalid. Please scan the QR code again.",
          });
          setLoading(false);
          return;
        }
        
        // Use restaurant_id from session
        setSessionRestaurantId(sessionData.restaurant_id!);
        fetchMenuDataForRestaurant(sessionData.restaurant_id!);
        logViewForRestaurant(sessionData.restaurant_id!);
        fetchClientInfo(sessionData.restaurant_id!);
        
        // Set up activity tracking - validate session every 5 minutes
        activityIntervalRef.current = setInterval(async () => {
          const { data: validationData } = await supabase.rpc("validate_menu_session", {
            p_session_token: sessionToken,
            p_idle_timeout_minutes: 20,
          });
          
          const valData = validationData as { valid?: boolean; reason?: string; message?: string } | null;
          
          if (!valData?.valid) {
            setSessionExpired({
              expired: true,
              reason: valData?.reason || "expired",
              message: valData?.message,
            });
          }
        }, 5 * 60 * 1000); // Check every 5 minutes
      } else if (restaurantId) {
        // Direct access without session (legacy support or direct link)
        fetchMenuData();
        logView();
        fetchClientInfo();
      }
    };
    
    initializeMenu();
    
    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, restaurantId]);
  
  useEffect(() => { if (!loading && profile) { const timer = setTimeout(() => setShowSplash(false), 1200); return () => clearTimeout(timer); } }, [loading, profile]);

  const fetchClientInfo = useCallback(async (restId?: string) => {
    try {
      const targetId = restId || restaurantId;
      const fingerprint = generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);
      const [ipResult, feedbackResult] = await Promise.all([
        supabase.functions.invoke("get-client-info"),
        targetId ? supabase.from("feedback").select("created_at").eq("restaurant_id", targetId).eq("device_fingerprint", fingerprint).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).maybeSingle() : Promise.resolve({ data: null })
      ]);
      if (ipResult.data?.ip) setClientIp(ipResult.data.ip);
      if (feedbackResult.data) setCanSubmitFeedback(false);
    } catch (error) { console.error("Error fetching client info:", error); }
  }, [restaurantId]);

  const logView = useCallback(async () => {
    try { await supabase.from("view_logs").insert({ restaurant_id: restaurantId }); } catch (error) { console.error("Error logging view:", error); }
  }, [restaurantId]);
  
  const logViewForRestaurant = useCallback(async (restId: string) => {
    try { await supabase.from("view_logs").insert({ restaurant_id: restId }); } catch (error) { console.error("Error logging view:", error); }
  }, []);

  const checkSubscriptionStatus = useCallback(async (userId: string): Promise<{ active: boolean; reason?: string }> => {
    try {
      // Use server-side function for secure subscription check
      const { data, error } = await supabase.rpc("check_restaurant_subscription", {
        restaurant_uuid: userId
      });
      
      if (error) {
        console.error("Subscription check error:", error);
        return { active: false, reason: "error" };
      }
      
      // The function returns { has_subscription: boolean, status: string, ... }
      const result = data as { has_subscription?: boolean; status?: string } | null;
      return { 
        active: result?.has_subscription === true && result?.status === "active",
        reason: result?.status || "none"
      };
    } catch {
      return { active: false, reason: "error" };
    }
  }, []);

  const fetchMenuData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check subscription status first using secure server-side function
      const subscriptionCheck = await checkSubscriptionStatus(restaurantId!);
      
      // Check bell feature access
      const { data: bellAccess } = await supabase.rpc("check_bell_feature_access", {
        p_user_id: restaurantId!
      });
      setBellFeatureEnabled(bellAccess === true);
      
      const [profileResult, imagesResult, socialResult] = await Promise.all([
        supabase.from("profiles").select("restaurant_name, restaurant_description, logo_url, is_disabled, bell_service_enabled, call_service_enabled, call_phone_number").eq("id", restaurantId).maybeSingle(),
        supabase.from("menu_images").select("*").eq("restaurant_id", restaurantId).order("display_order", { ascending: true }),
        supabase.from("social_links").select("*").eq("restaurant_id", restaurantId).maybeSingle()
      ]);
      
      if (profileResult.data) {
        // Mark as disabled if no active subscription or already disabled
        const isDisabled = profileResult.data.is_disabled || !subscriptionCheck.active;
        const profileData: RestaurantProfile = {
          restaurant_name: profileResult.data.restaurant_name,
          restaurant_description: profileResult.data.restaurant_description,
          logo_url: profileResult.data.logo_url,
          is_disabled: profileResult.data.is_disabled,
          bell_service_enabled: profileResult.data.bell_service_enabled,
          call_service_enabled: profileResult.data.call_service_enabled,
          call_phone_number: profileResult.data.call_phone_number,
          disabled: isDisabled,
          subscriptionExpired: isDisabled ? !subscriptionCheck.active : undefined,
          subscriptionReason: isDisabled ? subscriptionCheck.reason : undefined,
        };
        setProfile(profileData);
      }
      if (imagesResult.data) setMenuImages(imagesResult.data);
      if (socialResult.data) setSocialLinks(socialResult.data);
    } catch (error) { console.error("Error fetching menu data:", error); toast.error("Error loading menu"); } finally { setLoading(false); }
  }, [restaurantId, checkSubscriptionStatus]);
  
  const fetchMenuDataForRestaurant = useCallback(async (restId: string) => {
    try {
      setLoading(true);
      
      // Check subscription status first using secure server-side function
      const subscriptionCheck = await checkSubscriptionStatus(restId);
      
      // Check bell feature access
      const { data: bellAccess } = await supabase.rpc("check_bell_feature_access", {
        p_user_id: restId
      });
      setBellFeatureEnabled(bellAccess === true);
      
      const [profileResult, imagesResult, socialResult] = await Promise.all([
        supabase.from("profiles").select("restaurant_name, restaurant_description, logo_url, is_disabled, bell_service_enabled, call_service_enabled, call_phone_number").eq("id", restId).maybeSingle(),
        supabase.from("menu_images").select("*").eq("restaurant_id", restId).order("display_order", { ascending: true }),
        supabase.from("social_links").select("*").eq("restaurant_id", restId).maybeSingle()
      ]);
      
      if (profileResult.data) {
        // Mark as disabled if no active subscription or already disabled
        const isDisabled = profileResult.data.is_disabled || !subscriptionCheck.active;
        const profileData: RestaurantProfile = {
          restaurant_name: profileResult.data.restaurant_name,
          restaurant_description: profileResult.data.restaurant_description,
          logo_url: profileResult.data.logo_url,
          is_disabled: profileResult.data.is_disabled,
          bell_service_enabled: profileResult.data.bell_service_enabled,
          call_service_enabled: profileResult.data.call_service_enabled,
          call_phone_number: profileResult.data.call_phone_number,
          disabled: isDisabled,
          subscriptionExpired: isDisabled ? !subscriptionCheck.active : undefined,
          subscriptionReason: isDisabled ? subscriptionCheck.reason : undefined,
        };
        setProfile(profileData);
      }
      if (imagesResult.data) setMenuImages(imagesResult.data);
      if (socialResult.data) setSocialLinks(socialResult.data);
    } catch (error) { console.error("Error fetching menu data:", error); toast.error("Error loading menu"); } finally { setLoading(false); }
  }, [checkSubscriptionStatus]);

  
const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitFeedback) { toast.error("You have already submitted feedback recently."); return; }
    if (feedback.rating === 0) { toast.error("Please select a rating"); return; }
    
    // Use effective restaurant ID (from session or URL)
    const targetRestaurantId = sessionRestaurantId || restaurantId;
    if (!targetRestaurantId) { toast.error("Restaurant not found"); return; }
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({ restaurant_id: targetRestaurantId, rating: feedback.rating, customer_name: feedback.name || null, comment: feedback.comment || null, customer_ip: clientIp || null, device_fingerprint: deviceFingerprint || null });
      if (error) throw error;
      toast.success("Thank you for your feedback!");
      setFeedback({ rating: 0, name: "", comment: "" });
      setShowFeedback(false);
      setCanSubmitFeedback(false);
    } catch (error) { toast.error("Error submitting feedback"); } finally { setSubmitting(false); }
  };

  const openZoom = (url: string, index: number) => { setZoomedImage(url); setZoomedIndex(index); };

  // Get effective restaurant ID (from session or URL)
  const effectiveRestaurantId = sessionRestaurantId || restaurantId;

  // Session Expired Screen
  if (sessionExpired.expired) {
    return (
      <SessionExpired
        reason={sessionExpired.reason as "expired" | "invalid" | "idle" | undefined}
        message={sessionExpired.message}
      />
    );
  }

  // Splash Screen
  if (showSplash) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20 relative overflow-hidden">
        {/* Decorative food elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5 dark:opacity-10">
          <FoodIcon className="absolute top-10 left-10 text-orange-500" size={60} />
          <PlateIcon className="absolute top-20 right-20 text-amber-500" size={80} />
          <ChefHatIcon className="absolute bottom-20 left-20 text-orange-600" size={70} />
          <UtensilsCrossed className="absolute bottom-10 right-10 text-amber-600" size={50} />
        </div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative z-10 text-center px-6 max-w-sm mx-auto">
          {profile?.logo_url ? (
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.15 }} className="mb-6">
              <SimpleLogo src={profile.logo_url} alt={profile.restaurant_name} size="lg" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 100, damping: 18 }} className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/30 flex items-center justify-center border-2 border-orange-200 dark:border-orange-800 shadow-lg">
              <ChefHatIcon className="w-16 h-16 text-orange-600 dark:text-orange-400" />
            </motion.div>
          )}
          
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.3 }} className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">{profile?.restaurant_name || "Loading..."}</motion.h1>
          {profile?.restaurant_description && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.4 }} className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{profile.restaurant_description}</motion.p>}
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8">
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown className="w-5 h-5 mx-auto text-orange-500/60 dark:text-orange-400/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <UtensilsCrossed className="h-8 w-8 text-orange-500 dark:text-orange-400 mx-auto" />
          </motion.div>
          <p className="text-sm text-muted-foreground mt-3">Loading menu...</p>
        </motion.div>
      </div>
    );
  }

  if (profile?.disabled) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100, damping: 18 }} className="relative z-10">
          <Card className="max-w-sm w-full text-center p-6 sm:p-8 shadow-lg border-orange-200/50 dark:border-orange-800/30">
            {profile?.logo_url && (
              <div className="mb-4">
                <SimpleLogo src={profile.logo_url} alt={profile.restaurant_name} size="md" />
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-semibold mb-2">{profile?.restaurant_name || 'Menu Unavailable'}</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-amber-400 mx-auto mb-4 rounded-full" />
            <p className="text-muted-foreground text-sm mb-4">
              {profile?.subscriptionExpired 
                ? "This restaurant's subscription has expired. Please contact the restaurant directly."
                : "This restaurant's menu is currently unavailable."}
            </p>
            {socialLinks?.whatsapp && (
              <a 
                href={`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Contact Restaurant
              </a>
            )}
            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              <UtensilsCrossed className="w-3 h-3 text-orange-500/60" />
              Powered by AddMenu
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }


  return (
    <div ref={containerRef} className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-orange-50/30 via-background to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/10">
      {/* Decorative food pattern background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute top-20 left-10">
          <FoodIcon size={40} className="text-orange-500" />
        </div>
        <div className="absolute top-40 right-20">
          <PlateIcon size={50} className="text-amber-500" />
        </div>
        <div className="absolute bottom-40 left-20">
          <ChefHatIcon size={45} className="text-orange-600" />
        </div>
        <div className="absolute bottom-20 right-10">
          <UtensilsCrossed size={35} className="text-amber-600" />
        </div>
      </div>
      
      {/* Theme Toggle */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
        <ThemeToggle />
      </motion.div>

      {/* Sticky Header */}
      <motion.header style={{ opacity: headerOpacity }} className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-orange-200/30 dark:border-orange-800/20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {profile?.logo_url && <SimpleLogo src={profile.logo_url} alt={profile.restaurant_name} size="sm" />}
            <div className="flex-1 min-w-0"><h1 className="text-sm sm:text-base font-medium truncate">{profile?.restaurant_name}</h1></div>
            <UtensilsCrossed className="w-4 h-4 text-orange-500/60 dark:text-orange-400/50" />
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-3 sm:px-4 relative">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          {profile?.logo_url && (
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.1 }} className="mb-3 sm:mb-4">
              <SimpleLogo src={profile.logo_url} alt={profile.restaurant_name} size="md" />
            </motion.div>
          )}
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-xl sm:text-2xl font-semibold tracking-tight mb-1.5 sm:mb-2">{profile?.restaurant_name}</motion.h1>
          {profile?.restaurant_description && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto line-clamp-2">{profile.restaurant_description}</motion.p>}
        </div>
      </motion.section>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 pb-6 sm:pb-8 relative z-10">
        {/* Menu Images */}
        <div className="space-y-3 sm:space-y-4">
          {menuImages.length > 0 ? menuImages.map((image, index) => (
            <ScrollRevealSection key={image.id} delay={Math.min(index * 0.06, 0.3)}>
              <motion.div className="overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-orange-200/30 dark:border-orange-800/20 shadow-md hover:shadow-xl hover:border-orange-300/50 dark:hover:border-orange-700/30 transition-all duration-400" whileHover={{ y: -2, scale: 1.005 }} transition={{ duration: 0.25 }}>
                <LazyImage src={image.image_url} alt={`Menu page ${index + 1}`} className="w-full h-auto cursor-zoom-in" onClick={() => openZoom(image.image_url, index)} />
              </motion.div>
            </ScrollRevealSection>
          )) : (
            <ScrollRevealSection>
              <div className="py-12 sm:py-16 text-center border-2 border-dashed border-orange-200/40 dark:border-orange-800/30 rounded-xl sm:rounded-2xl bg-card">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                  <ChefHatIcon className="h-8 w-8 text-orange-500/60 dark:text-orange-400/50" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">No menu available yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Check back soon for delicious updates!</p>
              </div>
            </ScrollRevealSection>
          )}
        </div>


        {/* Social Links */}
        {socialLinks && (
          <ScrollRevealSection delay={0.15} className="mt-6 sm:mt-8">
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
              {socialLinks.facebook && <SocialIcon href={socialLinks.facebook} label="Facebook"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></SocialIcon>}
              {socialLinks.instagram && <SocialIcon href={socialLinks.instagram} label="Instagram"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></SocialIcon>}
              {socialLinks.twitter && <SocialIcon href={socialLinks.twitter} label="X"><svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></SocialIcon>}
              {socialLinks.youtube && <SocialIcon href={socialLinks.youtube} label="YouTube"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></SocialIcon>}
              {socialLinks.whatsapp && <SocialIcon href={`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, "")}`} label="WhatsApp"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></SocialIcon>}
              {socialLinks.website && <SocialIcon href={socialLinks.website} label="Website"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></SocialIcon>}
            </div>
          </ScrollRevealSection>
        )}

    {/* Feedback Section */}
        <ScrollRevealSection delay={0.2} className="mt-8 sm:mt-10">
          <AnimatePresence mode="wait">
            {!showFeedback ? (
              <motion.div key="btn" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <motion.button
                  onClick={() => setShowFeedback(true)}
                  className="w-full group flex items-center justify-center gap-2.5 h-11 sm:h-12 px-4 rounded-xl border border-orange-200/50 dark:border-orange-800/30 bg-card hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:border-orange-300/60 dark:hover:border-orange-700/40 transition-all duration-300 shadow-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <MessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Share Your Experience</span>
                  <Star className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 transition-colors" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ type: "spring", stiffness: 100, damping: 18 }}>
                <Card className="shadow-md overflow-hidden border-orange-200/50 dark:border-orange-800/30">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex justify-between items-center mb-4 sm:mb-5">
                      <h2 className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        Share Your Experience
                      </h2>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full -mr-1 hover:bg-orange-100/50 dark:hover:bg-orange-950/30" onClick={() => setShowFeedback(false)}><X className="h-4 w-4" /></Button>
                    </div>
                    <form onSubmit={handleSubmitFeedback} className="space-y-4 sm:space-y-5">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm">How was your experience?</Label>
                        <div className="flex gap-1 justify-center py-1.5 sm:py-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button key={star} type="button" onClick={() => setFeedback({ ...feedback, rating: star })} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }} className="p-0.5 sm:p-1">
                              <Star className={`h-7 w-7 sm:h-8 sm:w-8 transition-all duration-200 ${star <= feedback.rating ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-muted-foreground/30 hover:text-amber-300"}`} />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="name" className="text-xs sm:text-sm">Name <span className="text-muted-foreground">(optional)</span></Label>
                        <Input id="name" placeholder="Your name" value={feedback.name} onChange={(e) => setFeedback({ ...feedback, name: e.target.value })} className="h-9 sm:h-10 rounded-lg sm:rounded-xl text-sm border-orange-200/50 dark:border-orange-800/30 focus:border-orange-400 dark:focus:border-orange-600" />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="comment" className="text-xs sm:text-sm">Comment</Label>
                        <Textarea id="comment" placeholder="Tell us about your experience..." value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })} rows={3} className="rounded-lg sm:rounded-xl resize-none text-sm min-h-[80px] border-orange-200/50 dark:border-orange-800/30 focus:border-orange-400 dark:focus:border-orange-600" />
                      </div>
                      <Button type="submit" className="w-full h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md" disabled={submitting || !canSubmitFeedback}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        {canSubmitFeedback ? "Submit Feedback" : "Already Submitted"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollRevealSection>

        {/* Footer */}
        <ScrollRevealSection delay={0.25} className="mt-10 sm:mt-12">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <UtensilsCrossed className="w-3 h-3 text-orange-500/60" />
              Powered by <a href="https://addmenu.in" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium">AddMenu</a>
            </p>
          </div>
        </ScrollRevealSection>
      </main>


      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center touch-none" onClick={() => setZoomedImage(null)}>
            {/* Close button */}
            <motion.button initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ delay: 0.08 }} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20" onClick={() => setZoomedImage(null)}>
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
            
            {/* Navigation arrows for desktop */}
            {menuImages.length > 1 && (
              <>
                {zoomedIndex > 0 && (
                  <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20" onClick={(e) => { e.stopPropagation(); setZoomedIndex(zoomedIndex - 1); setZoomedImage(menuImages[zoomedIndex - 1].image_url); }}>
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </motion.button>
                )}
                {zoomedIndex < menuImages.length - 1 && (
                  <motion.button initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20" onClick={(e) => { e.stopPropagation(); setZoomedIndex(zoomedIndex + 1); setZoomedImage(menuImages[zoomedIndex + 1].image_url); }}>
                    <ChevronDown className="h-5 w-5 -rotate-90" />
                  </motion.button>
                )}
              </>
            )}
            
            {/* Image counter */}
            {menuImages.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm">
                {zoomedIndex + 1} / {menuImages.length}
              </motion.div>
            )}
            
            {/* Zoomed Image */}
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className="w-full max-w-4xl px-3 sm:px-4 relative z-10" onClick={(e) => e.stopPropagation()}>
              <img src={zoomedImage} alt="Menu" className="w-full h-auto max-h-[85vh] sm:max-h-[90vh] object-contain rounded-lg select-none shadow-2xl" draggable={false} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bell Button - Call Waiter (only show if bell feature is enabled in subscription AND profile) */}
      {effectiveRestaurantId && bellFeatureEnabled && profile?.bell_service_enabled !== false && <BellButton restaurantId={effectiveRestaurantId} />}
      
      {/* Call Button - Direct call to restaurant (only show if call service is enabled AND phone number exists) */}
      {profile?.call_service_enabled && profile?.call_phone_number && <CallButton phoneNumber={profile.call_phone_number} />}
    </div>
  );
};

export default MenuView;