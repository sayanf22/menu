import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowRight, MessageCircle, Sparkles, Star, Zap, Shield, Users, Loader2, Bell, ExternalLink, Rocket } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  max_images: number | null;
  bell_feature_enabled: boolean;
  plan_tier: number;
  isExternal?: boolean;
  externalUrl?: string;
  highlight?: boolean;
  icon: "star" | "zap" | "bell" | "rocket";
  gradientClass?: string;
}

const ALL_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for small restaurants",
    price_monthly: 24900,
    price_yearly: 273900, // 11 months price (1 month free)
    features: [
      "Digital Menu with QR Code",
      "5 Menu Image Uploads",
      "Basic Analytics Dashboard",
      "Customer Feedback Collection",
      "Social Media Links",
      "Email Support"
    ],
    max_images: 5,
    bell_feature_enabled: false,
    plan_tier: 1,
    icon: "star"
  },
  {
    id: "standard",
    name: "Standard",
    description: "Growing restaurants with bell service",
    price_monthly: 36900,
    price_yearly: 405900, // 11 months price (1 month free)
    features: [
      "Everything in Basic",
      "10 Menu Image Uploads",
      "Bell Calling Feature",
      "Priority Support",
      "Advanced Analytics",
      "Custom Branding"
    ],
    max_images: 10,
    bell_feature_enabled: true,
    plan_tier: 2,
    highlight: true,
    icon: "bell",
    gradientClass: "from-amber-500 to-orange-500"
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Digital menu with categories",
    price_monthly: 59900,
    price_yearly: 658900, // 11 months price (1 month free)
    features: [
      "Digital menu with categories",
      "Up to 50 menu items",
      "Toggle item availability",
      "QR code generation",
      "Advanced Bell Feature",
      "Dark/Light mode"
    ],
    max_images: 50,
    bell_feature_enabled: true,
    plan_tier: 3,
    isExternal: true,
    externalUrl: "https://addmenu.site/?mode=signup&plan=advanced",
    icon: "zap",
    gradientClass: "from-blue-500 to-cyan-500"
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete ordering system",
    price_monthly: 99900,
    price_yearly: 1098900, // 11 months price (1 month free)
    features: [
      "Everything in Advanced",
      "Unlimited menu items",
      "Real-time order management",
      "Order notifications",
      "Order status tracking",
      "Priority support"
    ],
    max_images: null,
    bell_feature_enabled: true,
    plan_tier: 4,
    isExternal: true,
    externalUrl: "https://addmenu.site/?mode=signup&plan=premium",
    highlight: true,
    icon: "rocket",
    gradientClass: "from-purple-500 to-pink-500"
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [dbPlans, setDbPlans] = useState<Map<string, string>>(new Map());
  const { initiatePayment, loading } = useRazorpay();

  useEffect(() => {
    checkUser();
    fetchDbPlans();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();
      setHasActiveSubscription(!!subscription);
    }
  };

  const fetchDbPlans = async () => {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('id, name')
        .eq('is_active', true);
      if (data) {
        const planMap = new Map<string, string>();
        data.forEach(p => {
          if (p.name.toLowerCase() === 'basic') planMap.set('basic', p.id);
          else if (p.name.toLowerCase().includes('plus')) planMap.set('standard', p.id);
        });
        setDbPlans(planMap);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (plan.isExternal && plan.externalUrl) {
      window.open(plan.externalUrl, '_blank');
      return;
    }
    const dbPlanId = dbPlans.get(plan.id);
    if (!dbPlanId) {
      toast.error('Plan not available');
      return;
    }
    if (!user) {
      navigate(`/auth?plan=${dbPlanId}&cycle=${billingCycle}`);
      return;
    }
    if (hasActiveSubscription) {
      toast.info('You already have an active subscription');
      navigate('/dashboard');
      return;
    }
    setSelectedPlan(plan.id);
    await initiatePayment(
      { planId: dbPlanId, billingCycle },
      () => {
        setSelectedPlan(null);
        toast.success('Subscription activated!');
        setTimeout(() => navigate('/dashboard'), 1500);
      },
      () => setSelectedPlan(null)
    );
  };

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(paise / 100);
  };

  const getIcon = (icon: string, className: string) => {
    switch (icon) {
      case "star": return <Star className={className} />;
      case "bell": return <Bell className={className} />;
      case "zap": return <Zap className={className} />;
      case "rocket": return <Rocket className={className} />;
      default: return <Star className={className} />;
    }
  };

  const getGradientStyle = (gradientClass?: string) => {
    if (!gradientClass) return {};
    if (gradientClass.includes("amber")) return { background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.05))' };
    if (gradientClass.includes("blue")) return { background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.05))' };
    if (gradientClass.includes("purple")) return { background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.05))' };
    return {};
  };


  return (
    <>
      <Helmet>
        <title>AddMenu Pricing | Digital Menu QR Code Subscription Plans</title>
        <meta name="description" content="Choose the perfect AddMenu subscription plan. From Basic to Premium with ordering system. 7-day money-back guarantee." />
        <link rel="canonical" href="https://addmenu.in/pricing" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 px-4 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent/10 to-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
            </div>
            
            <div className="container mx-auto max-w-4xl text-center relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Simple & Transparent Pricing
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Choose Your <span className="text-primary">Perfect Plan</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
              >
                From simple QR menus to complete ordering systems. 7-day money-back guarantee.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center bg-muted rounded-full p-1"
              >
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">1 Month Free</Badge>
                </button>
              </motion.div>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="py-12 px-4 relative">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {ALL_PLANS.map((plan, index) => {
                  const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
                  const isSelected = selectedPlan === plan.id;

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`p-5 h-full flex flex-col border-2 relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                          plan.highlight ? 'border-transparent' : 'border-border hover:border-primary/30'
                        }`}
                        style={plan.highlight ? getGradientStyle(plan.gradientClass) : {}}
                      >
                        {plan.highlight && (
                          <div className="absolute top-3 right-3">
                            <Badge className={`text-xs text-white border-0 ${
                              plan.gradientClass?.includes("purple") 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}>
                              {plan.plan_tier === 4 ? <Rocket className="w-3 h-3 mr-1" /> : <Crown className="w-3 h-3 mr-1" />}
                              {plan.plan_tier === 4 ? 'Best Value' : 'Popular'}
                            </Badge>
                          </div>
                        )}

                        {plan.isExternal && (
                          <div className="absolute top-3 left-3">
                            <Badge variant="outline" className="text-xs">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Pro
                            </Badge>
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4 mt-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              plan.gradientClass 
                                ? `bg-gradient-to-br ${plan.gradientClass} text-white`
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {getIcon(plan.icon, "w-5 h-5")}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold">{plan.name}</h3>
                              <p className="text-xs text-muted-foreground">{plan.description}</p>
                            </div>
                          </div>

                          <div className="mb-5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold">{formatPrice(price || 0)}</span>
                              <span className="text-muted-foreground text-sm">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                            </div>
                            {billingCycle === 'yearly' && plan.price_yearly && (
                              <p className="text-xs text-green-600 mt-1 font-medium">
                                🎉 1 month free! Pay for 11, get 12
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 mb-5">
                            {plan.features.map((feature, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-500/10">
                                  <Check className="w-2.5 h-2.5 text-green-500" />
                                </div>
                                <span className="text-xs text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleSubscribe(plan)}
                          disabled={loading && isSelected}
                          className={`w-full rounded-xl h-10 text-sm font-medium shadow-md transition-all duration-300 ${
                            plan.gradientClass
                              ? `bg-gradient-to-r ${plan.gradientClass} hover:opacity-90 text-white`
                              : 'bg-primary hover:bg-primary/90'
                          }`}
                        >
                          {isSelected && loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : plan.isExternal ? (
                            <>
                              Get {plan.name}
                              <ExternalLink className="w-3.5 h-3.5 ml-2" />
                            </>
                          ) : (
                            <>
                              Get Started
                              <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </>
                          )}
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Features Comparison */}
          <section className="py-12 px-4 bg-muted/30">
            <div className="container mx-auto max-w-5xl">
              <h2 className="text-2xl font-bold text-center mb-8">
                Compare <span className="text-primary">All Plans</span>
              </h2>
              
              <div className="bg-card rounded-2xl border overflow-hidden overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-5 gap-2 p-3 bg-muted/50 font-semibold text-sm">
                    <div>Feature</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center text-amber-600">Standard</div>
                    <div className="text-center text-blue-600">Advanced</div>
                    <div className="text-center text-purple-600">Premium</div>
                  </div>
                  
                  {[
                    { feature: "Digital QR Menu", basic: true, standard: true, advanced: true, premium: true },
                    { feature: "Menu Images", basic: "5", standard: "10", advanced: "50", premium: "∞" },
                    { feature: "Analytics", basic: true, standard: true, advanced: true, premium: true },
                    { feature: "Feedback", basic: true, standard: true, advanced: true, premium: true },
                    { feature: "Bell Calling", basic: false, standard: true, advanced: true, premium: true },
                    { feature: "Categories", basic: false, standard: false, advanced: true, premium: true },
                    { feature: "Order Management", basic: false, standard: false, advanced: false, premium: true },
                    { feature: "Priority Support", basic: false, standard: true, advanced: true, premium: true },
                  ].map((row, i) => (
                    <div key={i} className={`grid grid-cols-5 gap-2 p-3 text-sm ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                      <div className="font-medium">{row.feature}</div>
                      {(['basic', 'standard', 'advanced', 'premium'] as const).map((tier) => (
                        <div key={tier} className="text-center">
                          {typeof row[tier] === 'string' ? (
                            <span className="font-medium">{row[tier]}</span>
                          ) : row[tier] ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold text-center mb-8">
                Why Choose <span className="text-primary">AddMenu</span>?
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Zap, title: "Quick Setup", desc: "Under 5 minutes" },
                  { icon: Shield, title: "Secure", desc: "Razorpay powered" },
                  { icon: Users, title: "Support", desc: "Local assistance" },
                  { icon: Star, title: "Guarantee", desc: "7-day refund" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 rounded-xl">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 px-4 mx-4 bg-gradient-to-r from-primary to-accent rounded-2xl my-6">
            <div className="container mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-white">Ready to Get Started?</h2>
              <p className="text-white/80 mb-6">Join restaurants using AddMenu</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg" 
                  className="h-12 px-6 rounded-full bg-white text-primary hover:bg-white/90"
                  onClick={() => window.open('https://wa.me/917005832798', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="h-12 px-6 rounded-full border-2 border-white text-white hover:bg-white/10">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Pricing;