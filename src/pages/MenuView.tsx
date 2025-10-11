import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import { Star, Loader2, Facebook, Instagram, Twitter, Youtube, MessageCircle, Globe } from "lucide-react";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";

const MenuView = () => {
  const { restaurantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [menuImages, setMenuImages] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [themeColor, setThemeColor] = useState("#F59E0B");
  const [feedback, setFeedback] = useState({
    rating: 0,
    name: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [clientIp, setClientIp] = useState<string>("");
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [canSubmitFeedback, setCanSubmitFeedback] = useState(true);
  const [isHeaderLight, setIsHeaderLight] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchMenuData();
      logView();
      fetchClientInfo();
    }
  }, [restaurantId]);

  // Setup Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all menu cards
    const cards = document.querySelectorAll('.menu-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [menuImages]);

  // Check if color is light or dark
  const isLightColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  useEffect(() => {
    setIsHeaderLight(isLightColor(themeColor));
  }, [themeColor]);

  const fetchClientInfo = async () => {
    try {
      // Get device fingerprint
      const fingerprint = generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);

      // Get IP address from edge function
      const { data, error } = await supabase.functions.invoke('get-client-info');
      
      if (error) throw error;
      
      if (data?.ip) {
        setClientIp(data.ip);
      }

      // Check if user can submit feedback
      if (restaurantId && (data?.ip || fingerprint)) {
        const { data: existingFeedback, error: checkError } = await supabase
          .from('feedback')
          .select('created_at')
          .eq('restaurant_id', restaurantId)
          .or(`customer_ip.eq.${data?.ip},device_fingerprint.eq.${fingerprint}`)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (checkError) {
          console.error('Error checking feedback:', checkError);
        }

        if (existingFeedback) {
          setCanSubmitFeedback(false);
          const nextAvailableDate = new Date(existingFeedback.created_at);
          nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);
          toast.info(`You can submit feedback again after ${nextAvailableDate.toLocaleDateString()}`);
        }
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
    }
  };

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  };

  const logView = async () => {
    try {
      await supabase.from("view_logs").insert({
        restaurant_id: restaurantId,
      });
    } catch (error) {
      console.error("Error logging view:", error);
    }
  };

  const fetchMenuData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("restaurant_name, restaurant_description, logo_url")
        .eq("id", restaurantId)
        .maybeSingle();

      if (profileError) {
        // Profiles are private; continue without blocking public menu
        console.warn("Profile not accessible, continuing with public data:", profileError);
      }
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch menu images
      const { data: imagesData, error: imagesError } = await supabase
        .from("menu_images")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("display_order", { ascending: true });

      if (imagesError) throw imagesError;
      setMenuImages(imagesData || []);

      // Extract dominant color from first image if available
      if (imagesData && imagesData.length > 0 && imagesData[0].dominant_color) {
        setThemeColor(imagesData[0].dominant_color);
      }

      // Fetch social links using secure function (WhatsApp hidden for security)
      const { data: socialData, error: socialError } = await supabase
        .rpc("get_public_social_links", { rest_id: restaurantId });

      if (socialError) {
        console.error("Error fetching social links:", socialError);
      } else if (socialData && socialData.length > 0) {
        setSocialLinks(socialData[0]);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      toast.error("Error loading menu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmitFeedback) {
      toast.error("You have already submitted feedback recently. Please wait 7 days.");
      return;
    }

    if (feedback.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        restaurant_id: restaurantId,
        rating: feedback.rating,
        customer_name: feedback.name || null,
        comment: feedback.comment || null,
        customer_ip: clientIp || null,
        device_fingerprint: deviceFingerprint || null,
      });

      if (error) {
        // Check if it's a policy violation (duplicate feedback within 7 days)
        if (error.message.includes('policy')) {
          toast.error("You have already submitted feedback recently. Please wait 7 days before submitting again.");
          setCanSubmitFeedback(false);
        } else {
          throw error;
        }
        return;
      }

      toast.success("Thank you for your feedback!");
      setFeedback({ rating: 0, name: "", comment: "" });
      setShowFeedback(false);
      setCanSubmitFeedback(false);
    } catch (error) {
      toast.error("Error submitting feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-safe bg-background">
      {/* Theme Toggle - Fixed Position - Mobile Optimized */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 animate-fade-in">
        <ThemeToggle />
      </div>

      {/* Header - Mobile Optimized - Matches Menu Color */}
      <header 
        className="py-8 sm:py-10 md:py-12 px-3 sm:px-4 shadow-xl relative overflow-hidden" 
        style={{ 
          background: isHeaderLight 
            ? `linear-gradient(135deg, ${themeColor}f0, ${themeColor}e0, ${themeColor}d0)`
            : `linear-gradient(135deg, ${themeColor}e0, ${themeColor}c0, ${themeColor}a0)`
        }}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-br opacity-20"
          style={{
            background: isHeaderLight 
              ? 'linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.1))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
          }}
        ></div>
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          {profile?.logo_url && (
            <div className="flex justify-center mb-4 sm:mb-6 animate-scale-in">
              <img
                src={profile.logo_url}
                alt={profile.restaurant_name}
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-cover rounded-full border-4 shadow-2xl ${
                  isHeaderLight ? 'border-black/20' : 'border-white/30'
                }`}
              />
            </div>
          )}
          <h1 
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 animate-slide-up px-2 ${
              isHeaderLight 
                ? 'text-gray-900 drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]' 
                : 'text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]'
            }`}
          >
            {profile?.restaurant_name || "Our Menu"}
          </h1>
          {profile?.restaurant_description && (
            <p 
              className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto animate-slide-up px-4 ${
                isHeaderLight 
                  ? 'text-gray-800 drop-shadow-[0_1px_6px_rgba(255,255,255,0.7)]' 
                  : 'text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              {profile.restaurant_description}
            </p>
          )}
          <div className="mt-4 sm:mt-6 animate-bounce-gentle" style={{ animationDelay: '0.4s' }}>
            <div 
              className={`inline-block px-4 sm:px-6 py-2 backdrop-blur-sm rounded-full text-sm sm:text-base font-medium ${
                isHeaderLight 
                  ? 'bg-black/10 text-gray-900' 
                  : 'bg-white/20 text-white'
              }`}
            >
              Scroll down to explore our menu
            </div>
          </div>
        </div>
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent"
          style={{
            background: isHeaderLight 
              ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
          }}
        ></div>
      </header>

      {/* Menu Images Gallery - Vertical Scroll - Mobile Optimized */}
      <div className="container mx-auto px-3 sm:px-4 mt-4 sm:mt-6 md:mt-8 space-y-4 sm:space-y-6 max-w-4xl">
        {menuImages.length > 0 ? (
          <>
            {menuImages.map((image, index) => (
              <Card 
                key={image.id}
                className="menu-card overflow-hidden shadow-lg opacity-0 transition-all duration-700 hover:shadow-2xl hover:scale-[1.01]"
              >
                <CardContent className="p-0 relative group">
                  <div className="relative overflow-hidden">
                    <OptimizedImage
                      src={image.image_url}
                      alt={`Menu ${index + 1}`}
                      className="w-full h-auto object-contain cursor-zoom-in transition-transform duration-700 group-hover:scale-[1.03]"
                      priority={index < 2}
                      onLoad={() => handleImageLoad(image.id)}
                      onClick={() => setZoomedImage(image.image_url)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Click to zoom</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <Card className="p-8 text-center animate-fade-in">
            <div className="animate-bounce-gentle">
              <p className="text-muted-foreground text-lg">No menu images available</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for our delicious menu!</p>
            </div>
          </Card>
        )}

        {/* Social Media Links */}
        {socialLinks && (
          <Card className="mt-6 animate-slide-up glass-effect">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6 gradient-text">Connect With Us</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {socialLinks.facebook && (
                  <Button
                    size="lg"
                    onClick={() => window.open(socialLinks.facebook, "_blank")}
                    className="social-btn social-btn-facebook flex-col h-auto py-4 px-3"
                  >
                    <Facebook className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">Facebook</span>
                  </Button>
                )}
                {socialLinks.instagram && (
                  <Button
                    size="lg"
                    onClick={() => window.open(socialLinks.instagram, "_blank")}
                    className="social-btn social-btn-instagram flex-col h-auto py-4 px-3"
                  >
                    <Instagram className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">Instagram</span>
                  </Button>
                )}
                {socialLinks.twitter && (
                  <Button
                    size="lg"
                    onClick={() => window.open(socialLinks.twitter, "_blank")}
                    className="social-btn social-btn-twitter flex-col h-auto py-4 px-3"
                  >
                    <Twitter className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">Twitter</span>
                  </Button>
                )}
                {socialLinks.youtube && (
                  <Button
                    size="lg"
                    onClick={() => window.open(socialLinks.youtube, "_blank")}
                    className="social-btn social-btn-youtube flex-col h-auto py-4 px-3"
                  >
                    <Youtube className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">YouTube</span>
                  </Button>
                )}
                {socialLinks.whatsapp && (
                  <Button
                    size="lg"
                    onClick={() => window.open(`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`, "_blank")}
                    className="social-btn social-btn-whatsapp flex-col h-auto py-4 px-3"
                  >
                    <MessageCircle className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </Button>
                )}
                {socialLinks.website && (
                  <Button
                    size="lg"
                    onClick={() => window.open(socialLinks.website, "_blank")}
                    className="social-btn social-btn-website flex-col h-auto py-4 px-3"
                  >
                    <Globe className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">Website</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback Section */}
        <div className="mt-6">
          {!showFeedback ? (
            <Button 
              onClick={() => setShowFeedback(true)}
              className="w-full transition-bounce hover:scale-[1.02] animate-glow"
              size="lg"
            >
              <Star className="mr-2 h-5 w-5" />
              Leave Feedback
            </Button>
          ) : (
            <Card className="animate-scale-in glass-effect">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6 gradient-text">Share Your Experience</h2>
                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Label className="text-lg font-medium">Rating</Label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setFeedback({ ...feedback, rating: star })}
                          className="transition-bounce hover:scale-110 p-2"
                        >
                          <Star
                            className={`h-10 w-10 transition-all duration-200 ${
                              star <= feedback.rating 
                                ? "fill-yellow-400 text-yellow-400 drop-shadow-lg" 
                                : "text-muted-foreground hover:text-yellow-300"
                            }`}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={feedback.name}
                      onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                      className="transition-smooth focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Tell us about your experience..."
                      value={feedback.comment}
                      onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                      rows={4}
                      className="transition-smooth focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowFeedback(false)}
                      className="flex-1 transition-bounce hover:scale-[1.02]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 transition-bounce hover:scale-[1.02]" 
                      disabled={submitting || !canSubmitFeedback}
                    >
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {canSubmitFeedback ? "Submit Feedback" : "Already Submitted"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-7xl max-h-screen overflow-auto animate-scale-in">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white z-10 transition-bounce hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImage(null);
              }}
            >
              ✕
            </Button>
            <img
              src={zoomedImage}
              alt="Zoomed menu"
              className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
              style={{ maxHeight: '90vh' }}
              loading="eager"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuView;
