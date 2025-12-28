import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowRight, MessageCircle, Sparkles, Star, Zap, Shield, Users, Loader2, Bell, ExternalLink, Rocket, X } from "lucide-react";
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
  tagline?: string;
}

const ALL_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for small restaurants",
    tagline: "Get started",
    price_monthly: 24900,
    price_yearly: 273900,
    features: [
      "Digital Menu with QR Code",
      "5 Menu Image Uploads",
      "Drag & Drop Ordering",
      "Basic Analytics",
      "Customer Feedback",
      "Social Media Links"
    ],
    max_images: 5,
    bell_feature_enabled: false,
    plan_tier: 1,
    icon: "star"
  },
  {
    id: "standard",
    name: "Standard",
    description: "Most popular choice",
    tagline: "Best for growing",
    price_monthly: 39900,
    price_yearly: 438900,
    features: [
      "Everything in Basic",
      "15 Menu Image Uploads",
      "Bell Calling Feature",
      "Call Service Button",
      "Priority Support",
      "Advanced Analytics"
    ],
    max_images: 15,
    bell_feature_enabled: true,
    plan_tier: 2,
    highlight: true,
    icon: "bell",
    gradientClass: "from-amber-500 to-orange-500"
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Menu with categories",
    tagline: "Full control",
    price_monthly: 59900,
    price_yearly: 658900,
    features: [
      "Menu Categories",
      "100 Menu Items",
      "Toggle Availability",
      "Advanced Bell",
      "Dark/Light Mode",
      "Custom Branding"
    ],
    max_images: 100,
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
    tagline: "Enterprise ready",
    price_monthly: 99900,
    price_yearly: 1098900,
    features: [
      "Everything in Advanced",
      "Unlimited Items",
      "Order Management",
      "Order Notifications",
      "Status Tracking",
      "24/7 Priority Support"
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

  return (
    <>
      <Helmet>
        <title>AddMenu Pricing | Digital Menu QR Code Subscription Plans</title>
        <meta name="description" content="Choose the perfect AddMenu subscription plan. From Basic to Premium with ordering system. 7-day money-back guarantee." />
        <link rel="canonical" href="https://addmenu.in/pricing" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-20 pb-12 px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>
            
            <div className="container mx-auto max-w-4xl text-center relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Simple, Transparent Pricing
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
              >
                Choose Your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Perfect Plan
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
              >
                From simple QR menus to complete ordering systems. Start free trial with 7-day money-back guarantee.
              </motion.p>

              {/* Billing Toggle */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center bg-muted/80 backdrop-blur-sm rounded-full p-1.5 border border-border/50"
              >
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-gray-800 text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-white dark:bg-gray-800 text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly
                  <Badge className="text-[10px] bg-green-500 text-white border-0 px-2">
                    Save 17%
                  </Badge>
                </button>
              </motion.div>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="py-8 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ALL_PLANS.map((plan, index) => {
                  const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
                  const isSelected = selectedPlan === plan.id;
                  const isHighlighted = plan.highlight;

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Popular/Best Value Badge */}
                      {isHighlighted && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <Badge className={`px-4 py-1 text-xs font-semibold text-white border-0 shadow-lg ${
                            plan.gradientClass?.includes("purple") 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}>
                            {plan.plan_tier === 4 ? '🚀 Best Value' : '⭐ Most Popular'}
                          </Badge>
                        </div>
                      )}

                      <Card
                        className={`p-6 h-full flex flex-col relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${
                          isHighlighted 
                            ? 'border-2 border-primary/50 shadow-xl scale-[1.02] bg-gradient-to-b from-background to-primary/5' 
                            : 'border border-border/50 hover:border-primary/30 hover:-translate-y-1'
                        }`}
                      >
                        {/* External Badge */}
                        {plan.isExternal && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Pro
                            </Badge>
                          </div>
                        )}

                        {/* Plan Header */}
                        <div className="mb-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                            plan.gradientClass 
                              ? `bg-gradient-to-br ${plan.gradientClass} text-white shadow-lg`
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {getIcon(plan.icon, "w-6 h-6")}
                          </div>
                          
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            {plan.tagline}
                          </p>
                          <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">{formatPrice(price || 0)}</span>
                            <span className="text-muted-foreground text-sm font-medium">
                              /{billingCycle === 'yearly' ? 'year' : 'month'}
                            </span>
                          </div>
                          {billingCycle === 'yearly' && plan.price_yearly && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              1 month free! Pay for 11, get 12
                            </p>
                          )}
                        </div>

                        {/* Features */}
                        <div className="flex-1 space-y-3 mb-6">
                          {plan.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isHighlighted ? 'bg-primary/20' : 'bg-green-500/10'
                              }`}>
                                <Check className={`w-3 h-3 ${isHighlighted ? 'text-primary' : 'text-green-500'}`} />
                              </div>
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA Button */}
                        <Button
                          onClick={() => handleSubscribe(plan)}
                          disabled={loading && isSelected}
                          size="lg"
                          className={`w-full rounded-xl h-12 text-sm font-semibold transition-all duration-300 ${
                            isHighlighted
                              ? `bg-gradient-to-r ${plan.gradientClass} hover:opacity-90 text-white shadow-lg hover:shadow-xl`
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
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </>
                          ) : (
                            <>
                              Get Started
                              <ArrowRight className="w-4 h-4 ml-2" />
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
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold mb-3">
                  Compare All Features
                </h2>
                <p className="text-muted-foreground">See what's included in each plan</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-3xl border shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-semibold">Feature</th>
                        <th className="text-center p-4 font-semibold">Basic</th>
                        <th className="text-center p-4 font-semibold text-amber-600">Standard</th>
                        <th className="text-center p-4 font-semibold text-blue-600">Advanced</th>
                        <th className="text-center p-4 font-semibold text-purple-600">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Digital QR Menu", basic: true, standard: true, advanced: true, premium: true },
                        { feature: "Menu Images", basic: "5", standard: "15", advanced: "100", premium: "∞" },
                        { feature: "Drag & Drop Ordering", basic: true, standard: true, advanced: true, premium: true },
                        { feature: "Analytics Dashboard", basic: "Basic", standard: "Advanced", advanced: "Advanced", premium: "Advanced" },
                        { feature: "Customer Feedback", basic: true, standard: true, advanced: true, premium: true },
                        { feature: "Bell Calling", basic: false, standard: true, advanced: true, premium: true },
                        { feature: "Call Service", basic: false, standard: true, advanced: true, premium: true },
                        { feature: "Menu Categories", basic: false, standard: false, advanced: true, premium: true },
                        { feature: "Toggle Availability", basic: false, standard: false, advanced: true, premium: true },
                        { feature: "Order Management", basic: false, standard: false, advanced: false, premium: true },
                        { feature: "Priority Support", basic: false, standard: true, advanced: true, premium: "24/7" },
                      ].map((row, i) => (
                        <tr key={i} className={`border-t border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                          <td className="p-4 font-medium text-sm">{row.feature}</td>
                          {(['basic', 'standard', 'advanced', 'premium'] as const).map((tier) => (
                            <td key={tier} className="text-center p-4">
                              {typeof row[tier] === 'string' ? (
                                <span className="text-sm font-medium">{row[tier]}</span>
                              ) : row[tier] ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold mb-3">
                  Why Choose AddMenu?
                </h2>
                <p className="text-muted-foreground">Trusted by restaurants across Tripura</p>
              </motion.div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Zap, title: "Quick Setup", desc: "Under 5 minutes", color: "text-yellow-500" },
                  { icon: Shield, title: "Secure Payments", desc: "Razorpay powered", color: "text-green-500" },
                  { icon: Users, title: "Local Support", desc: "WhatsApp help", color: "text-blue-500" },
                  { icon: Star, title: "Money Back", desc: "7-day guarantee", color: "text-purple-500" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-5 text-center hover:shadow-lg transition-all duration-300 rounded-2xl border-0 bg-background">
                      <div className={`w-12 h-12 bg-muted rounded-2xl mx-auto mb-4 flex items-center justify-center`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary via-primary to-accent rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                    Ready to Get Started?
                  </h2>
                  <p className="text-white/80 mb-8 text-lg">
                    Join hundreds of restaurants using AddMenu
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="h-14 px-8 rounded-full bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                      onClick={() => window.open('https://wa.me/917005832798', '_blank')}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp Us
                    </Button>
                    <Link to="/auth">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="h-14 px-8 rounded-full border-2 border-white text-white hover:bg-white/10 font-semibold"
                      >
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
