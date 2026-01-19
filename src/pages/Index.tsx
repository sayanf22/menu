import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  QrCode,
  BarChart3,
  Upload,
  Star,
  ArrowRight,
  Check,
  Smartphone,
  Zap,
  Shield,
  MessageCircle,
  Mail,
  ChevronRight,
  Sparkles,
  X,
  Tablet,
  Users,
  Clock,
  Globe,
  Crown,
  Bell,
  Rocket,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

type PlanType = "basic" | "standard" | "advanced" | "premium";

const PLANS = {
  basic: {
    name: "Basic",
    price: 249,
    description: "Perfect for small hotels & restaurants",
    icon: Star,
    features: ["Digital Menu with QR Code", "5 Menu Image Uploads", "Drag & Drop Ordering", "Basic Analytics", "Customer Feedback", "Social Media Links"],
    notIncluded: ["Bell Calling Feature", "Call Service", "Priority Support"],
    gradient: "",
    isExternal: false,
    externalUrl: "",
  },
  standard: {
    name: "Standard",
    price: 399,
    description: "Most popular for hotels & restaurants",
    icon: Bell,
    features: ["Everything in Basic", "15 Menu Image Uploads", "Bell Calling Feature", "Call Service Button", "Priority Support", "Advanced Analytics"],
    notIncluded: [],
    gradient: "from-amber-500 to-orange-500",
    isExternal: false,
    externalUrl: "",
  },
  advanced: {
    name: "Advanced",
    price: 599,
    description: "Menu with categories",
    icon: Zap,
    features: ["Menu categories", "100 menu items", "Toggle availability", "Advanced Bell", "Dark/Light mode", "Custom Branding"],
    notIncluded: [],
    gradient: "from-blue-500 to-cyan-500",
    isExternal: true,
    externalUrl: "https://addmenu.site/?mode=signup&plan=advanced",
  },
  premium: {
    name: "Premium",
    price: 999,
    description: "Complete ordering system",
    icon: Rocket,
    features: ["Everything in Advanced", "Unlimited items", "Order management", "Order notifications", "Order tracking", "24/7 Priority support"],
    notIncluded: [],
    gradient: "from-purple-500 to-pink-500",
    isExternal: true,
    externalUrl: "https://addmenu.site/?mode=signup&plan=premium",
  },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<PlanType>("basic");
  const [deviceView, setDeviceView] = useState<"phone" | "tablet">("phone");
  const [dbPlanPrices, setDbPlanPrices] = useState<Map<string, { monthly: number; yearly: number | null }>>(new Map());

  useEffect(() => {
    fetchDbPlans();
  }, []);

  const fetchDbPlans = async () => {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('id, name, price_monthly, price_yearly')
        .eq('is_active', true);
      if (data) {
        const priceMap = new Map<string, { monthly: number; yearly: number | null }>();
        data.forEach(p => {
          if (p.name.toLowerCase() === 'basic') {
            priceMap.set('basic', { monthly: p.price_monthly, yearly: p.price_yearly });
          } else if (p.name.toLowerCase().includes('plus')) {
            priceMap.set('standard', { monthly: p.price_monthly, yearly: p.price_yearly });
          }
        });
        setDbPlanPrices(priceMap);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO />
      <Header />

      {/* Hero Section with Orange Theme & Food Shapes */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Decorations - Orange Theme */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large orange gradient blobs */}
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 dark:from-primary/10 dark:to-accent/5" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/15 to-primary/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 dark:from-accent/8 dark:to-primary/5" />
          
          {/* Decorative plate/dish shapes */}
          <div className="absolute top-20 left-[8%] w-20 h-20 border-4 border-primary/20 rounded-full dark:border-primary/10" />
          <div className="absolute top-32 left-[12%] w-8 h-8 bg-primary/10 rounded-full dark:bg-primary/5" />
          <div className="absolute top-48 right-[12%] w-28 h-28 border-4 border-accent/15 rounded-full dark:border-accent/8" />
          <div className="absolute top-60 right-[18%] w-10 h-10 bg-accent/10 rounded-full dark:bg-accent/5" />
          <div className="absolute bottom-40 left-[15%] w-24 h-24 border-4 border-primary/15 rounded-full dark:border-primary/8" />
          <div className="absolute bottom-28 right-[20%] w-16 h-16 bg-primary/8 rounded-full dark:bg-primary/4" />
          
          {/* Food-related decorative elements - fork & spoon shapes */}
          <div className="absolute top-1/4 left-[3%] opacity-10 dark:opacity-5">
            <div className="w-2 h-24 bg-primary rounded-full" />
            <div className="w-6 h-6 bg-primary rounded-full -mt-2 -ml-2" />
          </div>
          <div className="absolute bottom-1/3 right-[5%] opacity-10 dark:opacity-5">
            <div className="w-2 h-20 bg-accent rounded-full" />
            <div className="w-8 h-3 bg-accent rounded-full -mt-1 -ml-3" />
          </div>
          
          {/* QR Code decorative element */}
          <div className="absolute top-1/3 left-[5%] w-16 h-16 opacity-10 dark:opacity-5">
            <div className="grid grid-cols-4 gap-1">
              {[...Array(16)].map((_, i) => (
                <div key={i} className={`w-3 h-3 ${[0,1,2,4,8,12,13,14,3,7,11,15].includes(i) ? 'bg-primary' : 'bg-transparent'} rounded-sm`} />
              ))}
            </div>
          </div>
          
          {/* Dotted pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 dark:bg-primary/15 dark:border-primary/30 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 100+ hotels & restaurants in Tripura</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Digital Menus for{" "}
              <span className="text-primary">Hotels & Restaurants</span>
              <br />
              <span className="text-muted-foreground font-normal text-xl md:text-2xl lg:text-3xl mt-4 block">
                QR Code Menus for Modern Hospitality
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create beautiful contactless menus for your hotel or restaurant in minutes. Customers scan, browse, and order with ease. No app download required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 text-base rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 dark:shadow-primary/15 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="h-14 px-8 text-base rounded-full border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 dark:border-primary/40 transition-all duration-300 hover:scale-105 active:scale-95">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Social Links - Minimal Outline Style */}
            <div className="flex items-center justify-center gap-3 pt-6">
              <a
                href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-110 active:scale-95 dark:border-border/50"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/addmenu.in_"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-110 active:scale-95 dark:border-border/50"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="mailto:support@addmenu.in"
                className="p-3 rounded-full border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-110 active:scale-95 dark:border-border/50"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center dark:bg-green-500/20">
                  <Check className="w-3 h-3 text-green-500" />
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center dark:bg-green-500/20">
                  <Check className="w-3 h-3 text-green-500" />
                </div>
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center dark:bg-green-500/20">
                  <Check className="w-3 h-3 text-green-500" />
                </div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 right-[5%] w-40 h-40 border-2 border-primary/10 rounded-full dark:border-primary/5" />
        <div className="absolute bottom-20 left-[8%] w-24 h-24 bg-accent/5 rounded-full dark:bg-accent/3" />
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfect for <span className="text-primary">Hotels & Restaurants</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to digitize your hotel or restaurant menu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: QrCode, title: "Instant QR Menus", desc: "Generate QR codes in seconds" },
              { icon: Upload, title: "Easy Upload", desc: "Upload images or create from scratch" },
              { icon: BarChart3, title: "Analytics", desc: "Track views and customer engagement" },
              { icon: Shield, title: "Secure & Fast", desc: "Lightning fast, always available" },
            ].map((feature, i) => (
              <Card key={i} className="p-6 text-center rounded-2xl hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm dark:bg-card/30 dark:border-primary/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center dark:bg-primary/15 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Device Preview / Comparison Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-muted/50 relative overflow-hidden dark:from-muted/10 dark:to-muted/20 rounded-t-[3rem]">
        {/* Background shapes */}
        <div className="absolute top-10 right-10 w-32 h-32 border-4 border-primary/10 rounded-full dark:border-primary/5" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-primary/5 rounded-full dark:bg-primary/3" />
        <div className="absolute top-1/2 left-[5%] w-16 h-16 border-2 border-accent/10 rounded-full dark:border-accent/5" />
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See the <span className="text-primary">Difference</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare all plans and features on different devices
            </p>
          </div>

          {/* Device Switcher */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setDeviceView("phone")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                deviceView === "phone"
                  ? "bg-primary/10 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground border-2 border-transparent hover:border-border"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Phone
            </button>
            <button
              onClick={() => setDeviceView("tablet")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                deviceView === "tablet"
                  ? "bg-primary/10 text-primary border-2 border-primary/30 shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground border-2 border-transparent hover:border-border"
              }`}
            >
              <Tablet className="w-4 h-4" />
              Tablet
            </button>
          </div>

          {/* Plan Switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-muted rounded-2xl dark:bg-muted/50">
              {(Object.keys(PLANS) as PlanType[]).map((planKey) => {
                const plan = PLANS[planKey];
                const isActive = activeTab === planKey;
                const Icon = plan.icon;
                return (
                  <button
                    key={planKey}
                    onClick={() => setActiveTab(planKey)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                      isActive
                        ? plan.gradient
                          ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg`
                          : "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
                    } hover:scale-105 active:scale-95`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {plan.name} - ₹{plan.price}/mo
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Mockups */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl mx-auto">
            {/* Device Mockup */}
            <div className="relative transition-all duration-500">
              {deviceView === "phone" ? (
                // Phone Mockup
                <div className="w-[280px] h-[560px] bg-foreground rounded-[3rem] p-3 shadow-2xl dark:bg-white/90 transition-all duration-500 hover:shadow-3xl">
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative dark:bg-background">
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-b-2xl dark:bg-white/90" />
                    
                    {/* Screen content */}
                    <div className="pt-10 px-4 h-full overflow-hidden">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl mx-auto mb-2 flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-sm">Restaurant Menu</h4>
                      </div>
                      
                      {activeTab === "basic" ? (
                        <div className="space-y-3">
                          <div className="bg-muted rounded-2xl p-3 dark:bg-muted/50 transition-all duration-300">
                            <div className="w-full h-20 bg-primary/10 rounded-xl mb-2" />
                            <div className="h-3 bg-muted-foreground/20 rounded-full w-3/4" />
                            <div className="h-2 bg-muted-foreground/10 rounded-full w-1/2 mt-1" />
                          </div>
                          <div className="bg-muted rounded-2xl p-3 dark:bg-muted/50 transition-all duration-300">
                            <div className="w-full h-20 bg-primary/10 rounded-xl mb-2" />
                            <div className="h-3 bg-muted-foreground/20 rounded-full w-2/3" />
                            <div className="h-2 bg-muted-foreground/10 rounded-full w-1/3 mt-1" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-muted rounded-2xl p-3 dark:bg-muted/50 transition-all duration-300">
                            <div className="w-full h-20 bg-primary/10 rounded-xl mb-2" />
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="h-3 bg-muted-foreground/20 rounded-full w-20" />
                                <div className="h-2 bg-muted-foreground/10 rounded-full w-12 mt-1" />
                              </div>
                              <div className="bg-primary text-white text-xs px-3 py-1.5 rounded-full">
                                Add to Cart
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-3 border-2 border-primary/30 transition-all duration-300">
                            <div className="flex items-center gap-2 text-xs text-primary font-medium">
                              <Zap className="w-4 h-4" />
                              Online Ordering Enabled
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Tablet Mockup
                <div className="w-[400px] h-[300px] bg-foreground rounded-[2rem] p-3 shadow-2xl dark:bg-white/90 transition-all duration-500 hover:shadow-3xl">
                  <div className="w-full h-full bg-background rounded-[1.5rem] overflow-hidden relative dark:bg-background">
                    {/* Camera dot */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground/50 rounded-full dark:bg-white/50" />
                    
                    {/* Screen content */}
                    <div className="pt-6 px-4 h-full overflow-hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <QrCode className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">Restaurant Menu</h4>
                          <p className="text-xs text-muted-foreground">Tablet View</p>
                        </div>
                      </div>
                      
                      {activeTab === "basic" ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted rounded-2xl p-2 dark:bg-muted/50 transition-all duration-300">
                            <div className="w-full h-16 bg-primary/10 rounded-xl mb-2" />
                            <div className="h-2 bg-muted-foreground/20 rounded-full w-3/4" />
                          </div>
                          <div className="bg-muted rounded-2xl p-2 dark:bg-muted/50 transition-all duration-300">
                            <div className="w-full h-16 bg-primary/10 rounded-xl mb-2" />
                            <div className="h-2 bg-muted-foreground/20 rounded-full w-2/3" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted rounded-2xl p-2 dark:bg-muted/50 transition-all duration-300">
                            <div className="w-full h-16 bg-primary/10 rounded-xl mb-2" />
                            <div className="flex justify-between items-center">
                              <div className="h-2 bg-muted-foreground/20 rounded-full w-12" />
                              <div className="bg-primary text-white text-[10px] px-2 py-1 rounded-full">Add</div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-2 border border-primary/30 transition-all duration-300">
                            <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                              <Zap className="w-3 h-3" />
                              Online Orders
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="text-center mt-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  {deviceView === "phone" ? <Smartphone className="w-4 h-4" /> : <Tablet className="w-4 h-4" />}
                  {deviceView === "phone" ? "Mobile View" : "Tablet View"}
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="max-w-md">
              {(() => {
                const plan = PLANS[activeTab];
                const Icon = plan.icon;
                return (
                  <>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Icon className={`w-6 h-6 ${plan.gradient ? 'text-primary' : 'text-primary'}`} />
                      {plan.name} Plan Features
                      {plan.isExternal && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full">Pro</span>
                      )}
                    </h3>
                    <div className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 transition-all duration-300 hover:translate-x-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            plan.gradient ? 'bg-primary/10 dark:bg-primary/20' : 'bg-green-500/10 dark:bg-green-500/20'
                          }`}>
                            <Check className={`w-4 h-4 ${plan.gradient ? 'text-primary' : 'text-green-500'}`} />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-50">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <X className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="line-through">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8">
                      {plan.isExternal ? (
                        <a href={plan.externalUrl} target="_blank" rel="noopener noreferrer">
                          <Button className={`rounded-full h-12 px-8 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl ${
                            plan.gradient ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90` : 'bg-primary hover:bg-primary/90'
                          }`}>
                            Get {plan.name} - ₹{plan.price}/mo
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </a>
                      ) : (
                        <Link to="/auth">
                          <Button className={`rounded-full h-12 px-8 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl ${
                            plan.gradient ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90` : 'bg-primary hover:bg-primary/90'
                          }`}>
                            Get {plan.name} - ₹{plan.price}/mo
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 dark:from-primary/3" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-accent/5 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2 dark:from-accent/3" />
        
        {/* Decorative shapes */}
        <div className="absolute top-20 right-[10%] w-20 h-20 border-2 border-primary/10 rounded-full dark:border-primary/5" />
        <div className="absolute bottom-32 left-[8%] w-16 h-16 bg-accent/5 rounded-full dark:bg-accent/3" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 dark:bg-primary/15 transition-all duration-300 hover:scale-105">
              <Star className="w-4 h-4" />
              Simple Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your <span className="text-primary">Plan</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {(Object.entries(PLANS) as [PlanType, typeof PLANS.basic][]).map(([key, plan]) => {
              const Icon = plan.icon;
              const isHighlighted = key === "standard" || key === "premium";
              // Use database price if available, otherwise use hardcoded price
              const dbPrice = dbPlanPrices.get(key);
              const displayPrice = dbPrice?.monthly ? (dbPrice.monthly / 100) : plan.price;
              
              return (
                <Card 
                  key={key}
                  className={`p-6 border-2 relative overflow-hidden rounded-3xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                    isHighlighted 
                      ? 'border-primary bg-gradient-to-br from-primary/5 via-background to-accent/5 dark:from-primary/10 dark:to-accent/10' 
                      : 'border-border hover:border-primary/30 dark:border-border/50 dark:hover:border-primary/40'
                  }`}
                >
                  {/* Badge */}
                  {isHighlighted && (
                    <div className="absolute top-3 right-3">
                      <div className={`px-2 py-1 text-white text-xs font-medium rounded-full flex items-center gap-1 ${
                        key === "premium" ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}>
                        {key === "premium" ? <Rocket className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                        {key === "premium" ? "Best" : "Popular"}
                      </div>
                    </div>
                  )}
                  
                  {plan.isExternal && (
                    <div className="absolute top-3 left-3">
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 text-xs font-medium rounded-full flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Pro
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 dark:bg-primary/3" />
                  
                  <div className="relative pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        plan.gradient ? `bg-gradient-to-br ${plan.gradient} text-white` : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-5">
                      <span className="text-3xl font-bold">₹{displayPrice}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
                          <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 dark:bg-green-500/20">
                            <Check className="w-2.5 h-2.5 text-green-500" />
                          </div>
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.isExternal ? (
                      <a href={plan.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button className={`w-full rounded-full h-10 text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${
                          plan.gradient ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white` : 'bg-primary hover:bg-primary/90'
                        }`}>
                          Get {plan.name}
                          <ExternalLink className="w-3.5 h-3.5 ml-2" />
                        </Button>
                      </a>
                    ) : (
                      <Link to="/auth" className="block">
                        <Button className={`w-full rounded-full h-10 text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${
                          plan.gradient ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white shadow-lg shadow-primary/20` : 'bg-primary hover:bg-primary/90'
                        }`}>
                          Get Started
                          <ArrowRight className="w-3.5 h-3.5 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent relative overflow-hidden rounded-3xl mx-4 my-8">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-[10%] w-20 h-20 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-[15%] w-16 h-16 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-[50%] w-12 h-12 bg-white/20 rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            {[
              { icon: Users, value: "100+", label: "Restaurants" },
              { icon: QrCode, value: "5000+", label: "QR Scans" },
              { icon: Clock, value: "5 min", label: "Setup Time" },
              { icon: Globe, value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2 transition-all duration-300 hover:scale-110">
                <stat.icon className="w-8 h-8 mx-auto opacity-80" />
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl dark:bg-primary/3" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl dark:bg-accent/3" />
        </div>
        
        {/* Decorative shapes */}
        <div className="absolute top-20 left-[5%] w-16 h-16 border-2 border-primary/10 rounded-full dark:border-primary/5" />
        <div className="absolute bottom-20 right-[8%] w-20 h-20 border-2 border-accent/10 rounded-full dark:border-accent/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to <span className="text-primary">Digitize</span> Your Menu?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 100+ restaurants in Tripura who have already made the switch to digital menus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:scale-105 active:scale-95">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
